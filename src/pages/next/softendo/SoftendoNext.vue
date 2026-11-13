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

// Softendo entries have year ranges rather than release dates, so sorting uses
// the latest year in each range.
const initialSort = { field: "date", asc: false };

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
      getter: (record) => record.language,
      options: {
        records: rawRecords.value,
        list: [
          { value: "en", label: zh ? "英语" : "English" },
          { value: "pl", label: zh ? "波兰语" : "Polish" },
        ],
      },
    }),
  ];
});

const sorters = [
  { field: "name", compare: (a, b) => String(a.name).localeCompare(String(b.name)) },
  { field: "date", compare: (a, b) => (a.latestYear || 0) - (b.latestYear || 0) },
];

const catalog = useCatalog({
  records: rawRecords,
  titleFields: ["titleSearch"],
  authorFields: ["authorSearch"],
  facets: () => facets.value,
  sorters,
  defaultSort: initialSort,
  tags: true,
  // Softendo entries carry year ranges rather than release dates, so the
  // release-date filter has nothing meaningful to filter on.
  dateFilter: false,
});

const stats = computed(() => {
  if (loading.value) return null;
  return {
    total: rawRecords.value.length,
    versions: rawRecords.value.reduce((sum, record) => sum + record.versions.length, 0),
  };
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
    <div class="nx-pagehead">
      <div class="nx-pagehead-text">
        <h1 class="nx-masthead">{{ title }}</h1>
        <p class="nx-lede">
          {{ lan === "zh"
            ? "Softendo（Buziol Games）与 Banesoft 相关游戏的存档目录，按系列与语言收窄结果，每个版本都提供安装版与绿色版。"
            : "An archive of games from Softendo (Buziol Games) and Banesoft. Narrow by series and language; every version ships an installer and a portable build." }}
        </p>
      </div>
      <div
        v-if="stats"
        class="nx-pagehead-stats"
      >
        <div class="nx-stat">
          <span class="nx-stat-v nx-num">{{ stats.total }}</span>
          <span class="nx-stat-l">{{ lan === "zh" ? "收录游戏" : "games" }}</span>
        </div>
        <div class="nx-stat">
          <span class="nx-stat-v nx-num">{{ stats.versions }}</span>
          <span class="nx-stat-l">{{ lan === "zh" ? "可下载版本" : "versions" }}</span>
        </div>
      </div>
    </div>

    <NxCatalog
      v-if="!loading"
      ref="catalogRef"
      :catalog="catalog"
      :facets="facets"
      :sorters="sorters"
      :lan="lan"
      :show-date="false"
      :columns="{
        name: lan === 'zh' ? '游戏' : 'Game',
        author: lan === 'zh' ? '系列' : 'Series',
        version: lan === 'zh' ? '年份' : 'Years',
        date: lan === 'zh' ? '版本数' : 'Count',
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
