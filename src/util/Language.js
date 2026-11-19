import { ref, watch } from "vue";
import { getLocale, legacyLangOf, setLocale } from "../i18n/index.js";

// Global settings outlive the browser session, like the theme and the design
// choice (see Theme.js / Design.js): a cookie written without `expires` is
// dropped when the browser closes, so these choices live in localStorage and
// keep applying after later site releases change the built-in defaults.
function readSetting(key) {
  try {
    return localStorage.getItem(key);
  } catch (_e) {
    // Private mode / disabled storage: behave as if nothing was saved.
    return null;
  }
}

function writeSetting(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch (_e) {
    // Ignore: the choice still applies for this page view.
  }
}

export function getLanguage() {
  const saved = readSetting("language");
  if (saved == "zh") {
    return "zh";
  }
  if (saved == "en") {
    return "en";
  }
  for (const lan of navigator.languages) {
    if (lan.indexOf("zh") >= 0) {
      return "zh";
    } else if (lan.indexOf("en") >= 0) {
      return "en";
    }
  }
  return "en";
}

// The legacy design only knows `zh` / `en`. When its language switch is used we
// also move the shared locale, unless the current locale already hands over to
// the same legacy language — a Traditional Chinese visitor who switches inside
// the legacy UI keeps their Traditional choice for the next visit to the new one.
function syncLocaleForLegacyLanguage(language) {
  if (legacyLangOf(getLocale()) === language) return;
  setLocale(language === "zh" ? "zh-Hans" : "en", { updateUrl: false });
}

export function setLanguageZh() {
  writeSetting("language", "zh");
  syncLocaleForLegacyLanguage("zh");
  // 派发语言切换事件
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('language-changed'));
    window.dispatchEvent(new CustomEvent('custom-language-changed', { detail: { language: 'zh' } }));
  }
  return "zh";
}

export function setLanguageEn() {
  writeSetting("language", "en");
  syncLocaleForLegacyLanguage("en");
  // 派发语言切换事件
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('language-changed'));
    window.dispatchEvent(new CustomEvent('custom-language-changed', { detail: { language: 'en' } }));
  }
  return "en";
}

/**
 * 当前界面语言（新版多语言代码）。旧版页面请继续使用 `getLanguage()`，
 * 它只返回 `zh` / `en`。
 */
export function getLocaleCode() {
  return getLocale();
}

export function getDisplayMode() {
  const saved = readSetting("displayMode");
  if (saved == "line") {
    return "line";
  }
  if (saved == "card") {
    return "card";
  }
  return "line";
}

export function setDisplayModeLine() {
  writeSetting("displayMode", "line");
  return "line";
}

export function setDisplayModeCard() {
  writeSetting("displayMode", "card");
  return "card";
}

// 资源站直链开关（全局共享状态，localStorage 持久化）
const useDirectLink = ref(readSetting("useDirectLink") === "true");

watch(useDirectLink, (value) => {
  writeSetting("useDirectLink", value);
});

export function getUseDirectLink() {
  return useDirectLink;
}

// 全局默认排序（全局共享状态，localStorage 持久化），缺省值为日期倒序
const DEFAULT_SORT_VALUES = ["name_asc", "name_desc", "author_asc", "author_desc", "date_asc", "date_desc"];
const savedDefaultSort = readSetting("defaultSort");
const defaultSort = ref(DEFAULT_SORT_VALUES.includes(savedDefaultSort) ? savedDefaultSort : "date_desc");

watch(defaultSort, (value) => {
  writeSetting("defaultSort", value);
});

export function getDefaultSort() {
  return defaultSort;
}

export function setDefaultSort(value) {
  defaultSort.value = value;
}

// 作品目录每页显示的记录数（0 表示全部显示），新版设计的目录页共用，缺省 50 条
const PAGE_SIZE_VALUES = [25, 50, 100, 200, 0];
const savedPageSize = readSetting("pageSize");
const pageSize = ref(
  savedPageSize != null && PAGE_SIZE_VALUES.includes(Number(savedPageSize))
    ? Number(savedPageSize)
    : 50
);

watch(pageSize, (value) => {
  writeSetting("pageSize", value);
});

export function getPageSize() {
  return pageSize;
}

export function setPageSize(value) {
  const size = Number(value);
  pageSize.value = PAGE_SIZE_VALUES.includes(size) ? size : 50;
}
