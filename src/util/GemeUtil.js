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

function getDownloadInvalidFlag(item, link) {
    if (!item || !item.currentVer || !link) {
        return false;
    }
    const current = item.currentVer;
    if (link === current.download_url_alt) {
        if (current.download_url_invalid_alt !== undefined) {
            return current.download_url_invalid_alt;
        }
        if (current.download_url_alt_invalid !== undefined) {
            return current.download_url_alt_invalid;
        }
        return false;
    }
    if (link === current.download_url) {
        if (current.download_url_invalid !== undefined) {
            return current.download_url_invalid;
        }
        return false;
    }
    return false;
}

function getDownloadCodeForLink(item, link) {
    if (!item || !item.currentVer || !link) {
        return null;
    }
    const current = item.currentVer;
    if (link === current.download_url_alt) {
        return current.code_alt || null;
    }
    if (link === current.download_url) {
        return current.code || null;
    }
    return null;
}

function getDownloadInfo(item, link, lan) {
    if (!link) {
        return null;
    }
    const invalid = getDownloadInvalidFlag(item, link);
    const code = getDownloadCodeForLink(item, link);
    for (var entry of downloadName) {
        if (link.match(entry.domain)) {
            var desc = lan == "zh" && entry.desc_zh ? entry.desc_zh : entry.desc_en;
            if (entry.show_code == true && code) {
                desc += ` (${lan == "zh" ? "提取码：" : "Code: "}${code})`;
            }
            if (invalid) {
                desc += ` (${lan == "zh" ? "已失效" : "Invalid"})`;
            }
            var result = {
                url: link,
                desc: desc,
                code: null
            };
            if (entry.show_code == true && code) {
                result.code = code;
            }
            return result;
        }
    }
    var match = link.match(/http[s]?:\/\/([-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6})\b[-a-zA-Z0-9@:%_+.~#?&//=]*/);
    if (match) {
        return {
            url: link,
            desc: match[1],
            code: null
        };
    }
    return {
        url: link,
        desc: link,
        code: null
    };
}

export function getDownloadEntries(item, lan) {
    if (!item || !item.currentVer) {
        return [];
    }
    var links = [];
    if (lan == "en") {
        if (item.currentVer.download_url_alt) {
            links.push(item.currentVer.download_url_alt);
        }
        if (item.currentVer.download_url) {
            links.push(item.currentVer.download_url);
        }
    } else {
        if (item.currentVer.download_url) {
            links.push(item.currentVer.download_url);
        }
        if (item.currentVer.download_url_alt) {
            links.push(item.currentVer.download_url_alt);
        }
    }
    var result = [];
    for (var i = 0; i < links.length; i++) {
        var info = getDownloadInfo(item, links[i], lan);
        if (info) {
            result.push(info);
        }
    }
    return result;
}

export function getDownloadLink(item, lan) {
    var entries = getDownloadEntries(item, lan);
    if (entries.length == 0) {
        return null;
    }
    if (lan == "en" && item.currentVer && item.currentVer.download_url_alt) {
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].url == item.currentVer.download_url_alt) {
                return entries[i].url;
            }
        }
    }
    return entries[0].url;
}

export function getDownloadLinkValidity(item, lan) {
    const link = getDownloadLink(item, lan);
    if (!link) {
        return false;
    }
    return !getDownloadInvalidFlag(item, link);
}

export function getDownloadDesc(item, lan) {
    const link = getDownloadLink(item, lan);
    if (!link) {
        return null;
    }
    const info = getDownloadInfo(item, link, lan);
    if (!info) {
        return null;
    }
    return info.desc;
}

export function getDownloadCode(item, lan) {
    var entries = getDownloadEntries(item, lan);
    for (var i = 0; i < entries.length; i++) {
        if (entries[i].code) {
            return entries[i].code;
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
    // Mario Worker 作品：区分“合作作品”
    if (item.category === 'mw') {
        const folder = author || item.author;
        if (!folder) return null;
        if (folder === '合作作品') {
            return 'https://file.marioforever.net/Mario Worker/合作作品/';
        }
        return `https://file.marioforever.net/Mario Worker/吧友作品/${encodeURIComponent(folder)}/`;
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
