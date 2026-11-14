// Page-scroll locking shared by every overlay (details, changelog, settings,
// catalog write-up).
//
// Hiding the scrollbar removes it from the layout, so the viewport suddenly
// widens by the scrollbar's width. Fixed-position overlays are anchored to the
// viewport, so without compensation a full-bleed drawer stays laid out against
// the old width and ends up shifted (and half off-screen on a phone, where a
// classic scrollbar is ~20px). Reserving that width as body padding keeps the
// layout box unchanged.
let lockCount = 0;
let previousPaddingRight = "";

export function lockScroll(locked) {
  if (typeof document === "undefined") return;
  const body = document.body;

  if (locked) {
    if (lockCount === 0) {
      const gap = window.innerWidth - document.documentElement.clientWidth;
      previousPaddingRight = body.style.paddingRight;
      if (gap > 0) body.style.paddingRight = `${gap}px`;
    }
    lockCount++;
    body.classList.add("nx-locked");
    return;
  }

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    body.style.paddingRight = previousPaddingRight;
    body.classList.remove("nx-locked");
  }
}

// Force-release everything (used on unmount, so a crashed overlay cannot leave
// the page permanently unscrollable).
export function releaseScroll() {
  if (typeof document === "undefined") return;
  lockCount = 0;
  document.body.style.paddingRight = previousPaddingRight;
  document.body.classList.remove("nx-locked");
}
