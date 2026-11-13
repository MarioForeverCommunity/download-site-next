import { ref } from "vue";
import Cookies from "js-cookie";

// Design variants of this site.
//
// `legacy` is the original 2.x design, kept byte-for-byte so visitors can always
// fall back to it. `next` is the redesigned catalog UI. Both are mounted from
// the same entry HTML files; only the page shell differs.
//
// Resolution order: `?design=` URL parameter (persisted, so a shared link opens
// in the design it was copied from) -> `design` cookie -> DEFAULT_DESIGN.
export const LEGACY_DESIGN = "legacy";
export const NEXT_DESIGN = "next";

// Change this one constant to ship the other design as the default.
export const DEFAULT_DESIGN = NEXT_DESIGN;

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

function readCookieDesign() {
  return normalizeDesign(Cookies.get("design"));
}

function readInitialDesign() {
  const fromUrl = readUrlDesign();
  if (fromUrl) {
    Cookies.set("design", fromUrl);
    return fromUrl;
  }
  return readCookieDesign() || DEFAULT_DESIGN;
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
  Cookies.set("design", resolved);
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

/**
 * Build a link to the current page rendered in the requested design, keeping the
 * current query string (e.g. `?game=` deep links) intact.
 */
export function otherDesignHref(target = NEXT_DESIGN) {
  const value = target === NEXT_DESIGN ? NEXT_DESIGN : LEGACY_DESIGN;
  if (typeof window === "undefined") {
    return `?design=${value}`;
  }
  const params = new URLSearchParams(window.location.search);
  params.set("design", value);
  return `${window.location.pathname}?${params.toString()}`;
}
