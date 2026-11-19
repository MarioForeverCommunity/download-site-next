// Android back-button support for overlays (drawers, modals, dialogs).
//
// On Android the hardware/gesture back button is a browser "back" navigation: it
// fires `popstate` and, if nothing intercepts it, leaves the page. An open
// overlay should absorb that press and close itself instead.
//
// The mechanism: opening an overlay pushes one sentinel history entry. A back
// press then pops that sentinel, `popstate` fires, and the topmost overlay
// closes. When the overlay is closed from the UI (scrim, close button, Escape)
// the sentinel must be removed again, otherwise the next back press would be
// swallowed.
//
// Overlays can nest (the legacy detail modal opens an image preview on top of
// itself), so the open overlays are kept in a stack: one sentinel per overlay,
// and a back press always closes the one on top. Both designs share this module;
// the next design only ever has one overlay open at a time.
const stack = [];

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

  const token = `overlay-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const entry = { token, close: onBack };
  stack.push(entry);

  window.history.pushState({ nxOverlay: token }, "", window.location.href);

  let released = false;
  return function release() {
    if (released) return;
    released = true;
    const index = stack.indexOf(entry);
    if (index === -1) return;
    if (index === stack.length - 1) {
      stack.pop();
      // Undo the sentinel we added. The browser fires `popstate` for this, which
      // must not be treated as a back press.
      selfPopPending += 1;
      window.history.back();
    } else {
      // Released underneath a still-open overlay: only the top sentinel can be
      // unwound. The remaining guards keep working; the orphaned sentinel just
      // costs one ignored back press once it surfaces. Closing order is LIFO in
      // practice (a covered overlay cannot be clicked), so this is rare.
      stack.splice(index, 1);
    }
  };
}

// Drop every guard without touching history. The sentinel entries are left in
// place for whoever takes over from here.
//
// Two callers: the back-press path, where the sentinel is already gone; and the
// in-app navigation path, where the router replaces the sentinel with the page
// it opens. The latter must not call the release function above — unwinding the
// sentinel with `history.back()` raced the navigation (when the target page
// module was already cached the new entry was pushed first, the back press then
// popped it, and the browser bounced to the page being left).
export function abandonBackGuard() {
  stack.length = 0;
}

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    // Our own history.back() unwinding a sentinel: swallow exactly one event.
    if (selfPopPending > 0) {
      selfPopPending -= 1;
      return;
    }
    const top = stack.pop();
    if (!top) return;
    // The sentinel is already gone; just close the overlay.
    top.close();
  });
}
