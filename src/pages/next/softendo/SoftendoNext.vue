<script setup>
// Softendo / Buziol / Banesoft games catalog — redesigned.
import { ref, computed, onMounted } from "vue";
import NxShell from "../../../components/next/NxShell.vue";
import NxCatalog from "../../../components/next/NxCatalog.vue";
import { getLanguage, setLanguageZh, setLanguageEn } from "../../../util/Language.js";
import { navTop } from "../../../config.js";
import { readList } from "../../../util/ReadList.js";
import { loadImageIndex } from "../../../util/ImageUtil.js";
import { useCatalog } from "../../../util/useCatalog.js";
import { buildSoftendoRecords, makeFacet } from "../../../util/next/records.js";
import { normalizeSoftendoList } from "../../../util/SoftendoUtil.js";

const lan = ref(getLanguage());
const pageId = "softendo";
const pageEntry = navTop.find((item) => item.id === pageId);

const title = computed(() => (lan.value === "zh" ? pageEntry.title : pageEntry.title_alt));

const rawRecords = ref([]);
const loading = ref(true);

// Softendo entries have year ranges rather than release dates, so sorting
// defaults to the latest year, which is expressed as a name-independent order.
const initialSort = { field: "name", asc: true };

const facets = computed(() => {
  const zh = lan.value === "zh";
  return [
    makeFacet({
      key: "series",
      label: zh ? "系列" : "Series",
      getter: (record) => record.softendoType,
      options: {
        records: rawRecords.value,
        list: [
          { value: "mario", label: "Mario" },
          { value: "mff", label: "Mario Forever Flash" },
          { value: "flash", label: "Flash" },
          { value: "non-mario", label: "Non-Mario" },
          { value: "banesoft", label: "Banesoft" },
        ],
      },
    }),
    makeFacet({
      key: "language",
      label: zh ? "语言" : "Language",
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
        records: rawRecords.value,
        list: [
          { value: "en", label: zh ? "英语" : "English" },
          { value: "pl", label: zh ? "波兰语" : "Polish" },
          { value: "both", label: zh ? "双语言" : "Both" },
        ],
      },
    }),
  ];
});

const sorters = [
  { field: "name", compare: (a, b) => String(a.name).localeCompare(String(b.name)) },
  // No date sorter: Softendo entries have no release date, only year ranges,
  // which the "年份" column already shows.
];

const catalog = useCatalog({
  records: rawRecords,
  titleFields: ["titleSearch"],
  authorFields: ["authorSearch"],
  facets: () => facets.value,
  sorters,
  defaultSort: initialSort,
  tags: { untaggedLabel: lan.value === "zh" ? "未标签" : "Untagged" },
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
  load(lan.value);
});

function pageSetLanguageZh() {
  lan.value = setLanguageZh();
  document.title = pageEntry.title;
  load("zh");
}

function pageSetLanguageEn() {
  lan.value = setLanguageEn();
  document.title = pageEntry.title_alt;
  load("en");
}

document.title = title.value;
</script>

<template>
  <NxShell
    :page-id="pageId"
    :lan="lan"
    :title="title"
    :search="catalog"
    show-random
    @change-lan-zh="pageSetLanguageZh"
    @change-lan-en="pageSetLanguageEn"
    @random="randomGame"
  >
    <NxCatalog
      v-if="!loading"
      ref="catalogRef"
      :catalog="catalog"
      :facets="facets"
      :sorters="sorters"
      :lan="lan"
      :show-date="false"
      :show-actions="false"
      :columns="{
        name: lan === 'zh' ? '游戏' : 'Game',
        author: lan === 'zh' ? '系列' : 'Series',
        version: lan === 'zh' ? '年份' : 'Years',
        tags: lan === 'zh' ? '类型' : 'Genres',
      }"
    />
    <div
      v-else
      class="nx-loading"
    >
      {{ lan === "zh" ? "正在载入游戏目录…" : "Loading the catalog…" }}
    </div>
  </NxShell>
</template>
