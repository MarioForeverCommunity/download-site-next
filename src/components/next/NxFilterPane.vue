<script setup>
// Secondary filter sidebar.
//
// Filters are *always visible* next to the results instead of living in
// dropdowns: on a catalog you narrow and re-narrow constantly, so each click
// should cost one action, not two.
//
// Facets are multi-select (values inside one facet are OR-ed) because narrowing
// a large catalog is rarely a single choice. Tags stay tri-state because
// "has any of" / "has all of" / "excludes" are genuinely different questions.
import { computed } from "vue";
import NxIcon from "./NxIcon.vue";

const props = defineProps({
  catalog: {
    type: Object,
    required: true
  },
  facets: {
    type: Array,
    default: () => []
  },
  lan: {
    type: String,
    required: true
  },
  showTags: {
    type: Boolean,
    default: true
  },
  // Pages without a meaningful release date (Softendo ships year ranges) hide
  // the whole date section.
  showDate: {
    type: Boolean,
    default: true
  }
});

const text = computed(() => (props.lan === "zh" ? {
  tags: "标签",
  date: "发布时间",
  byYear: "年份",
  byRange: "日期区间",
  from: "起",
  to: "止",
  reset: "重置",
  all: "全部",
  rangeHint: "包含起止日期，精确到日。",
  tagHint: "点击依次切换：任一 / 同时 / 排除",
  anyYear: "全部年份",
} : {
  tags: "Tags",
  date: "Release date",
  byYear: "Year",
  byRange: "Date range",
  from: "From",
  to: "To",
  reset: "Reset",
  all: "All",
  rangeHint: "Inclusive, exact to the day.",
  tagHint: "Click to cycle: any / all / exclude",
  anyYear: "All years",
}));

const catalog = computed(() => props.catalog);

const choiceFacets = computed(() => props.facets.filter((facet) => facet.kind !== "tags"));

const tagList = computed(() => catalog.value.tagList.value);

const tagState = (tag) => catalog.value.tagStates.value[tag] || null;

const isRangeMode = computed(() => catalog.value.dateMode.value === "range");

const quickRanges = computed(() => {
  const now = new Date();
  const thisYear = String(now.getFullYear());
  const lastYear = String(now.getFullYear() - 1);
  return [
    { label: props.lan === "zh" ? "今年" : "This year", from: `${thisYear}-01-01`, to: `${thisYear}-12-31` },
    { label: props.lan === "zh" ? "去年" : "Last year", from: `${lastYear}-01-01`, to: `${lastYear}-12-31` },
    { label: props.lan === "zh" ? "近 30 天" : "30 days", from: isoDaysAgo(30), to: isoDaysAgo(0) },
  ];
});

function isoDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function applyQuick(range) {
  catalog.value.setDateMode("range");
  catalog.value.setRange(range.from, range.to);
}

function onFromInput(event) {
  catalog.value.setRange(event.target.value, catalog.value.rangeTo.value);
}

function onToInput(event) {
  catalog.value.setRange(catalog.value.rangeFrom.value, event.target.value);
}

function isFacetOn(key, value) {
  return (catalog.value.facetValues.value[key] || []).includes(value);
}

function facetCount(key) {
  return (catalog.value.facetValues.value[key] || []).length;
}
</script>

<template>
  <aside
    class="nx-pane"
    :aria-label="lan === 'zh' ? '筛选' : 'Filters'"
  >
    <!-- single-choice facets: region, platform/engine, classification -->
    <section
      v-for="facet in choiceFacets"
      :key="facet.key"
      class="nx-pane-section"
    >
      <h4>
        <span>{{ facet.label }}</span>
        <button
          v-if="facetCount(facet.key)"
          type="button"
          class="nx-pane-reset"
          @click="catalog.clearFacet(facet.key)"
        >{{ text.reset }}</button>
      </h4>

      <div class="nx-checks">
        <button
          type="button"
          class="nx-check"
          :class="{ on: !facetCount(facet.key) }"
          @click="catalog.clearFacet(facet.key)"
        >
          <span class="nx-check-box">
            <NxIcon
              v-if="!facetCount(facet.key)"
              name="check"
              :size="10"
            />
          </span>
          <span>{{ text.all }}</span>
          <span class="nx-check-count">{{ catalog.total.value }}</span>
        </button>

        <button
          v-for="option in facet.options"
          :key="option.value"
          type="button"
          class="nx-check"
          :class="{ on: isFacetOn(facet.key, option.value) }"
          @click="catalog.toggleFacet(facet.key, option.value)"
        >
          <span class="nx-check-box">
            <NxIcon
              v-if="isFacetOn(facet.key, option.value)"
              name="check"
              :size="10"
            />
          </span>
          <span>{{ option.label }}</span>
          <span
            v-if="option.count != null"
            class="nx-check-count"
          >{{ option.count }}</span>
        </button>
      </div>
    </section>

    <!-- release date: year(s) OR exact range, mutually exclusive -->
    <section
      v-if="showDate"
      class="nx-pane-section"
    >
      <h4>
        <span>{{ text.date }}</span>
        <button
          v-if="catalog.hasDateFilter.value"
          type="button"
          class="nx-pane-reset"
          @click="catalog.clearDate()"
        >{{ text.reset }}</button>
      </h4>

      <div class="nx-seg">
        <button
          type="button"
          :class="{ on: !isRangeMode }"
          @click="catalog.setDateMode('year')"
        >{{ text.byYear }}</button>
        <button
          type="button"
          :class="{ on: isRangeMode }"
          @click="catalog.setDateMode('range')"
        >{{ text.byRange }}</button>
      </div>

      <!-- years as multi-select chips: a 14-row radio list would bury the
           filters below it, and several years are often wanted at once -->
      <div
        v-if="!isRangeMode"
        class="nx-chips"
      >
        <button
          v-for="year in catalog.yearOptions.value"
          :key="year"
          type="button"
          class="nx-chip"
          :class="{ 'on-or': (catalog.filterYears.value || []).includes(year) }"
          :aria-pressed="(catalog.filterYears.value || []).includes(year)"
          @click="catalog.toggleYear(year)"
        >
          {{ year }}
          <span class="nx-chip-n">{{ catalog.yearCounts.value.get(year) || 0 }}</span>
        </button>
      </div>

      <div
        v-else
        class="nx-daterange"
      >
        <div class="nx-daterange-row">
          <label :for="`nx-from-${catalog.uid}`">{{ text.from }}</label>
          <input
            :id="`nx-from-${catalog.uid}`"
            class="nx-date"
            type="date"
            :min="catalog.dateBounds.value.min"
            :max="catalog.dateBounds.value.max"
            :value="catalog.rangeFrom.value"
            @input="onFromInput"
          />
        </div>
        <div class="nx-daterange-row">
          <label :for="`nx-to-${catalog.uid}`">{{ text.to }}</label>
          <input
            :id="`nx-to-${catalog.uid}`"
            class="nx-date"
            type="date"
            :min="catalog.dateBounds.value.min"
            :max="catalog.dateBounds.value.max"
            :value="catalog.rangeTo.value"
            @input="onToInput"
          />
        </div>
        <div class="nx-quick">
          <button
            v-for="range in quickRanges"
            :key="range.label"
            type="button"
            @click="applyQuick(range)"
          >{{ range.label }}</button>
        </div>
        <p class="nx-daterange-hint">{{ text.rangeHint }}</p>
      </div>
    </section>

    <!-- tags: tri-state -->
    <section
      v-if="showTags && tagList.length"
      class="nx-pane-section"
    >
      <h4>
        <span>{{ text.tags }}</span>
        <button
          v-if="catalog.activeTagCount.value"
          type="button"
          class="nx-pane-reset"
          @click="catalog.clearTags()"
        >{{ text.reset }}</button>
      </h4>
      <div class="nx-chips">
        <button
          v-for="item in tagList"
          :key="item.tag"
          type="button"
          class="nx-chip"
          :class="tagState(item.tag) ? `on-${tagState(item.tag)}` : ''"
          :aria-pressed="!!tagState(item.tag)"
          :title="text.tagHint"
          @click="catalog.cycleTag(item.tag)"
        >
          {{ item.tag }}
          <span class="nx-chip-n">{{ item.count }}</span>
        </button>
      </div>
    </section>

    <!-- page-specific extras (e.g. "list every version separately") -->
    <slot name="extras" />
  </aside>
</template>
