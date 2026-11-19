// Shared state for the redesigned app shell.
//
// The rail and topbar used to be rendered *inside* each page component, so every
// navigation destroyed and rebuilt them. That is also why a page transition could
// never animate the content alone: the transition lived inside the very component
// that was being replaced.
//
// The shell is now rendered once by the SPA root (boot/NxApp.vue) and stays
// mounted for the life of the document. Pages publish the parts that differ —
// title, write-up, search model, locale — here, and the root feeds them to the
// shell.
import { markRaw, reactive } from "vue";

// The full set of shell fields, with their defaults. `publishShell` resets to
// these before applying a page's values: the shell outlives the page, so a field
// a page does not set (search, write-up) must not keep the previous page's value
// — that left the search fields and the "about" button visible on documentation
// pages after visiting a catalog.
const DEFAULTS = {
  pageId: "",
  title: "",
  // Interface locale the page renders in. Empty means "follow the visitor's
  // choice" (the shell then resolves it itself).
  locale: "",
  // Canonical locales this page can actually present. The shell shows a language
  // switcher only when there is more than one; pages derive it from their files.
  locales: [],
  doc: null,
  docTitle: "",
  docUpdated: "",
  search: null,
  // Catalogs whose entries have no real author (Softendo lists game series)
  // hide the author search box; every other catalog shows it.
  showAuthorSearch: true,
  showRandom: false
};

export const shellConfig = reactive({ ...DEFAULTS });

// Page-owned callbacks the shell's controls dispatch to.
const HANDLER_DEFAULTS = {
  // (localeCode) => void — the page switches its own locale and reloads records.
  changeLocale: null,
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
  // The search model is a live catalog object whose fields are refs the shell
  // reads through `.value`. Marking it raw keeps `reactive()` from deep-wrapping
  // it and auto-unwrapping those refs: without this the shell saw `undefined`
  // and could not clear a box when its pill was removed.
  const next = config.search ? { ...config, search: markRaw(config.search) } : config;
  Object.assign(shellConfig, DEFAULTS, next);
}

export function publishShellHandlers(next) {
  Object.assign(handlers, HANDLER_DEFAULTS, next);
}

export function shellHandlers() {
  return handlers;
}
