<script setup>
// Sticky catalog toolbar: query, declarative facets, tri-state tag filter,
// density/theme controls and the live result count. Facets are passed in by each
// page so the same component serves fangames, MW levels, assets and Softendo.
import { ref, computed } from "vue";
import NxIcon from "./NxIcon.vue";
import { getTheme, toggleTheme, getDensity, toggleDensity } from "../../util/Theme.js";
import { getTagColor } from "../../util/TagUtil.js";

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
  placeholder: {
    type: String,
    default: ""
  },
  showCards: {
    type: Boolean,
    default: true
  }
});

const theme = getTheme();
const density = getDensity();

const tagOpen = ref(false);

const tagList = computed(() => props.catalog.tagList.value);

const tagStateOf = (tag) => props.catalog.tagStates.value[tag] || null;

const stateLabel = computed(() => ({
  or: props.lan === "zh" ? "任一" : "ANY",
  and: props.lan === "zh" ? "同时" : "ALL",
  not: props.lan === "zh" ? "排除" : "NOT",
}));

function tagStyle(tag) {
  const colors = getTagColor(tag, theme.value === "dark");
  const state = tagStateOf(tag);
  if (state === "not") {
    return { color: "var(--nx-muted)", borderColor: "var(--nx-line)", background: "transparent", textDecoration: "line-through" };
  }
  if (!state) {
    return { color: colors.text, borderColor: colors.border, background: "transparent" };
  }
  return { color: "#fff", borderColor: colors.border, background: colors.text };
}

const resultLabel = computed(() => {
  const count = props.catalog.count.value;
  const total = props.catalog.total.value;
  if (props.lan === "zh") {
    return props.catalog.isFiltered.value ? `${count} / ${total}` : `${total}`;
  }
  return props.catalog.isFiltered.value ? `${count} of ${total}` : `${total}`;
});
</script>

<template>
  <div class="nx-toolbar">
    <div class="nx-search">
      <span class="nx-search-icon"><NxIcon name="search" :size="14" /></span>
      <input
        :value="catalog.query.value"
        type="search"
        :placeholder="placeholder || (lan === 'zh' ? '搜索作品、作者、别名…' : 'Search titles, authors, aliases…')"
        :aria-label="lan === 'zh' ? '搜索' : 'Search'"
        @input="catalog.setQuery($event.target.value)"
      />
      <button
        v-if="catalog.query.value"
        class="nx-search-clear"
        type="button"
        :aria-label="lan === 'zh' ? '清除搜索' : 'Clear search'"
        @click="catalog.setQuery('')"
      >×</button>
    </div>

    <select
      v-for="facet in facets"
      :key="facet.key"
      class="nx-select"
      :value="catalog.facetValues.value[facet.key]"
      :aria-label="facet.label"
      @change="catalog.setFacet(facet.key, $event.target.value)"
    >
      <option value="">{{ facet.label }}</option>
      <option
        v-for="option in facet.options"
        :key="option.value"
        :value="option.value"
      >{{ option.label }}</option>
    </select>

    <div
      v-if="tagList.length"
      class="nx-tag-wrap"
    >
      <button
        type="button"
        class="nx-btn nx-btn-quiet"
        :class="{ 'is-on': tagOpen }"
        :aria-expanded="tagOpen"
        @click="tagOpen = !tagOpen"
      >
        <NxIcon name="tag" :size="14" />
        {{ lan === "zh" ? "标签" : "Tags" }}
        <span
          v-if="catalog.activeTagCount.value"
          class="nx-tag-count"
        >{{ catalog.activeTagCount.value }}</span>
      </button>

      <div
        v-if="tagOpen"
        class="nx-tag-pop"
      >
        <p class="nx-tag-hint">
          {{ lan === "zh" ? "点击标签依次切换：任一 → 同时 → 排除" : "Click a tag to cycle: any → all → exclude" }}
        </p>
        <div class="nx-tag-grid">
          <button
            v-for="item in tagList"
            :key="item.tag"
            type="button"
            class="nx-tag-chip"
            :style="tagStyle(item.tag)"
            :aria-pressed="!!tagStateOf(item.tag)"
            @click="catalog.cycleTag(item.tag)"
          >
            {{ lan === "zh" ? item.tag : item.tag }}
            <span class="nx-tag-chip-n">{{ item.count }}</span>
            <span
              v-if="tagStateOf(item.tag)"
              class="nx-tag-chip-state"
            >{{ stateLabel[tagStateOf(item.tag)] }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="nx-toolbar-spacer" />

    <span class="nx-count">{{ resultLabel }}</span>

    <button
      v-if="catalog.isFiltered.value"
      type="button"
      class="nx-btn nx-btn-quiet"
      :title="lan === 'zh' ? '清除全部筛选' : 'Clear all filters'"
      @click="catalog.clearAll()"
    >
      <NxIcon name="filter" :size="14" />
      {{ lan === "zh" ? "重置" : "Reset" }}
    </button>

    <button
      v-if="showCards"
      type="button"
      class="nx-btn nx-icon-btn"
      :class="{ 'is-on': catalog.view.value === 'cards' }"
      :title="catalog.view.value === 'cards' ? (lan === 'zh' ? '切换到列表' : 'Switch to list') : (lan === 'zh' ? '切换到卡片' : 'Switch to cards')"
      :aria-label="lan === 'zh' ? '切换视图' : 'Toggle view'"
      @click="catalog.toggleView()"
    >
      <NxIcon :name="catalog.view.value === 'cards' ? 'list' : 'grid'" :size="15" />
    </button>

    <button
      type="button"
      class="nx-btn nx-icon-btn"
      :class="{ 'is-on': density.value === 'compact' }"
      :title="lan === 'zh' ? '切换紧凑/舒适密度' : 'Toggle compact density'"
      :aria-label="lan === 'zh' ? '切换密度' : 'Toggle density'"
      @click="toggleDensity()"
    >
      <NxIcon name="layers" :size="15" />
    </button>

    <button
      type="button"
      class="nx-btn nx-icon-btn"
      :title="lan === 'zh' ? '切换深浅色' : 'Toggle theme'"
      :aria-label="lan === 'zh' ? '切换深浅色' : 'Toggle theme'"
      @click="toggleTheme()"
    >
      <NxIcon :name="theme === 'dark' ? 'sun' : 'moon'" :size="15" />
    </button>
  </div>
</template>

<style scoped>
  .nx-tag-wrap {
    position: relative;
  }

  .nx-tag-count {
    font-family: var(--nx-mono);
    font-size: 10px;
    background: var(--nx-accent);
    color: #fff;
    border-radius: 999px;
    min-width: 15px;
    height: 15px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
  }

  .nx-tag-pop {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    width: min(460px, calc(100vw - 32px));
    background: var(--nx-panel);
    border: 1px solid var(--nx-line);
    border-radius: var(--nx-r-lg);
    box-shadow: var(--nx-shadow-2);
    padding: 12px;
    z-index: 50;
  }

  .nx-tag-hint {
    font-size: 11.5px;
    color: var(--nx-muted);
    margin-bottom: 9px;
    line-height: 1.4;
  }

  .nx-tag-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    max-height: 280px;
    overflow-y: auto;
  }

  .nx-tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 24px;
    padding: 0 7px;
    border-radius: 3px;
    border: 1px solid;
    font-size: 11.5px;
    cursor: pointer;
    background: transparent;
    transition: opacity 0.12s ease;
  }

  .nx-tag-chip:hover {
    opacity: 0.78;
  }

  .nx-tag-chip-n {
    font-family: var(--nx-mono);
    font-size: 9.5px;
    opacity: 0.7;
  }

  .nx-tag-chip-state {
    font-family: var(--nx-mono);
    font-size: 9px;
    letter-spacing: 0.04em;
    opacity: 0.85;
    border-left: 1px solid currentColor;
    padding-left: 5px;
  }
</style>
