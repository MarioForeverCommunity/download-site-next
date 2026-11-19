// Which locale a redesigned page can actually present.
//
// Two things decide it: the visitor's choice (util/i18n) and the page's own
// capability. Some catalogs are single-language by design — the MW level catalog
// and the assets catalog are Chinese-only, the engines and Mario Worker indexes
// are English-only (config.js `show_zh` / `show_en`) — so on those pages the
// interface follows the language the content is written in, and the language menu
// only offers the locales that language has.
import { navTop } from "../../config.js";
import {
  dataLangOf,
  getLocale,
  localeInfo,
  localizedField,
  normalizeLocale,
} from "../../i18n/index.js";

/** The config.js entry that describes a page, or null. */
export function entryForPage(pageId) {
  return navTop.find((item) => item.id === pageId) || null;
}

/**
 * Content languages a page can present, derived from the same `show_zh` /
 * `show_en` flags the navigation uses.
 *
 * @returns {string[]} e.g. `["zh", "en"]`, `["zh"]`, `["en"]`
 */
export function pageLanguages(entry) {
  if (!entry) return ["zh", "en"];
  const languages = [];
  if (entry.show_zh !== false) languages.push("zh");
  if (entry.show_en !== false) languages.push("en");
  return languages.length ? languages : ["zh", "en"];
}

/**
 * The locale a page should render in for a given visitor choice.
 *
 * A page that cannot present the requested content language falls back to the
 * default locale of the language it does have, so a Japanese visitor on the
 * Chinese-only MW catalog gets Chinese content with a Chinese interface rather
 * than an English interface wrapped around Chinese records.
 */
export function localeForEntry(code, entry) {
  const info = localeInfo(code);
  const languages = pageLanguages(entry);
  if (languages.includes(info.data)) return info.code;
  return languages.includes("zh") ? "zh-Hans" : "en";
}

/** Resolved locale for a page id. */
export function pageLocale(pageId, code = getLocale()) {
  return localeForEntry(code, entryForPage(pageId));
}

/**
 * Resolve the locale a page should render from the locales it actually has.
 *
 * `pageLocale()` uses config.js's broad `show_zh` / `show_en` flags; this one uses
 * the page's real documents (or, for a page whose UI is fully translated, its
 * registered locale list). That way adding e.g. `mw-zh-hant.md` is enough for a
 * Traditional Chinese visitor to see it — no page or shell logic changes.
 *
 * @param {string} code - visitor's locale
 * @param {string[]} codes - canonical locales the page can present
 * @returns {string} a canonical locale code present in `codes` (or the request)
 */
export function localeForLocales(code, codes) {
  const list = (codes || []).filter(Boolean);
  if (list.length === 0) return normalizeLocale(code) || "zh-Hans";
  const wanted = normalizeLocale(code) || "zh-Hans";
  if (list.includes(wanted)) return wanted;

  // Same written language, preferring that language's default locale.
  const language = dataLangOf(wanted);
  const preferred = language === "zh" ? "zh-Hans" : "en";
  if (list.includes(preferred) && dataLangOf(preferred) === language) return preferred;
  // A Traditional Chinese visitor falls back to the Simplified write-up when a
  // page has no Traditional one. The reverse is deliberately not done: a
  // Simplified Chinese visitor on an English-content page (the engines and
  // Level Editors indexes) is better served by English than by silently
  // switching their interface to Traditional Chinese.
  if (wanted !== "zh-Hans") {
    const sameLanguage = list.find((item) => dataLangOf(item) === language);
    if (sameLanguage) return sameLanguage;
  }

  // Nothing in that language: fall back to the site's two base languages.
  if (list.includes("zh-Hans")) return "zh-Hans";
  if (list.includes("en")) return "en";
  return list[0];
}

/** Page title in a locale, via the entry's `title` / `title_alt` fields. */
export function pageTitleFor(entry, code) {
  if (!entry) return "";
  return localizedField(entry, "title", code) || entry.title || "";
}

/**
 * Pick the markdown write-up matching a locale's content language.
 *
 * @param {string} code - locale code
 * @param {object} docs - `{ zh, en }` compiled markdown components
 */
export function pickDoc(code, docs) {
  const info = localeInfo(code);
  // A page may ship a document written specifically for one locale — the home
  // page has mf-zh-hant.md and mf-pl.md alongside the shared zh/en pair. Pages
  // with only two documents keep working via the content-language fallback.
  // The keys are canonical (`zh-Hans`, not `zh`), so the written-language
  // fallback is spelled out rather than looked up by `info.data`.
  if (docs[info.code]) return docs[info.code];
  if (info.data === "en") return docs.en || null;
  return docs["zh-Hans"] || null;
}
