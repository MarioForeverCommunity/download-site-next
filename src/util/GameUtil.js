import { sourceName, downloadName, videoName } from "../config.js"
import { normalizedIncludes } from "./SearchUtil.js"
import { SmwpVersions } from "./SmwpVersions.js"

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

function getYsepanNoCodeFlag(item, link) {
  if (!item || !item.currentVer || !link) {
    return false;
  }
  const current = item.currentVer;
  if (link === current.download_url && current.download_url_ysepan_no_code) {
    return true;
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
  const ysepanNoCode = item ? getYsepanNoCodeFlag(item, link) : false;
  const code = item ? getDownloadCodeForLink(item, link) : null;
  const ysepanPattern = /(ysepan|ys168|ysupan)\.com/;
  for (const entry of downloadName) {
    if (link.match(entry.domain)) {
      let desc = lan == "zh" && entry.desc_zh ? entry.desc_zh : entry.desc_en;
      if (entry.show_code == true && code) {
        const isYsepan = ysepanPattern.test(link);
        desc += ` (${lan == "zh" ? (isYsepan ? "密码: " : "提取码: ") : "Code: "}${code})`;
      }
      if (ysepanNoCode) {
        desc += ` (${lan == "zh" ? "暂无法访问" : "Temporarily Unavailable"})`;
      } else if (invalid) {
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
  // 英文版 + chinese 作品：交换顺序（先 alt 后 main）
  // 英文版 + international 作品：不交换顺序（先 main 后 alt）
  // 中文版：不交换顺序（先 main 后 alt）
  const shouldSwap = lan == "en" && item.type == "chinese";
  if (shouldSwap) {
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

export function getResourceCdnURL(item) {
  return item.currentVer.file_url_cdn
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
  // Mario Worker 作品：区分合作作品和 MW 4.4
  if (item.category === 'mw') {
    const folder = author || item.author;
    if (!folder) return null;
    // MW 4.4 作品使用单独的目录
    if (item.smwp_ver === 'MW 4.4') {
      return `https://file.marioforever.net/Mario Worker/Mario Worker 4.4 作品/${encodeURIComponent(folder)}/`;
    }
    if (folder === '合作作品' || Array.isArray(folder)) {
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

// MF 游戏资源站基础路径
const MF_FILE_BASE_PATHS_ZH = {
  android: "https://file.marioforever.net/Mario Forever/安卓游戏/",
  repackaged: "https://file.marioforever.net/Mario Forever/重打包作品/",
  chinese: "https://file.marioforever.net/Mario Forever/国内作品/",
  international: "https://file.marioforever.net/Mario Forever/国外作品/"
}

const MF_FILE_BASE_PATHS_EN = {
  android: "https://file.marioforever.net/mario-forever/games/mobile-fangames/",
  repackaged: "https://file.marioforever.net/mario-forever/games/repackaged-fangames/",
  chinese: "https://file.marioforever.net/mario-forever/games/chinese-fangames/",
  international: "https://file.marioforever.net/mario-forever/games/international-fangames/"
}

// 对象存储（CDN）基础路径，遵循英文资源站路径规则
const MF_FILE_BASE_PATHS_CDN = {
  android: "https://mf-cdn.kevinh.wang/mario-forever/games/mobile-fangames/",
  repackaged: "https://mf-cdn.kevinh.wang/mario-forever/games/repackaged-fangames/",
  chinese: "https://mf-cdn.kevinh.wang/mario-forever/games/chinese-fangames/",
  international: "https://mf-cdn.kevinh.wang/mario-forever/games/international-fangames/"
}

/**
 * 构建 MF 游戏下载链接
 * @param {string} fileName - 文件名
 * @param {object} ver - 版本对象
 * @param {object} entry - 游戏条目
 * @param {string} lan - 语言/来源 ("zh"/"en"/"cdn")，cdn 遵循英文路径规则
 * @param {boolean} [isDataFile=false] - 是否为数据文件
 * @returns {string|null} 下载 URL
 */
export function getMfFileUrl(fileName, ver, entry, lan, isDataFile = false) {
  if (!fileName) return null
  // 数据文件需同时检查自身与主文件是否为 APK
  const isApk = isDataFile
    ? (fileName.toLowerCase().endsWith(".apk") || (ver.file_name && ver.file_name.toLowerCase().endsWith(".apk")))
    : fileName.toLowerCase().endsWith(".apk")

  const paths = lan === "zh" ? MF_FILE_BASE_PATHS_ZH
    : lan === "cdn" ? MF_FILE_BASE_PATHS_CDN
      : MF_FILE_BASE_PATHS_EN

  if (isApk) {
    return `${paths.android}${entry.first_author}/${fileName}`
  }
  if (ver.repacker) {
    return `${paths.repackaged}${fileName}`
  }
  if (entry.type === "chinese") {
    const year = ver.date instanceof Date ? ver.date.toISOString().split("-")[0] : ""
    return `${paths.chinese}${year}/${fileName}`
  }
  if (entry.type === "international") {
    return `${paths.international}${entry.first_author}/${fileName}`
  }
  return null
}

// MW 关卡资源站基础路径
const MW_LEVEL_BASE_PATH = "https://file.marioforever.net/Mario Worker/"
// 对象存储（CDN）基础路径，将 Mario Worker/ 替换为 mw-levels/
const MW_LEVEL_CDN_BASE_PATH = "https://mf-cdn.kevinh.wang/mw-levels/"
const SMWP_BASE_PATH = "https://file.marioforever.net/smwp/"
const SMWP_MW44_URL = "https://file.marioforever.net/Mario%20Worker/%E5%8E%9F%E7%89%88%20Mario%20Worker%20%E4%B8%8B%E8%BD%BD"
const SMWP_MW44_CDN_URL = "https://mf-cdn.kevinh.wang/mario-worker/original-mw/Mario%20Worker%204.4%20(2011).zip"

/**
 * 构建 MW 关卡下载链接
 * @param {object} entry - 关卡条目
 * @param {string} fname - 文件名
 * @param {boolean} [useCdn=false] - 是否使用对象存储（CDN）
 * @returns {string} 下载 URL
 */
export function getMwLevelFileUrl(entry, fname, useCdn = false) {
  const author = Array.isArray(entry.author) ? "合作作品" : entry.author
  const basePath = useCdn ? MW_LEVEL_CDN_BASE_PATH : MW_LEVEL_BASE_PATH
  if (entry.smwp_ver === "MW 4.4") {
    return `${basePath}Mario Worker 4.4 作品/${author}/${fname}`
  }
  const folder = author === "合作作品" ? "合作作品" : `吧友作品/${author}`
  return `${basePath}${folder}/${fname}`
}

/**
 * 判断文件名是否兼容 CDN（有扩展名且不以斜杠结尾）
 * @param {string} fileName - 文件名
 * @returns {boolean}
 */
export function isCdnCompatible(fileName) {
  if (!fileName || fileName.endsWith('/')) return false;
  const lastSegment = fileName.split('/').pop();
  return lastSegment.includes('.');
}

/**
 * 构建 SMWP 下载链接
 * @param {object} entry - 关卡条目
 * @returns {string|null} SMWP 下载 URL
 */
export function getSmwpUrl(entry, useCdn = false) {
  if (SmwpVersions[entry.smwp_ver]) {
    const url = `${SMWP_BASE_PATH}${SmwpVersions[entry.smwp_ver]}`;
    return useCdn ? url.replace("file.marioforever.net", "mf-cdn.kevinh.wang") : url;
  }
  if (entry.smwp_ver === "MW 4.4") {
    return useCdn ? SMWP_MW44_CDN_URL : SMWP_MW44_URL;
  }
  return null;
}

/**
 * 构建 SMWP 音乐包（数据包）下载链接
 * v1.5.0+: Data.7z；v1.4.0~1.4.5: Data.zip；更低版本和 MW 4.4 无数据包
 * @param {object} entry - 关卡条目
 * @param {boolean} [useCdn=false] - 是否使用对象存储（CDN）
 * @returns {string|null} 数据包下载 URL
 */
export function getSmwpDataUrl(entry, useCdn = false) {
  if (!entry.smwp_ver || entry.smwp_ver === "MW 4.4") return null;
  if (!SmwpVersions[entry.smwp_ver]) return null;

  const parts = entry.smwp_ver.replace(/^v/, "").split(".").map(Number);
  const major = parts[0] || 0;
  const minor = parts[1] || 0;

  let dataFile;
  if (major > 1 || (major === 1 && minor >= 5)) {
    dataFile = "Data.7z";
  } else if (major === 1 && minor === 4) {
    dataFile = "Data.zip";
  } else {
    return null;
  }

  const url = `${SMWP_BASE_PATH}${dataFile}`;
  return useCdn ? url.replace("file.marioforever.net", "mf-cdn.kevinh.wang") : url;
}

export function getDataResourceURL(item, lan) {
  if (lan == "en") {
    return item.currentVer.data_file_url_en
  }
  return item.currentVer.data_file_url_zh
}

export function getDataResourceCdnURL(item) {
  return item.currentVer.data_file_url_cdn
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
    if (normalizedIncludes(alias, target)) {
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

export function getCodeLabel(link, lan) {
  const ysepanPattern = /(ysepan|ys168|ysupan)\.com/;
  const isYsepan = link && ysepanPattern.test(link);
  return lan == "zh" ? (isYsepan ? "密码" : "提取码") : "Code";
}
