<script setup>
// One catalog record in list density. The row is a button so the whole strip is
// a hit target; links inside stop propagation so they still open in a new tab.
import { computed } from "vue";
import NxIcon from "./NxIcon.vue";
import NxLogoPlaceholder from "./NxLogoPlaceholder.vue";
import { formatIsoDate } from "../../util/next/records.js";
import { getTagPillColor } from "../../util/TagUtil.js";
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
  },
  showActions: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(["open"]);

const theme = getTheme();

const dateText = computed(() => formatIsoDate(props.record.date));

// Every tag is shown, not just the first two: the class column is how a visitor
// decides whether a record is relevant, so truncating it defeats the purpose.
// `getTagPillColor` also covers the runtime flags, so the card view agrees.
const tagPills = computed(() => props.record.tags.map((tag) => {
  const colors = getTagPillColor(tag, theme.value === "dark");
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

// The release post follows the reader's language: English prefers the alternate
// post (usually the English-language thread) and Chinese the primary one.
const sourceLink = computed(() => {
  const links = props.record.links;
  if (!links) return null;
  if (props.lan === "en") return links.sourceAlt || links.source || null;
  return links.source || null;
});

// Only meaningful when the catalog is expanded per version; on a collapsed
// multi-version row every version is "the record" and a badge would be noise.
const isLatest = computed(() => props.record.isLatestVersion === true);

// One author per line in list view; a comma-joined string hid collaborators.
const displayAuthors = computed(() => {
  // A record may supply its own list label (MW collaborations read 合作作品);
  // the details drawer keeps printing every author instead.
  if (props.record.displayAuthor) return [props.record.displayAuthor];
  const authors = props.record.authors;
  if (Array.isArray(authors) && authors.length > 0) return authors;
  return props.record.author ? [props.record.author] : [];
});

// Assets show the variant name only when the entry really has several variants.
// An entry that merely specifies `ver` without `variant` keeps its version in
// the version column and must not have it repeated beside the title.
const showVariant = computed(() => props.record.kind === "asset" && !!props.record.variantLabel);

// The alternate name is an aid for the English view (a transliteration or an
// English title); in Chinese it only repeats information the reader already has.
const showNameAlt = computed(() => props.lan !== "zh"
  && props.record.nameAlt && props.record.nameAlt !== props.record.name);

// The list drops its metadata columns on a phone, so the same values are
// reprinted as one small line under the title. MW records name the editor the
// level requires ("SMWP 1.7.12"), matching the card view.
const versionText = computed(() => {
  const r = props.record;
  if (r.kind === "softendo") return r.yearLabel || "";
  const raw = r.versionLabel || "";
  if (r.kind !== "mw" || !raw) return raw;
  return /^mw\b/i.test(raw) ? raw : "SMWP " + raw;
});

const mobileMeta = computed(() => {
  const parts = [];
  const authors = displayAuthors.value.join(", ");
  if (authors) parts.push(authors);
  if (versionText.value) parts.push(versionText.value);
  if (props.record.kind !== "softendo" && dateText.value) parts.push(dateText.value);
  return parts.join(" \u00b7 ");
});

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
      'is-no-actions': !showActions,
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
          :kind="record.kind"
          :asset-type="record.assetType"
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
          v-if="showNameAlt"
          class="nx-row-sub"
        >{{ record.nameAlt }}</div>
        <div
          v-if="mobileMeta"
          class="nx-row-sub nx-row-meta"
        >{{ mobileMeta }}</div>
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
      <!-- Softendo's "series" column is really its type, marked the way the
           legacy catalog did: a tinted dot carrying the name. -->
      <span
        v-if="record.kind === 'softendo' && record.softendoType"
        class="nx-dot"
        :class="`nx-type-${record.softendoType}`"
      >{{ displayAuthors[0] }}</span>
      <template v-else>{{ displayAuthors[0] || "—" }}</template>
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
      <!-- Asset catalogs fill this column with the record's type, marked the way
           the legacy design did it: a tinted dot carrying the type name. -->
      <span
        v-if="record.assetType"
        class="nx-dot"
        :class="`nx-type-${record.assetType}`"
      >{{ record.assetTypeLabel }}</span>
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

    <div
      v-if="showActions"
      class="nx-row-actions"
    >
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
        v-if="sourceLink"
        :href="sourceLink"
        target="_blank"
        rel="noopener"
        :title="lan === 'zh' ? '发布页' : 'Source'"
        :aria-label="lan === 'zh' ? '发布页' : 'Source'"
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
