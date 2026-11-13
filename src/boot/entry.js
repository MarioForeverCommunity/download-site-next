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
 * @param {object} [pages.next] - Vue component for the redesigned UI; when
 *   omitted the visitor stays on the legacy page regardless of preference.
 * @returns {Promise<"legacy"|"next">} the design that was mounted
 */
export async function startPage({ legacy, next }) {
  if (next && isNextDesign()) {
    const { bootNext } = await import("./next.js");
    bootNext(next);
    return "next";
  }
  const { bootLegacy } = await import("./legacy.js");
  bootLegacy(legacy);
  return "legacy";
}
