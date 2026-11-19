<script setup>
// Creation assets catalog — redesigned. Chinese-only, like the legacy page.
//
// Every variant is its own row (no collapse option): variants are separately
// downloadable builds, and hiding them behind a picker buried most of the
// catalog.
import { ref, computed, onMounted, watch, watchEffect } from "vue";
import NxCatalog from "../../../components/next/NxCatalog.vue";
import { applyLocale, getLocale, localeNeedsConversion, useI18n } from "../../../i18n/index.js";
import { prepareConversion } from "../../../i18n/convert.js";
import { getDefaultSort, getUseDirectLink } from "../../../util/Language.js";
import { navTop, setPageTitle } from "../../../config.js";
import { ensureAssetsList } from "../../../util/useAssetsList.js";
import { useCatalog } from "../../../util/useCatalog.js";
import { buildAssetRecords, makeFacet } from "../../../util/next/records.js";
import { getCatalogLastUpdated } from "../../../util/next/docUpdated.js";
import { publishShell, publishShellHandlers } from "../../../util/next/shellStore.js";
import { localeForLocales, pageTitleFor, pickDoc } from "../../../util/next/pageLocale.js";
import { discoverDocs } from "../../../util/next/docFiles.js";

// `assets.md` is the Simplified original; adding `assets-<locale>.md` later adds
// that language automatically, including its menu option.
const docs = discoverDocs(import.meta.glob("../../../markdown/assets*.md", {
  eager: true, import: "default",
}), "assets");
const locales = Object.keys(docs);

const pageId = "assets";
const pageEntry = navTop.find((item) => item.id === pageId);

const locale = ref(localeForLocales(getLocale(), locales));
const { t } = useI18n(() => locale.value);

const title = computed(() => pageTitleFor(pageEntry, locale.value));

const rawRecords = ref([]);
const loading = ref(true);

const SORT_MAP = {
  date_desc: { field: "date", asc: false },
  date_asc: { field: "date", asc: true },
  name_asc: { field: "name", asc: true },
  name_desc: { field: "name", asc: false },
  author_asc: { field: "author", asc: true },
  author_desc: { field: "author", asc: false },
};

const initialSort = SORT_MAP[getDefaultSort().value] || { field: "date", asc: false };

const facets = computed(() => [
  makeFacet({
    key: "type",
    label: t("facet.type"),
    getter: (record) => record.assetType,
    options: {
      records: rawRecords.value,
      list: ["engine", "addon", "effect", "sprite", "tool", "mwtool"].map((value) => ({
        value,
        label: t(`assetType.${value}`),
      })),
    },
  }),
]);

const sorters = [
  {
    field: "name",
    // Variants of one asset share a name; compare the variant label as a
    // tie-breaker so expanded rows keep a stable, sensible order.
    compare: (a, b) => String(a.name).localeCompare(String(b.name))
      || String(a.variantLabel || "").localeCompare(String(b.variantLabel || "")),
  },
  { field: "author", compare: (a, b) => String(a.author).localeCompare(String(b.author)) },
  {
    field: "date",
    compare: (a, b) => (a.date ? a.date.getTime() : 0) - (b.date ? b.date.getTime() : 0)
      || String(a.name).localeCompare(String(b.name)),
  },
];

const catalog = useCatalog({
  records: rawRecords,
  titleFields: ["titleSearch"],
  authorFields: ["authorSearch"],
  facets: () => facets.value,
  sorters,
  defaultSort: initialSort,
  tags: false,
  labels: () => ({ year: `${t("filter.byYear")} `, range: `${t("filter.byRange")} ` }),
});

async function load() {
  try {
    const list = await ensureAssetsList();
    rawRecords.value = buildAssetRecords(list, locale.value);
  } catch (error) {
    console.error("Failed to load assets catalog:", error);
    rawRecords.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  // Descriptions, variant names and version labels are converted for zh-Hant.
  // Other locales never load the dictionary (prepareConversion(false) is a no-op).
  await prepareConversion(localeNeedsConversion(locale.value));
  await load();
});

async function changeLocale(code) {
  locale.value = applyLocale(code);
  await prepareConversion(localeNeedsConversion(locale.value));
  await load();
}

// The settings drawer can flip the File Hub direct-link switch while this page is
// open; records bake their download URLs, so rebuild them to apply it at once.
watch(getUseDirectLink(), load);

// The catalog's own write-up, opened from the topbar; null hides the button.
const doc = computed(() => pickDoc(locale.value, docs));
const docUpdated = ref("");
getCatalogLastUpdated("assets").then((v) => { docUpdated.value = v || ""; });

// The app shell is rendered once by the SPA root; this page only publishes
// the parts that differ (title, write-up, search model) plus its own controls.
// A watchEffect keeps the shell in sync when the language changes or the
// write-up's date arrives after the first render.
watchEffect(() => {
  setPageTitle(title.value, locale.value);
  publishShell({
    pageId: "assets",
    title: title.value,
    locale: locale.value,
    locales,
    doc: doc.value,
    docTitle: title.value,
    docUpdated: docUpdated.value,
    search: catalog,
  });
});
publishShellHandlers({ changeLocale });
</script>

<template>

  <NxCatalog
    v-if="!loading"
    :catalog="catalog"
    :facets="facets"
    :sorters="sorters"
    :locale="locale"
    :columns="{
      name: t('catalog.colAssetName'),
      author: t('catalog.colAuthor'),
      version: t('catalog.colVersion'),
      date: t('catalog.colDate'),
      tags: t('facet.type'),
    }"
    :updated="docUpdated"
  />
  <div
    v-else
    class="nx-loading"
  >
    {{ t("page.assetsLoading") }}
  </div>
</template>
