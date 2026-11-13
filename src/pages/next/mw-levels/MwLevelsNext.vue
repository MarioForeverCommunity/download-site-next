<script setup>
// Mario Worker levels catalog — redesigned.
//
// The legacy page is Chinese-only, so this page is too: NxShell hides the
// language control for it based on config.js `show_en: false`.
import { ref, computed, onMounted } from "vue";
import NxShell from "../../../components/next/NxShell.vue";
import NxPageHead from "../../../components/next/NxPageHead.vue";
import NxCatalog from "../../../components/next/NxCatalog.vue";
import { getDefaultSort } from "../../../util/Language.js";
import { navTop } from "../../../config.js";
import { readList } from "../../../util/ReadList.js";
import { loadImageIndex } from "../../../util/ImageUtil.js";
import { useCatalog } from "../../../util/useCatalog.js";
import { buildMwRecords, yearOptions } from "../../../util/next/records.js";

const lan = ref("zh");
const pageId = "mw-levels";
const pageEntry = navTop.find((item) => item.id === pageId);

const title = computed(() => pageEntry.title);

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

const smwpFacet = computed(() => {
  const versions = new Set();
  for (const record of rawRecords.value) {
    if (record.smwpVersion) versions.add(record.smwpVersion);
  }
  const ordered = Array.from(versions).sort((a, b) => {
    if (a === "MW 4.4") return -1;
    if (b === "MW 4.4") return 1;
    return String(a).localeCompare(String(b), undefined, { numeric: true });
  });
  return {
    key: "smwp",
    label: "MW 版本",
    options: ordered.map((value) => ({ value, label: value })),
    test: (record, value) => record.smwpVersion === value,
  };
});

const yearFacet = computed(() => ({
  key: "year",
  label: "年份",
  options: yearOptions(rawRecords.value),
  test: (record, value) => record.date && String(record.date.getFullYear()) === value,
}));

const bundledFacet = {
  key: "bundled",
  label: "运行要求",
  options: [
    { value: "bundled", label: "自带 MW" },
    { value: "download", label: "需下载 MW" },
    { value: "bgm", label: "需替换 BGM" },
  ],
  test: (record, value) => {
    if (value === "bundled") return record.bundled;
    if (value === "download") return !record.bundled;
    if (value === "bgm") return record.hasBgm;
    return true;
  },
};

const facets = computed(() => [smwpFacet.value, yearFacet.value, bundledFacet]);

const sorters = [
  { field: "name", compare: (a, b) => String(a.name).localeCompare(String(b.name)) },
  { field: "author", compare: (a, b) => String(a.author).localeCompare(String(b.author)) },
  { field: "date", compare: (a, b) => (a.date ? a.date.getTime() : 0) - (b.date ? b.date.getTime() : 0) },
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
  const years = rawRecords.value.filter((r) => r.date).map((r) => r.date.getFullYear());
  const range = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "—";
  return [
    { label: "收录作品", value: rawRecords.value.length },
    { label: "年份跨度", value: range },
  ];
});

onMounted(async () => {
  try {
    const [list] = await Promise.all([readList("list-mw.yaml"), loadImageIndex().catch(() => null)]);
    rawRecords.value = buildMwRecords(list);
  } catch (error) {
    console.error("Failed to load MW catalog:", error);
    rawRecords.value = [];
  } finally {
    loading.value = false;
  }
});

document.title = title.value;
</script>

<template>
  <NxShell
    :page-id="pageId"
    :lan="lan"
    :title="title"
  >
    <NxPageHead
      :title="title"
      description="Mario Worker 关卡作品的收录目录。按 MW 版本、年份和运行要求筛选，点开任意一条查看下载与运行说明。"
      :stats="stats"
    />

    <div class="nx-page" style="padding-bottom: 0;">
      <p class="nx-note is-warn" style="margin: 12px 0 4px;">
        游玩前需要先下载 Mario Worker，并尽量使用作品对应的版本；带「需替换 BGM」标记的作品不要忘记放置音乐包。
      </p>
    </div>

    <NxCatalog
      v-if="!loading"
      :catalog="catalog"
      :facets="facets"
      :sorters="sorters"
      :lan="lan"
      placeholder="搜索作品、作者、别名…"
      :columns="{ name: '作品', author: '作者', version: 'MW 版本', date: '日期', tags: '标记' }"
    />
    <div
      v-else
      class="nx-page nx-loading"
    >
      正在载入关卡目录…
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
