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
// A short cross-fade marks the change. It is deliberately brief and only moves
// a couple of pixels: without any cue a swap looks like the page simply blinked,
// while a long animation would make a catalog feel slow.
import { currentComponent, currentPageId } from "../util/next/router.js";
</script>

<template>
  <!-- `:key` forces a fresh instance per page: filter state, scroll position and
       open drawers must not survive a navigation. -->
  <Transition
    name="nx-page"
    mode="out-in"
  >
    <component
      :is="currentComponent"
      v-if="currentComponent"
      :key="currentPageId"
    />
  </Transition>
</template>

<style>
  /* Global, not scoped: the transition classes are applied to the page
     component's root element, which is outside this component's scope. */
  .nx-page-enter-active,
  .nx-page-leave-active {
    transition: opacity 0.16s ease, transform 0.16s ease;
  }

  .nx-page-enter-from {
    opacity: 0;
    transform: translateY(4px);
  }

  .nx-page-leave-to {
    opacity: 0;
    transform: translateY(-2px);
  }

  /* Honouring the OS preference: no motion, no fade. */
  @media (prefers-reduced-motion: reduce) {
    .nx-page-enter-active,
    .nx-page-leave-active {
      transition: none;
    }

    .nx-page-enter-from,
    .nx-page-leave-to {
      opacity: 1;
      transform: none;
    }
  }
</style>
