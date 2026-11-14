// Boot path for the redesigned UI.
//
// Typography: the new interface deliberately reuses Inter, which
// `assets/fonts.css` already loads for every entry — no extra webfont, no second
// family, no serif. The legacy stylesheet (dark-mode.css) is *not* imported here;
// it styles bare body/a/table selectors and would leak into this UI.
//
// Navigation: the new design is a single-page app. Every entry HTML mounts this
// one root (see boot/NxApp.vue) and clicking a rail link swaps the page
// component instead of reloading the document. The legacy design keeps its
// per-page reloads — this module is only reachable from the new-design branch.
import { createApp } from "vue";
import "../assets/fonts.css";
import "../assets/next/base.css";
import { initTheme, initDensity } from "../util/Theme.js";
import { docComponents } from "../util/next/docComponents.js";
import { startRouter } from "../util/next/router.js";
import NxApp from "./NxApp.vue";

/**
 * @param {object} options
 * @param {string} [options.pageId] - the page this entry normally shows; used as
 *   the initial route and as the fallback for unknown URLs
 * @param {object} [options.components] - extra components to register globally
 *   (the markdown documents reference entry components by name)
 */
export async function bootNext(options = {}) {
  // Swapping designs reloads the page, so clear any legacy-only body state
  // rather than trusting the document to be clean.
  document.body.classList.add("nx-body");
  document.documentElement.classList.remove("modal-open");

  initTheme();
  initDensity();

  const app = createApp(NxApp);
  for (const [name, component] of Object.entries(docComponents)) {
    app.component(name, component);
  }
  for (const [name, component] of Object.entries(options.components || {})) {
    app.component(name, component);
  }
  app.mount("#app");

  // Mount first, then resolve the initial page: the router renders into the
  // already-mounted root, so the very first paint is never an empty shell.
  await startRouter({ pageId: options.pageId || "index" });
}
