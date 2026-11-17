// Legacy-design page-scroll locking. Replaces the OverlayScrollbars-backed
// disableScroll/enableScroll pair with plain DOM operations.
//
// The legacy pages have no `position: sticky` bars pinned to the document
// scroller (that concern applies only to the redesigned UI, see
// util/next/scrollLock.js), so hiding the root scrollbar here is safe. The
// width lost to the hidden scrollbar is reserved as body padding to keep the
// layout from reflowing when a modal opens.
let locked = false;
let savedPaddingRight = "";

export function disableScroll() {
  if (typeof document === "undefined" || locked) return;
  const root = document.documentElement;
  const body = document.body;

  savedPaddingRight = body.style.paddingRight;
  const widthBefore = root.clientWidth;
  root.classList.add("legacy-locked");
  const grown = root.clientWidth - widthBefore;
  if (grown > 0) body.style.paddingRight = `${grown}px`;
  locked = true;
}

export function enableScroll() {
  if (typeof document === "undefined" || !locked) return;
  document.documentElement.classList.remove("legacy-locked");
  document.body.style.paddingRight = savedPaddingRight;
  locked = false;
}
