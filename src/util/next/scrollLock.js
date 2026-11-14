// Page-scroll locking shared by every overlay (details, changelog, settings,
// catalog write-up, the phone filter drawer and the phone rail drawer).
//
// Two things have to be true while an overlay is open:
//
//  1. The page behind must not scroll — including from the wheel, touch, and
//     programmatic `scrollTo`. `overflow: hidden` alone does not stop script
//     scrolling, so the body is pinned with `position: fixed` and offset by the
//     current scroll position; releasing restores that position exactly.
//
//  2. The viewport must not reflow. Hiding the scrollbar widens the layout box by
//     its width, and fixed-position overlays are anchored to the viewport, so a
//     full-bleed drawer would sit visibly off-centre. The scrollbar width is
//     reserved as body padding instead.
let lockCount = 0;
let savedScrollY = 0;
let savedPaddingRight = "";
let savedPosition = "";
let savedTop = "";
let savedWidth = "";

function applyLock() {
  const body = document.body;
  savedScrollY = window.scrollY || window.pageYOffset || 0;
  savedPaddingRight = body.style.paddingRight;
  savedPosition = body.style.position;
  savedTop = body.style.top;
  savedWidth = body.style.width;

  const gap = window.innerWidth - document.documentElement.clientWidth;
  if (gap > 0) body.style.paddingRight = `${gap}px`;

  // Pinning the body is what actually stops every scroll source.
  body.style.position = "fixed";
  body.style.top = `-${savedScrollY}px`;
  body.style.width = "100%";
  body.classList.add("nx-locked");
}

function removeLock() {
  const body = document.body;
  body.classList.remove("nx-locked");
  body.style.position = savedPosition;
  body.style.top = savedTop;
  body.style.width = savedWidth;
  body.style.paddingRight = savedPaddingRight;
  // Restore the reading position the pin took away.
  window.scrollTo(0, savedScrollY);
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
  if (lockCount === 0 && !document.body.classList.contains("nx-locked")) return;
  lockCount = 0;
  removeLock();
}
