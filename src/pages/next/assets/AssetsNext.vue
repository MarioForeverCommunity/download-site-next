<script setup>
// Creation assets catalog — redesigned. Chinese-only, like the legacy page.
//
// Every variant is its own row (no collapse option): variants are separately
// downloadable builds, and hiding them behind a picker buried most of the
// catalog.
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
