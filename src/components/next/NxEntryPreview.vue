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
import NxLogoPlaceholder from "./NxLogoPlaceholder.vue";
import { formatIsoDate, assetTypeLabel, softwareLabel } from "../../util/next/records.js";

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
  details: "查看详情",
  loading: "载入中…",
  notFound: "未找到该条目",
  prev: "上一张",
  next: "下一张",
} : {
  download: "Download",
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
  if (record.kind === "asset") return `${assetTypeLabel(record.assetType, props.lan)} · ${record.author}`;
  if (record.kind === "softendo") return `${record.author} · ${record.yearLabel}`;
  const software = record.software ? softwareLabel(record.software, props.lan) : "";
  const date = formatIsoDate(record.date);
  return [record.author, software, date].filter(Boolean).join(" · ");
});

const primary = computed(() => {
  if (!props.record) return null;
  const version = props.record.versions && props.record.versions[0];
  const list = version ? version.downloads : props.record.downloads;
  if (!list) return null;
  return list.find((item) => !item.dead) || null;
});

// ── in-place detail drawer ───────────────────────────────────
const detailOpen = ref(false);

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

      <!-- no artwork: translucent site logo stands in for it -->
      <div
        v-if="gallery.length === 0"
        class="nx-entry-placeholder"
      >
        <NxLogoPlaceholder
          :lan="props.lan"
          variant="cover"
        />
      </div>

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
  /* The multi-image slider is NxGallery; only the single-image frame is styled
     here. Images are fitted whole and centred, never scaled past their natural
     size. */
  .nx-entry-media.is-single img {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 260px;
    object-fit: contain;
    object-position: center;
    display: block;
    margin: 0 auto;
  }

  .nx-entry-gallery {
    margin-top: 10px;
  }
</style>
