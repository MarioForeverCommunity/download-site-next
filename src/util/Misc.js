export function listToText(list) {
    if (typeof list === "string") {
        return list;
    }
    return list.join("<br />");
}

export function parseVer(ver) {
    return ver[Object.keys(ver)[0]];
}