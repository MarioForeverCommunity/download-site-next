<script setup>
// Mario Forever fangames catalog — redesigned.
//
// Same data pipeline as the legacy page (YAML -> ensureMfList -> adapter), and
// the same platform/software rules, so the two designs can never disagree about
// what a record is. Only presentation and the filter interaction differ.
import { ref, computed, onMounted } from "vue";
import NxShell from "../../../components/next/NxShell.vue";
import NxCatalog from "../../../components/next/NxCatalog.vue";
import { getLanguage, setLanguageZh, setLanguageEn, getDefaultSort } from "../../../util/Language.js";
import { navTop } from "../../../config.js";
import { ensureMfList } from "../../../util/useMfList.js";
import { loadImageIndex } from "../../../util/ImageUtil.js";
import { useCatalog } from "../../../util/useCatalog.js";
import { buildMfRecords, expandMfRecord, makeFacet } from "../../../util/next/records.js";

const lan = ref(getLanguage());
const pageId = "mf-games";
const pageEntry = navTop.find((item) => item.id === pageId);

const title = computed(() => (lan.value === "zh" ? pageEntry.title : pageEntry.title_alt));

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
  const zh = lan.value === "zh";
  return [
    makeFacet({
      key: "region",
      label: zh ? "地区" : "Region",
      getter: (record) => record.region,
      options: {
        records: list,
        list: [
          { value: "chinese", label: zh ? "国内" : "Chinese" },
          { value: "international", label: zh ? "国外" : "International" },
        ],
      },
    }),
    makeFacet({
      key: "platform",
      label: zh ? "平台" : "Platform",
      getter: (record) => record.platform,
      options: {
        records: list,
        list: ["Windows", "Linux", "macOS", "Android", "J2ME"].map((value) => ({ value, label: value })),
      },
    }),
    makeFacet({
      key: "software",
      label: zh ? "制作软件" : "Software",
      getter: (record) => record.software,
      options: {
        records: list,
        list: [
          { value: "mmf", label: "Clickteam Fusion" },
          { value: "godot", label: "Godot" },
          { value: "gamemaker", label: "GameMaker" },
          { value: "other", label: zh ? "其他" : "Other" },
        ],
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
  tags: true,
  labels: {
    year: lan.value === "zh" ? "年份 " : "Year ",
    range: lan.value === "zh" ? "日期 " : "Date ",
  },
});

const stats = computed(() => {
  if (loading.value) return [];
  const years = rawRecords.value.filter((r) => r.date).map((r) => r.date.getFullYear());
  const range = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "—";
  return { total: rawRecords.value.length, range };
});

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
    <!-- page heading sits between topbar and content -->
    <div class="nx-pagehead">
      <div class="nx-pagehead-text">
        <h1 class="nx-masthead">{{ title }}</h1>
        <p class="nx-lede">
          {{ lan === "zh"
            ? "Mario Forever 同人作品的持续收录档案。用左侧条件收窄结果，点开任意一条查看版本、截图与下载。"
            : "A growing archive of Mario Forever fangames. Narrow with the panel on the left; open any record for versions, screenshots and downloads." }}
        </p>
      </div>
      <div
        v-if="!loading"
        class="nx-pagehead-stats"
      >
        <div class="nx-stat">
          <span class="nx-stat-v nx-num">{{ stats.total }}</span>
          <span class="nx-stat-l">{{ lan === "zh" ? "收录作品" : "titles" }}</span>
        </div>
        <div class="nx-stat">
          <span class="nx-stat-v nx-num">{{ stats.range }}</span>
          <span class="nx-stat-l">{{ lan === "zh" ? "年份跨度" : "years" }}</span>
        </div>
      </div>
    </div>

    <div class="nx-pagehead-options">
      <label class="nx-inline-check">
        <input
          v-model="expandVersions"
          type="checkbox"
        />
        <span>{{ lan === "zh" ? "每个版本单独列出" : "List every version separately" }}</span>
      </label>
    </div>

    <NxCatalog
      v-if="!loading"
      ref="catalogRef"
      :catalog="catalog"
      :facets="facets"
      :sorters="sorters"
      :lan="lan"
      :columns="{
        name: lan === 'zh' ? '作品' : 'Title',
        author: lan === 'zh' ? '作者' : 'Author',
        version: lan === 'zh' ? '版本' : 'Version',
        date: lan === 'zh' ? '日期' : 'Date',
        tags: lan === 'zh' ? '分类' : 'Class',
      }"
    />
    <div
      v-else
      class="nx-loading"
    >
      {{ lan === "zh" ? "正在载入作品目录…" : "Loading the catalog…" }}
    </div>
  </NxShell>
</template>
