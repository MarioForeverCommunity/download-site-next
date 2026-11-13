<script setup>
// Mario Worker levels catalog — redesigned.
//
// Chinese-only, matching the legacy page (config.js `show_en: false`), so the
// language control is hidden by the shell.
import { ref, computed, onMounted } from "vue";
import NxShell from "../../../components/next/NxShell.vue";
import NxCatalog from "../../../components/next/NxCatalog.vue";
import { getDefaultSort } from "../../../util/Language.js";
import { navTop } from "../../../config.js";
import { readList } from "../../../util/ReadList.js";
import { loadImageIndex } from "../../../util/ImageUtil.js";
import { useCatalog } from "../../../util/useCatalog.js";
import { buildMwRecords, makeFacet, distinctValues } from "../../../util/next/records.js";

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

const facets = computed(() => {
  const list = rawRecords.value;
  const smwpValues = distinctValues(list, (record) => record.smwpVersion).sort((a, b) => {
    if (a === "MW 4.4") return -1;
    if (b === "MW 4.4") return 1;
    return String(a).localeCompare(String(b), undefined, { numeric: true });
  });

  return [
    makeFacet({
      key: "smwp",
      label: "MW 版本",
      getter: (record) => record.smwpVersion,
      options: {
        records: list,
        list: smwpValues.map((value) => ({ value, label: value })),
      },
    }),
    makeFacet({
      key: "runtime",
      label: "运行要求",
      getter: (record) => {
        if (record.bundled) return "bundled";
        if (record.hasBgm) return "bgm";
        return "download";
      },
      options: {
        records: list,
        list: [
          { value: "bundled", label: "自带 MW" },
          { value: "download", label: "需下载 MW" },
          { value: "bgm", label: "需替换 BGM" },
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
  records: rawRecords,
  titleFields: ["titleSearch"],
  authorFields: ["authorSearch"],
  facets: () => facets.value,
  sorters,
  defaultSort: initialSort,
  tags: true,
  labels: { year: "年份 ", range: "日期 " },
});

const stats = computed(() => {
  if (loading.value) return null;
  const years = rawRecords.value.filter((r) => r.date).map((r) => r.date.getFullYear());
  return {
    total: rawRecords.value.length,
    range: years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "—",
  };
});

const catalogRef = ref(null);

function randomGame() {
  if (catalogRef.value) catalogRef.value.randomRecord();
}

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
    :search="catalog"
    show-random
    @random="randomGame"
  >
    <div class="nx-pagehead">
      <div class="nx-pagehead-text">
        <h1 class="nx-masthead">{{ title }}</h1>
        <p class="nx-lede">
          Mario Worker 关卡作品目录。用左侧条件按 MW 版本、运行要求或日期收窄结果，点开任意一条查看下载与运行说明。
        </p>
      </div>
      <div
        v-if="stats"
        class="nx-pagehead-stats"
      >
        <div class="nx-stat">
          <span class="nx-stat-v nx-num">{{ stats.total }}</span>
          <span class="nx-stat-l">收录作品</span>
        </div>
        <div class="nx-stat">
          <span class="nx-stat-v nx-num">{{ stats.range }}</span>
          <span class="nx-stat-l">年份跨度</span>
        </div>
      </div>
    </div>

    <div class="nx-pagehead-options">
      <p class="nx-note is-warn">
        <span>游玩前需要先下载 Mario Worker，并尽量使用作品对应的版本；带「需替换 BGM」标记的作品请勿忘记放置音乐包。</span>
      </p>
    </div>

    <NxCatalog
      v-if="!loading"
      ref="catalogRef"
      :catalog="catalog"
      :facets="facets"
      :sorters="sorters"
      :lan="lan"
      :columns="{ name: '作品', author: '作者', version: 'MW 版本', date: '日期', tags: '标记' }"
    />
    <div
      v-else
      class="nx-loading"
    >
      正在载入关卡目录…
    </div>
  </NxShell>
</template>
