<script setup>
// Mario Worker levels catalog — redesigned.
//
// Chinese-only, matching the legacy page (config.js `show_en: false`). The page
// therefore always renders in a Chinese locale: `pageLocale` hands a Traditional
// Chinese visitor the Traditional interface, and everyone else Simplified.
// No tag filter: MW entries carry only "自带 MW" / "BGM" runtime flags, which
// the 运行要求 facet already expresses, so a second tag filter would duplicate it.
import { ref, computed, onMounted, watch, watchEffect } from "vue";
import NxCatalog from "../../../components/next/NxCatalog.vue";
import NxIcon from "../../../components/next/NxIcon.vue";
import { applyLocale, getLocale, useI18n } from "../../../i18n/index.js";
import { getDefaultSort, getUseDirectLink } from "../../../util/Language.js";
import { navTop, setPageTitle } from "../../../config.js";
import { ensureMwList } from "../../../util/useMwList.js";
import { loadImageIndex } from "../../../util/ImageUtil.js";
import { useCatalog } from "../../../util/useCatalog.js";
import { buildMwRecords, makeFacet, distinctValues, sourceFacetOptions } from "../../../util/next/records.js";
import { getCatalogLastUpdated } from "../../../util/next/docUpdated.js";
import { publishShell, publishShellHandlers } from "../../../util/next/shellStore.js";
import { localeForLocales, pageTitleFor, pickDoc } from "../../../util/next/pageLocale.js";
import { discoverDocs } from "../../../util/next/docFiles.js";

// Only `markdown/zh-hans/mw-levels.md` exists today, so this page has one language and no menu.
// Adding another `mw-levels-<locale>.md` would enable it without code changes.
const docs = discoverDocs(import.meta.glob("../../../markdown/*/mw-levels.md", {
  eager: true, import: "default",
}));
const locales = Object.keys(docs);

const pageId = "mw-levels";
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

const facets = computed(() => {
  const list = rawRecords.value;
  // Newest MW version first: the current editors are what visitors look for.
  const smwpValues = distinctValues(list, (record) => record.smwpVersion).sort((a, b) => {
    const rank = (value) => {
      if (value === "MW 4.4") return 1;
      if (value === "MW 4.0") return 0;
      return 2;
    };
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== rb) return rb - ra;
    return String(b).localeCompare(String(a), undefined, { numeric: true });
  });

  return [
    makeFacet({
      key: "smwp",
      label: t("facet.smwp"),
      // Long option set rendered as pills, matching the year filter's shape.
      as: "chips",
      getter: (record) => record.smwpVersion,
      options: {
        records: list,
        list: smwpValues.map((value) => ({ value, label: value })),
      },
    }),
    makeFacet({
      key: "runtime",
      label: t("facet.runtime"),
      // The MW requirement and the BGM note are independent: a level can ship
      // its own MW and still need a custom BGM, so it must surface under both.
      getter: (record) => {
        const values = [record.bundled ? "bundled" : "download"];
        if (record.hasBgm) values.push("bgm");
        return values;
      },
      options: {
        records: list,
        list: [
          { value: "bundled", label: t("facet.runtimeBundled") },
          { value: "download", label: t("facet.runtimeDownload") },
          { value: "bgm", label: t("facet.runtimeBgm") },
        ],
      },
    }),
    makeFacet({
      key: "source",
      label: t("facet.source"),
      getter: (record) => record.sources || [],
      countFrom: (record) => record.sources || [],
      options: {
        records: list,
        list: sourceFacetOptions(list, locale.value),
      },
    }),
  ];
});

const sorters = [
  { field: "name", compare: (a, b) => String(a.name).localeCompare(String(b.name)) },
  { field: "author", compare: (a, b) => String(a.author).localeCompare(String(b.author)) },
  { field: "date", compare: (a, b) => (a.date ? a.date.getTime() : 0) - (b.date ? b.date.getTime() : 0) },
];

const catalog = useCatalog({
  records: rawRecords,
  titleFields: ["titleSearch"],
  exactFields: ["fileSearch"],
  authorFields: ["authorSearch"],
  facets: () => facets.value,
  sorters,
  defaultSort: initialSort,
  tags: false,
  labels: () => ({ year: `${t("filter.byYear")} `, range: `${t("filter.byRange")} ` }),
});

// The dice button lives in the shell, so the page exposes a handler that reaches
// its catalog instance.
const catalogRef = ref(null);

function randomGame() {
  if (catalogRef.value) catalogRef.value.randomRecord();
}

async function load() {
  try {
    const [list] = await Promise.all([ensureMwList(), loadImageIndex().catch(() => null)]);
    rawRecords.value = buildMwRecords(list, locale.value);
  } catch (error) {
    console.error("Failed to load MW catalog:", error);
    rawRecords.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);

// The settings drawer can flip the File Hub direct-link switch while this page is
// open; records bake their download URLs, so rebuild them to apply it at once.
watch(getUseDirectLink(), load);

// The catalog's own write-up, opened from the topbar; null hides the button.
const doc = computed(() => pickDoc(locale.value, docs));
const docUpdated = ref("");
getCatalogLastUpdated("mwLevels").then((v) => { docUpdated.value = v || ""; });

// The app shell is rendered once by the SPA root; this page only publishes
// the parts that differ (title, write-up, search model) plus its own controls.
// A watchEffect keeps the shell in sync when the language changes or the
// write-up's date arrives after the first render.
watchEffect(() => {
  setPageTitle(title.value, locale.value);
  publishShell({
    pageId: "mw-levels",
    title: title.value,
    locale: locale.value,
    locales,
    doc: doc.value,
    docTitle: title.value,
    docUpdated: docUpdated.value,
    search: catalog,
    showRandom: true,
  });
});
// The menu is hidden while the catalog ships a single write-up, but registering
// the handler keeps a future `mw-levels-<locale>.md` from producing a menu whose
// clicks only close it: records are rebuilt in the newly chosen locale.
function changeLocale(code) {
  locale.value = applyLocale(code);
  load();
}

publishShellHandlers({
  changeLocale,
  random: randomGame,
});
</script>

<template>

  <NxCatalog
    ref="catalogRef"
    v-if="!loading"
    :catalog="catalog"
    :facets="facets"
    :sorters="sorters"
    :locale="locale"
    show-random
    :updated="docUpdated"
    row-class="is-mw"
    :columns="{
      name: t('catalog.colName'),
      author: t('catalog.colAuthor'),
      version: t('facet.smwp'),
      date: t('catalog.colDate'),
      tags: t('catalog.colMarks'),
    }"
  >
    <template #pane-extras>
      <section class="nx-pane-section">
        <h4><span>{{ t("page.mwLevelsListOptions") }}</span></h4>
        <div class="nx-checks">
          <button
            type="button"
            class="nx-check"
            :class="{ on: catalog.onlyWithImage.value }"
            :aria-pressed="catalog.onlyWithImage.value"
            @click="catalog.onlyWithImage.value = !catalog.onlyWithImage.value"
          >
            <span
              class="nx-check-box"
              aria-hidden="true"
            ><NxIcon
              v-if="catalog.onlyWithImage.value"
              name="check"
              :size="9"
            /></span>
            <span>{{ t("page.mwLevelsOnlyWithImage") }}</span>
          </button>
        </div>
      </section>
    </template>
  </NxCatalog>
  <div
    v-else
    class="nx-loading"
  >
    {{ t("page.mwLevelsLoading") }}
  </div>
</template>
