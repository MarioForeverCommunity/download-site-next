// Turns one overlay's open state into an Android back-button guard.
//
// Both designs keep overlay state in Vue refs (`selectedDownload`, `show`,
// `showImagePreview` …). Calling `useBackGuard` with the open state and a close
// callback makes the hardware back button close that overlay instead of leaving
// the page; closing it from the UI releases the guard again. Nested overlays
// (a detail modal plus its image preview) are handled by the guard stack in
// ./backGuard.js.
import { watch, onBeforeUnmount } from "vue";
import { pushBackGuard } from "./backGuard.js";

/**
 * @param {() => boolean} isOpen - reactive getter for the overlay's open state
 * @param {() => void} close - closes the overlay (same path as its close button)
 */
export function useBackGuard(isOpen, close) {
  let release = null;

  const update = (open) => {
    if (open) {
      if (!release) release = pushBackGuard(() => close());
    } else if (release) {
      const releaseGuard = release;
      release = null;
      releaseGuard();
    }
  };

  watch(isOpen, update, { immediate: true });

  onBeforeUnmount(() => {
    if (!release) return;
    const releaseGuard = release;
    release = null;
    releaseGuard();
  });
}
