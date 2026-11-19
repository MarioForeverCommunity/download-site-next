<script setup>
// Mario Forever fangames catalog — redesigned.
//
// Same data pipeline as the legacy page (YAML -> ensureMfList -> adapter), and
// the same platform/software rules, so the two designs can never disagree about
// what a record is. Only presentation and the filter interaction differ.
import { ref, computed, onMounted, watch, watchEffect } from "vue";
import NxCatalog from "../../../components/next/NxCatalog.vue";
import NxIcon from "../../../components/next/NxIcon.vue";
import { applyLocale, getLocale, localeNeedsConversion, useI18n } from "../../../i18n/index.js";
import { prepareConversion, isConversionReady } from "../../../i18n/convert.js";
import { getDefaultSort, getUseDirectLink } from "../../../util/Language.js";
import { navTop, setPageTitle } from "../../../config.js";
import { ensureMfList } from "../../../util/useMfList.js";
import { loadImageIndex } from "../../../util/ImageUtil.js";
import { useCatalog } from "../../../util/useCatalog.js";
import { buildMfRecords, expandMfRecord, makeFacet, sourceFacetOptions } from "../../../util/next/records.js";
import { getCatalogLastUpdated } from "../../../util/next/docUpdated.js";
import { publishShell, publishShellHandlers } from "../../../util/next/shellStore.js";
import { localeForLocales, pageTitleFor, pickDoc } from "../../../util/next/pageLocale.js";
import { discoverDocs } from "../../../util/next/docFiles.js";

// Optional per-locale write-ups: adding `mf-games-<locale>.md` is enough for that
// language to get its own document and its own entry in the language menu.
const docs = discoverDocs(import.meta.glob("../../../markdown/mf-games-*.md", {
  eager: true, import: "default",
}), "mf-games");
const locales = Object.keys(docs);

const pageId = "mf-games";
const pageEntry = navTop.find((item) => item.id === pageId);

// Resolve against the documents that actually exist; a visitor with a locale we
// have no write-up for gets the closest available one.
const locale = ref(localeForLocales(getLocale(), locales));
const { t } = useI18n(() => locale.value);

const title = computed(() => pageTitleFor(pageEntry, locale.value));

const rawRecords = ref([]);
const loading = ref(true);
const expandVersions = ref(false);

const SORT_MAP = {
  date_desc: { field: "date", asc: false },
  date_asc: { field: "date", asc: true },
  name_asc: { field: "name", asc: true },
  name_desc: { field: "name", asc: false },
  author_asc: { field: "author", asc: true },
  author_desc: { field: "author", asc: false },
};

const initialSort = SORT_MAP[getDefaultSort().value] || { field: "date", asc: false };

const records = computed(() => {
  if (!expandVersions.value) return rawRecords.value;
  const expanded = [];
  for (const record of rawRecords.value) expanded.push(...expandMfRecord(record));
  return expanded;
});

const facets = computed(() => {
  const list = records.value;
  return [
    makeFacet({
      key: "region",
      label: t("facet.region"),
      single: true,
      getter: (record) => record.region,
      options: {
        records: list,
        list: [
          { value: "chinese", label: t("facet.regionChinese") },
          { value: "international", label: t("facet.regionInternational") },
        ],
      },
    }),
    makeFacet({
      key: "platform",
      label: t("facet.platform"),
      // Platform lives on the version, not the record: match and count against
      // every version so a Linux-only build is findable without expanding.
      getter: (record) => record.platforms || [],
      countFrom: (record) => record.platforms || [],
      options: {
        records: list,
        list: ["Windows", "Linux", "macOS", "Android", "J2ME"].map((value) => ({ value, label: value })),
      },
    }),
    makeFacet({
      key: "software",
      label: t("facet.software"),
      getter: (record) => record.softwares || [],
      countFrom: (record) => record.softwares || [],
      options: {
        records: list,
        list: [
          { value: "mmf", label: t("software.mmf") },
          { value: "godot", label: t("software.godot") },
          { value: "gamemaker", label: t("software.gamemaker") },
          { value: "other", label: t("software.other") },
        ],
      },
    }),
    makeFacet({
      key: "source",
      label: t("facet.source"),
      // Each build may point at its own thread; the record's `sources` is the
      // union across versions, so a site is findable without expanding.
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
  records,
  titleFields: ["titleSearch"],
  authorFields: ["authorSearch"],
  facets: () => facets.value,
  sorters,
  defaultSort: initialSort,
  tags: () => ({ untaggedLabel: t("filter.untagged") }),
  // A getter, so the pills follow a language switch without a reload.
  labels: () => ({
    year: `${t("filter.byYear")} `,
    range: `${t("filter.byRange")} `,
  }),
});

// The dice button lives in the shell, so the page exposes a handler that reaches
// its catalog instance.
const catalogRef = ref(null);

function randomGame() {
  if (catalogRef.value) catalogRef.value.randomRecord();
}

async function load(language) {
  loading.value = true;
  try {
    const [list] = await Promise.all([ensureMfList(), loadImageIndex().catch(() => null)]);
    rawRecords.value = buildMfRecords(list, language);
  } catch (error) {
    console.error("Failed to load MF catalog:", error);
    rawRecords.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  // Titles and YAML descriptions of fangames are converted for zh-Hant, so the
  // dictionary must be ready before the first build (capped wait; failure is a
  // no-op conversion, never a broken page).
  await prepareConversion(localeNeedsConversion(locale.value));
  load(locale.value);
});

// The settings drawer can flip the File Hub direct-link switch while this page is
// open; records bake their download URLs, so rebuild them to apply it at once.
watch(getUseDirectLink(), () => load(locale.value));

// The shell's language menu calls this: store the choice, then rebuild the
// records in the new language (labels and localized YAML fields are baked in).
async function changeLocale(code) {
  locale.value = applyLocale(code);
  await prepareConversion(localeNeedsConversion(locale.value));
  load(locale.value);
}

// A slow first visit can exceed the capped wait in prepareConversion(), which
// would leave the Traditional search terms out of the index. Rebuild once when
// the dictionary finally lands, so zh-Hant searches match without a reload.
watch(() => isConversionReady(), (ready) => {
  if (ready && localeNeedsConversion(locale.value)) load(locale.value);
});

// The catalog's own write-up, opened from the topbar; null hides the button.
// Today this resolves to zh/en; the glob above makes future locale files work.
const doc = computed(() => pickDoc(locale.value, docs));
const docUpdated = ref("");
getCatalogLastUpdated("mfGames").then((v) => { docUpdated.value = v || ""; });

// The app shell is rendered once by the SPA root; this page only publishes
// the parts that differ (title, write-up, search model) plus its own controls.
// A watchEffect keeps the shell in sync when the language changes or the
// write-up's date arrives after the first render. The tab title lives here too:
// a Traditional Chinese switch converts the title asynchronously, and the effect
// re-runs once the converter lands.
watchEffect(() => {
  setPageTitle(title.value, locale.value);
  publishShell({
    pageId: "mf-games",
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
    :hide-version="!expandVersions"
    :columns="{
      name: t('catalog.colName'),
      author: t('catalog.colAuthor'),
      // Collapsed rows show the newest version only, so the column is labelled
      // accordingly; expanding every version makes it a plain version column.
      version: expandVersions ? t('catalog.colVersion') : t('catalog.colLatest'),
      date: t('catalog.colDate'),
      tags: t('catalog.colTags'),
    }"
  >
    <template #pane-extras>
      <section class="nx-pane-section">
        <h4><span>{{ t("page.mfGamesListOptions") }}</span></h4>
        <div class="nx-checks">
          <button
            type="button"
            class="nx-check"
            :class="{ on: expandVersions }"
            :aria-pressed="expandVersions"
            @click="expandVersions = !expandVersions"
          >
            <span
              class="nx-check-box"
              aria-hidden="true"
            ><NxIcon
              v-if="expandVersions"
              name="check"
              :size="9"
            /></span>
            <span>{{ t("page.mfGamesExpandVersions") }}</span>
          </button>
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
            <span>{{ t("page.mfGamesOnlyWithImage") }}</span>
          </button>
        </div>
      </section>
    </template>
  </NxCatalog>
  <div
    v-else
    class="nx-loading"
  >
    {{ t("page.mfGamesLoading") }}
  </div>
</template>
