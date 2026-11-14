<script setup>
// Shared catalog surface: filter pane + results + detail drawer + deep link.
//
// Every redesigned catalog page mounts this and supplies adapter-built records,
// so sorting, filtering, view switching and the drawer behave identically across
// fangames, MW levels, assets and Softendo.
import { computed, onMounted, watch, onBeforeUnmount } from "vue";
import NxFilterPane from "./NxFilterPane.vue";
import NxRow from "./NxRow.vue";
import NxCard from "./NxCard.vue";
import NxDetail from "./NxDetail.vue";
import NxIcon from "./NxIcon.vue";
import { setViewDensity } from "../../util/Theme.js";

const props = defineProps({
  catalog: {
    type: Object,
    required: true
  },
  facets: {
    type: Array,
    default: () => []
  },
  sorters: {
    type: Array,
    default: () => []
  },
  lan: {
    type: String,
    required: true
  },
  showCards: {
    type: Boolean,
    default: true
  },
  showRandom: {
    type: Boolean,
    default: false
  },
  showTags: {
    type: Boolean,
    default: true
  },
  showDate: {
    type: Boolean,
    default: true
  },
  emptyTitle: {
    type: String,
    default: ""
  },
  emptyHint: {
    type: String,
    default: ""
  },
  columns: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["random"]);

const text = computed(() => (props.lan === "zh" ? {
  count: (n, total, filtered) => (filtered ? `<b>${n}</b> / ${total} 条` : `<b>${n}</b> 条`),
  name: "作品",
  author: "作者",
  version: "版本",
  date: "日期",
  tags: "分类",
  emptyTitle: "没有符合条件的记录",
  emptyHint: "换一个关键词，或放宽筛选条件。",
  clear: "清除筛选",
  reset: "重置",
  cardView: "卡片视图",
  listView: "列表视图",
  random: "随机游戏",
} : {
  count: (n, total, filtered) => (filtered ? `<b>${n}</b> of ${total}` : `<b>${n}</b> records`),
  name: "Title",
  author: "Author",
  version: "Version",
  date: "Date",
  tags: "Class",
  emptyTitle: "No matching records",
  emptyHint: "Try another keyword or loosen the filters.",
  clear: "Clear filters",
  reset: "Reset",
  cardView: "Card view",
  listView: "List view",
  random: "Random game",
}));

const current = computed(() => {
  const id = props.catalog.activeId.value;
  if (id == null) return null;
  return props.catalog.filtered.value.find((record) => record.id === id)
    || props.catalog.allRecords.value.find((record) => record.id === id)
    || null;
});

function open(record) {
  props.catalog.setActive(record.id);
  updateUrl(record);
}

function close() {
  props.catalog.setActive(null);
  updateUrl(null);
}

function updateUrl(record) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete("game");
  url.searchParams.delete("asset");
  if (record) url.searchParams.set("id", record.id);
  else url.searchParams.delete("id");
  window.history.replaceState({}, "", url.toString());
}

// ?id= for the new design, and the legacy ?game= / ?asset= slugs, so a link
// copied from either interface keeps working after switching.
function readDeepLink() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const records = props.catalog.allRecords.value;

  const id = params.get("id");
  if (id) {
    const record = records.find((item) => item.id === id);
    if (record) {
      props.catalog.setActive(record.id);
      return;
    }
  }

  const legacySlug = params.get("game") || params.get("asset");
  if (legacySlug) {
    const match = records.find((item) => legacySlugs(item).includes(legacySlug));
    if (match) props.catalog.setActive(match.id);
  }
}

function legacySlugs(record) {
  const slugify = (value) => String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const slugs = [slugify(record.name)];
  if (record.authors && record.authors.length) {
    slugs.push(slugify(`${record.name}-${record.authors.join("-")}`));
    for (const author of record.authors) slugs.push(slugify(`${record.name}-${author}`));
  } else if (record.author) {
    slugs.push(slugify(`${record.name}-${record.author}`));
  }
  return slugs;
}

let stopDensityWatch = null;

onMounted(() => {
  readDeepLink();
  // Density follows the view: a list is for scanning, a card grid for browsing.
  setViewDensity(props.catalog.view.value);
  stopDensityWatch = watch(() => props.catalog.view.value, (view) => setViewDensity(view));
});

onBeforeUnmount(() => {
  if (stopDensityWatch) stopDensityWatch();
});

function sortArrow(field) {
  if (props.catalog.sort.value.field !== field) return null;
  return props.catalog.sort.value.asc ? "sortUp" : "sortDown";
}

const availableSorts = computed(() => props.sorters.map((sorter) => sorter.field));

function columnLabel(key, fallback) {
  return props.columns[key] || fallback;
}

// Removing a single active filter from the pill row.
function removeFilter(item) {
  if (item.type === "facet") props.catalog.toggleFacet(item.key, item.value);
  else if (item.type === "date") props.catalog.clearDate();
  else if (item.type === "tag") props.catalog.cycleTag(item.key);
  else if (item.type === "search") {
    if (item.key === "query") props.catalog.setQuery("");
    else props.catalog.setAuthorQuery("");
  }
}

const searchPills = computed(() => {
  const pills = [];
  if (props.catalog.query.value.trim()) {
    pills.push({ type: "search", key: "query", label: `“${props.catalog.query.value.trim()}”` });
  }
  if (props.catalog.authorQuery.value.trim()) {
    pills.push({ type: "search", key: "author", label: `${props.lan === "zh" ? "作者" : "Author"}: ${props.catalog.authorQuery.value.trim()}` });
  }
  return pills;
});

const allPills = computed(() => [...searchPills.value, ...props.catalog.activeFacets.value]);

function randomRecord() {
  const list = props.catalog.filtered.value;
  if (!list.length) return;
  const record = list[Math.floor(Math.random() * list.length)];
  open(record);
  emit("random", record);
}

defineExpose({ randomRecord, open });
</script>

<template>
  <div class="nx-content">
    <NxFilterPane
      :catalog="catalog"
      :facets="facets"
      :lan="lan"
      :show-tags="showTags"
      :show-date="showDate"
    >
      <template #extras>
        <slot name="pane-extras" />
      </template>
    </NxFilterPane>

    <div class="nx-results">
      <!-- results bar: count, sorting, active filters, view + random -->
      <div class="nx-results-bar">
        <span
          class="nx-results-count"
          v-html="text.count(catalog.count.value, catalog.total.value, catalog.isFiltered.value)"
        />

        <div class="nx-sort-field">
          <button
            v-for="field in availableSorts"
            :key="field"
            type="button"
            class="nx-sort-btn"
            :class="{ on: catalog.sort.value.field === field }"
            @click="catalog.toggleSort(field)"
          >
            {{ columnLabel(field, field) }}
            <span
              v-if="sortArrow(field)"
              class="nx-th-arrow"
              style="font-size:8px;"
            >{{ catalog.sort.value.asc ? "▲" : "▼" }}</span>
          </button>
        </div>

        <div
          v-if="allPills.length"
          class="nx-active-filters"
        >
          <span
            v-for="(pill, index) in allPills"
            :key="`${pill.type}-${pill.key}-${pill.value || ''}-${index}`"
            class="nx-filter-pill"
          >
            <span
              class="nx-filter-pill-label"
              :title="pill.label"
            >{{ pill.label }}</span>
            <button
              type="button"
              :aria-label="text.clear"
              @click="removeFilter(pill)"
            >×</button>
          </span>
          <button
            type="button"
            class="nx-sort-btn"
            @click="catalog.clearAll()"
          >{{ text.reset }}</button>
        </div>

        <!-- random sits immediately left of the view switch, per review -->
        <div class="nx-results-actions">
          <button
            v-if="showRandom"
            type="button"
            class="nx-icon-btn"
            :aria-label="text.random"
            :title="text.random"
            @click="randomRecord()"
          >
            <NxIcon
              name="dice"
              :size="15"
            />
          </button>
          <button
            v-if="showCards"
            type="button"
            class="nx-icon-btn"
            :aria-label="catalog.view.value === 'cards' ? text.listView : text.cardView"
            :title="catalog.view.value === 'cards' ? text.listView : text.cardView"
            @click="catalog.toggleView()"
          >
            <NxIcon
              :name="catalog.view.value === 'cards' ? 'rows' : 'grid'"
              :size="14"
            />
          </button>
        </div>
      </div>

      <div
        v-if="catalog.filtered.value.length === 0"
        class="nx-empty"
      >
        <div class="nx-empty-title">{{ emptyTitle || text.emptyTitle }}</div>
        <p>{{ emptyHint || text.emptyHint }}</p>
        <button
          type="button"
          @click="catalog.clearAll()"
        >{{ text.clear }}</button>
      </div>

      <div
        v-else-if="catalog.view.value === 'cards' && showCards"
        class="nx-cards"
      >
        <NxCard
          v-for="record in catalog.filtered.value"
          :key="record.id"
          :record="record"
          :lan="lan"
          :active="record.id === catalog.activeId.value"
          :show-tags="showTags"
          :show-date="showDate"
          @open="open"
        />
      </div>

      <div
        v-else
        class="nx-list"
      >
        <div
          class="nx-row nx-row-head"
          :class="{ 'is-softendo': !showDate, 'is-no-tags': !showTags }"
        >
          <button
            type="button"
            class="nx-th"
            :class="{ on: catalog.sort.value.field === 'name' }"
            @click="catalog.toggleSort('name')"
          >
            {{ columnLabel("name", text.name) }}
            <span
              v-if="sortArrow('name')"
              class="nx-th-arrow"
            >{{ catalog.sort.value.asc ? "▲" : "▼" }}</span>
          </button>

          <button
            v-if="availableSorts.includes('author')"
            type="button"
            class="nx-th"
            :class="{ on: catalog.sort.value.field === 'author' }"
            @click="catalog.toggleSort('author')"
          >
            {{ columnLabel("author", text.author) }}
            <span
              v-if="sortArrow('author')"
              class="nx-th-arrow"
            >{{ catalog.sort.value.asc ? "▲" : "▼" }}</span>
          </button>
          <span v-else>{{ columnLabel("author", text.author) }}</span>

          <span>{{ columnLabel("version", text.version) }}</span>
          <!-- The date column is optional (the Softendo catalog has none), so its
               header must not be rendered when the page hides it. -->
          <template v-if="showDate">
            <button
              v-if="availableSorts.includes('date')"
              type="button"
              class="nx-th"
              :class="{ on: catalog.sort.value.field === 'date' }"
              @click="catalog.toggleSort('date')"
            >
              {{ columnLabel("date", text.date) }}
              <span
                v-if="sortArrow('date')"
                class="nx-th-arrow"
              >{{ catalog.sort.value.asc ? "▲" : "▼" }}</span>
            </button>
            <span v-else>{{ columnLabel("date", text.date) }}</span>
          </template>

          <span
            v-if="showTags"
            class="nx-row-tags-col"
          >{{ columnLabel("tags", text.tags) }}</span>
          <span />
        </div>

        <NxRow
          v-for="record in catalog.filtered.value"
          :key="record.id"
          :record="record"
          :lan="lan"
          :active="record.id === catalog.activeId.value"
          :show-tags="showTags"
          :show-date="showDate"
          @open="open"
        />
      </div>
    </div>

    <NxDetail
      :record="current"
      :lan="lan"
      @close="close"
    />
  </div>
</template>
