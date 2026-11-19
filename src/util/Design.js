import { ref } from "vue";
import packageJson from "../../package.json";
import { getLocale } from "../i18n/index.js";

// Design variants of this site.
//
// `legacy` is the original 2.x design, kept byte-for-byte so visitors can always
// fall back to it. `next` is the redesigned catalog UI. Both are mounted from
// the same entry HTML files; only the page shell differs.
//
// Resolution order: `?design=` URL parameter (persisted, so a shared link opens
// in the design it was copied from) -> stored choice -> DEFAULT_DESIGN.
//
// The choice lives in localStorage under the same `design` key, mirroring the
// theme (`darkMode`, see Theme.js): a cookie would only live for the browser
// session and could silently flip a visitor onto another design when a release
// changes the default.
export const LEGACY_DESIGN = "legacy";
export const NEXT_DESIGN = "next";

// The redesigned UI becomes the default once 3.0.0 ships as a stable release.
// Prerelease builds of 3.0.0 itself (3.0.0-beta.x / 3.0.0-rc.x) keep the legacy
// UI as the fallback; the new design stays reachable via `?design=next` or the
// in-site switch in the meantime. Versions after 3.0.0 already treat the new
// design as released, so their prereleases (3.0.1-beta.x, 3.1.0-rc.x, …) use it
// as the default too.
const [coreVersion, ...versionSuffix] = String(packageJson.version).split(/[-+]/);
const [majorVersion, minorVersion, patchVersion] = coreVersion.split(".").map(Number);
const isAfter300 = majorVersion > 3 || (majorVersion === 3 && (minorVersion > 0 || patchVersion > 0));
const isStable300 = majorVersion === 3 && minorVersion === 0 && patchVersion === 0 && versionSuffix.length === 0;
export const DEFAULT_DESIGN = isAfter300 || isStable300 ? NEXT_DESIGN : LEGACY_DESIGN;

const DESIGN_VALUES = [LEGACY_DESIGN, NEXT_DESIGN];

// Accepted aliases in `?design=`, so links read naturally in either language.
const URL_ALIASES = {
  legacy: LEGACY_DESIGN,
  old: LEGACY_DESIGN,
  classic: LEGACY_DESIGN,
  next: NEXT_DESIGN,
  new: NEXT_DESIGN,
  modern: NEXT_DESIGN,
  beta: NEXT_DESIGN,
};

function normalizeDesign(value) {
  if (!value) return null;
  const key = String(value).trim().toLowerCase();
  const resolved = URL_ALIASES[key] || key;
  return DESIGN_VALUES.includes(resolved) ? resolved : null;
}

function readUrlDesign() {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    return normalizeDesign(params.get("design"));
  } catch (_e) {
    return null;
  }
}

const STORAGE_KEY = "design";

function readStoredDesign() {
  try {
    return normalizeDesign(localStorage.getItem(STORAGE_KEY));
  } catch (_e) {
    // Private mode / disabled storage: fall back to the default design.
    return null;
  }
}

function storeDesign(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch (_e) {
    // Ignore: the choice still applies for this page view.
  }
}

function readInitialDesign() {
  const fromUrl = readUrlDesign();
  if (fromUrl) {
    storeDesign(fromUrl);
    return fromUrl;
  }
  return readStoredDesign() || DEFAULT_DESIGN;
}

const design = ref(readInitialDesign());

export function getDesign() {
  return design.value;
}

export function isNextDesign() {
  return design.value === NEXT_DESIGN;
}

export function setDesign(value) {
  const resolved = normalizeDesign(value) || DEFAULT_DESIGN;
  if (resolved === design.value) {
    return resolved;
  }
  design.value = resolved;
  storeDesign(resolved);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("design-changed", { detail: { design: resolved } }));
  }
  return resolved;
}

export function toggleDesign() {
  return setDesign(design.value === NEXT_DESIGN ? LEGACY_DESIGN : NEXT_DESIGN);
}

// Reactive handle for components that need to re-render on switch.
export function getDesignRef() {
  return design;
}

// Entry files that still have a legacy page component. Pages without one (e.g.
// about.html) exist only in the redesigned UI, so the legacy switch has to land
// on the legacy home page instead of a page that would silently keep rendering
// the new design.
const LEGACY_ENTRY_FILES = new Set([
  "", "index.html", "mf-games.html", "mw-levels.html",
  "assets.html", "engines.html", "mario-worker.html", "softendo.html",
]);

export function hasLegacyPage(pathname = typeof window === "undefined" ? "" : window.location.pathname) {
  return LEGACY_ENTRY_FILES.has(String(pathname || "").split("/").pop() || "");
}

/**
 * Build a link to the current page rendered in the requested design, keeping the
 * current query string (e.g. `?game=` deep links) intact.
 *
 * The language travels with the link only when going *to* the redesigned UI: a
 * shared link has to reopen in the language it was copied from. The hand-off to
 * the legacy design drops `?lang=` on purpose — the legacy UI has no locale
 * system, it reads the stored `language` key, and leaving a new-design tag on a
 * legacy URL would only misdescribe it (a Chinese-only or English-only page
 * cannot honour it anyway).
 *
 * The language the legacy design opens in is therefore decided by the stored
 * `language` key, which `setLocale()` keeps in step: a locale that is new in the
 * redesigned UI hands over to English, and Traditional Chinese hands over to the
 * Simplified legacy site (each locale's `legacy` field, see src/i18n/locales/*).
 */
export function otherDesignHref(target = NEXT_DESIGN) {
  const value = target === NEXT_DESIGN ? NEXT_DESIGN : LEGACY_DESIGN;
  if (typeof window === "undefined") {
    return `?design=${value}`;
  }
  const params = new URLSearchParams(window.location.search);
  let pathname = window.location.pathname;
  if (value === LEGACY_DESIGN && !hasLegacyPage(pathname)) {
    // No legacy counterpart: go to the legacy home page, dropping query
    // parameters that only make sense on the current page.
    pathname = pathname.replace(/[^/]*$/, "") + "index.html";
    for (const key of [...params.keys()]) {
      if (key !== "design") params.delete(key);
    }
  }
  params.set("design", value);
  if (value === NEXT_DESIGN) params.set("lang", getLocale());
  else params.delete("lang");
  return `${pathname}?${params.toString()}`;
}
