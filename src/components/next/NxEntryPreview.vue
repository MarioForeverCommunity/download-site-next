<script setup>
// Inline record preview used inside the documentation pages.
//
// The legacy docs embed the full GameCard (with carousel, download modal, file
// size probing) in the middle of prose, which fights the reading flow. Here the
// preview is deliberately quiet: screenshot, name, author, one action. Anything
// deeper belongs in the catalog drawer, and "查看完整记录" goes there.
import { computed } from "vue";
import NxIcon from "./NxIcon.vue";
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

const images = computed(() => (props.record && props.record.images ? props.record.images.slice(0, 2) : []));

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

const catalogHref = computed(() => {
  const record = props.record;
  if (!record) return "#";
  const params = new URLSearchParams();
  params.set("design", "next");
  params.set("id", record.id);
  const page = record.kind === "mw" ? "mw-levels.html"
    : record.kind === "asset" ? "assets.html"
      : record.kind === "softendo" ? "softendo.html" : "mf-games.html";
  return `${page}?${params.toString()}`;
});
</script>

<template>
  <div class="nx-entry">
    <div
      v-if="loading"
      class="nx-entry-loading"
    >
      {{ lan === "zh" ? "载入中…" : "Loading…" }}
    </div>
    <div
      v-else-if="!record"
      class="nx-entry-loading"
    >
      {{ notFoundLabel || (lan === "zh" ? "未找到该条目" : "Record not found") }}
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
            <NxIcon name="download" :size="13" />
            {{ lan === "zh" ? "下载" : "Download" }}
          </a>
          <a
            class="nx-dl"
            :href="catalogHref"
          >
            <NxIcon name="list" :size="13" />
            {{ lan === "zh" ? "详情" : "Details" }}
          </a>
        </div>
      </div>
      <div
        v-if="record.description"
        class="nx-entry-text"
      >{{ record.description }}</div>
      <div
        v-if="images.length"
        class="nx-entry-media"
        :class="{ 'is-single': images.length === 1 }"
      >
        <img
          v-for="img in images"
          :key="img"
          :src="img"
          :alt="record.name"
          loading="lazy"
          decoding="async"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
  .nx-entry-loading {
    font-size: 13px;
    color: var(--nx-muted);
    padding: 4px 0;
  }

  .nx-entry-text {
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.58;
    color: var(--nx-ink-2);
  }
</style>
