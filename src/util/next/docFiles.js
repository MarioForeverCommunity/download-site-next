// Discover a page's markdown write-ups by filename instead of hard-coding which
// languages a page has.
//
// File convention: `<prefix>-<locale>.md` (a bare `<prefix>.md` is the Simplified
// Chinese original). A Vite `import.meta.glob` over those files is turned into a
// `{ canonicalLocaleCode: compiledComponent }` map, so dropping in a new
// `mw-zh-hant.md` / `engines-pl.md` makes that language appear in the page and in
// its language menu without touching the page or the shell logic.
//
// @param {Record<string, any>} modules - result of `import.meta.glob(..., { eager: true, import: "default" })`
// @param {string} prefix - filename stem before `-<locale>`
// @returns {Record<string, any>}
import { normalizeLocale } from "../../i18n/index.js";

export function discoverDocs(modules, prefix) {
  const docs = {};
  for (const [path, component] of Object.entries(modules || {})) {
    const file = path.slice(path.lastIndexOf("/") + 1).replace(/\.md$/, "");
    const suffix = file === prefix
      ? ""
      : file.startsWith(`${prefix}-`)
        ? file.slice(prefix.length + 1)
        : null;
    if (suffix === null) continue;
    // `zh` / `zh-hant` / `en` / `pl` → canonical `zh-Hans` / `zh-Hant` / …
    const code = suffix === "" ? "zh-Hans" : normalizeLocale(suffix);
    if (code) docs[code] = component;
  }
  return docs;
}
