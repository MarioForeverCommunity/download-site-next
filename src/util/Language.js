import { ref, watch } from "vue";

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

export function setLanguageZh() {
  writeSetting("language", "zh");
  // 派发语言切换事件
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('language-changed'));
    window.dispatchEvent(new CustomEvent('custom-language-changed', { detail: { language: 'zh' } }));
  }
  return "zh";
}

export function setLanguageEn() {
  writeSetting("language", "en");
  // 派发语言切换事件
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('language-changed'));
    window.dispatchEvent(new CustomEvent('custom-language-changed', { detail: { language: 'en' } }));
  }
  return "en";
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
