<script setup>
// One catalog record in list density. The row is a button so the whole strip is
// a hit target; links inside stop propagation so they still open in a new tab.
import { computed } from "vue";
import NxIcon from "./NxIcon.vue";
import NxLogoPlaceholder from "./NxLogoPlaceholder.vue";
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
  // Mirrors the catalog's column switches so the row drops the same columns the
  // header does; otherwise the trailing action column drifts left.
  showTags: {
    type: Boolean,
    default: true
  },
  showDate: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(["open"]);

const theme = getTheme();

const dateText = computed(() => formatIsoDate(props.record.date));

// Every tag is shown, not just the first two: the class column is how a visitor
// decides whether a record is relevant, so truncating it defeats the purpose.
const tagPills = computed(() => props.record.tags.map((tag) => {
  // Runtime flags (专用 MW / BGM) keep the legacy design's hues, but rendered as
  // a tinted background with a strong border and dark text rather than a solid
  // fill, so they sit beside content tags without shouting.
  if (tag.tone === "mw") {
    return {
      ...tag,
      style: { color: "#b45309", borderColor: "#f0a44a", background: "#fdf1e0" },
    };
  }
  if (tag.tone === "bgm") {
    return {
      ...tag,
      style: { color: "#a50036", borderColor: "#f0a0c0", background: "#fdeef4" },
    };
  }
  const colors = getTagColor(tag.key, theme.value === "dark");
  return { ...tag, style: { color: colors.text, borderColor: colors.border, background: colors.bg } };
}));

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

// Only meaningful when the catalog is expanded per version; on a collapsed
// multi-version row every version is "the record" and a badge would be noise.
const isLatest = computed(() => props.record.isLatestVersion === true);

// One author per line in list view; a comma-joined string hid collaborators.
const displayAuthors = computed(() => {
  const authors = props.record.authors;
  if (Array.isArray(authors) && authors.length > 0) return authors;
  return props.record.author ? [props.record.author] : [];
});

// Assets show the variant name only when the entry really has several variants.
// An entry that merely specifies `ver` without `variant` keeps its version in
// the version column and must not have it repeated beside the title.
const showVariant = computed(() => props.record.kind === "asset" && !!props.record.variantLabel);

function openLinks(event) {
  event.stopPropagation();
}
</script>

<template>
  <div
    class="nx-row"
    :class="{
      'is-active': active,
      'is-softendo': record.kind === 'softendo' || !showDate,
      'is-no-tags': !showTags,
    }"
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
        <NxLogoPlaceholder
          v-else
          :lan="lan"
          variant="thumb"
        />
      </div>
      <div class="nx-row-text">
        <div class="nx-row-name">
          {{ record.name }}<span
            v-if="showVariant"
            class="nx-row-variant"
          > ({{ record.variantLabel }})</span>
        </div>
        <div
          v-if="record.nameAlt && record.nameAlt !== record.name"
          class="nx-row-sub"
        >{{ record.nameAlt }}</div>
      </div>
    </div>

    <div
      v-if="displayAuthors.length > 1"
      class="nx-cell nx-cell-authors"
    >
      <span
        v-for="(name, index) in displayAuthors"
        :key="name + index"
      >{{ name }}</span>
    </div>
    <div
      v-else
      class="nx-cell"
    >
      {{ record.author || "—" }}
    </div>

    <div class="nx-cell nx-num">
      <template v-if="record.kind === 'softendo'">{{ record.yearLabel || "—" }}</template>
      <template v-else>{{ record.versionLabel || "—" }}</template>
    </div>

    <div
      v-if="record.kind !== 'softendo'"
      class="nx-cell nx-num"
    >
      {{ dateText || "—" }}
    </div>

    <div
      v-if="showTags"
      class="nx-row-tags nx-row-tags-col"
    >
      <span
        v-if="isLatest"
        class="nx-dot nx-dot-cur"
      >{{ lan === "zh" ? "最新" : "LATEST" }}</span>
      <span
        v-if="regionLabel"
        class="nx-dot"
        :class="record.region === 'chinese' ? 'nx-dot-cn' : 'nx-dot-intl'"
      >{{ regionLabel }}</span>
      <span
        v-for="tag in tagPills"
        :key="tag.key"
        class="nx-tag"
        :style="tag.style"
      >{{ tag.label }}</span>
      <span
        v-if="record.versionCount > 1"
        class="nx-tag"
      >{{ record.versionCount }} {{ lan === "zh" ? "个版本" : "versions" }}</span>
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
        <NxIcon name="download" :size="14" />
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
        <NxIcon name="link" :size="14" />
      </a>
      <a
        v-if="record.links && record.links.repo"
        :href="record.links.repo"
        target="_blank"
        rel="noopener"
        :title="lan === 'zh' ? '源代码' : 'Repository'"
        :aria-label="lan === 'zh' ? '源代码' : 'Repository'"
        @click="openLinks"
      >
        <NxIcon name="github" :size="14" />
      </a>
      <a
        v-if="record.links && record.links.wiki"
        :href="record.links.wiki"
        target="_blank"
        rel="noopener"
        title="Wiki"
        aria-label="Wiki"
        @click="openLinks"
      >
        <NxIcon name="info" :size="14" />
      </a>
      <a
        v-if="record.links && record.links.home"
        :href="record.links.home"
        target="_blank"
        rel="noopener"
        :title="lan === 'zh' ? '主页' : 'Homepage'"
        :aria-label="lan === 'zh' ? '主页' : 'Homepage'"
        @click="openLinks"
      >
        <NxIcon name="home" :size="14" />
      </a>
    </div>
  </div>
</template>
