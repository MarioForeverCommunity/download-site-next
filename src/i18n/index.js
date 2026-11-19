// Internationalisation core for the redesigned UI.
//
// Everything language-specific lives in `src/i18n/locales/*.js`: the interface
// strings, the native name shown in the switcher, which legacy language to hand
// over to, which written-content language the YAML data is in, and the data-field
// suffixes used when picking a value out of a record. Adding a language is
// therefore a matter of adding one file and registering it below — no component,
// page or adapter has to change.
//
// Two independent axes are involved and must not be confused:
//
//  - **interface locale** — the language of buttons, column headers and drawers.
//    This is what `t()` / `useI18n()` resolve, and what the visitor picks.
//  - **content language** (`data`) — the language the YAML records, the markdown
//    write-ups and the changelog are written in. `zh-Hant` sites its interface in
//    Traditional Chinese while reading the Simplified data; `localizedField()`
//    picks the best-authored field without rewriting it. The `convert` flag on a
//    locale now exists for exactly one thing: the Simplified-authored changelog
//    (`convert.js`), which has no Traditional source file. Everything else that
//    needs Traditional wording gets its own field or markdown document.
//
// Link variants are governed by `prefersAltLinks()`: Chinese (Simplified and
// Traditional alike) leads with the primary Chinese-community link, every other
// locale — Polish included — with the alternate (English-language) one.
import { ref } from "vue";
import { convertText } from "./convert.js";
import en from "./locales/en.js";
import pl from "./locales/pl.js";
import zhHans from "./locales/zh-hans.js";
import zhHant from "./locales/zh-hant.js";

// Order of this list is the order of the language menu.
const LOCALES = [zhHans, zhHant, en, pl];

// Used when nothing else matches (no URL parameter, no stored choice, no
// recognisable browser language).
const DEFAULT_LOCALE = "en";

// The interface locale outlives the browser session, like the design and theme
// choices (see util/Design.js / util/Theme.js).
const STORAGE_KEY = "locale";
// Legacy design compatibility: it only knows `zh` / `en`, so the hand-off keeps
// writing this key (see legacyLangOf()).
const LEGACY_STORAGE_KEY = "language";

const BY_CODE = new Map(LOCALES.map((locale) => [locale.code, locale]));

// Alias → canonical code, so `?lang=zh-tw`, a stored `zh-hant` or a browser tag
// such as `zh-HK` all resolve to the same catalogue.
const ALIASES = new Map();
for (const locale of LOCALES) {
  ALIASES.set(locale.code.toLowerCase(), locale.code);
  for (const alias of locale.aliases || []) ALIASES.set(String(alias).trim().toLowerCase(), locale.code);
}

/**
 * Resolve any language tag / alias to a registered locale code.
 *
 * @param {string} value
 * @returns {string|null} canonical code, or null when nothing matches
 */
export function normalizeLocale(value) {
  if (!value) return null;
  const key = String(value).trim().replace(/_/g, "-").toLowerCase();
  if (!key) return null;
  if (ALIASES.has(key)) return ALIASES.get(key);
  // Progressively shorter subtags: "zh-hant-tw" → "zh-hant" → "zh".
  const parts = key.split("-");
  for (let length = parts.length - 1; length > 0; length--) {
    const candidate = parts.slice(0, length).join("-");
    if (ALIASES.has(candidate)) return ALIASES.get(candidate);
  }
  return null;
}

/**
 * Metadata of a locale (falling back to the default locale for unknown codes).
 *
 * @param {string} code
 */
export function localeInfo(code) {
  return BY_CODE.get(normalizeLocale(code)) || BY_CODE.get(DEFAULT_LOCALE);
}

/** Every registered locale, in menu order. */
export function localeList() {
  return LOCALES;
}

/** Compact switcher options: `{ code, label, short }`. */
export function localeOptions() {
  return LOCALES.map((locale) => ({
    code: locale.code,
    label: locale.name || locale.code,
    short: locale.short || locale.code,
  }));
}

/**
 * Language the legacy design should be opened in for this locale.
 *
 * Defaults to English: the legacy UI only exists in Simplified Chinese and
 * English, so a locale that does not map itself explicitly hands over to English
 * (Traditional Chinese declares `legacy: "zh"` so it lands on the Simplified
 * legacy site instead).
 */
export function legacyLangOf(code) {
  return localeInfo(code).legacy || "en";
}

/** Written-content language (YAML / markdown / changelog) for this locale. */
export function dataLangOf(code) {
  return localeInfo(code).data || "en";
}

/**
 * Does this locale read its labels from Simplified Chinese and therefore need a
 * character conversion? Only `zh-Hant` declares `convert` today; every other
 * locale reads data written in its own script (English for new languages).
 */
export function localeNeedsConversion(code) {
  return Boolean(localeInfo(code).convert);
}

/**
 * Convert site-produced text (navigation titles, page titles, link names, site
 * labels) into the locale's script.
 *
 * This is for chrome the site itself writes — never for fan-made record names,
 * descriptions or markdown, which stay exactly as their authors wrote them.
 *
 * @param {string} text
 * @param {string} code - locale code
 */
export function localizeText(text, code) {
  if (!localeInfo(code).convert) return text;
  return convertText(text);
}

/**
 * Which link variant the locale leads with.
 *
 * Links come in a primary (Chinese-community) and an alternate (usually the
 * English-language) flavour. Simplified and Traditional Chinese are the same
 * written language here, so both use the primary link; every other locale — a
 * newly added Polish included — behaves like English and prefers the alternate
 * one, falling back to the primary when it is missing or dead.
 *
 * @param {string} code - locale code
 */
export function prefersAltLinks(code) {
  return dataLangOf(code) !== "zh";
}

// Cached lookup chains: every translation call would otherwise rebuild the same
// array for the same locale.
const CHAIN_CACHE = new Map();

/**
 * Message lookup chain: the locale itself, its declared fallbacks, then English.
 *
 * @param {string} code
 * @returns {string[]}
 */
export function messageChain(code) {
  const canonical = normalizeLocale(code) || DEFAULT_LOCALE;
  const cached = CHAIN_CACHE.get(canonical);
  if (cached) return cached;

  const chain = [];
  const walk = (candidate) => {
    const code2 = normalizeLocale(candidate);
    if (!code2 || chain.includes(code2)) return;
    chain.push(code2);
    for (const fallback of BY_CODE.get(code2).fallbacks || []) walk(fallback);
  };
  walk(canonical);
  if (!chain.includes("en")) walk("en");
  CHAIN_CACHE.set(canonical, chain);
  return chain;
}

// Dotted keys are split on every lookup; the key set is finite, so remember the
// segments instead of re-splitting the same strings on every render.
const KEY_PARTS = new Map();

function readKey(messages, key) {
  let parts = KEY_PARTS.get(key);
  if (!parts) {
    parts = String(key).split(".");
    KEY_PARTS.set(key, parts);
  }
  let node = messages;
  for (const part of parts) {
    if (!node || typeof node !== "object") return undefined;
    node = node[part];
    if (node === undefined) return undefined;
  }
  return node;
}

// `{name}` placeholders, so translators can reorder them freely.
function formatMessage(template, params) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) => (
    params[name] == null ? match : String(params[name])
  ));
}

// A catalogue value is normally a string, but a key that needs plural forms
// (Polish, English) may map CLDR categories to templates. `{n}` selects the
// category; languages without plural machinery keep using a plain string.
function resolveMessage(value, code, params) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object" || !params || params.n == null) return undefined;
  let category;
  try {
    category = new Intl.PluralRules(localeInfo(code).htmlLang || code).select(Number(params.n));
  } catch (_e) {
    category = "other";
  }
  const picked = value[category] || value.other || value.many || value.few || value.one;
  return typeof picked === "string" ? picked : undefined;
}

/**
 * Translate a key for a specific locale.
 *
 * @param {string} code - locale code
 * @param {string} key - dotted key, e.g. `"catalog.colName"`
 * @param {object} [params] - values for `{placeholder}` slots
 * @returns {string} the translation, or the key itself when no catalogue has it
 */
export function tFor(code, key, params) {
  for (const candidate of messageChain(code)) {
    const value = readKey(BY_CODE.get(candidate).messages, key);
    const message = resolveMessage(value, candidate, params);
    if (message !== undefined) return formatMessage(message, params);
  }
  return key;
}

/**
 * Does any catalogue in this locale's chain define the key?
 *
 * Used for optional blocks: the play instructions exist only in the Chinese
 * catalogues, so an English page asks first and simply omits the section.
 */
export function hasMessage(code, key) {
  for (const candidate of messageChain(code)) {
    const value = readKey(BY_CODE.get(candidate).messages, key);
    if (typeof value === "string") return true;
    if (value && typeof value === "object"
      && ["one", "few", "many", "other"].some((part) => typeof value[part] === "string")) {
      return true;
    }
  }
  return false;
}

/**
 * Pick a localized data field from a YAML-derived object.
 *
 * Suffixes come from the locale (`fields`), so `zh-Hant` tries `_zh_hant`,
 * `_zh`, the plain field, `_alt`, then `_en` — adding translated data fields is
 * enough to make them show up, no code change needed. Values are returned as
 * authored: opencc is deliberately *not* applied here (only the changelog uses
 * character conversion).
 *
 * @param {object} object
 * @param {string} key - base field name, e.g. `"homepage"` or `"desc"`
 * @param {string} code - locale code
 */
export function localizedField(object, key, code) {
  if (!object) return undefined;
  // A locale that declares no fields of its own behaves like English, which is
  // the safe default for a freshly added language file.
  const fields = localeInfo(code).fields || ["_en", "_alt", ""];
  for (const suffix of fields) {
    const value = object[key + suffix];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

/**
 * Look up a label in a small `{ zh, en, … }` dictionary, keyed by locale first,
 * then by the locale's content language, then English.
 *
 * @param {object} dictionary
 * @param {string} code - locale code
 */
export function labelFrom(dictionary, code) {
  if (!dictionary) return undefined;
  const info = localeInfo(code);
  for (const candidate of [info.code, info.data, "en", ...Object.keys(dictionary)]) {
    const value = dictionary[candidate];
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

// ── current locale ──────────────────────────────────────────
function readSetting(key) {
  try {
    return localStorage.getItem(key);
  } catch (_e) {
    return null;
  }
}

function writeSetting(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch (_e) {
    // Private mode / disabled storage: the choice still applies for this view.
  }
}

function readUrlLocale() {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    return normalizeLocale(params.get("lang") || params.get("locale"));
  } catch (_e) {
    return null;
  }
}

// Browser preference: the first tag we recognise wins, so a `zh-TW` browser
// opens in Traditional Chinese while `zh-CN` opens in Simplified.
function detectLocale() {
  if (typeof navigator === "undefined") return null;
  const tags = navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language];
  for (const tag of tags) {
    const match = normalizeLocale(tag);
    if (match) return match;
  }
  return null;
}

// A returning legacy visitor has only the `language` key (`zh` / `en`). Map it
// to the canonical locale of that language so their old choice still applies.
function localeFromLegacySetting() {
  const legacy = readSetting(LEGACY_STORAGE_KEY);
  if (legacy === "zh") return normalizeLocale("zh");
  if (legacy === "en") return normalizeLocale("en");
  return null;
}

function readInitialLocale() {
  const fromUrl = readUrlLocale();
  if (fromUrl) {
    writeSetting(STORAGE_KEY, fromUrl);
    writeSetting(LEGACY_STORAGE_KEY, legacyLangOf(fromUrl));
    return fromUrl;
  }

  const stored = normalizeLocale(readSetting(STORAGE_KEY));
  const legacy = readSetting(LEGACY_STORAGE_KEY);
  if (stored) {
    // The legacy design writes only `language`. When it no longer agrees with
    // the hand-off of the stored locale, the visitor re-picked a language inside
    // the legacy UI, and that pick is the newer of the two.
    if (legacy && legacyLangOf(stored) !== legacy) {
      return localeFromLegacySetting() || stored;
    }
    return stored;
  }
  return localeFromLegacySetting() || detectLocale() || DEFAULT_LOCALE;
}

const currentLocale = ref(readInitialLocale());

/** Current interface locale. */
export function getLocale() {
  return currentLocale.value;
}

function applyHtmlLang(code) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = localeInfo(code).htmlLang || code;
}

function writeLocaleParam(code) {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", code);
    // `history.state` carries the router's page id and the back-guard sentinel;
    // replacing it with `{}` would break both.
    window.history.replaceState(window.history.state, "", url.toString());
  } catch (_e) {
    // Non-http(s) contexts: the choice is still stored and applied.
  }
}

/**
 * Switch the interface locale.
 *
 * @param {string} next - locale code or alias
 * @param {object} [options]
 * @param {boolean} [options.persist=true] - remember the choice in localStorage
 * @param {boolean} [options.updateUrl=true] - mirror it into `?lang=`
 * @returns {string} the resolved locale code
 */
export function setLocale(next, options = {}) {
  const code = normalizeLocale(next) || DEFAULT_LOCALE;
  currentLocale.value = code;

  if (options.persist !== false) {
    writeSetting(STORAGE_KEY, code);
    // Keep the legacy design in step: it only understands `zh` / `en`, and a
    // Traditional Chinese visitor must land on the Simplified legacy site.
    writeSetting(LEGACY_STORAGE_KEY, legacyLangOf(code));
  }
  if (options.updateUrl !== false) writeLocaleParam(code);
  applyHtmlLang(code);
  return code;
}

/** Alias used by pages when reacting to the shell's language menu. */
export function applyLocale(code) {
  return setLocale(code);
}

/**
 * Re-apply a locale named by the current URL.
 *
 * The module resolves its locale once at import time, so a `?lang=` carried by
 * a link or a history entry would otherwise be ignored inside the single-page
 * app. The router calls this before navigating, i.e. before the target page's
 * setup resolves its locale again.
 *
 * @returns {boolean} whether the URL changed the active locale
 */
export function syncLocaleFromUrl() {
  const code = readUrlLocale();
  if (!code || code === currentLocale.value) return false;
  setLocale(code);
  return true;
}

/**
 * Apply the resolved locale to the document. Called once by the new design's
 * boot path, before the first render.
 */
export function initLocale() {
  const code = getLocale();
  applyHtmlLang(code);
  return code;
}

// Current-locale shortcuts, for code that is not bound to a page's prop.
export function t(key, params) {
  return tFor(currentLocale.value, key, params);
}

export function te(key) {
  return hasMessage(currentLocale.value, key);
}

/**
 * Bind the translation helpers to a locale source.
 *
 * @param {string|Function} [source] - a locale code, a getter returning one, or
 *   nothing to follow the global locale
 */
export function useI18n(source) {
  const codeOf = () => {
    if (typeof source === "function") return source();
    return source || currentLocale.value;
  };
  return {
    t: (key, params) => tFor(codeOf(), key, params),
    te: (key) => hasMessage(codeOf(), key),
    tl: (object, key) => localizedField(object, key, codeOf()),
    label: (dictionary) => labelFrom(dictionary, codeOf()),
    locale: codeOf,
  };
}
