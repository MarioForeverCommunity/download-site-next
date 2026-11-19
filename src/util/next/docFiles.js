// Discover a page's markdown write-ups by directory instead of hard-coding which
// languages a page has.
//
// Convention: `src/markdown/<locale>/<page>.md` — the folder is the interface
// locale (`zh-hans`, `zh-hant`, `en`, `pl`), the file is the page id. A Vite
// `import.meta.glob` over `markdown/<locale>/<page>.md` becomes a
// `{ canonicalLocaleCode: compiledComponent }` map, so dropping a file into a
// locale folder (`markdown/pl/mf-index.md`) makes that language appear in the
// page and in its language menu without touching the page or the shell logic.
//
// @param {Record<string, any>} modules - result of `import.meta.glob(..., { eager: true, import: "default" })`
// @returns {Record<string, any>}
import { normalizeLocale } from "../../i18n/index.js";

export function discoverDocs(modules) {
  const docs = {};
  for (const [path, component] of Object.entries(modules || {})) {
    // `.../markdown/zh-hant/mf-index.md` → `zh-hant`
    const match = /\/markdown\/([^/]+)\/[^/]+\.md$/.exec(path);
    if (!match) continue;
    const code = normalizeLocale(match[1]);
    if (code) docs[code] = component;
  }
  return docs;
}
