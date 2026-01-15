import {sourceName, downloadName, videoName} from "../config.js"

export function getSourceLink(item, lan) {
    if (lan == "en" && item.currentVer.source_url_alt) {
        return item.currentVer.source_url_alt;
    }
    return item.currentVer.source_url;
}

export function getSourceLinkValidity(item, lan) {
    if (lan == "en" && item.currentVer.source_url_alt) {
        return !item.currentVer.source_url_invalid_alt;
    }
    return !item.currentVer.source_url_invalid;
}

export function getSourceDesc(item, lan) {
    const link = getSourceLink(item, lan);
    if (!link) {
        return null;
    }
    for (var entry of sourceName) {
        if (link.match(entry.domain)) {
            return lan == "zh" && entry.desc_zh ? entry.desc_zh : entry.desc_en;
        }
    }
    return link.match(/http[s]?:\/\/([-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6})\b[-a-zA-Z0-9@:%_+.~#?&//=]*/)[1];
}

export function getName(item, lan) {
    return lan == "en" && item.game_alt != null ? item.game_alt : item.game;
}

export function getAuthor(item, lan) {
    var ret = lan == "en" && item.author_alt != null ? item.author_alt : item.author;
    if (typeof ret == "object") {
        return ret.join("\n");
    }
    return ret;
}

export function getAuthorList(item, lan) {
    return lan == "en" && item.author_alt != null ? item.author_alt : item.author;
}

export function getStrFromList(src) {
    if (src == null) {
        return null;
    }
    if (typeof src == "object") {
        return src.join("\n");
    }
    return src;
}

export function getDownloadLink(item, lan) {
    if (lan == "en" && item.currentVer.download_url_alt) {
        return item.currentVer.download_url_alt;
    }
    return item.currentVer.download_url;
}

export function getDownloadLinkValidity(item, lan) {
    if (lan == "en" && item.currentVer.download_url_alt) {
        return !item.currentVer.download_url_invalid_alt;
    }
    return !item.currentVer.download_url_invalid;
}

export function getDownloadDesc(item, lan) {
    const link = getDownloadLink(item, lan);

    if (!link) {
        return null
    }
    for (var entry of downloadName) {
        if (link.match(entry.domain)) {
            var desc = lan == "zh" && entry.desc_zh ? entry.desc_zh : entry.desc_en;
            if (entry.show_code == true && item.currentVer.code) {
                desc += ` (${lan == "zh" ? "提取码：" : "Code: "}${item.currentVer.code})`
            }
            if (!getDownloadLinkValidity(item, lan)) {
                desc += ` (${lan == "zh" ? "已失效" : "Outdated"})`
            }
            return desc;
        }
    }
    return link.match(/http[s]?:\/\/([-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6})\b[-a-zA-Z0-9@:%_+.~#?&//=]*/)[1];
}

export function getDownloadCode(item, lan) {
    const link = getDownloadLink(item, lan);

    if (!link) {
        return null
    }
    for (var entry of downloadName) {
        if (link.match(entry.domain)) {
            if (entry.show_code == true && item.currentVer.code) {
                return item.currentVer.code;
            }
            return null;
        }
    }
    return null;
}

export function getVideoDesc(link, lan) {
    if (!link) {
        return null;
    }
    for (var entry of videoName) {
        if (link.match(entry.domain)) {
            return lan == "zh" && entry.desc_zh ? entry.desc_zh : entry.desc_en;
        }
    }
    return link.match(/http[s]?:\/\/([-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6})\b[-a-zA-Z0-9@:%_+.~#?&//=]*/)[1];
}

export function getVersion(item, lan) {
    if (item.category == "mf") {
        return lan == "en" && item.currentVerStrAlt ? item.currentVerStrAlt : item.currentVerStr
    }
    if (item.category == "mw") {
        return item.smwp_ver;
    }
    return null;
}

export function getResourceURL(item, lan) {
    if (lan == "en") {
        return item.currentVer.file_url_en
    }
    return item.currentVer.file_url_zh
}

export function getAuthorFolderURL(item, author, lan) {
    // Android 游戏：统一指向 mobile-fangames，不分国内外
    if (item.currentVer && item.currentVer.file_name &&
        item.currentVer.file_name.toLowerCase().endsWith('.apk')) {
        const folder = item.author_alias || author || item.first_author;
        if (!folder) {
            return null;
        }
        if (lan == "en") {
            return `https://file.marioforever.net/mobile-fangames/${encodeURIComponent(folder)}/`;
        }
        return `https://file.marioforever.net/Mario Forever/安卓游戏/${encodeURIComponent(folder)}/`;
    }
    // 非 Android 保持原有逻辑
    if (item.type !== "international") {
        return null;
    }
    const folder = item.author_alias || author || item.first_author;
    if (!folder) {
        return null;
    }
    if (lan == "en") {
        return `https://file.marioforever.net/mario-forever/games/international-fangames/${encodeURIComponent(folder)}/`;
    }
    return `https://file.marioforever.net/Mario Forever/国外作品/${encodeURIComponent(folder)}/`;
}

export function getDataResourceURL(item, lan) {
    if (lan == "en") {
        return item.currentVer.data_file_url_en
    }
    return item.currentVer.data_file_url_zh
}

export function filterList(target, aliasList) {
    if (aliasList == null) {
        return false;
    }
    for (var alias of aliasList) {
        if (alias.toUpperCase().match(target.toUpperCase())) {
            return true;
        }
    }
    return false;
}
