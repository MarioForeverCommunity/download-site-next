import { getName, getAuthorList, getDownloadEntries, toResourceDirectUrl, getVideoDesc, getMwLevelFileUrl, processFileNamesWithVolumes } from "../GameUtil.js";
import { getAssetResourceURLs } from "../AssetUtil.js";
import { getSoftendoGameName, getSoftendoYearRange, getTypeLabel, getLanguageLabel, isKliktopiaRepackage } from "../SoftendoUtil.js";
import { getTagLabel } from "../TagUtil.js";
import { getGameImageSync, getShowcaseImagesSync } from "../ImageUtil.js";
import { getUseDirectLink } from "../Language.js";
import { downloadName } from "../../config.js";

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
    // Name the service from config.js's downloadName table rather than showing
    // a generic "网盘" for every mirror.
    const service = netdiskServiceName(item.url, lan);
    return {
      label: item.desc,
      shortLabel: service || shortNetdiskLabel(item.desc),
      service,
      url: item.url,
      code: item.code || null,
      dead,
      primary: false,
      kind: "netdisk",
    };
  });
}

// Resolve a URL to the human name of its hosting service (config.js downloadName).
export function netdiskServiceName(url, lan) {
  if (!url) return null;
  for (const entry of downloadName) {
    const domain = entry.domain;
    let matched;
    try {
      matched = typeof domain === "string" ? url.includes(domain) : domain.test(url);
    } catch (_e) {
      matched = false;
    }
    if (matched) {
      return lan === "zh" && entry.desc_zh ? entry.desc_zh : entry.desc_en;
    }
  }
  return null;
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

function cleanVersionLabel(value) {
  // A version written as "-" (or an em dash) in the YAML is a placeholder for
  // "no version", not a label; showing it as the version is confusing.
  if (value == null) return "";
  const text = String(value).trim();
  if (!text || text === "-" || text === "—" || text === "–") return "";
  return text;
}

function mfVersions(entry, lan) {
  const versions = Array.isArray(entry.ver) ? entry.ver : [];
  const mapped = versions.map((verRaw) => {
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
      label: cleanVersionLabel((lan === "en" && ver.ver_alt) ? ver.ver_alt : verKey),
      // What the UI may print. `verKey` stays the identity (used for switching
      // and for the id), but a version written as "-" has nothing to show.
      displayLabel: cleanVersionLabel((lan === "en" && ver.ver_alt) ? ver.ver_alt : verKey),
      date: toDate(ver.date),
      platform,
      software,
      // `old-versions/` is a URL path prefix applied by the link builder; the
      // filename shown to the reader must not include it.
      file: String(ver.file_name || "").replace(/^old-versions\//, ""),
      downloads,
      dataDownloads,
      repacker: ver.repacker || null,
      repackerAlt: ver.repacker_alt || null,
      current: ver.current === true,
      isApk: String(ver.file_name || "").toLowerCase().endsWith(".apk"),
      // Raw flag, resolved into `latest` below.
      explicitCurrent: ver.current === true,
    };
  });

  // "Latest" resolution, matching the legacy catalog:
  //  - any version explicitly marked `current: true` wins (several may be);
  //  - otherwise the newest date is the latest (first one on a tie), regardless
  //    of whether older versions carry `current: false` — that flag only opts a
  //    version out of being *explicitly* current, it does not suppress the
  //    date-based fallback. Without this, a catalog where every version is
  //    written as `current: false` would show no "latest" badge at all.
  const hasExplicit = mapped.some((v) => v.explicitCurrent);
  const latestKeys = new Set();

  if (hasExplicit) {
    for (const version of mapped) {
      if (version.explicitCurrent) latestKeys.add(version.verKey);
    }
  } else if (mapped.length > 0) {
    let maxTime = -Infinity;
    for (const version of mapped) {
      const time = version.date ? version.date.getTime() : -Infinity;
      if (time > maxTime) maxTime = time;
    }
    const first = mapped.find((version) => {
      const time = version.date ? version.date.getTime() : -Infinity;
      return time === maxTime;
    });
    if (first) latestKeys.add(first.verKey);
  }

  return mapped.map((version) => ({
    ...version,
    latest: latestKeys.has(version.verKey),
  }));
}

export function buildMfRecords(entries, lan) {
  return entries.map((entry) => {
    const versions = mfVersions(entry, lan);
    const currentVerStr = entry.currentVerStr || (versions[0] && versions[0].verKey) || "";
    // Prefer the resolved "latest" version as the one shown on the row.
    const current = versions.find((v) => v.latest)
      || versions.find((v) => v.verKey === currentVerStr)
      || versions[0] || null;
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
      // Filter inputs consider every version, not just the displayed one: a
      // fangame may ship a Linux build that is not its current version, and the
      // platform filter must still find it.
      platforms: Array.from(new Set(versions.map((v) => v.platform).filter(Boolean))),
      softwares: Array.from(new Set(versions.map((v) => v.software).filter(Boolean))),
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
    versionLabel: version.displayLabel || version.label,
    platform: version.platform,
    software: version.software,
    downloads: version.downloads,
    dataDownloads: version.dataDownloads,
    current: version,
    isLatestVersion: version.latest,
    expandedFrom: record,
    expandedIndex: index,
  }));
}

// ── Mario Worker levels ──────────────────────────────────────

export function buildMwRecords(entries) {
  const lan = "zh";
  return entries.map((entry) => {
    const names = authorNames(entry, lan);
    // The raw YAML usually has only `file_name`; the File Hub URL is derived
    // from it with the same helper the legacy page and the API script use.
    // Reading `file_urls` alone left most records without a download button.
    const fileNames = Array.isArray(entry.file_name)
      ? entry.file_name.filter((n) => n != null)
      : (entry.file_name ? [entry.file_name] : []);
    const displayNames = fileNames.length > 1
      ? processFileNamesWithVolumes(entry.file_name)
      : fileNames.map((name) => String(name).split("/").pop());

    const downloads = fileNames.map((fileName, index) => ({
      label: fileNames.length > 1
        ? `社区资源站 (${displayNames[index] || `#${index + 1}`})`
        : "社区资源站",
      shortLabel: fileNames.length > 1 ? `#${index + 1}` : "File Hub",
      url: direct(getMwLevelFileUrl(entry, fileName)),
      code: null,
      dead: false,
      primary: index === 0,
      kind: "filehub",
    }));

    // An explicit `file_url` overrides the derived link.
    if (entry.file_url) {
      downloads.unshift({
        label: "社区资源站",
        shortLabel: "File Hub",
        url: direct(entry.file_url),
        code: null,
        dead: false,
        primary: true,
        kind: "filehub",
      });
      downloads.forEach((d, i) => { d.primary = i === 0; });
    }

    const netdisk = [];
    if (entry.download_url) {
      const code = entry.code || null;
      const invalid = String(entry.download_url).startsWith("~");
      const url = invalid ? entry.download_url.slice(1) : entry.download_url;
      netdisk.push({
        label: `${netdiskServiceName(url, lan) || "网盘"}${code ? ` (提取码: ${code})` : ""}`,
        shortLabel: netdiskServiceName(url, lan) || "网盘",
        service: netdiskServiceName(url, lan),
        url,
        code,
        dead: invalid,
        primary: false,
        kind: "netdisk",
      });
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
    // Runtime flags use the legacy design's own badge colours so the same
    // record reads identically in both interfaces.
    if (entry.has_bundled_smwp) tags.push({ key: "mw", label: "专用 MW", tone: "mw" });
    if (entry.has_bgm) tags.push({ key: "bgm", label: "BGM", tone: "bgm" });

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
      versionLabel: cleanVersionLabel(entry.smwp_ver) || "",
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
        label: cleanVersionLabel(entry.smwp_ver) || "",
        displayLabel: cleanVersionLabel(entry.smwp_ver) || "",
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

// Assets are always expanded: one record per variant. Variants are separate
// downloadable builds (e.g. "Full" vs "Mod"), so collapsing them behind a
// picker hid most of the catalog behind one row.
export function buildAssetRecords(entries, lan) {
  const out = [];
  for (const entry of entries) {
    // Only an entry that actually declares `variants` has variant names. Every
    // asset has `ver` (the version), so testing `ver` would treat the version
    // string as a variant name — which is exactly the bug to avoid.
    const hasVariants = Array.isArray(entry.variants) && entry.variants.length > 0;

    if (!hasVariants) {
      out.push(buildAssetRecord(entry, entry.currentVer || {}, "", lan));
      continue;
    }

    for (const verRaw of entry.variants) {
      const verKey = Object.keys(verRaw)[0];
      const verObj = verRaw[verKey] || {};
      // Variant-level download fields inherit from the entry (the normalized
      // list already did this, but a raw YAML entry needs it too).
      const merged = {
        ...verObj,
        download_url: verObj.download_url ?? entry.download_url,
        download_url_alt: verObj.download_url_alt ?? entry.download_url_alt,
        code: verObj.code ?? entry.code,
        code_alt: verObj.code_alt ?? entry.code_alt,
        source_url: verObj.source_url ?? entry.source_url,
        source_url_alt: verObj.source_url_alt ?? entry.source_url_alt,
      };
      out.push(buildAssetRecord(entry, merged, verKey, lan));
    }
  }
  return out;
}

function buildAssetRecord(entry, variant, variantKey, lan) {
  const downloads = getAssetResourceURLs({ ...entry, currentVer: variant }, lan).map((item, index, arr) => ({
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
      label: `${netdiskServiceName(variant.download_url, lan) || "网盘"}${variant.code ? ` (提取码: ${variant.code})` : ""}`,
      shortLabel: netdiskServiceName(variant.download_url, lan) || "网盘",
      service: netdiskServiceName(variant.download_url, lan),
      url: variant.download_url,
      code: variant.code || null,
      dead: false,
      primary: false,
      kind: "netdisk",
    });
  }
  if (variant.download_url_alt) {
    downloads.push({
      label: `${netdiskServiceName(variant.download_url_alt, lan) || "备用网盘"}${variant.code_alt ? ` (提取码: ${variant.code_alt})` : ""}`,
      shortLabel: netdiskServiceName(variant.download_url_alt, lan) || "备用",
      service: netdiskServiceName(variant.download_url_alt, lan),
      url: variant.download_url_alt,
      code: variant.code_alt || null,
      dead: false,
      primary: false,
      kind: "netdisk",
    });
  }

  const image = entry.image ? `/data/assets/${entry.image}` : null;
  const variantLabel = variantKey
    ? ((lan === "en" && variant.variant_alt) ? variant.variant_alt : variantKey)
    : "";

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
    versionLabel: cleanVersionLabel(variant.ver) || variantLabel || "",
    variantLabel,
    versionCount: 1,
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
      label: cleanVersionLabel(variant.ver) || variantLabel || "",
      displayLabel: cleanVersionLabel(variant.ver) || variantLabel || "",
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
        // Colour follows the legacy modal's scheme (documented in
        // softendo-en.md): green exe, purple archive, red swf, turquoise
        // kliktopia repackage.
        const rawLabel = String(item.label || "").toLowerCase();
        const ext = String(item.url || "").split(".").pop().toLowerCase().split("?")[0];
        const match = (kw) => rawLabel === kw || rawLabel.startsWith(`${kw} `) || rawLabel.startsWith(`${kw}-`);
        // rar belongs with zip/7z: all three are archives and share a colour.
        const portableTone = isKliktopiaRepackage(key)
          ? "kliktopia"
          : (match("exe") || ext === "exe") ? "exe"
            : (match("swf") || ext === "swf") ? "swf"
              : (match("zip") || match("7z") || match("rar")
                || ext === "zip" || ext === "7z" || ext === "rar") ? "archive"
                : null;
        // A label that is only the word "portable" is dropped: the button
        // already says 绿色版 / Portable, so repeating it adds nothing.
        const formatHint = item.label && !/^portable$/i.test(String(item.label).trim())
          ? ` (${String(item.label).toUpperCase()})`
          : "";
        downloads.push({
          label: `${lan === "zh" ? "绿色版" : "Portable"}${formatHint}`,
          shortLabel: lan === "zh" ? "绿色版" : "Portable",
          url: direct(item.url),
          code: null,
          dead: false,
          primary: !ver.installer_url,
          kind: "portable",
          tone: portableTone,
        });
      }
      for (const item of ver.selfextract_urls || []) {
        downloads.push({
          label: lan === "zh" ? "自解压" : "Self-extracting",
          shortLabel: lan === "zh" ? "自解压" : "Self-ex",
          url: direct(item.url),
          code: null,
          dead: false,
          tone: "selfextract",
          primary: false,
          kind: "selfextract",
        });
      }
      return {
        verKey: key,
        label: key,
        displayLabel: key,
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
 *
 * `getter` may return an array when a record qualifies for several values (a
 * fangame can ship Windows and Linux builds). Pass `countFrom` when the count
 * must consider every version of a record rather than only the currently shown
 * one — otherwise a platform that only exists on a non-current version would
 * report 0 while the filter still matched it.
 */
export function makeFacet({ key, label, options, getter, countFrom, as, single }) {
  const counts = new Map();
  const countGetter = countFrom || getter;
  for (const record of options.records) {
    const value = countGetter(record);
    if (value == null) continue;
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      if (item == null) continue;
      counts.set(item, (counts.get(item) || 0) + 1);
    }
  }
  return {
    key,
    label,
    as,
    single,
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
