<script setup>
// Shared catalog surface: filter pane + results + detail drawer + deep link.
//
// Every redesigned catalog page mounts this and supplies adapter-built records,
// so sorting, filtering, view switching and the drawer behave identically across
// fangames, MW levels, assets and Softendo.
import { computed, onMounted, watch, onBeforeUnmount, ref } from "vue";
import NxFilterPane from "./NxFilterPane.vue";
import NxRow from "./NxRow.vue";
import NxCard from "./NxCard.vue";
import NxDetail from "./NxDetail.vue";
import NxIcon from "./NxIcon.vue";
import { setViewDensity } from "../../util/Theme.js";
import { lockScroll } from "../../util/next/scrollLock.js";
import { pushBackGuard } from "../../util/next/backGuard.js";

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
  // Catalogs whose records have no per-row links (Softendo) drop the download
  // column entirely rather than leaving an empty track.
  showActions: {
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
  },
  // The catalog data's last update, rendered in the results bar.
  updated: {
    type: String,
    default: ""
  },
  // MF catalogs pass this while their versions are collapsed: the phone meta
  // line then shows the author and date only (see NxRow's `hideVersion`).
  hideVersion: {
    type: Boolean,
    default: false
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
  pages: "分页",
  prevPage: "上一页",
  nextPage: "下一页",
} : {
  count: (n, total, filtered) => (filtered ? `<b>${n}</b> / ${total} records` : `<b>${n}</b> records`),
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
  pages: "Pagination",
  prevPage: "Previous page",
  nextPage: "Next page",
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

// "See all works" for a domestic MF author: no File Hub folder exists, so the
// author search box takes the first author's name (and the title query is
// cleared, otherwise it would keep narrowing the results).
function searchAuthor(name) {
  props.catalog.setQuery("");
  props.catalog.setAuthorQuery(name);
  close();
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

// The URL must stop naming the record as soon as its drawer is gone, whichever
// way it went away.
//
// Clearing it in `close()` alone was not enough: the drawer's back guard undoes
// its sentinel with `history.back()` when it closes, and that restores the entry
// that was current when the record was opened — an entry that still carries the
// `?id=` written at open time (or the one a shared link brought in). The back
// then landed on a URL naming a record whose drawer had just closed, so the
// parameter has to be cleared again on the entry the pop returns to.
function clearDeepLink() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has("id") && !url.searchParams.has("game") && !url.searchParams.has("asset")) return;
  updateUrl(null);
}

function onPopState() {
  if (props.catalog.activeId.value == null) clearDeepLink();
}

// A record can also disappear from the drawer without `close()` being called —
// a filter change that hides it resets `activeId` from the catalog store.
watch(() => props.catalog.activeId.value, (id) => {
  if (id == null) clearDeepLink();
});

// An author query can arrive from the URL (a doc card's "View all their works").
// Removing the author pill, resetting the filters or clearing the search box
// must drop the parameter too, otherwise the filter would come back on the next
// reload — including after the back-guard's `history.back()` restores the entry
// that carried it.
watch(() => props.catalog.authorQuery.value, (value) => {
  if (typeof window === "undefined") return;
  if (String(value).trim()) return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has("author")) return;
  url.searchParams.delete("author");
  window.history.replaceState({}, "", url.toString());
});

// ?id= for the new design, and the legacy ?game= / ?asset= slugs, so a link
// copied from either interface keeps working after switching.
function readDeepLink() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const records = props.catalog.allRecords.value;

  // Documentation pages have no catalog of their own, so their "View all their
  // works" button navigates here with the author in the query string; applying
  // it makes the landing list identical to what the drawer's own button shows.
  const author = params.get("author");
  if (author) props.catalog.setAuthorQuery(author);

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
  // Closing the drawer pops its back-guard sentinel; the entry it restores is
  // the one whose deep link has to be cleaned up (see clearDeepLink).
  window.addEventListener("popstate", onPopState);
});

onBeforeUnmount(() => {
  if (stopDensityWatch) stopDensityWatch();
  window.removeEventListener("popstate", onPopState);
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

// On a phone the filter pane becomes a right-hand drawer instead of a block
// above the results: a full-width column of facets pushed the catalog itself
// below the fold. The toggle lives in the results bar and is phone-only.
const filtersOpen = ref(false);

function toggleFilters() {
  filtersOpen.value = !filtersOpen.value;
}

function closeFilters() {
  filtersOpen.value = false;
}

function onFilterKeydown(event) {
  if (event.key === "Escape" && filtersOpen.value) filtersOpen.value = false;
}

// While the filter drawer is open the page behind it must not scroll or take
// pointer input: the scrim already covers the content, and this stops the wheel
// from scrolling the catalog underneath.
// The Android back button closes the filter drawer instead of leaving the page.
let releaseBack = null;

watch(filtersOpen, (open) => {
  lockScroll(open);
  if (open) {
    releaseBack = pushBackGuard(closeFilters);
  } else if (releaseBack) {
    releaseBack();
    releaseBack = null;
  }
});

onMounted(() => document.addEventListener("keydown", onFilterKeydown));
onBeforeUnmount(() => {
  document.removeEventListener("keydown", onFilterKeydown);
  // A navigation can swap this component out while the drawer is open; without
  // this the page would stay scroll-locked.
  if (filtersOpen.value) lockScroll(false);
});

function randomRecord() {
  const list = props.catalog.filtered.value;
  if (!list.length) return;
  const record = list[Math.floor(Math.random() * list.length)];
  open(record);
  emit("random", record);
}

// Page buttons: first and last are always reachable, with a window around the
// current page and an ellipsis where the sequence skips.
const pageItems = computed(() => {
  const total = props.catalog.pageCount.value;
  const current = props.catalog.page.value;
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const start = Math.max(2, Math.min(current - 1, total - 4));
  const end = Math.min(total - 1, Math.max(current + 1, 5));
  const items = [1];
  if (start > 2) items.push("…");
  for (let value = start; value <= end; value++) items.push(value);
  if (end < total - 1) items.push("…");
  items.push(total);
  return items;
});

function goPage(value) {
  if (!Number.isFinite(value)) return;
  props.catalog.setPage(value);
  // The controls sit under the list, so a new page would otherwise open below
  // the fold with the previous page's last rows in view.
  if (typeof window !== "undefined") window.scrollTo({ top: 0 });
}

defineExpose({ randomRecord, open });
</script>

<template>
  <div class="nx-content">
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

      <!-- Last updated for the catalog's data, so the stamp is visible without
               opening the description drawer or reading the topbar. -->
      <span
        v-if="updated"
        class="nx-results-updated nx-num"
      >{{ lan === "zh" ? "最后更新：" : "Last updated: " }}{{ updated }}</span>

      <!-- random sits immediately left of the view switch, per review -->
      <div class="nx-results-actions">
        <!-- Phones only: opens the filter drawer. On desktop the pane is always
             visible beside the results, so the button is hidden. -->
        <button
          type="button"
          class="nx-icon-btn nx-filter-toggle"
          :class="{ 'is-on': filtersOpen }"
          :aria-expanded="filtersOpen"
          :aria-label="text.filters"
          :title="text.filters"
          @click="toggleFilters()"
        >
          <NxIcon
            name="filter"
            :size="15"
          />
        </button>
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

    <div class="nx-content-main">
      <!-- Scrim behind the phone-only filter drawer -->
      <button
        v-if="filtersOpen"
        type="button"
        class="nx-scrim nx-filter-scrim"
        :aria-label="text.close"
        @click="closeFilters()"
      />
      <NxFilterPane
        :open="filtersOpen"
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
            v-for="record in catalog.pageRecords.value"
            :key="record.id"
            :record="record"
            :lan="lan"
            :active="record.id === catalog.activeId.value"
            :show-tags="showTags"
            :show-date="showDate"
            :show-actions="showActions"
            @open="open"
          />
        </div>

        <div
          v-else
          class="nx-list"
        >
          <div
            class="nx-row nx-row-head"
            :class="{ 'is-softendo': !showDate, 'is-no-tags': !showTags, 'is-no-actions': !showActions }"
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
            <span v-if="showActions" />
          </div>

          <NxRow
            v-for="record in catalog.pageRecords.value"
            :key="record.id"
            :record="record"
            :lan="lan"
            :active="record.id === catalog.activeId.value"
            :show-tags="showTags"
            :show-date="showDate"
            :show-actions="showActions"
            :hide-version="hideVersion"
            @open="open"
          />
        </div>

        <!-- Pagination sits under the results, so the first rows stay on screen
             while paging. Hidden when everything fits on one page. -->
        <nav
          v-if="catalog.pageCount.value > 1"
          class="nx-pages"
          :aria-label="text.pages"
        >
          <button
            type="button"
            class="nx-page-btn"
            :disabled="catalog.page.value === 1"
            :aria-label="text.prevPage"
            @click="goPage(catalog.page.value - 1)"
          >
            <NxIcon
              name="chevronLeft"
              :size="13"
            />
          </button>

          <template
            v-for="(item, index) in pageItems"
            :key="`page-${index}-${item}`"
          >
            <span
              v-if="item === '…'"
              class="nx-page-gap"
              aria-hidden="true"
            >…</span>
            <button
              v-else
              type="button"
              class="nx-page-btn nx-num"
              :class="{ on: item === catalog.page.value }"
              :aria-current="item === catalog.page.value ? 'page' : undefined"
              @click="goPage(item)"
            >{{ item }}</button>
          </template>

          <button
            type="button"
            class="nx-page-btn"
            :disabled="catalog.page.value === catalog.pageCount.value"
            :aria-label="text.nextPage"
            @click="goPage(catalog.page.value + 1)"
          >
            <NxIcon
              name="chevronRight"
              :size="13"
            />
          </button>
        </nav>
      </div>

      <NxDetail
        :record="current"
        :lan="lan"
        @close="close"
        @search-author="searchAuthor"
      />
    </div>
  </div>
</template>
