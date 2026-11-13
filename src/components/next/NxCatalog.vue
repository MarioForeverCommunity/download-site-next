<script setup>
// Shared catalog surface: toolbar + list/card switch + detail drawer + deep link.
//
// Every redesigned catalog page mounts this and supplies an adapter-built record
// list, so sorting/filtering/drawer behaviour is identical across fangames, MW
// levels, assets and Softendo. Pages that need a bespoke empty state or a
// bespoke row pass it through slots.
import { computed, onMounted } from "vue";
import NxToolbar from "./NxToolbar.vue";
import NxRow from "./NxRow.vue";
import NxCard from "./NxCard.vue";
import NxDetail from "./NxDetail.vue";

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
  placeholder: {
    type: String,
    default: ""
  },
  showCards: {
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
  // Column labels; keys match the sorter fields.
  columns: {
    type: Object,
    default: () => ({})
  }
});

const current = computed(() => {  if (props.catalog.activeId.value == null) return null;
  const found = props.catalog.filtered.value.find((record) => record.id === props.catalog.activeId.value);
  if (found) return found;
  // A record opened from a deep link may be filtered out by default settings;
  // fall back to the unfiltered source so the link still works.
  return props.catalog.allRecords.value.find((record) => record.id === props.catalog.activeId.value) || null;
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
  if (record) {
    url.searchParams.set("id", record.id);
  } else {
    url.searchParams.delete("id");
  }
  window.history.replaceState({}, "", url.toString());
}

// Read ?id= on load so every record can be linked and shared. The legacy design
// uses `?game=` with its own slug format, so both are honoured: a link copied
// from the old UI keeps working after switching designs.
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
    for (const author of record.authors) {
      slugs.push(slugify(`${record.name}-${author}`));
    }
  } else if (record.author) {
    slugs.push(slugify(`${record.name}-${record.author}`));
  }
  return slugs;
}

onMounted(() => {
  readDeepLink();
});

function sortArrow(field) {
  if (props.catalog.sort.value.field !== field) return null;
  return props.catalog.sort.value.asc ? "sortUp" : "sortDown";
}

const availableSorts = computed(() => props.sorters.map((sorter) => sorter.field));

function columnLabel(key, fallback) {
  return props.columns[key] || fallback;
}
</script>

<template>
  <div>
    <NxToolbar
      :catalog="catalog"
      :facets="facets"
      :lan="lan"
      :placeholder="placeholder"
      :show-cards="showCards"
    />

    <div class="nx-list-wrap">
      <Transition
        name="nx-fade"
        mode="out-in"
      >
        <div
          v-if="catalog.filtered.value.length === 0"
          class="nx-list"
          key="empty"
        >
          <div class="nx-empty">
            <div class="nx-empty-title">{{ emptyTitle || (lan === 'zh' ? '没有符合条件的记录' : 'No matching records') }}</div>
            <p>{{ emptyHint || (lan === 'zh' ? '换一个关键词，或放宽筛选条件。' : 'Try another keyword or loosen the filters.') }}</p>
            <button
              type="button"
              class="nx-btn"
              @click="catalog.clearAll()"
            >{{ lan === "zh" ? "清除筛选" : "Clear filters" }}</button>
          </div>
        </div>

        <div
          v-else-if="catalog.view.value === 'cards' && showCards"
          class="nx-cards"
          key="cards"
        >
          <NxCard
            v-for="record in catalog.filtered.value"
            :key="record.id"
            :record="record"
            :lan="lan"
            :active="record.id === catalog.activeId.value"
            @open="open"
          />
        </div>

        <div
          v-else
          class="nx-list"
          key="list"
        >
          <div class="nx-list-head nx-row">
            <button
              type="button"
              class="nx-sort"
              :class="{ on: catalog.sort.value.field === 'name' }"
              @click="catalog.toggleSort('name')"
            >
              {{ columnLabel('name', lan === 'zh' ? '作品' : 'TITLE') }}
              <span
                v-if="sortArrow('name')"
                class="nx-sort-arrow"
              >{{ catalog.sort.value.asc ? "▲" : "▼" }}</span>
            </button>
            <button
              v-if="availableSorts.includes('author')"
              type="button"
              class="nx-sort nx-row-author"
              :class="{ on: catalog.sort.value.field === 'author' }"
              @click="catalog.toggleSort('author')"
            >
              {{ columnLabel('author', lan === 'zh' ? '作者' : 'AUTHOR') }}
              <span
                v-if="sortArrow('author')"
                class="nx-sort-arrow"
              >{{ catalog.sort.value.asc ? "▲" : "▼" }}</span>
            </button>
            <span
              v-else
              class="nx-row-author"
            >{{ columnLabel('author', lan === 'zh' ? '作者' : 'AUTHOR') }}</span>
            <span class="nx-row-version">{{ columnLabel('version', lan === 'zh' ? '版本' : 'VERSION') }}</span>
            <button
              v-if="availableSorts.includes('date')"
              type="button"
              class="nx-sort nx-row-date"
              :class="{ on: catalog.sort.value.field === 'date' }"
              @click="catalog.toggleSort('date')"
            >
              {{ columnLabel('date', lan === 'zh' ? '日期' : 'DATE') }}
              <span
                v-if="sortArrow('date')"
                class="nx-sort-arrow"
              >{{ catalog.sort.value.asc ? "▲" : "▼" }}</span>
            </button>
            <span
              v-else
              class="nx-row-date"
            >{{ columnLabel('date', lan === 'zh' ? '日期' : 'DATE') }}</span>
            <span class="nx-row-tags-col">{{ columnLabel('tags', lan === 'zh' ? '分类' : 'CLASS') }}</span>
            <span />
          </div>

          <NxRow
            v-for="record in catalog.filtered.value"
            :key="record.id"
            :record="record"
            :lan="lan"
            :active="record.id === catalog.activeId.value"
            @open="open"
          />
        </div>
      </Transition>
    </div>

    <NxDetail
      :record="current"
      :lan="lan"
      @close="close"
    />
  </div>
</template>
