import { ref, watch } from "vue";
import Cookies from "js-cookie";

export function getLanguage() {
  if (Cookies.get("language") == "zh") {
    return "zh";
  }
  if (Cookies.get("language") == "en") {
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
  Cookies.set("language", "zh");
  // 派发语言切换事件
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('language-changed'));
    window.dispatchEvent(new CustomEvent('custom-language-changed', { detail: { language: 'zh' } }));
  }
  return "zh";
}

export function setLanguageEn() {
  Cookies.set("language", "en");
  // 派发语言切换事件
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('language-changed'));
    window.dispatchEvent(new CustomEvent('custom-language-changed', { detail: { language: 'en' } }));
  }
  return "en";
}

export function getDisplayMode() {
  if (Cookies.get("displayMode") == "line") {
    return "line";
  }
  if (Cookies.get("displayMode") == "card") {
    return "card";
  }
  return "line";
}

export function setDisplayModeLine() {
  Cookies.set("displayMode", "line");
  return "line";
}

export function setDisplayModeCard() {
  Cookies.set("displayMode", "card");
  return "card";
}

// 资源站直链开关（全局共享状态，cookie 持久化）
const useDirectLink = ref(Cookies.get("useDirectLink") === "true");

watch(useDirectLink, (value) => {
  Cookies.set("useDirectLink", String(value));
});

export function getUseDirectLink() {
  return useDirectLink;
}

// 全局默认排序（全局共享状态，cookie 持久化），缺省值为日期倒序
const DEFAULT_SORT_VALUES = ["name_asc", "name_desc", "author_asc", "author_desc", "date_asc", "date_desc"];
const defaultSort = ref(DEFAULT_SORT_VALUES.includes(Cookies.get("defaultSort")) ? Cookies.get("defaultSort") : "date_desc");

watch(defaultSort, (value) => {
  Cookies.set("defaultSort", value);
});

export function getDefaultSort() {
  return defaultSort;
}

export function setDefaultSort(value) {
  defaultSort.value = value;
}
