<script setup>
// Placeholder shown wherever a record has no images.
//
// A grey box reads as "broken"; the site's own logo at 60% opacity reads as
// "this record simply has no screenshot yet", which is the actual situation for
// a large share of the archive.
import { computed } from "vue";
import { dataLangOf, localeNeedsConversion } from "../../i18n/index.js";

const props = defineProps({
  // Interface locale; only its content language matters here.
  locale: {
    type: String,
    default: "zh-Hans"
  },
  // Record kind ("mf" | "mw" | …) and, for assets, the asset type. Mario Worker
  // levels and MW tools get their own mark, since a Mario Forever logo on them
  // reads as the wrong product.
  kind: {
    type: String,
    default: ""
  },
  assetType: {
    type: String,
    default: ""
  },
  // "thumb" | "cover" — controls how much of the box the logo fills
  variant: {
    type: String,
    default: "cover"
  }
});

const isWorkerMark = computed(() => props.kind === "mw"
  || (props.kind === "asset" && props.assetType === "mwtool"));

// Two brand marks ship with the site: the Chinese logo and the international
// one. Simplified Chinese uses the Chinese mark; Traditional Chinese uses the
// international one, like English and Polish.
const src = computed(() => {
  if (isWorkerMark.value) return "./images/marioworker.png";
  if (localeNeedsConversion(props.locale)) return "./images/logo2_hd.png";
  return dataLangOf(props.locale) === "zh" ? "./images/logo_hd.png" : "./images/logo2_hd.png";
});
</script>

<template>
  <div
    class="nx-logo-ph"
    :class="[`is-${variant}`, { 'is-mw': isWorkerMark }]"
  >
    <img
      :src="src"
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
    />
  </div>
</template>

<style scoped>
  .nx-logo-ph {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: var(--nx-fill);
    overflow: hidden;
  }

  .nx-logo-ph img {
    opacity: 0.6;
    object-fit: contain;
    display: block;
  }

  /* small row thumbnail: the logo is the whole tile */
  .nx-logo-ph.is-thumb img {
    width: 80%;
    height: auto;
  }

  /* card / gallery tile */
  .nx-logo-ph.is-cover img {
    width: 68%;
    max-width: 220px;
    height: auto;
  }

  /* The Mario Worker mark is a wide wordmark: at the generic logo share of the
     tile it collapsed into a hairline, so it fills more of the box. */
  .nx-logo-ph.is-mw.is-thumb img {
    width: 90%;
  }

  .nx-logo-ph.is-mw.is-cover img {
    width: 80%;
  }
</style>
