<script setup>
// Softendo / Buziol / Banesoft games catalog — redesigned.
import { ref, computed, onMounted } from "vue";
import NxShell from "../../../components/next/NxShell.vue";
import NxPageHead from "../../../components/next/NxPageHead.vue";
import NxCatalog from "../../../components/next/NxCatalog.vue";
import { getLanguage, setLanguageZh, setLanguageEn } from "../../../util/Language.js";
import { navTop } from "../../../config.js";
import { readList } from "../../../util/ReadList.js";
import { loadImageIndex } from "../../../util/ImageUtil.js";
import { useCatalog } from "../../../util/useCatalog.js";
import { buildSoftendoRecords } from "../../../util/next/records.js";
import { normalizeSoftendoList } from "../../../util/SoftendoUtil.js";

const lan = ref(getLanguage());
const pageId = "softendo";
const pageEntry = navTop.find((item) => item.id === pageId);

const title = computed(() => (lan.value === "zh" ? pageEntry.title : pageEntry.title_alt));

const rawRecords = ref([]);
const loading = ref(true);

const initialSort = { field: "date", asc: false };

const seriesFacet = computed(() => ({
  key: "series",
  label: lan.value === "zh" ? "系列" : "Series",
  options: [
    { value: "mario", label: "Mario" },
    { value: "mff", label: "Mario Forever Flash" },
    { value: "flash", label: "Flash" },
    { value: "non-mario", label: "Non-Mario" },
    { value: "banesoft", label: "Banesoft" },
  ],
  test: (record, value) => record.softendoType === value,
}));

const languageFacet = computed(() => ({
  key: "language",
  label: lan.value === "zh" ? "语言" : "Language",
  options: [
    { value: "en", label: lan.value === "zh" ? "英语" : "English" },
    { value: "pl", label: lan.value === "zh" ? "波兰语" : "Polish" },
  ],
  test: (record, value) => (record.language || []).includes(value),
}));

const facets = computed(() => [seriesFacet.value, languageFacet.value]);

const sorters = [
  { field: "name", compare: (a, b) => String(a.name).localeCompare(String(b.name)) },
  { field: "date", compare: (a, b) => (a.latestYear || 0) - (b.latestYear || 0) },
];

const catalog = useCatalog({
  records: rawRecords,
  searchFields: ["searchText"],
  facets: () => facets.value,
  sorters,
  defaultSort: initialSort,
  tags: true,
});

const stats = computed(() => {
  if (loading.value) return [];
  return [
    { label: lan.value === "zh" ? "收录游戏" : "GAMES", value: rawRecords.value.length },
    {
      label: lan.value === "zh" ? "可下载版本" : "VERSIONS",
      value: rawRecords.value.reduce((sum, record) => sum + record.versions.length, 0),
    },
  ];
});

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
    @change-lan-zh="pageSetLanguageZh"
    @change-lan-en="pageSetLanguageEn"
  >
    <NxPageHead
      :title="title"
      :description="lan === 'zh'
        ? 'Softendo（Buziol Games）与 Banesoft 相关游戏的存档目录，按系列与语言筛选，每个版本都提供安装版与绿色版。'
        : 'An archive of games from Softendo (Buziol Games) and Banesoft. Filter by series and language; every version ships an installer and a portable build.'"
      :stats="stats"
    />

    <NxCatalog
      v-if="!loading"
      :catalog="catalog"
      :facets="facets"
      :sorters="sorters"
      :lan="lan"
      :placeholder="lan === 'zh' ? '搜索游戏、别名、类型…' : 'Search games, aliases, genres…'"
      :columns="{
        name: lan === 'zh' ? '游戏' : 'GAME',
        author: lan === 'zh' ? '系列' : 'SERIES',
        version: lan === 'zh' ? '年份' : 'YEARS',
        date: lan === 'zh' ? '版本数' : 'COUNT',
        tags: lan === 'zh' ? '类型' : 'GENRES',
      }"
    />
    <div
      v-else
      class="nx-page nx-loading"
    >
      {{ lan === "zh" ? "正在载入游戏目录…" : "Loading the catalog…" }}
    </div>
  </NxShell>
</template>

<style scoped>
  .nx-loading {
    padding: 40px 28px;
    color: var(--nx-muted);
    font-size: 13px;
  }
</style>
