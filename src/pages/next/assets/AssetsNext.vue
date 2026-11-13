<script setup>
// Creation assets catalog — redesigned. Chinese-only, like the legacy page.
import { ref, computed, onMounted } from "vue";
import NxShell from "../../../components/next/NxShell.vue";
import NxCatalog from "../../../components/next/NxCatalog.vue";
import { getDefaultSort } from "../../../util/Language.js";
import { navTop } from "../../../config.js";
import { ensureAssetsList } from "../../../util/useAssetsList.js";
import { useCatalog } from "../../../util/useCatalog.js";
import { buildAssetRecords, makeFacet } from "../../../util/next/records.js";

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

const facets = computed(() => [
  makeFacet({
    key: "type",
    label: "类型",
    getter: (record) => record.assetType,
    options: {
      records: rawRecords.value,
      list: [
        { value: "engine", label: "引擎" },
        { value: "addon", label: "拓展" },
        { value: "effect", label: "特效" },
        { value: "sprite", label: "素材" },
        { value: "tool", label: "工具" },
        { value: "mwtool", label: "MW 工具" },
      ],
    },
  }),
]);

const sorters = [
  { field: "name", compare: (a, b) => String(a.name).localeCompare(String(b.name)) },
  { field: "author", compare: (a, b) => String(a.author).localeCompare(String(b.author)) },
  { field: "date", compare: (a, b) => (a.date ? a.date.getTime() : 0) - (b.date ? b.date.getTime() : 0) },
];

const catalog = useCatalog({
  records: rawRecords,
  titleFields: ["titleSearch"],
  authorFields: ["authorSearch"],
  facets: () => facets.value,
  sorters,
  defaultSort: initialSort,
  tags: false,
  labels: { year: "年份 ", range: "日期 " },
});

const stats = computed(() => {
  if (loading.value) return null;
  const byType = {};
  for (const record of rawRecords.value) {
    byType[record.assetType] = (byType[record.assetType] || 0) + 1;
  }
  return {
    total: rawRecords.value.length,
    engines: byType.engine || 0,
    media: (byType.sprite || 0) + (byType.effect || 0),
  };
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
    :search="catalog"
  >
    <div class="nx-pagehead">
      <div class="nx-pagehead-text">
        <h1 class="nx-masthead">{{ title }}</h1>
        <p class="nx-lede">
          引擎、拓展、素材、特效与工具。按类型与日期收窄结果，点开任意一条查看变体与下载。
        </p>
      </div>
      <div
        v-if="stats"
        class="nx-pagehead-stats"
      >
        <div class="nx-stat">
          <span class="nx-stat-v nx-num">{{ stats.total }}</span>
          <span class="nx-stat-l">收录条目</span>
        </div>
        <div class="nx-stat">
          <span class="nx-stat-v nx-num">{{ stats.engines }}</span>
          <span class="nx-stat-l">引擎</span>
        </div>
        <div class="nx-stat">
          <span class="nx-stat-v nx-num">{{ stats.media }}</span>
          <span class="nx-stat-l">素材 / 特效</span>
        </div>
      </div>
    </div>

    <NxCatalog
      v-if="!loading"
      :catalog="catalog"
      :facets="facets"
      :sorters="sorters"
      :lan="lan"
      :show-tags="false"
      :columns="{ name: '资源', author: '作者', version: '版本', date: '日期' }"
    />
    <div
      v-else
      class="nx-loading"
    >
      正在载入创作资源…
    </div>
  </NxShell>
</template>
