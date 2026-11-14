// Page-scroll locking shared by every overlay (details, changelog, settings,
// catalog write-up, the phone filter drawer and the phone rail drawer).
//
// While an overlay is open the page behind must not scroll — from the wheel,
// touch, keyboard, or by scroll chaining when the overlay's own content reaches
// its end. The viewport must also not reflow: hiding the scrollbar widens the
// layout box, so its width is reserved as body padding.
//
// Deliberately *not* used: pinning the body with `position: fixed`, and
// `overflow: hidden` on the root. This layout keeps the rail and the topbar
// `position: sticky` against the document scroller; both of those take that
// scroller away, which dropped the two bars out of view by exactly the scroll
// offset whenever an overlay opened. Scrolling is blocked with listeners
// instead, which leave the scroller intact.
let lockCount = 0;
let savedScrollY = 0;
let savedPaddingRight = "";

// The scrollable element an event should scroll, if any. Overlays put their
// scroll on an inner container (`.nx-drawer-body`), so matching only the overlay
// shell would always report "not scrollable" and let the chain through.
const SCROLLER_SELECTOR = ".nx-drawer-body, .nx-drawer, .nx-pane, .nx-rail";

function scrollerFor(target) {
  if (!target || !target.closest) return null;
  // `closest` only walks up to the scroll container; an event whose target is a
  // child of that container (a list item, a paragraph) resolves to it correctly.
  return target.closest(SCROLLER_SELECTOR);
}

// True when `scroller` can still move in the direction of `delta` (positive =
// content scrolls down). At an edge, the gesture must be consumed rather than
// passed on to the document.
function canScrollFurther(scroller, delta) {
  if (!scroller) return false;
  const max = scroller.scrollHeight - scroller.clientHeight;
  if (max <= 1) return false;
  if (delta < 0) return scroller.scrollTop > 0;
  return scroller.scrollTop < max - 1;
}

function blockWheel(event) {
  const scroller = scrollerFor(event.target);
  if (canScrollFurther(scroller, event.deltaY)) return;
  event.preventDefault();
}

function blockTouchMove(event) {
  const scroller = scrollerFor(event.target);
  // Touch deltas come from the gesture, not the event; use the last known
  // direction so an edge swipe is still consumed.
  if (canScrollFurther(scroller, lastTouchDelta)) return;
  if (event.cancelable) event.preventDefault();
}

// Track the vertical direction of the current touch gesture.
let lastTouchY = null;
let lastTouchDelta = 0;

function onTouchStart(event) {
  const t = event.touches && event.touches[0];
  lastTouchY = t ? t.clientY : null;
  lastTouchDelta = 0;
}

function onTouchMove(event) {
  const t = event.touches && event.touches[0];
  if (t && lastTouchY != null) {
    // Finger moving up scrolls content down, so invert for a scroll delta.
    lastTouchDelta = lastTouchY - t.clientY;
    lastTouchY = t.clientY;
  }
  blockTouchMove(event);
}

// Keys that scroll the document.
const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);

function blockKeys(event) {
  if (!SCROLL_KEYS.has(event.key)) return;
  const target = event.target;
  // Never swallow typing in a field.
  if (target && target.closest && target.closest("input, textarea, select, [contenteditable='true']")) return;
  event.preventDefault();
}

function applyLock() {
  const body = document.body;
  const root = document.documentElement;
  savedScrollY = window.scrollY || window.pageYOffset || 0;
  savedPaddingRight = body.style.paddingRight;

  const gap = window.innerWidth - root.clientWidth;
  if (gap > 0) body.style.paddingRight = `${gap}px`;

  root.classList.add("nx-locked");
  window.addEventListener("wheel", blockWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("keydown", blockKeys, { capture: true });
}

function removeLock() {
  const body = document.body;
  const root = document.documentElement;
  root.classList.remove("nx-locked");
  body.style.paddingRight = savedPaddingRight;
  window.removeEventListener("wheel", blockWheel);
  window.removeEventListener("touchstart", onTouchStart);
  window.removeEventListener("touchmove", onTouchMove);
  window.removeEventListener("keydown", blockKeys, { capture: true });
  lastTouchY = null;
  lastTouchDelta = 0;
  // The lock never moved the page, so the reading position is untouched; this
  // is only a safety net for engines that scrolled anyway.
  if (Math.abs((window.scrollY || 0) - savedScrollY) > 1) {
    window.scrollTo(0, savedScrollY);
  }
}

export function lockScroll(locked) {
  if (typeof document === "undefined") return;

  if (locked) {
    if (lockCount === 0) applyLock();
    lockCount++;
    return;
  }

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) removeLock();
}

// Force-release everything (used on unmount, so a crashed overlay cannot leave
// the page permanently unscrollable).
export function releaseScroll() {
  if (typeof document === "undefined") return;
  if (lockCount === 0 && !document.documentElement.classList.contains("nx-locked")) return;
  lockCount = 0;
  removeLock();
}
