// Visibility of the config.js entry lists (`navTop` rail links, `topBar` site
// links) in the redesigned UI.
//
// Three independent switches, in the order a maintainer would reason about them:
//
//  - `show_new: false` — hidden in the redesigned UI only; the legacy header
//    still prints the entry.
//  - `show_zh_hant: false` — narrows the Chinese entries further: the entry is
//    meant for the mainland audience (a QQ group, a Bilibili account) and is
//    dropped from the Traditional Chinese interface. The legacy header has no
//    Traditional Chinese UI, so it ignores the field.
//  - `show_zh` / `show_en` — which of the site's written languages the entry
//    belongs to. `contentLang` is the language the *page* presents, not the
//    interface language: a Chinese-only catalog opened by an English visitor
//    still shows its Chinese rail.
//
// Keeping the rule here (instead of inline in NxShell) makes it testable and
// keeps the shell from growing a sixth copy of the same three conditions.
//
// @param {object} item - a `navTop` / `topBar` entry
// @param {object} context
// @param {string} context.contentLang - `"zh"` or `"en"`
// @param {boolean} context.traditionalUi - whether the interface is Traditional Chinese
// @returns {boolean}
export function isEntryVisible(item, { contentLang, traditionalUi }) {
  if (!item) return false;
  if (item.show_new === false) return false;
  if (item.show_zh_hant === false && traditionalUi) return false;
  if (item.show_zh === false && contentLang === "zh") return false;
  if (item.show_en === false && contentLang !== "zh") return false;
  return true;
}
