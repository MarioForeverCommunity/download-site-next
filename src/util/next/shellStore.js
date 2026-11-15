// Shared state for the redesigned app shell.
//
// The rail and topbar used to be rendered *inside* each page component, so every
// navigation destroyed and rebuilt them. That is also why a page transition could
// never animate the content alone: the transition lived inside the very component
// that was being replaced.
//
// The shell is now rendered once by the SPA root (boot/NxApp.vue) and stays
// mounted for the life of the document. Pages publish the parts that differ —
// title, write-up, search model — here, and the root feeds them to the shell.
import { reactive } from "vue";

// The full set of shell fields, with their defaults. `publishShell` resets to
// these before applying a page's values: the shell outlives the page, so a field
// a page does not set (search, write-up) must not keep the previous page's value
// — that left the search fields and the "about" button visible on documentation
// pages after visiting a catalog.
const DEFAULTS = {
  pageId: "",
  title: "",
  lan: "zh",
  doc: null,
  docTitle: "",
  docUpdated: "",
  search: null,
  showRandom: false
};

export const shellConfig = reactive({ ...DEFAULTS });

// Page-owned callbacks the shell's controls dispatch to.
const HANDLER_DEFAULTS = {
  changeLanZh: null,
  changeLanEn: null,
  random: null
};

const handlers = { ...HANDLER_DEFAULTS };

/**
 * Publish the current page's shell configuration. Called from each page's setup
 * (inside a watchEffect), so it runs again on every navigation.
 *
 * Unspecified fields fall back to their default rather than keeping whatever the
 * previous page published.
 */
export function publishShell(config) {
  Object.assign(shellConfig, DEFAULTS, config);
}

export function publishShellHandlers(next) {
  Object.assign(handlers, HANDLER_DEFAULTS, next);
}

export function shellHandlers() {
  return handlers;
}
