// Boot path for the redesigned UI: new typefaces, new tokens, theme bootstrap.
import { createApp } from "vue";
import "../assets/next/fonts.css";
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
  // rather than trusting the document to be clean. `dark` matters most: the
  // legacy stylesheet keys off it and must not restyle the redesigned UI.
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
