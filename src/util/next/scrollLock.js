// Page-scroll locking shared by every overlay (details, changelog, settings,
// catalog write-up, the phone filter drawer and the phone rail drawer).
//
// Two things have to be true while an overlay is open:
//
//  1. The page behind must not scroll — from the wheel, touch, or keyboard.
//  2. The viewport must not reflow. Hiding the scrollbar widens the layout box
//     by its width, and fixed-position overlays are anchored to the viewport, so
//     a full-bleed drawer would sit visibly off-centre. The scrollbar width is
//     reserved as body padding instead.
//
// Deliberately *not* used: pinning the body with `position: fixed`. That is the
// usual recipe, but this layout keeps the rail and the topbar `position: sticky`
// against the document scroller; pinning the body takes the document scroller
// away and offsets the body by the scroll position, so both bars jumped upwards
// out of view whenever an overlay opened after scrolling. `overflow: hidden` on
// the root keeps the document scroller (and therefore the sticky elements) in
// place, and the wheel/touch listeners below cover what it does not block.
let lockCount = 0;
let savedScrollY = 0;
let savedPaddingRight = "";

function blockWheel(event) {
  // Let the overlay's own scrollable content keep scrolling.
  const target = event.target;
  if (target && target.closest) {
    const scroller = target.closest(".nx-drawer, .nx-pane, .nx-rail, .nx-detail");
    if (scroller) {
      const canScroll = scroller.scrollHeight > scroller.clientHeight;
      if (canScroll) return;
    }
  }
  event.preventDefault();
}

function blockTouchMove(event) {
  const target = event.target;
  if (target && target.closest) {
    const scroller = target.closest(".nx-drawer, .nx-pane, .nx-rail, .nx-detail");
    if (scroller) {
      const canScroll = scroller.scrollHeight > scroller.clientHeight;
      if (canScroll) return;
    }
  }
  if (event.cancelable) event.preventDefault();
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
  window.addEventListener("touchmove", blockTouchMove, { passive: false });
  window.addEventListener("keydown", blockKeys, { capture: true });
}

function removeLock() {
  const body = document.body;
  const root = document.documentElement;
  root.classList.remove("nx-locked");
  body.style.paddingRight = savedPaddingRight;
  window.removeEventListener("wheel", blockWheel);
  window.removeEventListener("touchmove", blockTouchMove);
  window.removeEventListener("keydown", blockKeys, { capture: true });
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
