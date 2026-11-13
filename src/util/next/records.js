import { getName, getAuthorList, getStrFromList, getDownloadEntries, getMfFileUrl, toResourceDirectUrl, getVideoDesc } from "../GameUtil.js";
import { getAssetResourceURLs } from "../AssetUtil.js";
import { getSoftendoGameName, getSoftwareLabel, getSoftendoYearRange, getTypeLabel, getLanguageLabel } from "../SoftendoUtil.js";
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

function slug(value) {
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

// ── Mario Forever fangames ───────────────────────────────────

function mfVersionRecords(entry, lan) {
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
    const versions = mfVersionRecords(entry, lan);
    const currentVerStr = entry.currentVerStr || (versions[0] && versions[0].verKey) || "";
    const current = versions.find((v) => v.verKey === currentVerStr) || versions[0] || null;
    const names = authorNames(entry, lan);
    const rawNames = authorNames(entry, "zh");
    const id = `mf::${entry.game}::${rawNames.join("|")}::${(entry.type || "")}`;

    // Artwork is best-effort: the index resolves to null until it has loaded, and
    // the row falls back to the empty-thumbnail treatment rather than blocking.
    const probe = { ...entry, currentVerStr: current ? current.verKey : currentVerStr };
    const image = getGameImageSync(probe, "mf-games");
    const images = getShowcaseImagesSync(probe, "mf-games").map((item) => item.url);

    const description = lan === "zh"
      ? (entry.description_zh || entry.description || null)
      : (entry.description_en || entry.description_alt || entry.description || null);

    const tags = (entry.tag ? (Array.isArray(entry.tag) ? entry.tag : [entry.tag]) : []).map((tag) => ({
      key: tag,
      label: getTagLabel(tag, lan),
    }));

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
      searchText: [entry.game, entry.game_alt, authorText(entry, "zh"), authorText(entry, "en"), (entry.alias || []).join(" "), (entry.tag || []).join(" ")]
        .filter(Boolean).join(" "),
      raw: entry,
      current,
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

// Expand a multi-version record into one record per version, mirroring the
// legacy "expand all versions" switch.
export function expandMfRecord(record) {
  if (!record || record.versions.length <= 1) return [record];
  return record.versions.map((version, index) => ({
    ...record,
    id: `${record.id}::${version.verKey}`,
    date: version.date,
    versionLabel: version.label,
    versionCount: record.versions.length,
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
      const probe = { ...entry, currentVer: entry.currentVer };
      netdisk.push(...netdiskDownloads(probe, lan));
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
        label: lan === "zh" ? "网盘数据包" : "Netdisk data",
        shortLabel: lan === "zh" ? "网盘" : "Netdisk",
        url: entry.currentVer.data_download_url,
        code: entry.currentVer.data_code || null,
        dead: false,
        primary: false,
        kind: "netdisk",
      });
    }

    const image = getGameImageSync(entry, "mw-levels");
    const images = getShowcaseImagesSync(entry, "mw-levels").map((item) => item.url);

    const tags = [];
    if (entry.has_bundled_smwp) tags.push({ key: "BundledMW", label: "专用 MW" });
    if (entry.has_bgm) tags.push({ key: "BGM", label: "BGM" });

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
      downloads: [...downloads, ...netdisk],
      dataDownloads,
      versions: [{
        verKey: entry.smwp_ver || "",
        label: entry.smwp_ver || "",
        date: toDate(entry.date),
        downloads: [...downloads, ...netdisk],
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
      searchText: [entry.game, entry.game_alt, authorText(entry, "zh"), (entry.alias || []).join(" "), entry.file_name]
        .filter(Boolean).join(" "),
      raw: entry,
    };
  });
}

// ── Creation assets ──────────────────────────────────────────

export function buildAssetRecords(entries, lan) {
  return entries.map((entry) => {
    const variant = entry.currentVer || {};
    const variantKey = entry.currentVerStr || "";    const downloads = getAssetResourceURLs(entry, lan).map((item, index, arr) => ({
      label: item.name,
      shortLabel: arr.length > 1 ? `#${index + 1}` : "File Hub",
      url: direct(item.url),
      code: null,
      dead: false,
      primary: index === 0,
      kind: "filehub",
    }));

    const netdisk = [];
    if (variant.download_url) {
      netdisk.push({
        label: `${lan === "zh" ? "网盘" : "Netdisk"}${variant.code ? ` (${lan === "zh" ? "提取码" : "Code"}: ${variant.code})` : ""}`,
        shortLabel: lan === "zh" ? "网盘" : "Netdisk",
        url: variant.download_url,
        code: variant.code || null,
        dead: false,
        primary: false,
        kind: "netdisk",
      });
    }
    if (variant.download_url_alt) {
      netdisk.push({
        label: `${lan === "zh" ? "备用网盘" : "Mirror"}${variant.code_alt ? ` (${lan === "zh" ? "提取码" : "Code"}: ${variant.code_alt})` : ""}`,
        shortLabel: lan === "zh" ? "备用" : "Mirror",
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
      tags: [],
      image,
      images: image ? [image] : [],
      description: lan === "en" ? (entry.description_alt || entry.description || null) : (entry.description || null),
      downloads: [...downloads, ...netdisk],
      dataDownloads: [],
      variants: (entry.ver || []).map((verRaw) => {
        const key = Object.keys(verRaw)[0];
        const obj = verRaw[key] || {};
        return { key, label: (lan === "en" && obj.variant_alt) ? obj.variant_alt : key, ver: obj.ver || "", date: toDate(obj.date) };
      }),
      links: {
        home: null,
        source: entry.source_url || null,
        repo: entry.repo || null,
        wiki: null,
        video: [],
      },
      searchText: [entry.name, entry.name_alt, authorText(entry, "zh"), authorText(entry, "en"), (entry.alias || []).join(" "), entry.description, entry.description_alt]
        .filter(Boolean).join(" "),
      raw: entry,
    };
  });
}

// ── Softendo / Buziol games ──────────────────────────────────

export function buildSoftendoRecords(entries, lan) {
  return entries.map((entry) => {
    const yearRange = getSoftendoYearRange(entry);
    const image = getGameImageSync(entry, "softendo");
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
        current: index === 0,
        platform: null,
        software: null,
        repacker: null,
      };
    });

    const current = versions[0] || { downloads: [] };
    const genres = entry.genre ? (Array.isArray(entry.genre) ? entry.genre : [entry.genre]) : [];
    const language = entry.language ? (Array.isArray(entry.language) ? entry.language : [entry.language]) : [];

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
      searchText: [getSoftendoGameName(entry), (entry.alias || []).join(" "), getTypeLabel(entry.type), genres.join(" "),
        Array.isArray(getSoftwareLabel(entry.software)) ? getSoftwareLabel(entry.software).join(" ") : getSoftwareLabel(entry.software)]
        .filter(Boolean).join(" "),
      raw: entry,
    };
  });
}

// ── facet option builders ────────────────────────────────────
export function distinctOptions(records, getter, labeler = (v) => v) {
  const seen = new Map();
  for (const record of records) {
    const value = getter(record);
    if (!value) continue;
    if (!seen.has(value)) seen.set(value, labeler(value));
  }
  return Array.from(seen.entries())
    .sort((a, b) => String(a[1]).localeCompare(String(b[1])))
    .map(([value, label]) => ({ value, label }));
}

export function yearOptions(records) {
  const years = new Set();
  for (const record of records) {
    if (!record.date) continue;
    years.add(record.date.getFullYear());
  }
  return Array.from(years)
    .sort((a, b) => b - a)
    .map((year) => ({ value: String(year), label: String(year) }));
}

export function slugForRecord(record) {
  const names = record.authors && record.authors.length ? record.authors.join("-") : record.author;
  return `${slug(record.name)}-${slug(names)}`;
}

export { getMfFileUrl, getStrFromList };
