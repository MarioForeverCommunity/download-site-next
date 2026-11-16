// The catalog's current page is mirrored in the URL (`?page=<n>`) so a paged
// view survives a reload and can be shared. Both designs and all catalogs use
// the same parameter; every write goes through `replaceState` and keeps the
// other parameters (`design`, `id`, `game`, `asset`, `author`) intact.
const PAGE_PARAM = "page";

/**
 * Page requested by the current URL, or 1 when absent / invalid.
 */
export function readPageParam() {
  if (typeof window === "undefined") return 1;
  const raw = new URLSearchParams(window.location.search).get(PAGE_PARAM);
  const value = Math.floor(Number(raw));
  return Number.isFinite(value) && value >= 1 ? value : 1;
}

/**
 * Write the current page to the URL. Page 1 removes the parameter so a
 * first-page address stays clean, and an unchanged value is left alone.
 *
 * @param {number} page - the page now on screen
 */
export function writePageParam(page) {
  if (typeof window === "undefined") return;
  const next = Math.max(1, Math.floor(Number(page) || 1));
  const url = new URL(window.location.href);
  const current = url.searchParams.get(PAGE_PARAM);
  if (next > 1) {
    if (current === String(next)) return;
    url.searchParams.set(PAGE_PARAM, String(next));
  } else {
    if (current === null) return;
    url.searchParams.delete(PAGE_PARAM);
  }
  window.history.replaceState(window.history.state, "", url.toString());
}
