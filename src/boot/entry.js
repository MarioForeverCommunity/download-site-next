// Entry-point bootstrap.
//
// Each entry HTML (`index.html`, `mf-games.html`, …) loads one small main.js. That
// file hands both page implementations here and this module mounts the one the
// visitor selected, so the two designs can coexist without duplicating the
// document, the data pipeline or the build config.
//
// The two boot modules are imported dynamically on purpose: `bootLegacy` pulls in
// the legacy stylesheet (`dark-mode.css`), which styles bare `body`/`a`/`table`
// selectors and would leak into the redesigned UI if it were part of the initial
// module graph.
import { isNextDesign } from "../util/Design.js";

/**
 * @param {object} pages
 * @param {object} pages.legacy - Vue component for the original design
 * @param {string} [pages.pageId] - which entry this HTML is; the redesigned UI
 *   uses it as the initial route (it can then navigate client-side without a
 *   reload). The legacy design does not need it.
 * @returns {Promise<"legacy"|"next">} the design that was mounted
 */
export async function startPage({ legacy, pageId }) {
  if (isNextDesign()) {
    const { bootNext } = await import("./next.js");
    await bootNext({ pageId });
    return "next";
  }
  const { bootLegacy } = await import("./legacy.js");
  bootLegacy(legacy);
  return "legacy";
}
