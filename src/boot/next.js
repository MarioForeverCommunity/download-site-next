// Boot path for the redesigned UI.
//
// Typography: the new interface deliberately reuses Inter, which
// `assets/fonts.css` already loads for every entry — no extra webfont, no second
// family, no serif. The legacy stylesheet (dark-mode.css) is *not* imported here;
// it styles bare body/a/table selectors and would leak into this UI.
import { createApp } from "vue";
import "../assets/fonts.css";
import "../assets/next/base.css";
import { initTheme, initDensity } from "../util/Theme.js";
import { docComponents } from "../util/next/docComponents.js";

/**
 * @param {object} App - root component for the page
 * @param {object} [options]
 * @param {object} [options.components] - extra components to register globally
 *   (the markdown documents reference entry components by name)
 */
export function bootNext(App, options = {}) {
  // Swapping designs reloads the page, so clear any legacy-only body state
  // rather than trusting the document to be clean.
  document.body.classList.add("nx-body");
  document.documentElement.classList.remove("modal-open");

  initTheme();
  initDensity();

  const app = createApp(App, options.props || {});
  for (const [name, component] of Object.entries(docComponents)) {
    app.component(name, component);
  }
  for (const [name, component] of Object.entries(options.components || {})) {
    app.component(name, component);
  }
  app.mount("#app");
}
