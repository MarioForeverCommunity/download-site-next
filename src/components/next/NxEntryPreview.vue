<script setup>
// Inline record preview used inside the documentation pages.
//
// Two things matter here and were missing from the first iteration:
//  1. the title image and the full showcase slider come back, paginated in
//     normal flow so the dots never sit on top of the artwork;
//  2. "查看详情" opens the record's detail drawer *in place* — the visitor stays
//     on the doc page instead of being bounced to the catalog.
import { ref, computed } from "vue";
import NxIcon from "./NxIcon.vue";
import NxDetail from "./NxDetail.vue";
import NxGallery from "./NxGallery.vue";
import { formatIsoDate, assetTypeLabel } from "../../util/next/records.js";

const props = defineProps({
  record: {
    type: Object,
    default: null
  },
  lan: {
    type: String,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  notFoundLabel: {
    type: String,
    default: ""
  }
});

const text = computed(() => (props.lan === "zh" ? {
  download: "下载",
  source: "源代码",
  details: "查看详情",
  loading: "载入中…",
  notFound: "未找到该条目",
  prev: "上一张",
  next: "下一张",
} : {
  download: "Download",
  source: "Source code",
  details: "Details",
  loading: "Loading…",
  notFound: "Record not found",
  prev: "Previous",
  next: "Next",
}));

const gallery = computed(() => (props.record && props.record.images ? props.record.images : []));

const subtitle = computed(() => {
  const record = props.record;
  if (!record) return "";
  if (record.kind === "asset") {
    // Assets are catalogued per variant, so the variant name and its version are
    // the identifying facts; without them several cards look identical.
    const parts = [assetTypeLabel(record.assetType, props.lan)];
    if (record.variantLabel) parts.push(record.variantLabel);
    if (record.versionLabel && record.versionLabel !== record.variantLabel) parts.push(record.versionLabel);
    parts.push(record.author);
    return parts.filter(Boolean).join(" · ");
  }
  if (record.kind === "softendo") return `${record.author} · ${record.yearLabel}`;
  // The engine is shown in the details drawer; the card keeps author and date so
  // the subtitle stays one short line.
  const date = formatIsoDate(record.date);
  return [record.author, date].filter(Boolean).join(" · ");
});

const primary = computed(() => {
  if (!props.record) return null;
  // Prefer the record's own resolved download list: when the markdown pins a
  // version (`ver="..."`), that list already points at the pinned build, while
  // `versions[0]` could be a different (newer) entry.
  const list = (props.record.downloads && props.record.downloads.length)
    ? props.record.downloads
    : (props.record.versions && props.record.versions[0] ? props.record.versions[0].downloads : null);
  if (!list) return null;
  return list.find((item) => !item.dead) || null;
});

// ── in-place detail drawer ───────────────────────────────────
const detailOpen = ref(false);

// Assets with a repository get a source-code button on the card itself; MF and
// MW cards keep their existing actions.
const repoUrl = computed(() => {
  const record = props.record;
  if (!record || record.kind !== "asset") return null;
  return (record.links && record.links.repo) || null;
});

</script>

<template>
  <div class="nx-entry">
    <div
      v-if="loading"
      class="nx-entry-loading"
    >
      {{ text.loading }}
    </div>
    <div
      v-else-if="!record"
      class="nx-entry-loading"
    >
      {{ notFoundLabel || text.notFound }}
    </div>
    <template v-else>
      <div class="nx-entry-head">
        <div style="min-width: 0;">
          <div class="nx-entry-title">{{ record.name }}</div>
          <div class="nx-entry-desc">{{ subtitle }}</div>
        </div>
        <div class="nx-entry-actions">
          <a
            v-if="primary"
            class="nx-dl is-primary"
            :href="primary.url"
            target="_blank"
            rel="noopener"
          >
            <NxIcon
              name="download"
              :size="12"
            />
            {{ text.download }}
          </a>
          <a
            v-if="repoUrl"
            class="nx-dl is-primary"
            :href="repoUrl"
            target="_blank"
            rel="noopener"
          >
            <NxIcon
              name="github"
              :size="12"
            />
            {{ text.source }}
          </a>
          <button
            type="button"
            class="nx-dl"
            style="cursor:pointer;"
            @click="detailOpen = true"
          >
            <NxIcon
              name="info"
              :size="12"
            />
            {{ text.details }}
          </button>
        </div>
      </div>

      <div
        v-if="record.description"
        class="nx-entry-text"
      >{{ record.description }}</div>

      <!-- no artwork: no image block at all. A placeholder logo inside a card
           reads as a broken image; the catalog keeps its logo placeholder, but a
           card simply omits the media area. -->
      <template v-else-if="gallery.length === 0" />

      <!-- one image: show it flat -->
      <div
        v-else-if="gallery.length === 1"
        class="nx-entry-media is-single"
      >
        <img
          :src="gallery[0]"
          :alt="record.name"
          loading="lazy"
          decoding="async"
        />
      </div>

      <!-- several images: the shared gallery, so the entry card, the docs and
           the drawer cannot drift apart in sizing or pagination -->
      <div
        v-else-if="gallery.length > 1"
        class="nx-entry-gallery"
      >
        <NxGallery
          :images="gallery"
          :alt="record.name"
          :lan="lan"
          fit="contain"
          aspect-ratio="4 / 3"
          :max-height="480"
        />
      </div>

    </template>
    <NxDetail
      :record="detailOpen ? props.record : null"
      :lan="lan"
      @close="detailOpen = false"
    />
  </div>
</template>

<style scoped>
  /* The multi-image slider is NxGallery; the single-image preview mirrors its
     frame: same top margin, same filler background (so transparent or
     letterboxed artwork does not sit on the bare card), and the same 480px cap
     on the picture itself — the card around it stays uncapped. */
  .nx-entry-media.is-single {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    max-height: 480px;
    overflow: hidden;
    border-radius: 4px;
    background: var(--nx-fill);
  }

  .nx-entry-media.is-single img {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 480px;
    object-fit: contain;
    object-position: center;
    display: block;
    background: var(--nx-fill);
  }

  .nx-entry-gallery {
    margin-top: 10px;
  }
</style>
