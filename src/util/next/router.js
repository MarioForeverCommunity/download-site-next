// Client-side navigation for the redesigned pages.
//
// The seven entries are separate HTML files, so a plain <a> between them
// reloads the whole document: fonts, the design decision, and every shared chunk
// are fetched and re-parsed each time. The legacy design keeps that behaviour —
// this module is only ever loaded by the new design's boot path.
//
// How it works: the boot path mounts a shell that owns a single dynamic
// component. Intercepting an in-app navigation resolves the target entry to its
// page component, updates the URL with history.pushState, and swaps the
// component — no document reload, and the browser back/forward buttons keep
// working through popstate.
//
// Scope: same-origin links to the known entry files only. Anything external,
// anything with a modifier key, and anything carrying `target`/`download` falls
// through to the browser.
import { ref, shallowRef, markRaw } from "vue";

// pageId -> { href, load }
// `href` is the public URL of the entry file; `load` imports the redesigned page
// component lazily so only the pages actually visited are downloaded.
const ROUTES = {
  index: { href: "./", load: () => import("../../pages/next/index/MfIndexNext.vue") },
  "mf-games": { href: "./mf-games.html", load: () => import("../../pages/next/mf-games/MfGamesNext.vue") },
  "mw-levels": { href: "./mw-levels.html", load: () => import("../../pages/next/mw-levels/MwLevelsNext.vue") },
  assets: { href: "./assets.html", load: () => import("../../pages/next/assets/AssetsNext.vue") },
  engines: { href: "./engines.html", load: () => import("../../pages/next/engines/EnginesNext.vue") },
  "mario-worker": { href: "./mario-worker.html", load: () => import("../../pages/next/mario-worker/MwIndexNext.vue") },
  softendo: { href: "./softendo.html", load: () => import("../../pages/next/softendo/SoftendoNext.vue") }
};

export const currentPageId = ref("");

const currentComponent = shallowRef(null);

let booting = true;
let defaultPageId = "index";

// Normalise a URL path to the entry file it names. "" and "/" are the index.
function pageIdFromPath(pathname) {
  const file = String(pathname || "").split("/").pop() || "";
  if (!file || file === "index.html") return "index";
  const match = Object.entries(ROUTES).find(([, route]) => {
    const routeFile = route.href.replace("./", "");
    return routeFile === file;
  });
  return match ? match[0] : null;
}

export function pageIdForCurrentUrl() {
  return pageIdFromPath(window.location.pathname) || defaultPageId;
}

/**
 * @param {string} pageId - id from ROUTES
 * @param {object} [options]
 * @param {boolean} [options.replace] - replace the history entry instead of pushing
 */
export async function navigateTo(pageId, options = {}) {
  const route = ROUTES[pageId];
  if (!route) return false;

  const module = await route.load();
  currentComponent.value = markRaw(module.default);
  currentPageId.value = pageId;

  if (!options.replace && !booting) {
    window.history.pushState({ nxPageId: pageId }, "", new URL(route.href, window.location.href).href);
  } else if (options.replace) {
    window.history.replaceState({ nxPageId: pageId }, "", new URL(route.href, window.location.href).href);
  }

  // A new page starts at the top, the way a reload would.
  if (!booting && !options.keepScroll) window.scrollTo({ top: 0 });
  booting = false;
  return true;
}

// Should this click be handled by the router at all?
function handleableLink(event, anchor) {
  if (!anchor || !anchor.getAttribute) return false;
  if (event.defaultPrevented) return false;
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  const raw = anchor.getAttribute("href") || "";
  if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return false;

  let url;
  try {
    url = new URL(raw, window.location.href);
  } catch {
    return false;
  }
  if (url.origin !== window.location.origin) return false;
  // A different query/hash on the same page is not a page change.
  if (url.pathname === window.location.pathname) return false;
  return pageIdFromPath(url.pathname) !== null;
}

function onClick(event) {
  const anchor = event.target.closest ? event.target.closest("a[href]") : null;
  if (!handleableLink(event, anchor)) return;
  const url = new URL(anchor.getAttribute("href"), window.location.href);
  const pageId = pageIdFromPath(url.pathname);
  if (!pageId) return;
  event.preventDefault();
  navigateTo(pageId);
}

function onPopState() {
  const pageId = pageIdFromPath(window.location.pathname);
  if (!pageId || pageId === currentPageId.value) return;
  navigateTo(pageId, { replace: true, keepScroll: false });
}

/**
 * Boot the redesigned UI: mount the shell for the current entry and wire the
 * router up. Returns the page component that should render first.
 *
 * @param {object} options
 * @param {string} options.pageId - the page this entry normally shows
 */
export async function startRouter({ pageId }) {
  defaultPageId = pageId;
  booting = true;
  document.addEventListener("click", onClick);
  window.addEventListener("popstate", onPopState);
  await navigateTo(pageId, { replace: true });
  booting = false;
  return currentComponent;
}

export { currentComponent };
