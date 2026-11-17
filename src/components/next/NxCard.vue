<script setup>
// Card density: the same record with its screenshot as the primary signal.
// This is the browsing mode; the list is the scanning mode.
import { computed } from "vue";
import { formatIsoDate } from "../../util/next/records.js";
import { getTagPillColor } from "../../util/TagUtil.js";
import { getTheme } from "../../util/Theme.js";
import NxLogoPlaceholder from "./NxLogoPlaceholder.vue";

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
  }
});

const emit = defineEmits(["open"]);

const theme = getTheme();

const metaDate = computed(() => formatIsoDate(props.record.date));

const decoratedTags = computed(() => props.record.tags.map((tag) => {
  const colors = getTagPillColor(tag, theme.value === "dark");
  return { ...tag, style: { color: colors.text, borderColor: colors.border, background: colors.bg } };
}));

// MW entries carry only runtime flags (bundled MW / custom BGM). They describe
// the level's runtime rather than its content, so they sit on the version line
// beside the SMWP build instead of on the date line with the content tags.
const RUNTIME_TAG_KEYS = ["mw", "bgm"];
const isRuntimeTag = (tag) => RUNTIME_TAG_KEYS.includes(tag.key);

const versionTags = computed(() => (props.record.kind === "mw"
  ? decoratedTags.value.filter(isRuntimeTag)
  : []));

const tagPills = computed(() => (props.record.kind === "mw"
  ? decoratedTags.value.filter((tag) => !isRuntimeTag(tag))
  : decoratedTags.value));

const regionLabel = computed(() => {
  const region = props.record.region;
  if (region === "chinese") return props.lan === "zh" ? "国内" : "Chinese";
  if (region === "international") return props.lan === "zh" ? "国外" : "International";
  return null;
});

// Cards have no version column, so the identifying version has to appear in the
// body. What counts as "the version" differs per catalog:
//   assets - the variant name and its version ("Full", "0.10.7.1")
//   mf     - only when every version is listed separately: the row's own
//            version. Collapsed rows show the newest build only, so a version
//            line there would just repeat the title's implicit "latest".
//   mw     - the SMWP editor the level needs ("SMWP v1.7.12" / "MW 4.4")
const versionText = computed(() => {
  const r = props.record;
  if (!r) return "";
  if (r.kind === "asset") {
    const parts = [];
    if (r.variantLabel) parts.push(r.variantLabel);
    if (r.versionLabel && r.versionLabel !== r.variantLabel) parts.push(r.versionLabel);
    return parts.join(" \u00b7 ");
  }
  if (r.kind === "mw") {
    const raw = r.smwpVersion || r.versionLabel || "";
    if (!raw) return "";
    // Values already naming the editor are left as written.
    return /^mw\b/i.test(raw) ? raw : "SMWP " + raw;
  }
  // `expandedFrom` is only set on rows produced by expandMfRecord, i.e. when the
  // "list every version separately" option is on.
  if (!r.expandedFrom) return "";
  return r.versionLabel || "";
});
</script>

<template>
  <div
    class="nx-card"
    :class="{ 'is-active': active }"
    role="button"
    tabindex="0"
    @click="emit('open', record)"
    @keydown.enter.prevent="emit('open', record)"
    @keydown.space.prevent="emit('open', record)"
  >
    <div class="nx-card-shot">
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
        variant="cover"
      />
    </div>
    <div class="nx-card-body">
      <div class="nx-card-name">{{ record.name }}</div>
      <div class="nx-card-author-row">
        <!-- Softendo's "author" line is its series: shown with the same tinted
             type dot as the list. -->
        <span
          v-if="record.kind === 'softendo' && record.softendoType"
          class="nx-dot"
          :class="`nx-type-${record.softendoType}`"
        >{{ record.displayAuthor || record.author }}</span>
        <span
          v-else-if="record.displayAuthor || record.author"
          class="nx-card-author"
        >{{ record.displayAuthor || record.author }}</span>
        <!-- region tag sits beside the author in card view, per review -->
        <span
          v-if="regionLabel"
          class="nx-dot"
          :class="record.region === 'chinese' ? 'nx-dot-cn' : 'nx-dot-intl'"
        >{{ regionLabel }}</span>
      </div>
      <div
        v-if="versionText || versionTags.length"
        class="nx-card-version"
      >
        <span
          v-if="versionText"
          class="nx-card-version-text"
        >{{ versionText }}</span>
        <span
          v-for="tag in versionTags"
          :key="tag.key"
          class="nx-tag"
          :style="tag.style"
        >{{ tag.label }}</span>
      </div>
      <div class="nx-card-meta">
        <span v-if="metaDate">{{ metaDate }}</span>
        <span v-else-if="record.yearLabel">{{ record.yearLabel }}</span>
        <span
          v-if="record.assetType"
          class="nx-dot"
          :class="`nx-type-${record.assetType}`"
        >{{ record.assetTypeLabel }}</span>
        <span
          v-for="tag in tagPills"
          :key="tag.key"
          class="nx-tag"
          :style="tag.style"
        >{{ tag.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .nx-card-version {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
    font-family: var(--nx-mono);
    font-size: 10.5px;
    color: var(--nx-muted);
    white-space: nowrap;
    overflow: hidden;
  }

  .nx-card-version-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nx-card-author-row {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
  }

  .nx-card-author-row .nx-card-author {
    flex: 0 1 auto;
  }

  .nx-card-author-row .nx-dot {
    flex: none;
  }
</style>
