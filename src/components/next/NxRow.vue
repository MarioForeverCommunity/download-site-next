<script setup>
// One catalog record in list density. The row is a button so the whole strip is
// a hit target; links inside stop propagation so they still open in a new tab.
import { computed } from "vue";
import NxIcon from "./NxIcon.vue";
import NxLogoPlaceholder from "./NxLogoPlaceholder.vue";
import { formatIsoDate } from "../../util/next/records.js";
import { getTagPillColor } from "../../util/TagUtil.js";
import { getTheme } from "../../util/Theme.js";
import { dataLangOf, prefersAltLinks, useI18n } from "../../i18n/index.js";

const props = defineProps({
  record: {
    type: Object,
    required: true
  },
  // Interface locale (see src/i18n/locales/*).
  locale: {
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
  },
  // MF catalogs roll every version into one row, so the phone meta line would
  // repeat the newest build's version under every title; the page hides it until
  // "list every version separately" is on, when each row is its own version.
  // MW and assets always carry a meaningful version and never set this.
  hideVersion: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["open"]);

const { t } = useI18n(() => props.locale);

// Written-content language: decides whether the alternate (usually English)
// title is worth restating under the main one.
const contentLang = computed(() => dataLangOf(props.locale));

// Which link variant leads. Chinese (Simplified and Traditional alike) leads with
// the primary Chinese-community post; every other locale — English, Polish, and
// whatever is added next — leads with the alternate post, like English does.
const altLinksFirst = computed(() => prefersAltLinks(props.locale));

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
  if (region === "chinese") return t("region.chinese");
  if (region === "international") return t("region.international");
  return null;
});

const primaryDownload = computed(() => {
  const downloads = props.record.downloads || [];
  return downloads.find((item) => !item.invalid) || null;
});

// The release post follows the reader's language: English prefers the alternate
// post (usually the English-language thread) and Chinese the primary one. Invalid
// posts are skipped first, so a dead primary falls back to a live alternate (and
// vice versa); when neither is usable the button is hidden entirely.
const sourceLink = computed(() => {
  const links = props.record.links;
  if (!links) return null;
  const primary = links.source && !links.sourceInvalid ? links.source : null;
  const alt = links.sourceAlt && !links.sourceAltInvalid ? links.sourceAlt : null;
  if (!primary && !alt) return null;
  return altLinksFirst.value ? (alt || primary) : (primary || alt);
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
const showNameAlt = computed(() => contentLang.value !== "zh"
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
  if (versionText.value && !props.hideVersion) parts.push(versionText.value);
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
          :locale="locale"
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
      >{{ t("badge.latest") }}</span>
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
      >{{ t("unit.versions", { n: record.versionCount }) }}</span>
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
        :title="t('common.download')"
        :aria-label="t('common.download')"
        @click="openLinks"
      >
        <NxIcon name="download" :size="14" />
      </a>
      <a
        v-if="sourceLink"
        :href="sourceLink"
        target="_blank"
        rel="noopener"
        :title="t('detail.source')"
        :aria-label="t('detail.source')"
        @click="openLinks"
      >
        <NxIcon name="link" :size="14" />
      </a>
      <a
        v-if="record.links && record.links.repo"
        :href="record.links.repo"
        target="_blank"
        rel="noopener"
        :title="t('detail.repo')"
        :aria-label="t('detail.repo')"
        @click="openLinks"
      >
        <NxIcon name="github" :size="14" />
      </a>
      <a
        v-if="record.links && record.links.wiki"
        :href="record.links.wiki"
        target="_blank"
        rel="noopener"
        :title="t('detail.wiki')"
        :aria-label="t('detail.wiki')"
        @click="openLinks"
      >
        <NxIcon name="wiki" :size="14" />
      </a>
      <a
        v-if="record.links && record.links.home"
        :href="record.links.home"
        target="_blank"
        rel="noopener"
        :title="t('detail.homepage')"
        :aria-label="t('detail.homepage')"
        @click="openLinks"
      >
        <NxIcon name="home" :size="14" />
      </a>
    </div>
  </div>
</template>
