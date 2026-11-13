import { getName, getAuthorList, getDownloadEntries, toResourceDirectUrl, getVideoDesc } from "../GameUtil.js";
import { getAssetResourceURLs } from "../AssetUtil.js";
import { getSoftendoGameName, getSoftendoYearRange, getTypeLabel, getLanguageLabel } from "../SoftendoUtil.js";
import { getTagLabel } from "../TagUtil.js";
import { getGameImageSync, getShowcaseImagesSync } from "../ImageUtil.js";
import { getUseDirectLink } from "../Language.js";

// ── shared helpers ────────────────────────────────────────────
// The redesigned pages read the same YAML as the legacy pages, so platform and
// software detection must stay identical to `src/pages/mf-games/MfGames.vue`;
// the rules live here once so a future edit cannot drift between designs.

export function detectPlatform(verKey, fileName) {
  const verLower = String(verKey || "").toLowerCase();
  const fileLower = String(fileName || "").toLowerCase();
  if (verLower.includes("linux") || fileLower.includes("linux")
    || fileLower.endsWith(".tar.xz") || fileLower.endsWith(".tar.gz") || fileLower.endsWith(".tgz")) {
    return "Linux";
  }
  if (verLower.includes("macos") || fileLower.includes("macos") || fileLower.endsWith(".dmg")) {
    return "macOS";
  }
  if (verLower.includes("android") || fileLower.includes("android") || fileLower.endsWith(".apk")) {
    return "Android";
  }
  if (fileLower.endsWith(".jar")) {
    return "J2ME";
  }
  return "Windows";
}

export function detectSoftware(entry, verObj) {
  if (verObj && verObj.software) return verObj.software;
  if (entry && entry.software) return entry.software;
  return "mmf";
}

const SOFTWARE_LABELS = {
  mmf: { zh: "Clickteam Fusion", en: "Clickteam Fusion" },
  godot: { zh: "Godot Engine", en: "Godot Engine" },
  gamemaker: { zh: "GameMaker", en: "GameMaker" },
  flash: { zh: "Flash", en: "Flash" },
  klik: { zh: "Klik & Play", en: "Klik & Play" },
  other: { zh: "其他", en: "Other" },
};

export function softwareLabel(software, lan) {
  const entry = SOFTWARE_LABELS[software];
  if (!entry) return software || "";
  return lan === "zh" ? entry.zh : entry.en;
}

const ASSET_TYPE_LABELS = {
  engine: { zh: "引擎", en: "Engine" },
  addon: { zh: "拓展", en: "Addon" },
  effect: { zh: "特效", en: "Effect" },
  sprite: { zh: "素材", en: "Sprite" },
  tool: { zh: "工具", en: "Tool" },
  mwtool: { zh: "MW 工具", en: "MW Tool" },
};

export function assetTypeLabel(type, lan) {
  const entry = ASSET_TYPE_LABELS[type];
  if (!entry) return type;
  return lan === "zh" ? entry.zh : entry.en;
}

function direct(url) {
  const useDirect = getUseDirectLink();
  return useDirect.value ? toResourceDirectUrl(url) : url;
}

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatIsoDate(date) {
  if (!date) return "";
  const d = toDate(date);
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function authorNames(entry, lan) {
  const list = getAuthorList(entry, lan);
  if (list == null) return [];
  return Array.isArray(list) ? list.slice() : [list];
}

function authorText(entry, lan) {
  return authorNames(entry, lan).join(", ");
}

function netdiskDownloads(record, lan) {
  const entries = getDownloadEntries(record, lan);
  return entries.map((item) => {
    const dead = /（已失效）|\(Invalid\)|（暂无法访问）|\(Temporarily Unavailable\)/.test(item.desc || "");
    return {
      label: item.desc,
      shortLabel: shortNetdiskLabel(item.desc),
      url: item.url,
      code: item.code || null,
      dead,
      primary: false,
      kind: "netdisk",
    };
  });
}

function shortNetdiskLabel(desc) {
  if (!desc) return "";
  return desc.replace(/\s*\((提取码|密码|Code|已失效|Invalid|暂无法访问|Temporarily Unavailable)[^)]*\)/g, "").trim();
}

// The title image must be first in the gallery (it is the recognisable artwork),
// followed by the showcase shots in natural order.
function collectImages(entry, category, verKey) {
  const probe = verKey ? { ...entry, currentVerStr: verKey } : entry;
  const title = getGameImageSync(probe, category);
  const showcases = getShowcaseImagesSync(probe, category).map((item) => item.url);
  const images = [];
  const seen = new Set();
  for (const url of [title, ...showcases]) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    images.push(url);
  }
  return { image: title || (images[0] || null), images };
}

// ── Mario Forever fangames ───────────────────────────────────

function mfVersions(entry, lan) {
  const versions = Array.isArray(entry.ver) ? entry.ver : [];
  return versions.map((verRaw) => {
    const verKey = Object.keys(verRaw)[0];
    const ver = verRaw[verKey] || {};
    const platform = detectPlatform(verKey, ver.file_name);
    const software = detectSoftware(entry, ver);
    const fileKey = lan === "zh" ? "file_url_zh" : "file_url_en";
    const dataKey = lan === "zh" ? "data_file_url_zh" : "data_file_url_en";
    const downloads = [];

    if (ver[fileKey]) {
      downloads.push({
        label: lan === "zh" ? "社区资源站" : "Community File Hub",
        shortLabel: "File Hub",
        url: direct(ver[fileKey]),
        code: null,
        dead: false,
        primary: true,
        kind: "filehub",
      });
    }

    const probe = { ...entry, currentVer: ver, currentVerStr: verKey };
    downloads.push(...netdiskDownloads(probe, lan));

    const dataDownloads = [];
    if (ver[dataKey]) {
      dataDownloads.push({
        label: lan === "zh" ? "社区资源站" : "Community File Hub",
        shortLabel: "File Hub",
        url: direct(ver[dataKey]),
        code: null,
        dead: false,
        primary: true,
        kind: "filehub",
      });
    }
    if (ver.data_download_url) {
      dataDownloads.push({
        label: lan === "zh" ? "网盘数据包" : "Netdisk data",
        shortLabel: lan === "zh" ? "网盘" : "Netdisk",
        url: ver.data_download_url,
        code: ver.data_code || null,
        dead: false,
        primary: false,
        kind: "netdisk",
      });
    }

    return {
      verKey,
      label: (lan === "en" && ver.ver_alt) ? ver.ver_alt : verKey,
      date: toDate(ver.date),
      platform,
      software,
      file: ver.file_name || "",
      downloads,
      dataDownloads,
      repacker: ver.repacker || null,
      repackerAlt: ver.repacker_alt || null,
      current: ver.current === true,
      isApk: String(ver.file_name || "").toLowerCase().endsWith(".apk"),
    };
  });
}

export function buildMfRecords(entries, lan) {
  return entries.map((entry) => {
    const versions = mfVersions(entry, lan);
    const currentVerStr = entry.currentVerStr || (versions[0] && versions[0].verKey) || "";
    const current = versions.find((v) => v.verKey === currentVerStr) || versions[0] || null;
    const names = authorNames(entry, lan);
    const rawNames = authorNames(entry, "zh");
    const id = `mf::${entry.game}::${rawNames.join("|")}::${entry.type || ""}`;

    const { image, images } = collectImages(entry, "mf-games", current ? current.verKey : currentVerStr);

    const description = lan === "zh"
      ? (entry.description_zh || entry.description || null)
      : (entry.description_en || entry.description_alt || entry.description || null);

    const tagKeys = entry.tag ? (Array.isArray(entry.tag) ? entry.tag : [entry.tag]) : [];
    const tags = tagKeys.map((tag) => ({ key: tag, label: getTagLabel(tag, lan) }));

    return {
      id,
      kind: "mf",
      name: getName(entry, lan),
      nameZh: entry.game,
      nameAlt: entry.game_alt || null,
      author: names.join(", "),
      authors: names,
      authorZh: authorText(entry, "zh"),
      date: current ? current.date : null,
      versionLabel: current ? current.label : "",
      versionCount: versions.length,
      region: entry.type || null,
      platform: current ? current.platform : null,
      software: current ? current.software : null,
      tags,
      image,
      images,
      description,
      downloads: current ? current.downloads : [],
      dataDownloads: current ? current.dataDownloads : [],
      versions,
      links: {
        home: (lan === "zh" ? entry.homepage_zh || entry.homepage_en : entry.homepage_en || entry.homepage_zh) || null,
        source: currentSourceUrl(entry, lan),
        repo: (current && current.repo) || entry.repo || null,
        wiki: (lan === "zh" ? entry.wiki_zh_url : entry.wiki_en_url) || null,
        video: collectVideos(entry, lan),
      },
      // Filenames are searchable, matching the legacy filter behaviour.
      titleSearch: [entry.game, entry.game_alt, ...(Array.isArray(entry.alias) ? entry.alias : entry.alias ? [entry.alias] : []),
        ...versions.map((v) => v.file)],
      authorSearch: [authorText(entry, "zh"), authorText(entry, "en")],
      raw: entry,
    };
  });
}

function currentSourceUrl(entry, lan) {
  if (!entry.currentVer) return null;
  if (lan === "en" && entry.currentVer.source_url_alt) return entry.currentVer.source_url_alt;
  return entry.currentVer.source_url || null;
}

function collectVideos(entry, lan) {
  const list = lan === "zh" ? (entry.video_zh || entry.video) : (entry.video_en || entry.video);
  if (!list) return [];
  return list.map((item) => {
    const key = Object.keys(item)[0];
    const url = item[key];
    return { title: key, url, site: getVideoDesc(url, lan) };
  });
}

// Expand a multi-version record into one record per version.
export function expandMfRecord(record) {
  if (!record || record.versions.length <= 1) return [record];
  return record.versions.map((version, index) => ({
    ...record,
    id: `${record.id}::${version.verKey}`,
    date: version.date,
    versionLabel: version.label,
    platform: version.platform,
    software: version.software,
    downloads: version.downloads,
    dataDownloads: version.dataDownloads,
    current: version,
    expandedFrom: record,
    expandedIndex: index,
  }));
}

// ── Mario Worker levels ──────────────────────────────────────

export function buildMwRecords(entries) {
  const lan = "zh";
  return entries.map((entry) => {
    const names = authorNames(entry, lan);
    const downloads = (entry.file_urls || []).map((item, index) => ({
      label: item.name,
      shortLabel: entry.file_urls.length > 1 ? `#${index + 1}` : "File Hub",
      url: direct(item.url),
      code: null,
      dead: false,
      primary: index === 0,
      kind: "filehub",
    }));

    const netdisk = [];
    if (entry.currentVer && entry.currentVer.download_url) {
      netdisk.push(...netdiskDownloads({ ...entry, currentVer: entry.currentVer }, lan));
    }

    const dataDownloads = (entry.data_file_urls || []).map((item, index) => ({
      label: item.name,
      shortLabel: entry.data_file_urls.length > 1 ? `#${index + 1}` : "File Hub",
      url: direct(item.url),
      code: null,
      dead: false,
      primary: index === 0,
      kind: "filehub",
    }));
    if (entry.currentVer && entry.currentVer.data_download_url) {
      dataDownloads.push({
        label: "网盘数据包",
        shortLabel: "网盘",
        url: entry.currentVer.data_download_url,
        code: entry.currentVer.data_code || null,
        dead: false,
        primary: false,
        kind: "netdisk",
      });
    }

    const { image, images } = collectImages(entry, "mw-levels");

    const tags = [];
    if (entry.has_bundled_smwp) tags.push({ key: "BundledMW", label: "专用 MW" });
    if (entry.has_bgm) tags.push({ key: "BGM", label: "BGM" });

    const allDownloads = [...downloads, ...netdisk];

    return {
      id: `mw::${entry.game}::${names.join("|")}`,
      kind: "mw",
      name: entry.game,
      nameZh: entry.game,
      nameAlt: entry.game_alt || null,
      author: names.join(", "),
      authors: names,
      authorZh: names.join(", "),
      date: toDate(entry.date),
      versionLabel: entry.smwp_ver || "",
      versionCount: 1,
      region: null,
      platform: null,
      software: null,
      tags,
      image,
      images,
      description: entry.description || null,
      downloads: allDownloads,
      dataDownloads,
      versions: [{
        verKey: entry.smwp_ver || "",
        label: entry.smwp_ver || "",
        date: toDate(entry.date),
        downloads: allDownloads,
        dataDownloads,
        current: true,
        platform: null,
        software: null,
        repacker: null,
      }],
      links: {
        home: entry.homepage || null,
        source: entry.currentVer ? entry.currentVer.source_url || null : null,
        repo: entry.repo || null,
        wiki: entry.wiki_zh_url || null,
        video: (entry.video || []).map((item) => {
          const key = Object.keys(item)[0];
          return { title: key, url: item[key], site: getVideoDesc(item[key], lan) };
        }),
      },
      smwpVersion: entry.smwp_ver || null,
      smwpUrl: entry.smwp_url ? direct(entry.smwp_url) : null,
      smwpDataUrl: entry.smwp_data_url ? direct(entry.smwp_data_url) : null,
      bundled: !!entry.has_bundled_smwp,
      hasBgm: !!entry.has_bgm,
      titleSearch: [entry.game, entry.game_alt, ...(Array.isArray(entry.alias) ? entry.alias : entry.alias ? [entry.alias] : []),
        entry.file_name],
      authorSearch: [authorText(entry, "zh")],
      raw: entry,
    };
  });
}

// ── Creation assets ──────────────────────────────────────────

export function buildAssetRecords(entries, lan) {
  return entries.map((entry) => {
    const variant = entry.currentVer || {};
    const variantKey = entry.currentVerStr || "";
    const downloads = getAssetResourceURLs(entry, lan).map((item, index, arr) => ({
      label: item.name,
      shortLabel: arr.length > 1 ? `#${index + 1}` : "File Hub",
      url: direct(item.url),
      code: null,
      dead: false,
      primary: index === 0,
      kind: "filehub",
    }));

    if (variant.download_url) {
      downloads.push({
        label: `网盘${variant.code ? ` (提取码: ${variant.code})` : ""}`,
        shortLabel: "网盘",
        url: variant.download_url,
        code: variant.code || null,
        dead: false,
        primary: false,
        kind: "netdisk",
      });
    }
    if (variant.download_url_alt) {
      downloads.push({
        label: `备用网盘${variant.code_alt ? ` (提取码: ${variant.code_alt})` : ""}`,
        shortLabel: "备用",
        url: variant.download_url_alt,
        code: variant.code_alt || null,
        dead: false,
        primary: false,
        kind: "netdisk",
      });
    }

    const image = entry.image ? `/data/assets/${entry.image}` : null;

    return {
      id: `asset::${entry.name}::${variantKey}`,
      kind: "asset",
      name: getName(entry, lan),
      nameZh: entry.name,
      nameAlt: entry.name_alt || null,
      author: authorText(entry, lan),
      authors: authorNames(entry, lan),
      authorZh: authorText(entry, "zh"),
      date: toDate(variant.date || entry.date),
      versionLabel: variant.ver || variantKey || "",
      versionCount: entry.ver ? entry.ver.length : 1,
      region: null,
      platform: null,
      software: null,
      assetType: entry.type,
      assetTypeLabel: assetTypeLabel(entry.type, lan),
      tags: [],
      image,
      images: image ? [image] : [],
      description: lan === "en" ? (entry.description_alt || entry.description || null) : (entry.description || null),
      downloads,
      dataDownloads: [],
      versions: [{
        verKey: variantKey || (variant.ver || ""),
        label: variant.ver || variantKey || "",
        date: toDate(variant.date || entry.date),
        downloads,
        dataDownloads: [],
        current: true,
        platform: null,
        software: null,
        repacker: null,
      }],
      links: {
        home: null,
        source: entry.source_url || null,
        repo: entry.repo || null,
        wiki: null,
        video: [],
      },
      titleSearch: [entry.name, entry.name_alt, ...(Array.isArray(entry.alias) ? entry.alias : entry.alias ? [entry.alias] : [])],
      authorSearch: [authorText(entry, "zh"), authorText(entry, "en")],
      raw: entry,
    };
  });
}

// ── Softendo / Buziol games ──────────────────────────────────

export function buildSoftendoRecords(entries, lan) {
  return entries.map((entry) => {
    const yearRange = getSoftendoYearRange(entry);
    const versions = (entry.ver || []).map((verRaw, index) => {
      const key = Object.keys(verRaw)[0];
      const ver = verRaw[key] || {};
      const downloads = [];
      if (ver.installer_url) {
        const toolbar = String(ver.installer_url).toLowerCase().includes("toolbar");
        downloads.push({
          label: `${lan === "zh" ? "安装版" : "Installer"}${toolbar ? (lan === "zh" ? "（含广告插件）" : " (with toolbar)") : ""}`,
          shortLabel: lan === "zh" ? "安装版" : "Installer",
          url: direct(ver.installer_url),
          code: null,
          dead: false,
          primary: true,
          kind: "installer",
          toolbar,
        });
      }
      for (const item of ver.portable_urls || []) {
        downloads.push({
          label: `${lan === "zh" ? "绿色版" : "Portable"}${item.label ? ` (${String(item.label).toUpperCase()})` : ""}`,
          shortLabel: lan === "zh" ? "绿色版" : "Portable",
          url: direct(item.url),
          code: null,
          dead: false,
          primary: !ver.installer_url,
          kind: "portable",
        });
      }
      for (const item of ver.selfextract_urls || []) {
        downloads.push({
          label: lan === "zh" ? "自解压" : "Self-extracting",
          shortLabel: lan === "zh" ? "自解压" : "Self-ex",
          url: direct(item.url),
          code: null,
          dead: false,
          primary: false,
          kind: "selfextract",
        });
      }
      return {
        verKey: key,
        label: key,
        year: ver.year || null,
        date: toDate(ver.date),
        downloads,
        dataDownloads: [],
        current: index === 0,
        platform: null,
        software: null,
        repacker: null,
      };
    });

    const current = versions[0] || { downloads: [] };
    const genres = entry.genre ? (Array.isArray(entry.genre) ? entry.genre : [entry.genre]) : [];
    const language = entry.language ? (Array.isArray(entry.language) ? entry.language : [entry.language]) : [];
    const image = getGameImageSync(entry, "softendo");

    return {
      id: `softendo::${getSoftendoGameName(entry)}`,
      kind: "softendo",
      name: getSoftendoGameName(entry),
      nameZh: getSoftendoGameName(entry),
      nameAlt: entry.alias && entry.alias.length ? entry.alias.join(", ") : null,
      author: getTypeLabel(entry.type),
      authors: [getTypeLabel(entry.type)],
      authorZh: getTypeLabel(entry.type),
      date: null,
      yearLabel: yearRange.display,
      latestYear: yearRange.latestYear,
      versionLabel: yearRange.display,
      versionCount: versions.length,
      region: null,
      platform: null,
      software: entry.software || null,
      softendoType: entry.type,
      tags: genres.map((genre) => ({ key: genre, label: getTagLabel(genre, lan) })),
      language,
      languageLabel: getLanguageLabel(entry.language, lan),
      image,
      images: image ? [image] : [],
      description: lan === "zh" ? (entry.description || entry.description_alt || null) : (entry.description_alt || entry.description || null),
      downloads: current.downloads,
      dataDownloads: [],
      versions,
      links: { home: null, source: null, repo: null, wiki: null, video: [] },
      titleSearch: [getSoftendoGameName(entry), ...(entry.alias || [])],
      authorSearch: [getSoftendoGameName(entry)],
      raw: entry,
    };
  });
}

// ── facet helpers ────────────────────────────────────────────

/**
 * Build a single-choice facet with per-option counts, so the sidebar can show
 * how many records each choice would leave.
 */
export function makeFacet({ key, label, options, getter }) {
  const counts = new Map();
  for (const record of options.records) {
    const value = getter(record);
    if (value == null) continue;
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }
  }
  return {
    key,
    label,
    options: options.list.map((option) => ({
      ...option,
      count: counts.get(option.value) || 0,
    })),
    test: (record, value) => {
      const recordValue = getter(record);
      if (Array.isArray(recordValue)) return recordValue.includes(value);
      return recordValue === value;
    },
  };
}

export function distinctValues(records, getter) {
  const set = new Set();
  for (const record of records) {
    const value = getter(record);
    if (value == null) continue;
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) set.add(item);
  }
  return Array.from(set);
}

export { slugify };
