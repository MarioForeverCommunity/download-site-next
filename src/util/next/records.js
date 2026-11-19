import { getName, getAuthorList, getDownloadEntries, toResourceDirectUrl, getVideoDesc, getMwLevelFileUrl, processFileNamesWithVolumes, detectPlatform } from "../GameUtil.js";
import { getAssetResourceURLs } from "../AssetUtil.js";
import { getSoftendoGameName, getSoftendoYearRange, getTypeLabel, getLanguageLabel, isKliktopiaRepackage } from "../SoftendoUtil.js";
import { getTagLabel } from "../TagUtil.js";
import { getGameImageSync, getShowcaseImagesSync } from "../ImageUtil.js";
import { getUseDirectLink } from "../Language.js";
import { downloadName, sourceName } from "../../config.js";
import { dataLangOf, localizedField, localizeText, prefersAltLinks, tFor } from "../../i18n/index.js";

// ── locale handling ──────────────────────────────────────────
// The builders take an interface locale (`zh-Hans`, `zh-Hant`, `en`, `pl`, …).
// Two different things are derived from it:
//
//  - `contentLangOf()` — the language the YAML data and the File Hub paths are
//    written in. Every legacy helper (GameUtil / AssetUtil / SoftendoUtil) speaks
//    that smaller `zh` / `en` vocabulary, so it is what they receive.
//  - `tr()` — the interface strings (download-button labels, service names),
//    which come from the i18n catalogues and therefore follow the visitor's
//    language, Traditional Chinese included.
//
// Link variants follow `prefersAltLinks()`: Chinese (Simplified *and*
// Traditional, which read the same data) leads with the primary link, every
// other locale — English, Polish, future ones — with the alternate link.
function contentLangOf(locale) {
  return dataLangOf(locale);
}

// Kept as the inverse of `prefersAltLinks()` so the two can never disagree.
function isContentZh(locale) {
  return !prefersAltLinks(locale);
}

function tr(locale, key, params) {
  return tFor(locale, key, params);
}

// Search indexes keep their original values (so selection, deep links and
// identity never change) and additionally carry a Traditional Chinese variant.
// `localizeText()` is a no-op for every locale without opencc, so other
// languages neither pay for nor see this.
function searchValues(values, locale) {
  const result = values.filter((value) => typeof value === "string" && value);
  for (const value of result.slice()) {
    const converted = localizeText(value, locale);
    if (converted && converted !== value && !result.includes(converted)) result.push(converted);
  }
  return result;
}

// Tags are data (`Single Level`, `Horror`, …) with a translation entry per
// locale (`tag.single_level`). An unknown tag keeps the legacy dictionary and
// finally the raw value, so a new YAML tag never renders as a message key.
function tagLabel(tag, locale) {
  const slug = String(tag || "").toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (slug) {
    const key = `tag.${slug}`;
    const label = tr(locale, key);
    if (label !== key) return label;
  }
  return getTagLabel(tag, contentLangOf(locale));
}

// ── shared helpers ────────────────────────────────────────────
// The redesigned pages read the same YAML as the legacy pages, so platform and
// software detection must stay identical to `src/pages/mf-games/MfGames.vue`.
// Platform rules live in GameUtil.js (`detectPlatform`) and are shared by both
// designs; software detection below is the redesigned counterpart.

export { detectPlatform };

export function detectSoftware(entry, verObj) {
  if (verObj && verObj.software) return verObj.software;
  if (entry && entry.software) return entry.software;
  return "mmf";
}

const SOFTWARE_KEYS = ["mmf", "godot", "gamemaker", "flash", "klik", "other"];
const ASSET_TYPE_KEYS = ["engine", "addon", "effect", "sprite", "tool", "mwtool"];

/**
 * Display name of a "made with" software slug (`mmf`, `godot`, …).
 *
 * @param {string} software
 * @param {string} locale - interface locale
 */
export function softwareLabel(software, locale) {
  if (!software) return "";
  return SOFTWARE_KEYS.includes(software)
    ? tr(locale, `software.${software}`)
    : String(software);
}

/**
 * Display name of an asset type slug (`engine`, `addon`, …).
 *
 * @param {string} type
 * @param {string} locale - interface locale
 */
export function assetTypeLabel(type, locale) {
  if (!type) return "";
  return ASSET_TYPE_KEYS.includes(type)
    ? tr(locale, `assetType.${type}`)
    : String(type);
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
  // `author` / `author_alt` are YAML data, so the content language decides which
  // one is displayed — not the interface language.
  const list = getAuthorList(entry, contentLangOf(lan));
  if (list == null) return [];
  return Array.isArray(list) ? list.slice() : [list];
}

function authorText(entry, lan) {
  return authorNames(entry, lan).join(", ");
}

function netdiskDownloads(record, lan) {
  const entries = getDownloadEntries(record, contentLangOf(lan));
  return entries.map((item) => {
    // GameUtil builds the suffix with ASCII parentheses ("已失效"), so accept
    // both bracket widths in case a hand-written desc uses full-width ones.
    const invalid = /[(（](已失效|Invalid|暂无法访问|Temporarily Unavailable)[)）]/.test(item.desc || "");
    // Name the service from config.js's downloadName table rather than showing
    // a generic "网盘" for every mirror.
    const entry = matchDownloadEntry(item.url);
    const service = entry ? siteNameOf(entry, lan) : null;
    return {
      label: netdiskLabel(item.desc, entry, lan),
      shortLabel: service || shortNetdiskLabel(item.desc),
      service,
      url: item.url,
      code: item.code || null,
      invalid,
      primary: false,
      kind: "netdisk",
    };
  });
}

// The full label of a netdisk button.
//
// `getDownloadInfo()` in GameUtil prints the *raw* table name — `desc_zh` for any
// Chinese content language, `desc_en` otherwise — and appends status markers
// ("(提取码: …)", "(已失效)", …). The extraction code is stripped before display,
// so what is left is the service name plus an optional marker. Rebuild it from the
// localized name from config.js's `desc_zh_hant` / `desc_en`; no character
// conversion is involved. Unknown services keep the hostname GameUtil produced.
function netdiskLabel(desc, entry, lan) {
  const text = withoutCode(desc);
  if (!entry) return text;
  const raw = isContentZh(lan) && entry.desc_zh ? entry.desc_zh : entry.desc_en;
  const name = siteNameOf(entry, lan) || raw;
  const marker = raw && text.startsWith(raw) ? text.slice(raw.length) : "";
  return `${name}${marker}`;
}

// Name of a site listed in config.js's `sourceName` / `downloadName` tables.
// The tables carry a hand-written name per language (`desc_zh`, `desc_zh_hant`,
// `desc_en`); `localizedField()` walks the locale's field chain and returns the
// authored value verbatim.
function siteNameOf(entry, lan) {
  return localizedField(entry, "desc", lan) || "";
}

// The config.js `downloadName` row matching a URL, or null for an unknown host.
function matchDownloadEntry(url) {
  if (!url) return null;
  for (const entry of downloadName) {
    const domain = entry.domain;
    let matched;
    try {
      matched = typeof domain === "string" ? url.includes(domain) : domain.test(url);
    } catch (_e) {
      matched = false;
    }
    if (matched) return entry;
  }
  return null;
}

// Resolve a URL to the human name of its hosting service (config.js downloadName).
export function netdiskServiceName(url, lan) {
  const entry = matchDownloadEntry(url);
  return entry ? siteNameOf(entry, lan) : null;
}

// Same lookup for a release post, using config.js's `sourceName` table.
export function sourceServiceName(url, lan) {
  if (!url) return null;
  for (const entry of sourceName) {
    const domain = entry.domain;
    let matched;
    try {
      matched = typeof domain === "string" ? url.includes(domain) : domain.test(url);
    } catch (_e) {
      matched = false;
    }
    if (matched) {
      return siteNameOf(entry, lan);
    }
  }
  return null;
}

// Sources missing from config.js's `sourceName` table are grouped into one
// bucket instead of surfacing a bare hostname per site.
const OTHER_SOURCE_KEY = "other";

// A release post's site as a filter value. The key is the English service name
// so a facet selection survives a language switch; `sourceSiteLabel` turns it
// back into a label.
function sourceSite(url) {
  if (!url) return null;
  const value = String(url);
  for (const entry of sourceName) {
    const domain = entry.domain;
    let matched;
    try {
      matched = typeof domain === "string" ? value.includes(domain) : domain.test(value);
    } catch (_e) {
      matched = false;
    }
    if (matched) return entry.desc_en || entry.desc_zh || OTHER_SOURCE_KEY;
  }
  return OTHER_SOURCE_KEY;
}

// Deduplicate the sites of a build's primary and alternate release posts.
function sourceSites(urls) {
  const keys = [];
  for (const url of urls) {
    const key = sourceSite(url);
    if (key && !keys.includes(key)) keys.push(key);
  }
  return keys;
}

export function sourceSiteLabel(key, lan) {
  if (!key) return "";
  if (key === OTHER_SOURCE_KEY) return tr(lan, "facet.other");
  const entry = sourceName.find((item) => (item.desc_en || item.desc_zh) === key);
  if (!entry) return key;
  return siteNameOf(entry, lan) || key;
}

// Options for the release-source facet: only the sites present in the catalog,
// sorted by their English service name (the language-independent key) with the
// "other" bucket last, named in the current language.
export function sourceFacetOptions(records, lan) {
  const keys = new Set();
  for (const record of records) {
    for (const key of record.sources || []) keys.add(key);
  }
  return Array.from(keys)
    .sort((a, b) => {
      if (a === OTHER_SOURCE_KEY) return 1;
      if (b === OTHER_SOURCE_KEY) return -1;
      return a.localeCompare(b, "en", { sensitivity: "base" });
    })
    .map((key) => ({ value: key, label: sourceSiteLabel(key, lan) }));
}

// Tieba threads at or below this id are no longer reachable on the original
// site; the legacy design offers an archive link for them. Keep the threshold
// in sync with GameCard.vue / GameLine.vue / AssetCard.vue.
const TIEBA_ARCHIVE_MAX_POST_ID = 6856592056;

// Release posts may carry the site-wide `~` invalid-link prefix. The list
// normalizers (useMfList / useMwList) strip it and store the flag as
// `source_url_invalid`, so callers pass that flag in; the prefix check stays
// for lists that keep the raw value (assets). Either way the URL is clean and
// the flag is exposed for the drawer to annotate the button.
function releasePost(rawUrl, invalidFlag = false) {
  if (!rawUrl) return { url: null, backup: null, invalid: false };
  const prefixed = String(rawUrl).startsWith("~");
  const invalid = prefixed || invalidFlag === true;
  const url = prefixed ? String(rawUrl).substring(1) : String(rawUrl);
  return { url, backup: tiebaArchiveUrl(url), invalid };
}

// Older Tieba posts have a mirror on archive.marioforever.net. Returns null for
// non-Tieba URLs and for posts newer than the archive cut-off.
export function tiebaArchiveUrl(url) {
  if (!url || !String(url).includes("tieba.baidu.com/p/")) return null;
  const match = String(url).match(/\/p\/(\d+)/);
  if (!match) return null;
  const postId = parseInt(match[1], 10);
  if (!Number.isFinite(postId) || postId > TIEBA_ARCHIVE_MAX_POST_ID) return null;
  return `https://archive.marioforever.net/post/${match[1]}`;
}

// Fall back to the URL's own host, so a mirror missing from config.js still
// names where the file comes from.
function urlHostname(url) {
  try {
    return new URL(url).hostname;
  } catch (_e) {
    return null;
  }
}

// The last path segment of a link built from a known file name (assets and
// Softendo use their own base paths, so this is the file name itself).
function fileNameFromUrl(url) {
  if (!url) return "";
  try {
    const path = decodeURIComponent(new URL(url).pathname);
    return path.split("/").filter(Boolean).pop() || "";
  } catch (_e) {
    return "";
  }
}

function shortNetdiskLabel(desc) {
  if (!desc) return "";
  return desc.replace(/\s*\((提取码|密码|Code|已失效|Invalid|暂无法访问|Temporarily Unavailable)[^)]*\)/g, "").trim();
}

// A download label must not repeat its extraction code: the detail drawer prints
// the code in its own badge (and copies it on click), so a suffix here showed the
// same code twice on one button.
function withoutCode(desc) {
  if (!desc) return "";
  return desc.replace(/\s*\((提取码|密码|Code)\s*[:：][^)]*\)/g, "").trim();
}

// The title image must be first in the gallery (it is the recognisable image),
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

// A multi-version record that is not expanded still opens as one drawer, and
// that drawer shows the screenshots of every build: all version title screens
// first (newest → oldest), then the shared showcase shots. Images that repeat
// across builds — a game with one title file reused by every version — are kept
// once, so the gallery does not fill with duplicates.
function collectAllVersionImages(entry, versions) {
  const probes = [...versions]
    .sort((a, b) => {
      const at = a.date ? a.date.getTime() : -Infinity;
      const bt = b.date ? b.date.getTime() : -Infinity;
      return bt - at;
    })
    .map((version) => ({ ...entry, currentVerStr: version.verKey }));

  const images = [];
  const seen = new Set();
  const push = (url) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    images.push(url);
  };

  // Title screens first, newest build to oldest.
  for (const probe of probes) push(getGameImageSync(probe, "mf-games"));
  for (const probe of probes) {
    for (const item of getShowcaseImagesSync(probe, "mf-games")) push(item.url);
  }
  return images;
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
    const fileKey = isContentZh(lan) ? "file_url_zh" : "file_url_en";
    const dataKey = isContentZh(lan) ? "data_file_url_zh" : "data_file_url_en";
    const downloads = [];
    // Each File Hub button carries the file it points at, so the drawer can pair
    // every file name with its own size.
    const fileNames = (Array.isArray(ver.file_name) ? ver.file_name : ver.file_name ? [ver.file_name] : [])
      .filter(Boolean)
      .map((name) => String(name).replace(/^old-versions\//, ""));
    const dataFileNames = (Array.isArray(ver.data_file_name) ? ver.data_file_name : ver.data_file_name ? [ver.data_file_name] : [])
      .filter(Boolean)
      .map((name) => String(name).replace(/^old-versions\//, ""));

    if (ver[fileKey]) {
      downloads.push({
        label: tr(lan, "download.filehub"),
        shortLabel: "File Hub",
        file: fileNames[0] || "",
        url: direct(ver[fileKey]),
        code: null,
        invalid: false,
        primary: true,
        kind: "filehub",
      });
    }

    const probe = { ...entry, currentVer: ver, currentVerStr: verKey };
    downloads.push(...netdiskDownloads(probe, lan));

    const dataDownloads = [];
    if (ver[dataKey]) {
      dataDownloads.push({
        label: tr(lan, "download.filehub"),
        shortLabel: "File Hub",
        file: dataFileNames[0] || "",
        url: direct(ver[dataKey]),
        code: null,
        invalid: false,
        primary: true,
        kind: "filehub",
      });
    }
    if (ver.data_download_url) {
      // The link's label is its hosting service, like the download buttons: the
      // "data package" context comes from the section it sits in.
      const service = netdiskServiceName(ver.data_download_url, lan) || urlHostname(ver.data_download_url);
      dataDownloads.push({
        label: service || tr(lan, "download.netdiskData"),
        shortLabel: service || tr(lan, "download.netdisk"),
        service,
        url: ver.data_download_url,
        code: ver.data_code || null,
        invalid: false,
        primary: false,
        kind: "netdisk",
      });
    }

    // Version text is a display label: convert it for a Traditional interface.
    // `verKey` itself stays untouched, so picker selection, deep links and row
    // ids keep using the original value.
    const versionText = localizeText((!isContentZh(lan) && ver.ver_alt) ? ver.ver_alt : verKey, lan);
    return {
      verKey,
      label: cleanVersionLabel(versionText),
      // What the UI may print. `verKey` stays the identity (used for switching
      // and for the id), but a version written as "-" has nothing to show.
      displayLabel: cleanVersionLabel(versionText),
      date: toDate(ver.date),
      platform,
      software,
      // The release post belongs to the build, not the entry: each version may
      // point at its own thread. Both the primary and the alternate post are
      // kept, so the drawer can list them in the reader's language order.
      // Normalization already stripped the `~` prefix and recorded the flag in
      // `source_url_invalid`, so it must be passed on here.
      source: releasePost(ver.source_url, ver.source_url_invalid).url,
      sourceAlt: releasePost(ver.source_url_alt, ver.source_url_invalid_alt).url,
      sourceInvalid: releasePost(ver.source_url, ver.source_url_invalid).invalid,
      sourceAltInvalid: releasePost(ver.source_url_alt, ver.source_url_invalid_alt).invalid,
      // Release-source facet values: one entry per site this build's posts live on.
      sources: sourceSites([ver.source_url, ver.source_url_alt]),
      // `old-versions/` is a URL path prefix applied by the link builder; the
      // file names shown to the reader must not include it.
      files: fileNames,
      dataFiles: dataFileNames,
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
    // Display names are converted for zh-Hant; `authorZh` and `authorSearch`
    // below stay in the original script so search and the File Hub author-folder
    // URL still address the real folder.
    const names = authorNames(entry, lan).map((name) => localizeText(name, lan));
    const rawNames = authorNames(entry, "zh");
    // Region (`chinese` / `international`) is deliberately not part of the id:
    // a work has exactly one region, so it never distinguishes two records.
    const id = `mf::${entry.game}::${rawNames.join("|")}`;

    const { image, images } = collectImages(entry, "mf-games", current ? current.verKey : currentVerStr);

    // `localizedField` walks the locale's own field chain, so `_zh_hans` /
    // `_ja` descriptions (once they exist) win over the generic fallbacks.
    // A Traditional Chinese interface has no authored title/description for most
    // fangames, so these two fields go through opencc (the only catalog fields
    // that do) — search fields below deliberately stay in the original script.
    const description = localizeText(localizedField(entry, "description", lan) || "", lan) || null;

    const tagKeys = entry.tag ? (Array.isArray(entry.tag) ? entry.tag : [entry.tag]) : [];
    const tags = tagKeys.map((tag) => ({ key: tag, label: tagLabel(tag, lan) }));

    return {
      id,
      kind: "mf",
      name: localizeText(getName(entry, contentLangOf(lan)), lan),
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
      // Release-source filter values also span every version, matching the
      // platform/software facets above.
      sources: Array.from(new Set(versions.flatMap((v) => v.sources || []))),
      tags,
      image,
      images,
      // The detail drawer of a non-expanded multi-version record shows every
      // build's screenshots; everywhere else keeps using `images`.
      galleryImages: versions.length > 1 ? collectAllVersionImages(entry, versions) : images,
      description,
      downloads: current ? current.downloads : [],
      dataDownloads: current ? current.dataDownloads : [],
      versions,
      links: {
        home: localizedField(entry, "homepage", lan) || null,
        // Both release posts are exposed raw; the list row picks one by
        // language and skips invalid posts itself.
        source: releasePost(entry.currentVer && entry.currentVer.source_url, entry.currentVer && entry.currentVer.source_url_invalid).url,
        sourceAlt: releasePost(entry.currentVer && entry.currentVer.source_url_alt, entry.currentVer && entry.currentVer.source_url_invalid_alt).url,
        sourceInvalid: !!(entry.currentVer && entry.currentVer.source_url_invalid),
        sourceAltInvalid: !!(entry.currentVer && entry.currentVer.source_url_invalid_alt),
        repo: (current && current.repo) || entry.repo || null,
        wiki: (isContentZh(lan) ? entry.wiki_zh_url : entry.wiki_en_url) || entry.wiki_zh_url || null,
        video: collectVideos(entry, lan),
      },
      // Filenames are searchable, matching the legacy filter behaviour. A build
      // exposes `files` (an array — one file per volume), not a single `file`.
      titleSearch: searchValues([entry.game, entry.game_alt,
        ...(Array.isArray(entry.alias) ? entry.alias : entry.alias ? [entry.alias] : [])], lan),
      // File names are matched exactly (no typo tolerance), like the legacy list.
      fileSearch: versions.flatMap((version) => version.files || []),
      authorSearch: searchValues([authorText(entry, "zh"), authorText(entry, "en")], lan),
      raw: entry,
    };
  });
}

function collectVideos(entry, lan) {
  const list = isContentZh(lan) ? (entry.video_zh || entry.video) : (entry.video_en || entry.video);
  if (!list) return [];
  return list.map((item) => {
    // The YAML key is the video's own name, written in Simplified Chinese: it is
    // a display label, so convert it for a Traditional interface. The URL is
    // keyed by the raw name and must not change.
    const rawKey = Object.keys(item)[0];
    const url = item[rawKey];
    // The site name is chrome, not data: pass the interface locale so a
    // Traditional Chinese page reads `desc_zh_hant` instead of Simplified.
    return { title: localizeText(rawKey, lan), url, site: getVideoDesc(url, lan) };
  });
}

// Expand a multi-version record into one record per version.
export function expandMfRecord(record) {
  if (!record || record.versions.length <= 1) return [record];
  return record.versions.map((version, index) => {
    // Each row represents one build, so it prefers that build's own title
    // screenshot (`title_<version>.*`); collectImages falls back to the shared
    // title when the image folder has no version-specific file.
    const { image, images } = collectImages(record.raw, "mf-games", version.verKey);
    return {
      ...record,
      id: `${record.id}::${version.verKey}`,
      date: version.date,
      versionLabel: version.displayLabel || version.label,
      platform: version.platform,
      software: version.software,
      // An expanded row is a single build, so the faceted values must be that
      // build's too. Keeping the record-wide union made a Windows filter match
      // the Linux row of the same game (and vice versa) once versions were
      // listed separately.
      platforms: version.platform ? [version.platform] : [],
      softwares: version.software ? [version.software] : [],
      sources: version.sources || [],
      downloads: version.downloads,
      dataDownloads: version.dataDownloads,
      // The release post is version-scoped, so the row's link icon must point at
      // this build's thread instead of the record's first version.
      links: {
        ...record.links,
        source: version.source || null,
        sourceAlt: version.sourceAlt || null,
        sourceInvalid: version.sourceInvalid === true,
        sourceAltInvalid: version.sourceAltInvalid === true,
      },
      image,
      images,
      // A row produced by "expand all versions" is one build: its drawer must
      // not inherit the record-wide gallery of every version.
      galleryImages: images,
      current: version,
      isLatestVersion: version.latest,
      // Every version now has its own row, so the "N versions" badge would only
      // repeat what the rest of the list already shows.
      versionCount: 1,
      expandedFrom: record,
      expandedIndex: index,
    };
  });
}

// ── Mario Worker levels ──────────────────────────────────────

/**
 * Mario Worker level records.
 *
 * @param {object[]} entries - normalized list-mw.yaml
 * @param {string} [locale] - interface locale; the catalog itself is Chinese
 */
export function buildMwRecords(entries, locale = "zh-Hans") {
  const lan = locale;
  const tr2 = (key, params) => tr(lan, key, params);
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
        ? `${tr2("download.filehub")} (${displayNames[index] || `#${index + 1}`})`
        : tr2("download.filehub"),
      shortLabel: fileNames.length > 1 ? `#${index + 1}` : "File Hub",
      file: String(fileName).split("/").pop(),
      url: direct(getMwLevelFileUrl(entry, fileName)),
      code: null,
      invalid: false,
      primary: index === 0,
      kind: "filehub",
    }));

    // An explicit `file_url` overrides the derived link.
    if (entry.file_url) {
      downloads.unshift({
        label: tr2("download.filehub"),
        shortLabel: "File Hub",
        url: direct(entry.file_url),
        code: null,
        invalid: false,
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
        label: netdiskServiceName(url, lan) || tr2("download.netdisk"),
        shortLabel: netdiskServiceName(url, lan) || tr2("download.netdisk"),
        service: netdiskServiceName(url, lan),
        url,
        code,
        invalid,
        primary: false,
        kind: "netdisk",
      });
    }

    const dataFileNames = (Array.isArray(entry.data_file_name) ? entry.data_file_name : entry.data_file_name ? [entry.data_file_name] : [])
      .filter(Boolean)
      .map((name) => String(name).split("/").pop());

    const dataDownloads = (entry.data_file_urls || []).map((item, index) => ({
      label: item.name,
      shortLabel: entry.data_file_urls.length > 1 ? `#${index + 1}` : "File Hub",
      file: dataFileNames[index] || "",
      url: direct(item.url),
      code: null,
      invalid: false,
      primary: index === 0,
      kind: "filehub",
    }));
    if (entry.currentVer && entry.currentVer.data_download_url) {
      // Same as the MF builder: name the hosting service instead of a generic
      // "netdisk data" label.
      const service = netdiskServiceName(entry.currentVer.data_download_url, lan) || urlHostname(entry.currentVer.data_download_url);
      dataDownloads.push({
        label: service || tr2("download.netdiskData"),
        shortLabel: service || tr2("download.netdisk"),
        service,
        url: entry.currentVer.data_download_url,
        code: entry.currentVer.data_code || null,
        invalid: false,
        primary: false,
        kind: "netdisk",
      });
    }

    const { image, images } = collectImages(entry, "mw-levels");

    const tags = [];
    // Runtime flags use the legacy design's own badge colours so the same
    // record reads identically in both interfaces.
    if (entry.has_bundled_smwp) tags.push({ key: "mw", label: tr2("tag.bundled_mw"), tone: "mw" });
    if (entry.has_bgm) tags.push({ key: "bgm", label: "BGM", tone: "bgm" });

    const allDownloads = [...downloads, ...netdisk];
    const sources = sourceSites([
      entry.currentVer && entry.currentVer.source_url,
      entry.currentVer && entry.currentVer.source_url_alt,
    ]);

    return {
      id: `mw::${entry.game}::${names.join("|")}`,
      kind: "mw",
      name: entry.game,
      nameZh: entry.game,
      nameAlt: entry.game_alt || null,
      author: names.join(", "),
      authors: names,
      // Lists and cards show one label for a multi-author level (the legacy
      // design did the same); the details drawer still lists every author.
      displayAuthor: names.length > 1 ? tr2("detail.collab") : names.join(", "),
      authorZh: names.join(", "),
      date: toDate(entry.date),
      versionLabel: cleanVersionLabel(entry.smwp_ver) || "",
      versionCount: 1,
      region: null,
      platform: null,
      software: null,
      sources,
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
        // MW records have no date/version line in the drawer, but do show the
        // level's own file name(s) and the data package's file name(s).
        files: fileNames.map((name) => String(name).split("/").pop()),
        dataFiles: dataFileNames,
        downloads: allDownloads,
        dataDownloads,
        source: releasePost(entry.currentVer && entry.currentVer.source_url, entry.currentVer && entry.currentVer.source_url_invalid).url,
        sourceAlt: releasePost(entry.currentVer && entry.currentVer.source_url_alt).url,
        sourceInvalid: releasePost(entry.currentVer && entry.currentVer.source_url, entry.currentVer && entry.currentVer.source_url_invalid).invalid,
        sourceAltInvalid: releasePost(entry.currentVer && entry.currentVer.source_url_alt).invalid,
        current: true,
        platform: null,
        software: null,
        sources,
        repacker: null,
      }],
      links: {
        home: entry.homepage || null,
        source: releasePost(entry.currentVer && entry.currentVer.source_url, entry.currentVer && entry.currentVer.source_url_invalid).url,
        sourceAlt: releasePost(entry.currentVer && entry.currentVer.source_url_alt).url,
        sourceInvalid: releasePost(entry.currentVer && entry.currentVer.source_url, entry.currentVer && entry.currentVer.source_url_invalid).invalid,
        sourceAltInvalid: releasePost(entry.currentVer && entry.currentVer.source_url_alt).invalid,
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
      // `file_name` may be a list (multi-file / multi-volume builds), so each
      // name is indexed on its own instead of being stringified as one value.
      titleSearch: [entry.game, entry.game_alt, ...(Array.isArray(entry.alias) ? entry.alias : entry.alias ? [entry.alias] : [])],
      // File names are matched exactly (no typo tolerance), like the legacy list.
      fileSearch: Array.isArray(entry.file_name) ? entry.file_name : entry.file_name ? [entry.file_name] : [],
      // Multi-author levels are labelled 合作作品 everywhere in the UI, so the
      // author search accepts that label in addition to the names themselves.
      authorSearch: names.length > 1
        ? [authorText(entry, "zh"), tr2("detail.collab")]
        : [authorText(entry, "zh")],
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
  // One file name per File Hub link, so the drawer can pair each name with its
  // own size just like the game catalogs do.
  const assetFileNames = (Array.isArray(variant.file_name) ? variant.file_name : variant.file_name ? [variant.file_name] : [])
    .filter((name) => name != null)
    .map((name) => String(name).split("/").pop());
  // The File Hub button names itself from the interface locale, so a Traditional
  // visitor reads "社群資源網站" rather than GameUtil's Simplified base name.
  const downloads = getAssetResourceURLs(
    { ...entry, currentVer: variant }, contentLangOf(lan), tr(lan, "download.filehub"),
  ).map((item, index, arr) => ({
    label: item.name,
    shortLabel: arr.length > 1 ? `#${index + 1}` : "File Hub",
    file: assetFileNames[index] || fileNameFromUrl(item.url),
    url: direct(item.url),
    code: null,
    invalid: false,
    primary: index === 0,
    kind: "filehub",
  }));

  if (variant.download_url) {
    downloads.push({
      label: netdiskServiceName(variant.download_url, lan) || tr(lan, "download.netdisk"),
      shortLabel: netdiskServiceName(variant.download_url, lan) || tr(lan, "download.netdisk"),
      service: netdiskServiceName(variant.download_url, lan),
      url: variant.download_url,
      code: variant.code || null,
      invalid: false,
      primary: false,
      kind: "netdisk",
    });
  }
  if (variant.download_url_alt) {
    downloads.push({
      label: netdiskServiceName(variant.download_url_alt, lan) || tr(lan, "download.netdiskAlt"),
      shortLabel: netdiskServiceName(variant.download_url_alt, lan) || tr(lan, "download.netdiskAltShort"),
      service: netdiskServiceName(variant.download_url_alt, lan),
      url: variant.download_url_alt,
      code: variant.code_alt || null,
      invalid: false,
      primary: false,
      kind: "netdisk",
    });
  }

  const image = entry.image ? `/data/assets/${entry.image}` : null;
  // Display-only fields: convert the Simplified source for a Traditional
  // interface, while `variantKey` / `id` below keep the original identity.
  const variantLabel = localizeText(variantKey
    ? ((!isContentZh(lan) && variant.variant_alt) ? variant.variant_alt : variantKey)
    : "", lan);
  const versionText = localizeText(cleanVersionLabel(variant.ver), lan);
  const versionLabel = versionText || variantLabel;
  const displayAuthors = authorNames(entry, lan).map((name) => localizeText(name, lan));

  return {
    // A variant name repeats across versions (Rainbow Engine ships "含开始页"
    // for 0.10.7.1, 0.10.7.0 and 0.10.6.1), so the version is part of the
    // record identity. Without it those rows share one id, and a deep link can
    // only ever open the first of them.
    id: `asset::${entry.name}::${variantKey}::${cleanVersionLabel(variant.ver)}`,
    kind: "asset",
    name: localizeText(getName(entry, contentLangOf(lan)), lan),
    nameZh: entry.name,
    nameAlt: entry.name_alt || null,
    author: displayAuthors.join(", "),
    authors: displayAuthors,
    // Raw author strings stay for search / folder URLs (see the MF builder).
    authorZh: authorText(entry, "zh"),
    date: toDate(variant.date || entry.date),
    versionLabel,
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
    description: localizeText(localizedField(entry, "description", lan) || "", lan) || null,
    downloads,
    dataDownloads: [],
    versions: [{
      verKey: variantKey || (variant.ver || ""),
      label: versionLabel,
      displayLabel: versionLabel,
      date: toDate(variant.date || entry.date),
      downloads,
      dataDownloads: [],
      source: releasePost(variant.source_url).url,
      sourceAlt: releasePost(variant.source_url_alt).url,
      sourceInvalid: releasePost(variant.source_url).invalid,
      sourceAltInvalid: releasePost(variant.source_url_alt).invalid,
      current: true,
      platform: null,
      software: null,
      repacker: null,
    }],
    links: {
      home: null,
      source: releasePost(entry.source_url).url,
      sourceAlt: releasePost(entry.source_url_alt).url,
      sourceInvalid: releasePost(entry.source_url).invalid,
      sourceAltInvalid: releasePost(entry.source_url_alt).invalid,
      repo: entry.repo || null,
      wiki: null,
      video: [],
    },
    titleSearch: [entry.name, entry.name_alt, ...(Array.isArray(entry.alias) ? entry.alias : entry.alias ? [entry.alias] : [])],
    // Variant file names: exact matching only, like the legacy assets page.
    fileSearch: assetFileNames,
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
          label: `${tr(lan, "download.installer")}${toolbar ? tr(lan, "download.installerToolbar") : ""}`,
          shortLabel: tr(lan, "download.installer"),
          file: fileNameFromUrl(ver.installer_url),
          url: direct(ver.installer_url),
          code: null,
          invalid: false,
          primary: true,
          kind: "installer",
          toolbar,
        });
      }
      for (const item of ver.portable_urls || []) {
        // Colour follows the legacy modal's scheme (documented in
        // markdown/en/softendo.md): green exe, purple archive, red swf, turquoise
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
          label: `${tr(lan, "download.portable")}${formatHint}`,
          shortLabel: tr(lan, "download.portable"),
          file: fileNameFromUrl(item.url),
          url: direct(item.url),
          code: null,
          invalid: false,
          primary: !ver.installer_url,
          kind: "portable",
          tone: portableTone,
        });
      }
      for (const item of ver.selfextract_urls || []) {
        downloads.push({
          label: tr(lan, "download.selfextract"),
          shortLabel: tr(lan, "download.selfextractShort"),
          file: fileNameFromUrl(item.url),
          url: direct(item.url),
          code: null,
          invalid: false,
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
        source: null,
        sourceAlt: null,
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
    // "Non-Mario" describes a category, so it follows the interface language;
    // the other series names (Mario, MFF, Flash, Banesoft) are proper nouns and
    // stay as they are.
    const typeLabel = entry.type === "non-mario"
      ? tr(lan, "facet.nonMario")
      : getTypeLabel(entry.type);

    return {
      id: `softendo::${getSoftendoGameName(entry)}`,
      kind: "softendo",
      name: getSoftendoGameName(entry),
      nameZh: getSoftendoGameName(entry),
      // `alias` holds abbreviations (e.g. "MFBP") used only by search; showing
      // one under the title would read as a second, competing name.
      nameAlt: null,
      author: typeLabel,
      authors: [typeLabel],
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
      tags: genres.map((genre) => ({ key: genre, label: tagLabel(genre, lan) })),
      language,
      languageLabel: getLanguageLabel(entry.language, lan),
      image,
      images: image ? [image] : [],
      description: localizedField(entry, "description", lan) || null,
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
