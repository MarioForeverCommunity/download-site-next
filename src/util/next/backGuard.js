// Android back-button support for overlays (drawers, full-screen modals).
//
// On Android the hardware/gesture back button is a browser "back" navigation: it
// fires `popstate` and, if nothing intercepts it, leaves the page. An open
// overlay should absorb that press and close itself instead.
//
// The mechanism: opening an overlay pushes one sentinel history entry. A back
// press then pops that sentinel, `popstate` fires, and the overlay closes. When
// the overlay is closed from the UI (scrim, close button, Escape) the sentinel
// must be removed again, otherwise the next back press would be swallowed.
//
// Only one overlay is open at a time in this interface, so a single module-level
// token is enough; it also keeps nested overlays from stacking sentinels.
let activeToken = null;
let activeClose = null;

// Set while we are undoing our own sentinel, so the resulting `popstate` is not
// mistaken for a user pressing back.
let selfPopPending = 0;

/**
 * Register an open overlay. Returns a function that must be called when the
 * overlay closes from the UI.
 *
 * @param {() => void} onBack - called when the user presses back
 */
export function pushBackGuard(onBack) {
  if (typeof window === "undefined") return () => {};

  // A second overlay opening replaces the first (they never coexist).
  if (activeToken) {
    activeToken = null;
    activeClose = null;
  }

  const token = `nx-overlay-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  activeToken = token;
  activeClose = onBack;

  window.history.pushState({ nxOverlay: token }, "", window.location.href);

  let released = false;
  return function release() {
    if (released) return;
    released = true;
    if (activeToken !== token) return;
    activeToken = null;
    activeClose = null;
    // Undo the sentinel we added. The browser fires `popstate` for this, which
    // must not be treated as a back press.
    selfPopPending += 1;
    window.history.back();
  };
}

// Drop the guard without touching history (used when the overlay is closed by a
// back press that already popped the sentinel).
export function releaseBackGuard() {
  activeToken = null;
  activeClose = null;
}

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    // Our own history.back() unwinding a sentinel: swallow exactly one event.
    if (selfPopPending > 0) {
      selfPopPending -= 1;
      return;
    }
    if (!activeClose) return;
    const close = activeClose;
    // The sentinel is already gone; just close the overlay.
    releaseBackGuard();
    close();
  });
}
