// generate-api.js
//
// 为 download.marioforever.net 生成静态 JSON API。
// 读取 public/data 下的 YAML 数据、image-index.json 与各作品 data 文件夹，
// 预聚合成可直接 fetch 的静态 JSON（参数 / 资源站链接 / 图片 / description）。
// 输出到 public/api/。URL 构建逻辑与 src/util 下的 GameUtil.js / SoftendoUtil.js / AssetUtil.js 保持一致。
//
// 运行：node scripts/generate-api.js

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { load, YAML11_SCHEMA } from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, '..', 'public', 'data');
const apiDir = join(__dirname, '..', 'public', 'api');

const IMAGE_EXTS = ['.webp', '.png', '.jpg', '.jpeg', '.gif', '.avif', '.svg'];

// ---------------------------------------------------------------------------
// 基础工具
// ---------------------------------------------------------------------------

function loadYaml(filename) {
  const filePath = join(dataDir, filename);
  if (!existsSync(filePath)) return [];
  // 使用 YAML11_SCHEMA 以正确解析 !!timestamp 日期为 Date
  return load(readFileSync(filePath, 'utf8'), { schema: YAML11_SCHEMA }) || [];
}

function loadJson(filename) {
  const filePath = join(dataDir, filename);
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function toArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function normDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
}

function isoYear(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.getUTCFullYear().toString();
}

function getAuthorKey(entry) {
  const authors = entry.author;
  if (!authors) return '';
  return [...toArray(authors)].sort().join(',');
}

function sanitizeName(name) {
  if (!name) return '';
  let sanitized = name.replace(/[:/\\]/g, '');
  sanitized = sanitized.replace(/\.+$/g, '');
  return sanitized;
}

function naturalSort(a, b) {
  const regex = /(\d+)|(\D+)/g;
  const aParts = a.match(regex) || [];
  const bParts = b.match(regex) || [];
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || '';
    const bPart = bParts[i] || '';
    const aNum = parseInt(aPart, 10);
    const bNum = parseInt(bPart, 10);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
      if (aNum !== bNum) return aNum - bNum;
    } else {
      const cmp = aPart.localeCompare(bPart);
      if (cmp !== 0) return cmp;
    }
  }
  return 0;
}

// ---------------------------------------------------------------------------
// 图片解析（基于 image-index.json）
// ---------------------------------------------------------------------------

const REGEX = {
  titleVersion: /^title_(.+)\.[^.]+$/i,
  titleImage: /^title_.+\.[^.]+$/i,
  titleSimple: /^title\.[a-z]+$/i,
  logoImage: /^logo\.[a-z]+$/i,
  showcase: /^showcase_.+\.[^.]+$/i
};

function findGameInfo(imageIndex, category, entry) {
  const gameName = entry.game || entry.name;
  if (!gameName) return null;
  const mapping = imageIndex?.[category];
  if (!mapping) return null;
  const infoOrArray = mapping[gameName];
  if (!infoOrArray) return null;
  if (category === 'softendo' && !Array.isArray(infoOrArray)) return infoOrArray;
  if (Array.isArray(infoOrArray)) {
    const authorKey = getAuthorKey(entry);
    return infoOrArray.find(info => info.authorKey === authorKey) || null;
  }
  return infoOrArray;
}

function imagePath(category, dirName, img) {
  return dirName ? `/data/${category}/${dirName}/${img}` : `/data/${category}/${img}`;
}

function resolveImages(imageIndex, category, entry) {
  const info = findGameInfo(imageIndex, category, entry);
  const images = info?.images || [];
  const dirName = info?.dirName || '';
  const full = images.map(img => imagePath(category, dirName, img));

  const titleImg = images.find(img => REGEX.titleSimple.test(img.toLowerCase())) || null;
  const logoImg = images.find(img => REGEX.logoImage.test(img.toLowerCase())) || null;
  const showcaseImages = images.filter(img => REGEX.showcase.test(img)).sort(naturalSort);

  return {
    dir: dirName,
    all: full,
    title: titleImg ? imagePath(category, dirName, titleImg) : null,
    logo: logoImg ? imagePath(category, dirName, logoImg) : null,
    showcase: showcaseImages.map(img => imagePath(category, dirName, img))
  };
}

// ---------------------------------------------------------------------------
// description 读取（复用 DescriptionUtil 的定位逻辑：description.md / _zh / _en）
// ---------------------------------------------------------------------------

function readDescriptionFiles(category, dirName) {
  if (!dirName) return { default: null, zh: null, en: null, files: [] };
  const baseDir = join(dataDir, category, dirName);
  const names = ['description.md', 'description_zh.md', 'description_en.md'];
  const result = { default: null, zh: null, en: null, files: [] };
  for (const name of names) {
    const filePath = join(baseDir, name);
    if (existsSync(filePath)) {
      result.files.push(`/data/${category}/${dirName}/${name}`);
      const content = readFileSync(filePath, 'utf8');
      if (name === 'description.md') result.default = content;
      else if (name === 'description_zh.md') result.zh = content;
      else if (name === 'description_en.md') result.en = content;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// MF 资源站链接（镜像 src/util/GameUtil.js getMfFileUrl）
// ---------------------------------------------------------------------------

const MF_BASE_ZH = {
  android: 'https://file.marioforever.net/Mario Forever/安卓游戏/',
  repackaged: 'https://file.marioforever.net/Mario Forever/重打包作品/',
  chinese: 'https://file.marioforever.net/Mario Forever/国内作品/',
  international: 'https://file.marioforever.net/Mario Forever/国外作品/'
};
const MF_BASE_EN = {
  android: 'https://file.marioforever.net/mario-forever/games/mobile-fangames/',
  repackaged: 'https://file.marioforever.net/mario-forever/games/repackaged-fangames/',
  chinese: 'https://file.marioforever.net/mario-forever/games/chinese-fangames/',
  international: 'https://file.marioforever.net/mario-forever/games/international-fangames/'
};

function mfFileUrl(fileName, ver, entry, lan, isDataFile = false) {
  if (!fileName) return null;
  const isApk = isDataFile
    ? (fileName.toLowerCase().endsWith('.apk') || (ver.file_name && ver.file_name.toLowerCase().endsWith('.apk')))
    : fileName.toLowerCase().endsWith('.apk');
  const paths = lan === 'zh' ? MF_BASE_ZH : MF_BASE_EN;
  if (isApk) return `${paths.android}${entry.first_author}/${fileName}`;
  if (ver.repacker) return `${paths.repackaged}${fileName}`;
  if (entry.type === 'chinese') {
    const year = isoYear(ver.date);
    return `${paths.chinese}${year}/${fileName}`;
  }
  if (entry.type === 'international') {
    return `${paths.international}${entry.first_author}/${fileName}`;
  }
  return null;
}

function mfResourceLinks(fileName, ver, entry, isDataFile = false) {
  if (ver.file_url) {
    // 显式 file_url 时，直接使用
    return { zh: ver.file_url, en: ver.file_url };
  }
  return {
    zh: mfFileUrl(fileName, ver, entry, 'zh', isDataFile),
    en: mfFileUrl(fileName, ver, entry, 'en', isDataFile)
  };
}

// ---------------------------------------------------------------------------
// MF 作品
// ---------------------------------------------------------------------------

function buildMf() {
  const list = loadYaml('list-mf.yaml');
  const imageIndex = loadJson('image-index.json');

  return list.map(entry => {
    const out = { category: 'mf' };
    out.name = entry.game || '';
    out.nameAlt = entry.game_alt || null;
    out.aliases = toArray(entry.alias);
    out.author = entry.author == null ? [] : toArray(entry.author);
    out.authorAlt = entry.author_alt == null ? null : toArray(entry.author_alt);
    out.type = entry.type || '';
    // 制作软件：游戏级别 software，未指定则默认 mmf（与前端 detectSoftware 一致）
    out.software = entry.software || 'mmf';
    out.tags = toArray(entry.tag);
    out.wiki = { zh: entry.wiki_zh_url || null, en: entry.wiki_en_url || null };
    out.homepage = {
      zh: entry.homepage_zh || null,
      en: entry.homepage_en || null,
      repo: entry.repo || null
    };
    // MF 使用 description_zh / description_en 双语字段
    out.inlineDescription = {
      zh: entry.description_zh || null,
      en: entry.description_en || null
    };

    // first_author：与前端 useMfList 一致（同时写入 entry.first_author 供 URL 构建使用）
    let firstAuthor;
    if (entry.type === 'international' && entry.author_alias) {
      firstAuthor = entry.author_alias;
    } else if (typeof entry.author === 'object') {
      firstAuthor = toArray(entry.author)[0];
    } else {
      firstAuthor = entry.author;
    }
    entry.first_author = firstAuthor;
    out.firstAuthor = firstAuthor ?? null;

    // 归一化版本数组
    let versions;
    if (typeof entry.ver === 'object' && entry.ver !== null && !Array.isArray(entry.ver)) {
      versions = [entry.ver];
    } else if (Array.isArray(entry.ver)) {
      versions = entry.ver;
    } else {
      versions = [{
        [entry.ver || '']: {
          code: entry.code,
          code_alt: entry.code_alt,
          date: entry.date,
          download_url: entry.download_url,
          download_url_alt: entry.download_url_alt,
          file_name: entry.file_name,
          file_url: entry.file_url,
          source_url: entry.source_url,
          source_url_alt: entry.source_url_alt,
          ver_alt: entry.ver_alt,
          data_download_url: entry.data_download_url,
          data_file_name: entry.data_file_name,
          data_file_url: entry.data_file_url,
          repacker: entry.repacker,
          current: entry.current
        }
      }];
    }

    // 解析版本元数据（用于 current 判定与旧版本归档）
    const verMeta = versions.map(verRaw => {
      const verKey = Object.keys(verRaw)[0];
      const ver = verRaw[verKey] || {};
      const rawTime = ver.date ? new Date(ver.date).getTime() : -Infinity;
      return {
        verKey,
        ver,
        dateTime: Number.isNaN(rawTime) ? -Infinity : rawTime,
        // 显式 current 标记：未指定为 null
        current: ver.current === undefined ? null : !!ver.current
      };
    });

    // 解析当前（最新）版本集合：
    // - 有显式 current: true 时，取所有标记为 current 的版本（支持多 current）
    // - 无显式 current: true 时，回退为日期最新的版本（多个并列取第一个）；
    //   但若该最新日期版本已显式 current: false，则不再自动标记（次新版本也不视为 current）
    const currentKeys = new Set();
    if (verMeta.some(m => m.current === true)) {
      for (const m of verMeta) {
        if (m.current === true) currentKeys.add(m.verKey);
      }
    } else if (verMeta.length > 0) {
      let latest = null;
      let maxTime = -Infinity;
      for (const m of verMeta) {
        if (m.dateTime > maxTime) {
          maxTime = m.dateTime;
          latest = m;
        }
      }
      if (latest && latest.current !== false) {
        currentKeys.add(latest.verKey);
      }
    }

    // 国际作品（非安卓）旧版本归档处理：
    // 以解析后的 current === false 为判断标准，标记旧版本为归档（重打包版本与 apk 除外）。
    // 注意：仅记录归档标记，不改动 file_name 字段本身，URL 构建时再前缀 old-versions/
    const archivedKeys = new Map(); // verKey -> { file_name, data_file_name }
    if (entry.type === 'international') {
      for (const m of verMeta) {
        const isCurrent = currentKeys.has(m.verKey);
        const decide = (field) => {
          const f = m.ver[field];
          if (!f || m.ver.repacker) return false;
          if (f.startsWith('old-versions/')) return false;
          if (f.toLowerCase().endsWith('.apk')) return false;
          return !isCurrent;
        };
        archivedKeys.set(m.verKey, {
          file_name: decide('file_name'),
          data_file_name: decide('data_file_name')
        });
      }
    }

    const verList = versions.map(verRaw => {
      const verKey = Object.keys(verRaw)[0];
      const ver = verRaw[verKey] || {};
      const srcInvalid = typeof ver.source_url === 'string' && ver.source_url[0] === '~';
      const srcUrl = srcInvalid ? ver.source_url.substring(1) : ver.source_url;
      const srcInvalidAlt = typeof ver.source_url_alt === 'string' && ver.source_url_alt[0] === '~';
      const srcUrlAlt = srcInvalidAlt ? ver.source_url_alt.substring(1) : ver.source_url_alt;
      const dlInvalid = typeof ver.download_url === 'string' && ver.download_url[0] === '~';
      const dlUrl = dlInvalid ? ver.download_url.substring(1) : ver.download_url;
      const dlInvalidAlt = typeof ver.download_url_alt === 'string' && ver.download_url_alt[0] === '~';
      const dlUrlAlt = dlInvalidAlt ? ver.download_url_alt.substring(1) : ver.download_url_alt;
      const dataDlInvalid = typeof ver.data_download_url === 'string' && ver.data_download_url[0] === '~';
      const dataDlUrl = dataDlInvalid ? ver.data_download_url.substring(1) : ver.data_download_url;

      const arch = archivedKeys.get(verKey) || { file_name: false, data_file_name: false };
      // 归档版本的链接文件名前缀 old-versions/（仅用于构建 URL，fileName 字段保留原始文件名）
      const resFileName = arch.file_name && ver.file_name ? 'old-versions/' + ver.file_name : ver.file_name;
      const dataFileName = arch.data_file_name && ver.data_file_name ? 'old-versions/' + ver.data_file_name : ver.data_file_name;

      return {
        version: verKey,
        versionAlt: ver.ver_alt || null,
        date: normDate(ver.date),
        // current 已在解析阶段确定（currentKeys）
        current: currentKeys.has(verKey),
        // 单版本级别制作软件：显式指定则用之，否则回退到游戏级 software（未指定时为 mmf）
        software: ver.software || entry.software || 'mmf',
        source: {
          url: srcUrl || null,
          urlAlt: srcUrlAlt || null,
          invalid: !!srcInvalid,
          invalidAlt: !!srcInvalidAlt
        },
        download: {
          url: dlUrl || null,
          urlAlt: dlUrlAlt || null,
          code: ver.code || null,
          codeAlt: ver.code_alt || null,
          invalid: !!dlInvalid,
          invalidAlt: !!dlInvalidAlt
        },
        dataDownload: {
          url: dataDlUrl || null,
          code: ver.data_code || null,
          invalid: !!dataDlInvalid
        },
        resource: {
          fileName: ver.file_name || null,
          ...mfResourceLinks(resFileName, ver, entry)
        },
        dataResource: {
          fileName: ver.data_file_name || null,
          ...mfResourceLinks(dataFileName, ver, entry, true)
        },
        repacker: ver.repacker || null
      };
    });

    // current 已在解析阶段确定（currentKeys），此处生成 current 版本列表
    const currentList = verList.filter(v => v.current);

    out.versions = verList;
    // 所有 current 版本的版本名（轻量数组，避免与 versions 中的完整对象重复）
    out.currentVersion = currentList.map(v => v.version).filter(Boolean);
    out.currentVersionAlt = entry.ver_alt || null;

    out.images = resolveImages(imageIndex, 'mf-games', entry);
    out.description = readDescriptionFiles('mf-games', out.images.dir);
    return out;
  });
}

// ---------------------------------------------------------------------------
// MW 资源站链接（镜像 src/util/GameUtil.js getMwLevelFileUrl）
// ---------------------------------------------------------------------------

const MW_BASE = 'https://file.marioforever.net/Mario Worker/';
const SMWP_BASE = 'https://file.marioforever.net/smwp/';
const SMWP_MW44_URL = 'https://file.marioforever.net/Mario Worker/原版 Mario Worker 下载';

const SmwpVersions = {
  'v0.2.4': 'SuperMarioWorkerProject_v0.2.4_Fix.rar',
  'v1.2.2': 'SuperMarioWorkerProject_v1.2.2.zip',
  'v1.2.7': 'SuperMarioWorkerProject_v1.2.7.zip',
  'v1.3.0': 'SuperMarioWorkerProject_v1.3.0.zip',
  'v1.3.1': 'SuperMarioWorkerProject_v1.3.1_Fix2.zip',
  'v1.4.1': 'SuperMarioWorkerProject_v1.4.1.zip',
  'v1.4.4': 'SuperMarioWorkerProject_v1.4.4.zip',
  'v1.4.5': 'SuperMarioWorkerProject_v1.4.5.zip',
  'v1.5.0': 'SuperMarioWorkerProject_v1.5.0.7z',
  'v1.5.2': 'SuperMarioWorkerProject_v1.5.2_Fix2.7z',
  'v1.6.0': 'SuperMarioWorkerProject_v1.6.0.7z',
  'v1.6.1': 'SuperMarioWorkerProject_v1.6.1.7z',
  'v1.6.2': 'SuperMarioWorkerProject_v1.6.2_Fix.7z',
  'v1.6.5': 'SuperMarioWorkerProject_v1.6.5.7z',
  'v1.7.0': 'SuperMarioWorkerProject_v1.7.0.7z',
  'v1.7.2': 'SuperMarioWorkerProject_v1.7.2_Fix.7z',
  'v1.7.3': 'SuperMarioWorkerProject_v1.7.3.7z',
  'v1.7.4': 'SuperMarioWorkerProject_v1.7.4.7z',
  'v1.7.5': 'SuperMarioWorkerProject_v1.7.5.7z',
  'v1.7.6': 'SuperMarioWorkerProject_v1.7.6.7z',
  'v1.7.7': 'smwp-1.7.7.7z',
  'v1.7.8': 'smwp-1.7.8.7z',
  'v1.7.9': 'smwp-1.7.9.7z',
  'v1.7.10': 'smwp-1.7.10.7z',
  'v1.7.11': 'smwp-1.7.11.7z',
  'v1.7.12': 'smwp-1.7.12.7z',
  'v1.7.12.1': 'smwp-1.7.12.1.7z',
  'v1.7.13': 'smwp-1.7.13-beta1.7z'
};

function mwFileUrl(entry, fname) {
  const author = Array.isArray(entry.author) ? '合作作品' : entry.author;
  if (entry.smwp_ver === 'MW 4.4') {
    return `${MW_BASE}Mario Worker 4.4 作品/${author}/${fname}`;
  }
  const folder = author === '合作作品' ? '合作作品' : `吧友作品/${author}`;
  return `${MW_BASE}${folder}/${fname}`;
}

function mwSmwpUrl(entry) {
  if (SmwpVersions[entry.smwp_ver]) {
    return `${SMWP_BASE}${SmwpVersions[entry.smwp_ver]}`;
  }
  if (entry.smwp_ver === 'MW 4.4') {
    return SMWP_MW44_URL;
  }
  return null;
}

function mwSmwpDataUrl(entry) {
  if (!entry.smwp_ver || entry.smwp_ver === 'MW 4.4') return null;
  if (!SmwpVersions[entry.smwp_ver]) return null;
  const parts = entry.smwp_ver.replace(/^v/, '').split('.').map(Number);
  const major = parts[0] || 0;
  const minor = parts[1] || 0;
  let dataFile;
  if (major > 1 || (major === 1 && minor >= 5)) dataFile = 'Data.7z';
  else if (major === 1 && minor === 4) dataFile = 'Data.zip';
  else return null;
  return `${SMWP_BASE}${dataFile}`;
}

function buildMw() {
  const list = loadYaml('list-mw.yaml');
  const imageIndex = loadJson('image-index.json');

  return list.map(entry => {
    const out = { category: 'mw' };
    out.name = entry.game || '';
    out.aliases = toArray(entry.alias);
    out.author = entry.author == null ? [] : toArray(entry.author);
    out.smwpVer = entry.smwp_ver || null;
    out.date = normDate(entry.date);
    out.hasBgm = !!entry.has_bgm;
    out.hasBundledSmwp = !!entry.has_bundled_smwp;
    out.inlineDescription = entry.description || null;
    out.wiki = entry.wiki_zh_url || null;
    out.homepage = entry.homepage || null;

    const srcInvalid = typeof entry.source_url === 'string' && entry.source_url[0] === '~';
    const srcUrl = srcInvalid ? entry.source_url.substring(1) : entry.source_url;
    const dlInvalid = typeof entry.download_url === 'string' && entry.download_url[0] === '~';
    const dlUrl = dlInvalid ? entry.download_url.substring(1) : entry.download_url;

    out.source = { url: srcUrl || null, invalid: !!srcInvalid };
    out.download = { url: dlUrl || null, code: entry.code || null, invalid: !!dlInvalid };

    // 主文件 / 数据文件（字段名与 mf.json 保持一致：resource / dataResource）
    // MW 作品仅有中文资源站路径，故不含 en
    const buildFiles = (fileName, explicitUrl) => {
      if (explicitUrl) {
        return [{ fileName: null, zh: explicitUrl }];
      }
      if (!fileName) return [];
      const names = Array.isArray(fileName) ? fileName : [fileName];
      const result = [];
      for (const fn of names) {
        if (fn == null) continue;
        result.push({
          fileName: fn,
          zh: mwFileUrl(entry, fn)
        });
      }
      return result;
    };
    out.resource = buildFiles(entry.file_name, entry.file_url);
    out.dataResource = buildFiles(entry.data_file_name, entry.data_file_url);

    // SMWP 与数据包链接
    if (entry.smwp_ver && !entry.has_bundled_smwp) {
      out.smwp = { zh: mwSmwpUrl(entry) };
      out.smwpData = { zh: mwSmwpDataUrl(entry) };
    } else {
      out.smwp = null;
      out.smwpData = null;
    }

    out.images = resolveImages(imageIndex, 'mw-levels', entry);
    out.description = readDescriptionFiles('mw-levels', out.images.dir);
    return out;
  });
}

// ---------------------------------------------------------------------------
// Assets（镜像 src/util/AssetUtil.js getAssetFileUrl）
// ---------------------------------------------------------------------------

const ASSET_BASE = {
  effect: 'https://file.marioforever.net/Mario Forever/引擎/CTF特效/',
  addon: 'https://file.marioforever.net/Mario Forever/引擎/拓展资源包/',
  sprite: 'https://file.marioforever.net/Mario Forever/游戏素材/',
  tool: 'https://file.marioforever.net/Mario Forever/游戏工具/',
  mwtool: 'https://file.marioforever.net/Mario Worker/辅助工具/'
};
const ENGINE_BASE = 'https://file.marioforever.net/Mario Forever/引擎/';

function assetFileUrl(type, fileName, path = '') {
  if (!fileName) return null;
  // 与 MF/MW 保持一致：文件名不做 URL 编码，交由客户端处理（含中文/空格）
  if (type === 'engine') {
    const pathPart = path ? path + '/' : '';
    return `${ENGINE_BASE}${pathPart}${fileName}`;
  }
  const baseUrl = ASSET_BASE[type];
  return baseUrl ? baseUrl + fileName : null;
}

function buildAssets() {
  const list = loadYaml('list-assets.yaml');
  const imageFiles = existsSync(join(dataDir, 'assets'))
    ? readdirSync(join(dataDir, 'assets')).filter(f => IMAGE_EXTS.includes(extOf(f)))
    : [];

  return list.map(entry => {
    const out = { category: 'assets' };
    out.name = entry.name || '';
    out.nameAlt = entry.name_alt || null;
    out.aliases = toArray(entry.alias);
    out.author = entry.author == null ? [] : toArray(entry.author);
    out.type = entry.type || '';
    out.path = entry.path || '';
    out.pathAlt = entry.path_alt || null;
    out.inlineDescription = entry.description || null;
    out.repo = entry.repo || null;

    const buildVer = (variantKey, v) => {
      const date = normDate(v?.date);
      const dlInvalid = typeof v?.download_url === 'string' && v.download_url[0] === '~';
      const dlUrl = dlInvalid ? v.download_url.substring(1) : v.download_url;
      const srcInvalid = typeof v?.source_url === 'string' && v.source_url[0] === '~';
      const srcUrl = srcInvalid ? v.source_url.substring(1) : v.source_url;
      const fileName = v?.file_name || v?.image;
      const fileNames = Array.isArray(fileName) ? fileName.filter(f => f != null) : (fileName ? [fileName] : []);
      // 结构参考 mf.json 的 resource：每项含 fileName 与 zh/en 链接
      // assets 的资源站链接不分中英文，zh 与 en 相同
      const resource = fileNames.map(fn => {
        const url = assetFileUrl(entry.type, fn, entry.path);
        return {
          fileName: fn,
          zh: url,
          en: url
        };
      });
      return {
        variant: variantKey || null,
        version: v?.ver || null,
        date,
        source: { url: srcUrl || null, invalid: !!srcInvalid },
        download: { url: dlUrl || null, code: v?.code || entry.code || null, invalid: !!dlInvalid },
        resource
      };
    };

    let variants;
    if (entry.variants) {
      variants = entry.variants.map(v => buildVer(Object.keys(v)[0], v[Object.keys(v)[0]]));
      out.currentVariant = variants[0]?.variant || null;
    } else {
      variants = [buildVer(null, { ...entry, ver: entry.ver })];
      out.currentVariant = null;
    }
    out.variants = variants;
    out.currentVersion = variants[0]?.version || null;

    // 图片：entry.image 或 name 匹配 data/assets 下的文件
    const imgName = entry.image || null;
    if (imgName) {
      out.image = `/data/assets/${imgName}`;
    } else {
      const baseName = sanitizeName(entry.name);
      const match = imageFiles.find(f => sanitizeName(f) === baseName);
      out.image = match ? `/data/assets/${match}` : null;
    }
    return out;
  });
}

function extOf(filename) {
  const i = filename.lastIndexOf('.');
  return i === -1 ? '' : filename.slice(i).toLowerCase();
}

// ---------------------------------------------------------------------------
// Softendo（镜像 src/util/SoftendoUtil.js）
// ---------------------------------------------------------------------------

const SOFTENDO_BASE_EN = {
  mario: {
    installer: 'https://file.marioforever.net/mario-forever/games/softendo/installer/',
    portable: 'https://file.marioforever.net/mario-forever/games/softendo/portable/'
  },
  mff: {
    installer: 'https://file.marioforever.net/mario-forever/games/softendo/flash/exe-installer/',
    portable_swf: 'https://file.marioforever.net/mario-forever/games/softendo/flash/swf/mario-forever-flash/',
    portable_exe: 'https://file.marioforever.net/mario-forever/games/softendo/flash/exe/'
  },
  flash: {
    installer: 'https://file.marioforever.net/mario-forever/games/softendo/flash/exe-installer/',
    portable_swf: 'https://file.marioforever.net/mario-forever/games/softendo/flash/swf/other/',
    portable_exe: 'https://file.marioforever.net/mario-forever/games/softendo/flash/exe/',
    portable_zip: 'https://file.marioforever.net/mario-forever/games/softendo/flash/zip/'
  },
  'non-mario': {
    installer: 'https://file.marioforever.net/mario-forever/games/softendo/non-mario/installer/',
    portable: 'https://file.marioforever.net/mario-forever/games/softendo/non-mario/portable/',
    kliktopia: 'https://file.marioforever.net/mario-forever/games/softendo/non-mario/portable/kliktopia-repackage/'
  },
  banesoft: {
    installer: 'https://file.marioforever.net/mario-forever/games/banesoft/installer/',
    portable: 'https://file.marioforever.net/mario-forever/games/banesoft/portable/'
  }
};
const SOFTENDO_BASE_ZH = {
  mario: {
    installer: 'https://file.marioforever.net/Mario Forever/Softendo 其他游戏下载/安装版/',
    portable: 'https://file.marioforever.net/Mario Forever/Softendo 其他游戏下载/绿色版/'
  },
  mff: {
    installer: 'https://file.marioforever.net/Mario Forever/Softendo 其他游戏下载/flash/exe-installer/',
    portable_swf: 'https://file.marioforever.net/Mario Forever/Softendo 其他游戏下载/flash/swf/mario-forever-flash/',
    portable_exe: 'https://file.marioforever.net/Mario Forever/Softendo 其他游戏下载/flash/exe/'
  },
  flash: {
    installer: 'https://file.marioforever.net/Mario Forever/Softendo 其他游戏下载/flash/exe-installer/',
    portable_swf: 'https://file.marioforever.net/Mario Forever/Softendo 其他游戏下载/flash/swf/other/',
    portable_exe: 'https://file.marioforever.net/Mario Forever/Softendo 其他游戏下载/flash/exe/',
    portable_zip: 'https://file.marioforever.net/Mario Forever/Softendo 其他游戏下载/flash/zip/'
  },
  'non-mario': {
    installer: 'https://file.marioforever.net/Mario Forever/Softendo 其他游戏下载/non-mario/installer/',
    portable: 'https://file.marioforever.net/Mario Forever/Softendo 其他游戏下载/non-mario/portable/',
    kliktopia: 'https://file.marioforever.net/Mario Forever/Softendo 其他游戏下载/non-mario/portable/kliktopia-repackage/'
  },
  banesoft: {
    installer: 'https://file.marioforever.net/Mario Forever/Banesoft 相关游戏下载/安装版/',
    portable: 'https://file.marioforever.net/Mario Forever/Banesoft 相关游戏下载/绿色版/'
  }
};
const NSMF_ZH = {
  installer: 'https://file.marioforever.net/Mario Forever/New Super Mario Forever 下载/安装版/',
  portable: 'https://file.marioforever.net/Mario Forever/New Super Mario Forever 下载/绿色版/'
};
function softendoBaseUrl(type, lan, nsmf) {
  if (nsmf && lan === 'zh') return NSMF_ZH;
  return lan === 'zh' ? SOFTENDO_BASE_ZH[type] : SOFTENDO_BASE_EN[type];
}

function isKliktopiaRepackage(verKey) {
  return verKey && verKey.toLowerCase().includes('kliktopia repackage');
}

/**
 * 解析 portable / selfextract 字段，返回每个文件的分类与文件名
 * 不直接生成 URL，由调用方按 zh/en 分别构建
 * @returns {Array<{kind: string, fileName: string}>}
 */
function portableEntries(type, portable, nsmf, verKey) {
  if (!portable) return [];
  const urls = softendoBaseUrl(type, 'en', nsmf);
  if (!urls) return [];

  const processItem = (value, kind) => {
    if (Array.isArray(value)) {
      return value.filter(item => typeof item === 'string').map(item => ({ kind, fileName: item }));
    }
    if (typeof value === 'string') {
      return [{ kind, fileName: value }];
    }
    return [];
  };

  if (typeof portable === 'string') {
    const useKliktopia = type === 'non-mario' && isKliktopiaRepackage(verKey);
    const baseUrl = useKliktopia ? (urls.kliktopia || urls.portable) : (urls.portable || urls.portable_zip || urls.portable_exe);
    if (!baseUrl) return [];
    return [{ kind: 'portable', fileName: portable }];
  }

  const result = [];
  const useKliktopia = type === 'non-mario' && isKliktopiaRepackage(verKey);
  const defaultBaseUrl = useKliktopia ? urls.kliktopia : urls.portable;
  if (portable.exe) {
    const exeBase = urls.portable_exe || defaultBaseUrl;
    if (exeBase) result.push(...processItem(portable.exe, 'exe'));
  }
  if (portable.swf) {
    const swfBase = type === 'mff' ? urls.portable_swf : (urls.portable_swf || defaultBaseUrl);
    if (swfBase) result.push(...processItem(portable.swf, 'swf'));
  }
  if (portable.zip) {
    const zipBase = urls.portable_zip || defaultBaseUrl;
    if (zipBase) result.push(...processItem(portable.zip, 'zip'));
  }
  if (result.length === 0 && typeof portable === 'object') {
    const baseUrl = defaultBaseUrl || urls.portable_zip || urls.portable_exe;
    if (baseUrl) {
      for (const key of Object.keys(portable)) {
        const value = portable[key];
        if (typeof value === 'string' || Array.isArray(value)) result.push(...processItem(value, key));
      }
    }
  }
  return result;
}

/**
 * 按分类（kind）为单个 portable / selfextract 文件构建指定语言的下载链接
 */
function portableUrlFor(type, kind, fileName, lan, nsmf, verKey) {
  const urls = softendoBaseUrl(type, lan, nsmf);
  if (!urls) return null;
  const useKliktopia = type === 'non-mario' && isKliktopiaRepackage(verKey);
  const defaultBaseUrl = useKliktopia ? (urls.kliktopia || urls.portable) : urls.portable;
  let baseUrl;
  if (kind === 'exe') {
    baseUrl = urls.portable_exe || defaultBaseUrl;
  } else if (kind === 'swf') {
    baseUrl = type === 'mff' ? urls.portable_swf : (urls.portable_swf || defaultBaseUrl);
  } else if (kind === 'zip') {
    baseUrl = urls.portable_zip || defaultBaseUrl;
  } else {
    baseUrl = defaultBaseUrl || urls.portable_zip || urls.portable_exe;
  }
  if (!baseUrl) return null;
  // 与 MF/MW 保持一致：文件名不做 URL 编码
  return baseUrl + fileName;
}

function installerUrl(type, fileName, lan, nsmf) {
  if (!fileName) return null;
  const urls = softendoBaseUrl(type, lan, nsmf);
  if (!urls || !urls.installer) return null;
  return urls.installer + fileName;
}

/**
 * 根据 type 和所有版本的 portable 判断默认的 software 值
 * 镜像 src/util/SoftendoUtil.js getSoftwareDefault：
 * - 仅对 mff / flash 分类生效
 * - 所有版本中同时存在 exe 和 zip（允许分布在不同版本）时，flash 返回 ["flash", "mmf"]
 * - mff 分类一律不再添加 mmf software，返回 "flash"
 * - 否则返回 "flash"
 */
function softendoSoftwareDefault(type, entry) {
  if (type !== 'mff' && type !== 'flash') {
    return null;
  }

  // 收集所有 portable 数据
  const portables = [];

  if (entry.portable) {
    portables.push(entry.portable);
  }

  if (entry.ver && Array.isArray(entry.ver)) {
    for (const verRaw of entry.ver) {
      const verObj = verRaw[Object.keys(verRaw)[0]];
      if (verObj.portable) {
        portables.push(verObj.portable);
      }
    }
  }

  // 检查所有版本中是否存在 exe 和 zip（允许分布在不同版本）
  let hasAnyExe = false;
  let hasAnyZip = false;

  for (const portable of portables) {
    if (portable && typeof portable === 'object') {
      if (portable.exe && (typeof portable.exe === 'string' || (Array.isArray(portable.exe) && portable.exe.length > 0))) {
        hasAnyExe = true;
      }
      if (portable.zip && (typeof portable.zip === 'string' || (Array.isArray(portable.zip) && portable.zip.length > 0))) {
        hasAnyZip = true;
      }
    }
  }

  if (hasAnyExe || hasAnyZip) {
    // mff 分类一律不再添加 mmf software，仅 flash 分类保留 mmf
    if (type === 'mff') {
      return 'flash';
    }
    return ['flash', 'mmf'];
  }

  return 'flash';
}

/**
 * 归一化 software 字段，镜像 src/util/SoftendoUtil.js normalizeSoftendoList：
 * - 优先使用显式指定的 software（支持字符串或数组）
 * - 否则对 mff / flash 分类按 portable 自动匹配默认值
 */
function softendoSoftware(type, entry) {
  if (entry.software) {
    return entry.software;
  }
  if (type === 'mff' || type === 'flash') {
    return softendoSoftwareDefault(type, entry);
  }
  return '';
}

function buildSoftendo() {
  const list = loadYaml('list-softendo.yaml');
  const imageIndex = loadJson('image-index.json');

  return list.map(entry => {
    const out = { category: 'softendo' };
    out.name = entry.game || entry.name || '';
    out.aliases = toArray(entry.alias);
    out.type = entry.type || '';
    out.software = softendoSoftware(entry.type, entry);
    out.genre = toArray(entry.genre);
    out.initialYear = entry.initial_year || null;
    out.isNsmf = !!entry.nsmf;

    // 归一化版本数组（镜像 normalizeSoftendoList）
    // installer / portable / selfextract 均对齐其他文件的结构：
    // 数组形式，每项含 fileName 与 zh/en 链接
    const buildVer = (verKey, v) => {
      const installerFile = v?.installer;
      const installer = installerFile
        ? [{
          fileName: installerFile,
          zh: installerUrl(entry.type, installerFile, 'zh', out.isNsmf),
          en: installerUrl(entry.type, installerFile, 'en', out.isNsmf)
        }]
        : [];

      const buildPortable = (field) => portableEntries(entry.type, field, out.isNsmf, verKey).map(item => ({
        fileName: item.fileName,
        // kind 表示文件形态：portable / exe / swf / zip 等
        kind: item.kind,
        zh: portableUrlFor(entry.type, item.kind, item.fileName, 'zh', out.isNsmf, verKey),
        en: portableUrlFor(entry.type, item.kind, item.fileName, 'en', out.isNsmf, verKey)
      }));

      return {
        version: verKey,
        year: v?.year || null,
        installer,
        portable: buildPortable(v?.portable),
        selfextract: buildPortable(v?.selfextract)
      };
    };

    if (entry.ver && Array.isArray(entry.ver)) {
      out.versions = entry.ver.map(verRaw => buildVer(Object.keys(verRaw)[0], verRaw[Object.keys(verRaw)[0]]));
      out.currentVersion = out.versions[0]?.version || null;
    } else {
      const year = entry.year || '';
      const v = { ...entry };
      out.versions = [buildVer(String(year), v)];
      out.currentVersion = null;
    }

    // 年份范围
    const years = [];
    if (entry.ver && Array.isArray(entry.ver)) {
      // 多版本：取每个版本的 year
      for (const verRaw of entry.ver) {
        const verObj = verRaw[Object.keys(verRaw)[0]];
        if (verObj?.year) years.push(verObj.year);
      }
    } else if (entry.year) {
      // 单版本：取 entry.year
      years.push(entry.year);
    }
    const sortedYears = [...new Set(years)].sort((a, b) => a - b);
    out.years = sortedYears;

    // initialYear：显式指定则用之，否则取所有版本中最旧的年份
    if (out.initialYear == null && sortedYears.length > 0) {
      out.initialYear = sortedYears[0];
    }

    // softendo 每条仅一张图（文件名与游戏名相同，为标题界面或 logo，无 showcase），
    // 采用与 assets 相同的单图格式：image 字段
    const softendoInfo = findGameInfo(imageIndex, 'softendo', entry);
    const softendoImages = softendoInfo?.images || [];
    const softendoDir = softendoInfo?.dirName || '';
    out.image = softendoImages.length > 0
      ? imagePath('softendo', softendoDir, softendoImages[0])
      : null;
    return out;
  });
}

// ---------------------------------------------------------------------------
// Original MF（list-original-mf.yaml）
// 链接规则镜像 src/components/OriginalMfTable.vue 的 baseUrls
// ---------------------------------------------------------------------------

const ORIGINAL_MF_BASE = {
  zh: {
    installer: 'https://file.marioforever.net/Mario Forever/Mario Forever 全版本下载/安装版/',
    portable: 'https://file.marioforever.net/Mario Forever/Mario Forever 全版本下载/绿色版/',
    nsmfInstaller: 'https://file.marioforever.net/Mario Forever/New Super Mario Forever 下载/安装版/'
  },
  en: {
    installer: 'https://file.marioforever.net/mario-forever/games/original-mf/installer/',
    portable: 'https://file.marioforever.net/mario-forever/games/original-mf/portable/',
    nsmfInstaller: 'https://file.marioforever.net/mario-forever/games/softendo/installer/'
  }
};

/**
 * 将星级字符串转换为 1~10 的数字评分
 * ★ 记 2 分，☆（半星）记 1 分
 * @param {string} rating - 如 "★★★★☆"
 * @returns {number|null} 1~10 的分数
 */
function ratingToScore(rating) {
  if (!rating || typeof rating !== 'string') return null;
  let score = 0;
  for (const ch of rating) {
    if (ch === '★') score += 2;
    else if (ch === '☆') score += 1;
  }
  return score > 0 ? score : null;
}

function buildOriginalMf() {
  const list = loadYaml('list-original-mf.yaml');

  return list.map(entry => {
    const isNsmf = entry.nsmf === true;
    const hasToolbar = entry.toolbar === true;

    const linksFor = (kind, fileName) => {
      if (!fileName) return null;
      const result = {};
      for (const lan of ['zh', 'en']) {
        const paths = ORIGINAL_MF_BASE[lan];
        // NSMF 版本的安装版使用 New Super Mario Forever / Softendo 路径
        const base = kind === 'installer'
          ? (isNsmf ? paths.nsmfInstaller : paths.installer)
          : paths.portable;
        result[lan] = `${base}${fileName}`;
      }
      return result;
    };

    return {
      version: entry.ver || '',
      date: normDate(entry.date),
      rating: entry.rating || null,
      // 数字评分：★=2，☆=1，满分 10
      ratingScore: ratingToScore(entry.rating),
      installer: {
        fileName: entry.installer || null,
        // 安装程序是否捆绑 Mario Forever Toolbar（广告插件）
        toolbar: hasToolbar,
        // 是否使用 NSMF（New Super Mario Forever）链接格式
        nsmf: isNsmf,
        ...(linksFor('installer', entry.installer) || { zh: null, en: null })
      },
      portable: {
        fileName: entry.portable || null,
        ...(linksFor('portable', entry.portable) || { zh: null, en: null })
      }
    };
  });
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------

function main() {
  if (!existsSync(apiDir)) mkdirSync(apiDir, { recursive: true });

  const mf = buildMf();
  const mw = buildMw();
  const assets = buildAssets();
  const softendo = buildSoftendo();
  const originalMf = buildOriginalMf();

  const generatedAt = new Date().toISOString();
  const files = {
    'mf.json': mf,
    'mw.json': mw,
    'assets.json': assets,
    'softendo.json': softendo,
    'original-mf.json': originalMf
  };

  for (const [file, data] of Object.entries(files)) {
    writeFileSync(join(apiDir, file), JSON.stringify(data, null, 2));
  }

  // 清单文件：端点发现 + 统计
  const manifest = {
    name: 'download.marioforever.net static API',
    generatedAt,
    endpoints: Object.keys(files).map(file => ({
      id: file.replace('.json', ''),
      path: `/api/${file}`,
      file,
      count: files[file].length,
      category: file.replace('.json', '')
    })),
    notes: [
      '静态 JSON API，随站点构建生成。',
      'resource: 社区资源站(file.marioforever.net)链接。',
      'images.* 与 description.* 指向 public/data 下的图片与 markdown 文件路径。'
    ]
  };
  writeFileSync(join(apiDir, 'index.json'), JSON.stringify(manifest, null, 2));

  console.log('Static API generated:');
  for (const [file, data] of Object.entries(files)) {
    console.log(`  /api/${file}  ${data.length} entries`);
  }
  console.log(`  /api/index.json  (manifest)`);
}

main();
