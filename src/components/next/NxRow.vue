<script setup>
// One catalog record in list density. The row is a button so the entire strip is
// a hit target; links inside stop propagation so they still open in a new tab.
import { computed } from "vue";
import NxIcon from "./NxIcon.vue";
import { formatIsoDate } from "../../util/next/records.js";
import { getTagColor } from "../../util/TagUtil.js";
import { getTheme } from "../../util/Theme.js";

const props = defineProps({
  record: {
    type: Object,
    required: true
  },
  lan: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: false
  },
  showTags: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(["open"]);

const theme = getTheme();

const dateText = computed(() => formatIsoDate(props.record.date));

const pillTags = computed(() => props.record.tags.slice(0, 2).map((tag) => ({
  ...tag,
  style: (() => {
    const colors = getTagColor(tag.key, theme.value === "dark");
    return { color: colors.text, borderColor: colors.border, background: colors.bg };
  })(),
})));

const regionLabel = computed(() => {
  const region = props.record.region;
  if (region === "chinese") return props.lan === "zh" ? "国内" : "CN";
  if (region === "international") return props.lan === "zh" ? "国外" : "INT";
  return null;
});

const primaryDownload = computed(() => {
  const downloads = props.record.downloads || [];
  return downloads.find((item) => !item.dead) || null;
});

function openLinks(event) {
  event.stopPropagation();
}
</script>

<template>
  <div
    class="nx-row"
    :class="{ 'is-active': active }"
    role="button"
    tabindex="0"
    @click="emit('open', record)"
    @keydown.enter.prevent="emit('open', record)"
    @keydown.space.prevent="emit('open', record)"
  >
    <div class="nx-row-title">
      <div
        class="nx-thumb"
        :class="{ 'is-empty': !record.image }"
      >
        <img
          v-if="record.image"
          :src="record.image"
          :alt="record.name"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div class="nx-row-text">
        <div class="nx-row-name">{{ record.name }}</div>
        <div
          v-if="record.nameAlt && record.nameAlt !== record.name"
          class="nx-row-sub"
        >{{ record.nameAlt }}</div>
        <div
          v-else-if="record.description"
          class="nx-row-sub"
        >{{ record.description }}</div>
      </div>
    </div>

    <div class="nx-row-cell nx-row-author">
      {{ record.author || "—" }}
    </div>

    <div class="nx-row-cell nx-mono nx-row-version">
      <template v-if="record.kind === 'softendo'">{{ record.yearLabel || "—" }}</template>
      <template v-else-if="record.kind === 'asset'">{{ record.versionLabel || "—" }}</template>
      <template v-else>{{ record.versionLabel || "—" }}</template>
    </div>

    <div class="nx-row-cell nx-mono nx-row-date">
      <template v-if="record.kind === 'softendo'">
        {{ record.versionCount }} {{ lan === "zh" ? "版本" : "ver" }}
      </template>
      <template v-else>
        {{ dateText || "—" }}
      </template>
    </div>

    <div
      v-if="showTags"
      class="nx-row-tags nx-row-tags-col"
    >
      <span
        v-if="regionLabel"
        class="nx-dot"
        :class="record.region === 'chinese' ? 'nx-dot-cn' : 'nx-dot-intl'"
      >{{ regionLabel }}</span>
      <span
        v-for="tag in pillTags"
        :key="tag.key"
        class="nx-tag"
        :style="tag.style"
      >{{ tag.label }}</span>
      <span
        v-if="record.versionCount > 1"
        class="nx-tag"
      >{{ record.versionCount }} {{ lan === "zh" ? "个版本" : "v" }}</span>
    </div>

    <div class="nx-row-actions">
      <a
        v-if="primaryDownload"
        :href="primaryDownload.url"
        target="_blank"
        rel="noopener"
        :title="lan === 'zh' ? '直接下载' : 'Direct download'"
        :aria-label="lan === 'zh' ? '直接下载' : 'Direct download'"
        @click="openLinks"
      >
        <NxIcon name="download" :size="15" />
      </a>
      <a
        v-if="record.links && record.links.source"
        :href="record.links.source"
        target="_blank"
        rel="noopener"
        :title="lan === 'zh' ? '发布页' : 'Source post'"
        :aria-label="lan === 'zh' ? '发布页' : 'Source post'"
        @click="openLinks"
      >
        <NxIcon name="link" :size="15" />
      </a>
      <span class="nx-row-more">
        <NxIcon name="chevronRight" :size="14" />
      </span>
    </div>
  </div>
</template>

<style scoped>
  .nx-row-more {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    color: var(--nx-faint);
  }

  .nx-row:hover .nx-row-more {
    color: var(--nx-ink);
  }
</style>
