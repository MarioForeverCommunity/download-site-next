<script setup>
// Creation assets catalog — redesigned. Chinese-only, like the legacy page.
import { ref, computed, onMounted } from "vue";
import NxShell from "../../../components/next/NxShell.vue";
import NxPageHead from "../../../components/next/NxPageHead.vue";
import NxCatalog from "../../../components/next/NxCatalog.vue";
import { getDefaultSort } from "../../../util/Language.js";
import { navTop } from "../../../config.js";
import { ensureAssetsList } from "../../../util/useAssetsList.js";
import { useCatalog } from "../../../util/useCatalog.js";
import { buildAssetRecords, yearOptions } from "../../../util/next/records.js";

const lan = ref("zh");
const pageId = "assets";
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

const typeFacet = {
  key: "type",
  label: "类型",
  options: [
    { value: "engine", label: "引擎" },
    { value: "addon", label: "拓展" },
    { value: "effect", label: "特效" },
    { value: "sprite", label: "素材" },
    { value: "tool", label: "工具" },
    { value: "mwtool", label: "MW 工具" },
  ],
  test: (record, value) => record.assetType === value,
};

const yearFacet = computed(() => ({
  key: "year",
  label: "年份",
  options: yearOptions(rawRecords.value),
  test: (record, value) => record.date && String(record.date.getFullYear()) === value,
}));

const facets = computed(() => [typeFacet, yearFacet.value]);

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
  tags: false,
});

const stats = computed(() => {
  if (loading.value) return [];
  const byType = {};
  for (const record of rawRecords.value) {
    byType[record.assetType] = (byType[record.assetType] || 0) + 1;
  }
  return [
    { label: "收录条目", value: rawRecords.value.length },
    { label: "引擎", value: byType.engine || 0 },
    { label: "素材/特效", value: (byType.sprite || 0) + (byType.effect || 0) },
  ];
});

onMounted(async () => {
  try {
    const list = await ensureAssetsList();
    rawRecords.value = buildAssetRecords(list, "zh");
  } catch (error) {
    console.error("Failed to load assets catalog:", error);
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
      description="引擎、拓展、素材、特效与工具。按类型和年份筛选，点开任意一条查看变体与下载。"
      :stats="stats"
    />

    <NxCatalog
      v-if="!loading"
      :catalog="catalog"
      :facets="facets"
      :sorters="sorters"
      :lan="lan"
      placeholder="搜索资源、作者、别名…"
      :columns="{ name: '资源', author: '作者', version: '版本', date: '日期' }"
    />
    <div
      v-else
      class="nx-page nx-loading"
    >
      正在载入创作资源…
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
