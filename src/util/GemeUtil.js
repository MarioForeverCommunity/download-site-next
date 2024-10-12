import {sourceName, downloadName} from "../config.js"

export function getSourceLink(item, lan) {
    if (lan == "en" && item.currentVer.source_url_alt) {
        return item.currentVer.source_url_alt;
    }
    return item.currentVer.source_url;
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
    return null;
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

export function getDownloadLink(item, lan) {
    if (lan == "en" && item.currentVer.download_url_alt) {
        return item.currentVer.download_url;
    }
    return item.currentVer.download_url;
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
            return desc;
        }
    }
    return "下载链接";
}