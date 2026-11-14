<script setup>
// Mario Worker levels catalog — redesigned.
//
// Chinese-only, matching the legacy page (config.js `show_en: false`).
// No tag filter: MW entries carry only "专用 MW" / "BGM" runtime flags, which
// the 运行要求 facet already expresses, so a second tag filter would duplicate it.
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
  // Newest MW version first: the current editors are what visitors look for.
  const smwpValues = distinctValues(list, (record) => record.smwpVersion).sort((a, b) => {
    const rank = (value) => {
      if (value === "MW 4.4") return 1;
      if (value === "MW 4.0") return 0;
      return 2;
    };
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== rb) return rb - ra;
    return String(b).localeCompare(String(a), undefined, { numeric: true });
  });

  return [
    makeFacet({
      key: "smwp",
      label: "MW 版本",
      // Long option set rendered as pills, matching the year filter's shape.
      as: "chips",
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
  tags: false,
  labels: { year: "年份 ", range: "日期 " },
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
    :search="catalog"
  >
    <NxCatalog
      v-if="!loading"
      :catalog="catalog"
      :facets="facets"
      :sorters="sorters"
      :lan="lan"
      show-random
      :show-tags="false"
      :columns="{ name: '作品', author: '作者', version: 'MW 版本', date: '日期', tags: '标记' }"
    >
      <template #pane-extras>
        <section class="nx-pane-section">
          <h4><span>列表选项</span></h4>
          <label class="nx-inline-check">
            <input
              :checked="catalog.onlyWithImage.value"
              type="checkbox"
              @change="catalog.onlyWithImage.value = $event.target.checked"
            />
            <span>仅显示有图片的作品</span>
          </label>
        </section>
      </template>
    </NxCatalog>
    <div
      v-else
      class="nx-loading"
    >
      正在载入关卡目录…
    </div>
  </NxShell>
</template>
