<script setup>
// Root component for the redesigned UI.
//
// Every entry HTML mounts this once; it renders whichever page component the
// router currently points at. Navigating between catalog pages therefore swaps
// one dynamic component instead of reloading the document, while the URL and the
// back/forward buttons keep working.
//
// Each page component still owns its own NxShell, so exactly one rail/topbar is
// on screen at a time — the shell is part of the page, not of this root.
//
// The cross-fade lives inside NxShell (on the content slot only), not here: the
// rail and topbar are the stable frame of the interface and must not flash on
// every navigation.
import { currentComponent, currentPageId } from "../util/next/router.js";
</script>

<template>
  <!-- `:key` forces a fresh instance per page: filter state, scroll position and
       open drawers must not survive a navigation. -->
  <component
    :is="currentComponent"
    v-if="currentComponent"
    :key="currentPageId"
  />
</template>
