import Cookies from "js-cookie";

var regLan = null;

export function lanRegister(obj) {
    regLan = obj;
}

export function getLanguage() {
    if (Cookies.get("language") == "zh") {
        return "zh";
    }
    if (Cookies.get("language") == "en") {
        return "en";
    }
    for (var lan of navigator.languages) {
        if (lan.indexOf("zh") > 0) {
            return "zh";
        } else if (lan.indexOf("en") > 0) {
            return "en";
        }
    }
    return "en";
}

export function setLanguageZh() {
    Cookies.set("language", "zh");
    regLan.value = "zh";
    return "zh";
}

export function setLanguageEn() {
    Cookies.set("language", "en");
    regLan.value = "en";
    return "en";
}