import Cookies from "js-cookie";

export function getLanguage() {
    if (Cookies.get("language") == "zh") {
        return "zh";
    }
    if (Cookies.get("language") == "en") {
        return "en";
    }
    for (var lan of navigator.languages) {
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