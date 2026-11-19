// Simplified → Traditional conversion for the one piece of site text that has no
// Traditional source: the changelog (`src/data/changelog.js`).
//
// Everything else that needs Traditional wording is authored explicitly —
// `option_zh_hant` / `title_zh_hant` / `desc_zh_hant` in config.js, dedicated
// `*-zh-hant.md` write-ups, and the `zh-Hant` message catalogue. Fan-made record
// names, author names and descriptions are never machine-converted.
//
// opencc-js carries a ~1 MB dictionary, so it is a **dynamic import loaded only
// when a Traditional Chinese visitor opens the changelog**; until it arrives
// `convertText()` is an identity function, so nothing can throw. The converter is
// a `shallowRef`, so the drawer re-renders automatically when it lands.
import { shallowRef } from "vue";

const converter = shallowRef(null);

/** Resolves to the converter, or null when it could not be loaded. */
let pending = null;

// Memoised conversions: the site re-renders the same labels constantly, and the
// changelog list is long. A bounded cache keeps that free; clearing on overflow
// costs one re-conversion per string.
const cache = new Map();
const CACHE_LIMIT = 4000;

/** True once conversion is available (the locale never needs it otherwise). */
export function isConversionReady() {
  return converter.value !== null;
}

/**
 * Convert a Simplified Chinese string to Traditional Chinese.
 *
 * Returns the input untouched when the converter is not loaded yet, when the
 * value is not a string, or when the value has nothing to convert (ASCII, digits
 * and already-Traditional text all pass through unchanged).
 *
 * @param {string} text
 * @returns {string}
 */
export function convertText(text) {
  const convert = converter.value;
  if (!convert || typeof text !== "string" || !text) return text;
  // Same strings are converted over and over (labels on every re-render, the
  // changelog list on every open), so memoise the results.
  const cached = cache.get(text);
  if (cached !== undefined) return cached;
  try {
    const converted = convert(text);
    if (cache.size > CACHE_LIMIT) cache.clear();
    cache.set(text, converted);
    return converted;
  } catch (_error) {
    // A dictionary hiccup must never take the page down.
    return text;
  }
}

/**
 * Load the converter (idempotent — the import is cached by the browser).
 *
 * @returns {Promise<boolean>} whether conversion is available afterwards
 */
export function loadConverter() {
  if (!pending) {
    pending = import("opencc-js/cn2t")
      .then(({ Converter }) => {
        // `cn → twp` (OpenCC s2twp): character conversion + Taiwan variants +
        // Taiwanese common phrases (e.g. 软件 → 軟體, 网络 → 網路, 数据 → 資料).
        // See https://github.com/nk2028/opencc-js/blob/main/README-zh-CN.md
        converter.value = Converter({ from: "cn", to: "twp" });
        return true;
      })
      .catch((error) => {
        console.warn("[i18n] Traditional Chinese conversion is unavailable:", error);
        return false;
      });
  }
  return pending;
}

/**
 * Start loading the converter when the locale needs it.
 *
 * Boot awaits this so the first paint is usually already Traditional (no flash of
 * Simplified navigation), but the wait is capped: the dictionary is ~1 MB raw, and
 * a slow connection must not hold up the page. When the race is lost the load
 * keeps running in the background — the converter is reactive, so the labels turn
 * Traditional the moment it arrives.
 *
 * @param {boolean} needed
 * @param {number} [timeout] - milliseconds to wait before painting anyway
 * @returns {Promise<boolean>} whether conversion was ready in time
 */
export function prepareConversion(needed, timeout = 1200) {
  if (!needed) return Promise.resolve(false);
  const loading = loadConverter();
  if (!(timeout > 0)) return loading;
  return Promise.race([
    loading,
    new Promise((resolve) => {
      setTimeout(() => resolve(isConversionReady()), timeout);
    }),
  ]);
}
