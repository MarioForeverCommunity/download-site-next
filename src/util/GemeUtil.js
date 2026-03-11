import { sourceName, downloadName, videoName } from "../config.js"

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
  for (const entry of sourceName) {
    if (link.match(entry.domain)) {
      return lan == "zh" && entry.desc_zh ? entry.desc_zh : entry.desc_en;
    }
  }
  return link.match(/http[s]?:\/\/([-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6})\b[-a-zA-Z0-9@:%_+.~#?&//=]*/)[1];
}

export function getName(item, lan) {
  if (lan == "en" && item.game_alt != null) {
    return item.game_alt;
  }
  return item.game || item.name;
}

export function getAuthor(item, lan) {
  const ret = lan == "en" && item.author_alt != null ? item.author_alt : item.author;
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

export function getDownloadInfo(item, link, lan) {
  if (!link) {
    return null;
  }
  const invalid = item ? getDownloadInvalidFlag(item, link) : false;
  const code = item ? getDownloadCodeForLink(item, link) : null;
  for (const entry of downloadName) {
    if (link.match(entry.domain)) {
      let desc = lan == "zh" && entry.desc_zh ? entry.desc_zh : entry.desc_en;
      if (entry.show_code == true && code) {
        desc += ` (${lan == "zh" ? "提取码: " : "Code: "}${code})`;
      }
      if (invalid) {
        desc += ` (${lan == "zh" ? "已失效" : "Invalid"})`;
      }
      const result = {
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
  const match = link.match(/http[s]?:\/\/([-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6})\b[-a-zA-Z0-9@:%_+.~#?&//=]*/);
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
  const links = [];
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
  const result = [];
  for (let i = 0; i < links.length; i++) {
    const info = getDownloadInfo(item, links[i], lan);
    if (info) {
      result.push(info);
    }
  }
  return result;
}

export function getDownloadLink(item, lan) {
  const entries = getDownloadEntries(item, lan);
  if (entries.length == 0) {
    return null;
  }
  if (lan == "en" && item.currentVer && item.currentVer.download_url_alt) {
    for (let i = 0; i < entries.length; i++) {
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
  const entries = getDownloadEntries(item, lan);
  for (let i = 0; i < entries.length; i++) {
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
  for (const entry of videoName) {
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

export function hasDownloadableContent(item) {
  if (!item || !item.currentVer) {
    return false;
  }
  const hasDownloadUrl = item.currentVer.download_url || item.currentVer.download_url_alt;
  const hasFileName = item.currentVer.file_name;
  const hasFileUrl = item.currentVer.file_url_zh || item.currentVer.file_url_en || item.currentVer.file_url;
  const hasFileUrls = item.file_urls && item.file_urls.length > 0;
  const hasDataDownloadUrl = item.currentVer.data_download_url || item.currentVer.data_download_url_alt;
  const hasDataFileName = item.currentVer.data_file_name;
  const hasDataFileUrl = item.currentVer.data_file_url_zh || item.currentVer.data_file_url_en;
  return hasDownloadUrl || hasFileName || hasFileUrl || hasFileUrls || hasDataDownloadUrl || hasDataFileName || hasDataFileUrl;
}

export function filterList(target, aliasList) {
  if (aliasList == null) {
    return false;
  }
  for (const alias of aliasList) {
    if (alias.toUpperCase().match(target.toUpperCase())) {
      return true;
    }
  }
  return false;
}

export function processFileNamesWithVolumes(fileNames) {
  if (!fileNames || !Array.isArray(fileNames)) {
    return fileNames ? [processSingleFileName(fileNames)] : [];
  }

  const processed = fileNames.map((fn, idx) => {
    if (fn == null) return null;
    return {
      original: fn,
      index: idx
    };
  }).filter(item => item !== null);

  const displayNames = processed.map(item => {
    let displayName = item.original.split('/').pop();
    displayName = removeExtensions(displayName);
    try {
      displayName = decodeURIComponent(displayName);
    } catch (error) {
      console.error('Failed to decode URI component:', displayName, error);
    }
    return { ...item, displayName };
  });

  const nameGroups = new Map();
  displayNames.forEach((item, i) => {
    const baseName = getBaseNameWithoutVolume(item.displayName);
    if (!nameGroups.has(baseName)) {
      nameGroups.set(baseName, []);
    }
    nameGroups.get(baseName).push({ ...item, originalIndex: i });
  });

  const result = new Array(displayNames.length);

  nameGroups.forEach((group, baseName) => {
    if (group.length > 1) {
      const volumePattern = /\.(7z|rar|zip)\.(\d+)$/i;
      group.forEach(item => {
        const match = item.original.match(volumePattern);
        if (match) {
          const volumeNum = parseInt(match[2], 10);
          result[item.originalIndex] = `${baseName} (分卷 ${volumeNum})`;
        } else {
          result[item.originalIndex] = item.displayName;
        }
      });
    } else {
      result[group[0].originalIndex] = group[0].displayName;
    }
  });

  return result;
}

function processSingleFileName(fileName) {
  let displayName = fileName.split('/').pop();
  displayName = removeExtensions(displayName);
  try {
    displayName = decodeURIComponent(displayName);
  } catch (error) {
    console.error('Failed to decode URI component:', displayName, error);
  }
  return displayName;
}

function removeExtensions(fileName) {
  const volumePattern = /\.(7z|rar|zip)\.\d+$/i;
  if (volumePattern.test(fileName)) {
    return fileName.replace(volumePattern, '');
  }
  return fileName.replace(/\.[^.]*$/, '');
}

function getBaseNameWithoutVolume(displayName) {
  const volumePattern = /\s*\(分卷 \d+\)$/;
  return displayName.replace(volumePattern, '');
}
