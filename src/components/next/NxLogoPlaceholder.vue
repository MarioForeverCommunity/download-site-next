<script setup>
// Placeholder shown wherever a record has no artwork.
//
// A grey box reads as "broken"; the site's own logo at 60% opacity reads as
// "this record simply has no screenshot yet", which is the actual situation for
// a large share of the archive.
import { computed } from "vue";

const props = defineProps({
  lan: {
    type: String,
    default: "zh"
  },
  // "thumb" | "cover" — controls how much of the box the logo fills
  variant: {
    type: String,
    default: "cover"
  }
});

const src = computed(() => (props.lan === "zh" ? "./images/logo_hd.png" : "./images/logo2_hd.png"));
</script>

<template>
  <div
    class="nx-logo-ph"
    :class="`is-${variant}`"
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
    width: 74%;
    height: auto;
  }

  /* card / gallery tile */
  .nx-logo-ph.is-cover img {
    width: 42%;
    max-width: 220px;
    height: auto;
  }
</style>
