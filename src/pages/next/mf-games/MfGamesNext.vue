<script setup>
// Mario Forever fangames catalog — redesigned.
//
// Same data pipeline as the legacy page (YAML -> normalizeMfEntry), adapted into
// the shared record model in util/next/records.js. The legacy page stays mounted
// behind src/pages/mf-games/MfGames.vue and is one click away via DesignSwitch.
import { ref, computed, onMounted } from "vue";
import NxShell from "../../../components/next/NxShell.vue";
import NxPageHead from "../../../components/next/NxPageHead.vue";
import NxCatalog from "../../../components/next/NxCatalog.vue";
import { getLanguage, setLanguageZh, setLanguageEn, getDefaultSort } from "../../../util/Language.js";
import { navTop } from "../../../config.js";
import { ensureMfList } from "../../../util/useMfList.js";
import { loadImageIndex } from "../../../util/ImageUtil.js";
import { useCatalog } from "../../../util/useCatalog.js";
import { buildMfRecords, expandMfRecord, yearOptions } from "../../../util/next/records.js";

const lan = ref(getLanguage());
const pageId = "mf-games";
const pageEntry = navTop.find((item) => item.id === pageId);

const title = computed(() => (lan.value === "zh" ? pageEntry.title : pageEntry.title_alt));

const rawRecords = ref([]);
const loading = ref(true);
const expandVersions = ref(false);

// The visitor's global default sort (Global Settings) still decides the initial
// ordering, exactly as on the legacy page.
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
  for (const record of rawRecords.value) {
    expanded.push(...expandMfRecord(record));
  }
  return expanded;
});

const regionFacet = computed(() => ({
  key: "region",
  label: lan.value === "zh" ? "地区" : "Region",
  options: [
    { value: "chinese", label: lan.value === "zh" ? "国内" : "Chinese" },
    { value: "international", label: lan.value === "zh" ? "国外" : "International" },
  ],
  test: (record, value) => record.region === value,
}));

const platformFacet = computed(() => ({
  key: "platform",
  label: lan.value === "zh" ? "平台" : "Platform",
  options: ["Windows", "Linux", "macOS", "Android", "J2ME"].map((value) => ({ value, label: value })),
  test: (record, value) => record.platform === value,
}));

const softwareFacet = computed(() => ({
  key: "software",
  label: lan.value === "zh" ? "制作软件" : "Software",
  options: [
    { value: "mmf", label: "Clickteam Fusion" },
    { value: "godot", label: "Godot" },
    { value: "gamemaker", label: "GameMaker" },
    { value: "other", label: lan.value === "zh" ? "其他" : "Other" },
  ],
  test: (record, value) => record.software === value,
}));

const yearFacet = computed(() => ({
  key: "year",
  label: lan.value === "zh" ? "年份" : "Year",
  options: yearOptions(records.value),
  test: (record, value) => record.date && String(record.date.getFullYear()) === value,
}));

const facets = computed(() => [regionFacet.value, platformFacet.value, softwareFacet.value, yearFacet.value]);

const sorters = [
  { field: "name", compare: (a, b) => String(a.name).localeCompare(String(b.name)) },
  { field: "author", compare: (a, b) => String(a.author).localeCompare(String(b.author)) },
  { field: "date", compare: (a, b) => (a.date ? a.date.getTime() : 0) - (b.date ? b.date.getTime() : 0) },
];

const catalog = useCatalog({
  records,
  searchFields: ["searchText"],
  // Getter so facet labels follow the UI language.
  facets: () => facets.value,
  sorters,
  defaultSort: initialSort,
  tags: true,
});

const stats = computed(() => {
  if (loading.value) return [];
  const years = rawRecords.value.filter((r) => r.date).map((r) => r.date.getFullYear());
  const range = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "—";
  return [
    { label: lan.value === "zh" ? "收录作品" : "TITLES", value: rawRecords.value.length },
    { label: lan.value === "zh" ? "年份跨度" : "YEARS", value: range },
  ];
});

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
    @change-lan-zh="pageSetLanguageZh"
    @change-lan-en="pageSetLanguageEn"
  >
    <NxPageHead
      :title="title"
      :description="lan === 'zh'
        ? 'Mario Forever 同人作品的持续收录档案。按地区、平台、制作软件与标签筛选，点开任意一条查看版本与下载。'
        : 'A growing archive of Mario Forever fangames. Filter by region, platform, engine and tag; open any record for versions and downloads.'"
      :stats="stats"
    />

    <div class="nx-page" style="padding-bottom: 0;">
      <label class="nx-expand">
        <input
          v-model="expandVersions"
          type="checkbox"
        />
        <span>{{ lan === "zh" ? "每个版本单独列出" : "List every version separately" }}</span>
      </label>
    </div>

    <NxCatalog
      v-if="!loading"
      :catalog="catalog"
      :facets="facets"
      :sorters="sorters"
      :lan="lan"
      :columns="{
        name: lan === 'zh' ? '作品' : 'TITLE',
        author: lan === 'zh' ? '作者' : 'AUTHOR',
        version: lan === 'zh' ? '版本' : 'VERSION',
        date: lan === 'zh' ? '日期' : 'DATE',
        tags: lan === 'zh' ? '分类' : 'CLASS',
      }"
    />
    <div
      v-else
      class="nx-page nx-loading"
    >
      {{ lan === "zh" ? "正在载入作品目录…" : "Loading the catalog…" }}
    </div>
  </NxShell>
</template>

<style scoped>
  .nx-expand {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 12.5px;
    color: var(--nx-muted);
    cursor: pointer;
    user-select: none;
    padding: 12px 0 4px;
  }

  .nx-expand input {
    accent-color: var(--nx-accent);
    cursor: pointer;
  }

  .nx-loading {
    padding: 40px 28px;
    color: var(--nx-muted);
    font-size: 13px;
  }
</style>
