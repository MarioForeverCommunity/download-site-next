<script setup>
// Softendo / Buziol / Banesoft games catalog — redesigned.
import { ref, computed, onMounted, watch, watchEffect } from "vue";
import NxCatalog from "../../../components/next/NxCatalog.vue";
import { applyLocale, getLocale, useI18n } from "../../../i18n/index.js";
import { getUseDirectLink } from "../../../util/Language.js";
import { navTop, setPageTitle } from "../../../config.js";
import { readList } from "../../../util/ReadList.js";
import { loadImageIndex } from "../../../util/ImageUtil.js";
import { useCatalog } from "../../../util/useCatalog.js";
import { buildSoftendoRecords, makeFacet, softwareLabel } from "../../../util/next/records.js";
import { normalizeSoftendoList } from "../../../util/SoftendoUtil.js";
import { getCatalogLastUpdated } from "../../../util/next/docUpdated.js";
import { publishShell, publishShellHandlers } from "../../../util/next/shellStore.js";
import { localeForLocales, pageTitleFor, pickDoc } from "../../../util/next/pageLocale.js";
import { discoverDocs } from "../../../util/next/docFiles.js";

const docs = discoverDocs(import.meta.glob("../../../markdown/*/softendo.md", {
  eager: true, import: "default",
}));
const locales = Object.keys(docs);

const pageId = "softendo";
const pageEntry = navTop.find((item) => item.id === pageId);

const locale = ref(localeForLocales(getLocale(), locales));
const { t } = useI18n(() => locale.value);

const title = computed(() => pageTitleFor(pageEntry, locale.value));

const rawRecords = ref([]);
const loading = ref(true);

// Softendo entries have year ranges rather than release dates, so sorting
// defaults to the latest year, which is expressed as a name-independent order.
const initialSort = { field: "name", asc: true };

const facets = computed(() => {
  const list = rawRecords.value;
  return [
    makeFacet({
      key: "series",
      label: t("facet.series"),
      getter: (record) => record.softendoType,
      options: {
        records: list,
        list: [
          { value: "mario", label: t("facet.mario") },
          { value: "mff", label: t("facet.mff") },
          { value: "flash", label: t("facet.flash") },
          { value: "non-mario", label: t("facet.nonMario") },
          { value: "banesoft", label: t("facet.banesoft") },
        ],
      },
    }),
    makeFacet({
      key: "software",
      label: t("facet.madeWith"),
      // A game can list several makers (a title shipped as both an exe and a
      // swf, for instance), so this is a multi-choice facet.
      getter: (record) => {
        if (!record.software) return null;
        return Array.isArray(record.software) ? record.software : [record.software];
      },
      options: {
        records: list,
        list: ["flash", "mmf", "gamemaker", "other"].map((value) => ({
          value,
          label: softwareLabel(value, locale.value),
        })),
      },
    }),
    makeFacet({
      key: "language",
      label: t("facet.language"),
      // A game either ships in one language or in both, so this is a
      // single-choice facet rendered with radio dots rather than checkboxes.
      single: true,
      getter: (record) => {
        const langs = record.language || [];
        const hasEn = langs.includes("en");
        const hasPl = langs.includes("pl");
        if (hasEn && hasPl) return "both";
        if (hasPl) return "pl";
        if (hasEn) return "en";
        return null;
      },
      options: {
        records: list,
        list: [
          { value: "en", label: t("facet.english") },
          { value: "pl", label: t("facet.polish") },
          { value: "both", label: t("facet.both") },
        ],
      },
    }),
  ];
});

const sorters = [
  { field: "name", compare: (a, b) => String(a.name).localeCompare(String(b.name)) },
  // The "系列" column shows `author` (the series a game belongs to), so the
  // header can be made sortable with a matching comparator. Sorting by series
  // groups the catalog by family, which is how visitors browse it.
  { field: "author", compare: (a, b) => String(a.author || "").localeCompare(String(b.author || "")) },
  // No date sorter: Softendo entries have no release date, only year ranges,
  // which the "年份" column already shows.
];

const catalog = useCatalog({
  records: rawRecords,
  titleFields: ["titleSearch"],
  exactFields: ["fileSearch"],
  authorFields: ["authorSearch"],
  facets: () => facets.value,
  sorters,
  defaultSort: initialSort,
  tags: () => ({ untaggedLabel: t("filter.untagged") }),
  // Softendo entries carry year ranges rather than release dates, so the
  // release-date filter has nothing meaningful to filter on.
  dateFilter: false,
});

const catalogRef = ref(null);

function randomGame() {
  if (catalogRef.value) catalogRef.value.randomRecord();
}

async function load(language) {
  loading.value = true;
  try {
    const [list] = await Promise.all([readList("list-softendo.yaml"), loadImageIndex().catch(() => null)]);
    const normalized = normalizeSoftendoList(list, language);
    rawRecords.value = buildSoftendoRecords(normalized, language);
  } catch (error) {
    console.error("Failed to load Softendo catalog:", error);
    rawRecords.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  load(locale.value);
});

// The settings drawer can flip the File Hub direct-link switch while this page is
// open; records bake their download URLs, so rebuild them to apply it at once.
watch(getUseDirectLink(), () => load(locale.value));

function changeLocale(code) {
  locale.value = applyLocale(code);
  load(locale.value);
}

// The catalog's own write-up, opened from the topbar; null hides the button.
// pickDoc matches the exact locale and falls back by written language.
const doc = computed(() => pickDoc(locale.value, docs));
const docUpdated = ref("");
getCatalogLastUpdated("softendo").then((v) => { docUpdated.value = v || ""; });

// The app shell is rendered once by the SPA root; this page only publishes
// the parts that differ (title, write-up, search model) plus its own controls.
// A watchEffect keeps the shell in sync when the language changes or the
// write-up's date arrives after the first render.
watchEffect(() => {
  setPageTitle(title.value, locale.value);
  publishShell({
    pageId: "softendo",
    title: title.value,
    locale: locale.value,
    locales,
    doc: doc.value,
    docTitle: title.value,
    docUpdated: docUpdated.value,
    search: catalog,
    // Softendo records have no author (the "series" column reuses that slot),
    // so the shell hides the author search box on this page.
    showAuthorSearch: false,
    showRandom: true,
  });
});
publishShellHandlers({
  changeLocale,
  random: randomGame,
});
</script>

<template>

  <NxCatalog
    v-if="!loading"
    ref="catalogRef"
    :catalog="catalog"
    :facets="facets"
    :sorters="sorters"
    :locale="locale"
    show-random
    :show-date="false"
    :show-actions="false"
    :columns="{
      name: t('catalog.colGame'),
      author: t('catalog.colSeries'),
      version: t('catalog.colYears'),
      tags: t('catalog.colGenres'),
    }"
    :updated="docUpdated"
  />
  <div
    v-else
    class="nx-loading"
  >
    {{ t("page.softendoLoading") }}
  </div>
</template>
