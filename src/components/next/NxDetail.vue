<script setup>
// Record detail drawer.
//
// Keeps the catalog visible behind it so records can be compared without losing
// place, and keeps the deep link cheap to maintain. The gallery restores what the
// first iteration dropped: the title image plus the full showcase slider, with
// pagination rendered in normal flow beneath the track instead of overlapping it.
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";
import MarkdownIt from "markdown-it";
import NxIcon from "./NxIcon.vue";
import NxGallery from "./NxGallery.vue";
import { formatIsoDate, softwareLabel, softendoSoftwareLabel, sourceServiceName, tiebaArchiveUrl } from "../../util/next/records.js";
import { getTagPillColor } from "../../util/TagUtil.js";
import { getFullTypeLabel } from "../../util/SoftendoUtil.js";
import { getAuthorFolderURL } from "../../util/GameUtil.js";
import { getDescriptionSync } from "../../util/ImageUtil.js";
import { batchFetchFileSizes } from "../../util/OpenListApi.js";
import { lockScroll, releaseScroll } from "../../util/next/scrollLock.js";
import { pushBackGuard } from "../../util/backGuard.js";
import { buildPageUrl } from "../../util/next/router.js";
import { dataLangOf, localeNeedsConversion, localizeText, prefersAltLinks, useI18n } from "../../i18n/index.js";
import { prepareConversion } from "../../i18n/convert.js";

const props = defineProps({
  record: {
    type: Object,
    default: null
  },
  // Interface locale (see src/i18n/locales/*).
  locale: {
    type: String,
    required: true
  },
  // A deep link that names one build (`<record id>::<verKey>`) opens the record
  // with that version already selected in the picker.
  versionKey: {
    type: String,
    default: null
  }
});

const emit = defineEmits(["close", "searchAuthor"]);

const { t, te } = useI18n(() => props.locale);

// Content language of the data behind this record (`zh` / `en`): the File Hub
// folder paths, the description files and the release-post ordering all follow
// the written language, not the interface language.
const contentLang = computed(() => dataLangOf(props.locale));

const lightbox = ref(null);
const activeVersion = ref(null);
// The legacy download modal tailored its help text to phones; the drawer keeps
// that split so a reader on a phone is not told to run an .exe.
const isMobile = ref(false);
function updateIsMobile() {
  isMobile.value = window.innerWidth <= 800;
}
// The legacy full-screen modal rendered a per-record description file
// (description.md / .txt from the data folder) on top of the YAML blurb. The
// drawer restores it: without it, records whose write-up lives in a file showed
// only a one-line summary.
const md = new MarkdownIt({ breaks: true, linkify: true, html: false });
const longDescription = ref("");
const longDescriptionHtml = computed(() => (longDescription.value ? md.render(longDescription.value) : ""));

async function loadLongDescription() {
  longDescription.value = "";
  const record = props.record;
  if (!record || !record.raw) return;
  const category = record.kind === "mw" ? "mw-levels" : "mf-games";
  if (record.kind !== "mf" && record.kind !== "mw") return;

  const url = getDescriptionSync(record.raw, category, contentLang.value);
  if (!url) return;

  // A Traditional Chinese interface has no authored description file for most
  // fangames: the source is description_zh.md, so convert that one text. MW
  // descriptions are left exactly as written.
  const convertForHant = record.kind === "mf" && localeNeedsConversion(props.locale);
  if (convertForHant) await prepareConversion(true);

  try {
    const response = await axios.get(url);
    const body = typeof response.data === "string" ? response.data : "";
    if (body && !body.trim().startsWith("<!DOCTYPE html>")) {
      longDescription.value = convertForHant ? localizeText(body, props.locale) : body;
    }
  } catch (_e) {
    longDescription.value = "";
  }
}

watch(() => props.record, () => {
  loadLongDescription();
}, { immediate: true });

// ── version picker ─────────────────────────────────────────
const theme = ref(document.documentElement.dataset.nxTheme || "light");

const isOpen = computed(() => props.record != null);

// Rows produced by expandMfRecord describe exactly one build: the drawer must
// then show that build only, instead of offering the other versions again.
const isExpandedVersion = computed(() => !!(props.record && props.record.expandedFrom));

const text = computed(() => ({
  screenshots: t("detail.screenshots"),
  about: t("detail.about"),
  details: t("detail.details"),
  tags: t("detail.tags"),
  versions: t("detail.versions"),
  data: t("detail.data"),
  runtime: t("detail.runtime"),
  links: t("detail.links"),
  videos: t("detail.videos"),
  author: t("detail.author"),
  authorWorks: t("detail.authorWorks"),
  authorFolder: t("detail.authorFolder"),
  region: t("detail.region"),
  madeWith: t("detail.madeWith"),
  platform: t("detail.platform"),
  released: t("detail.released"),
  updated: t("detail.updated"),
  type: t("detail.type"),
  series: t("detail.series"),
  nonMario: t("facet.nonMario"),
  language: t("detail.language"),
  years: t("detail.years"),
  variant: t("detail.variant"),
  date: t("detail.date"),
  mw: t("detail.mw"),
  chinese: t("region.chinese"),
  international: t("region.international"),
  latest: t("detail.latest"),
  repack: t("badge.repack"),
  code: t("detail.code"),
  codeCopyHint: t("detail.codeCopyHint"),
  copied: t("detail.copied"),
  codePassword: t("detail.codePassword"),
  codePasswordCopyHint: t("detail.codePasswordCopyHint"),
  codePasswordCopied: t("detail.codePasswordCopied"),
  requires: t("detail.requires"),
  bundled: t("detail.bundled"),
  playNote: t("detail.playNote"),
  downloadIt: t("detail.downloadIt"),
  bgmNote: t("detail.bgmNote"),
  musicPack: t("detail.musicPack"),
  source: t("detail.source"),
  sourceInvalid: t("detail.sourceInvalid"),
  homepage: t("detail.homepage"),
  repo: t("detail.repo"),
  wiki: t("detail.wiki"),
  download: t("detail.download"),
  share: t("detail.share"),
  shareCopied: t("detail.shareCopied"),
  esc: t("detail.esc"),
  collab: t("detail.collab"),
}));

// OS badge in the "versions & downloads" line: the brand glyph carries the
// platform, while the name stays available as the accessible label/tooltip.
const PLATFORM_ICONS = {
  Windows: "windows",
  Linux: "linux",
  macOS: "apple",
  Android: "android",
  J2ME: "java",
};

function platformIcon(platform) {
  return PLATFORM_ICONS[platform] || null;
}

// Yongshuo E-disk calls its extraction code an access password; the legacy
// download buttons already label it 密码 for these hosts. Mirror that for the
// drawer's code badges, tooltips and copied notice.
const YSEPAN_HOST = /(ysepan|ys168|ysupan)\.com/i;

function isYsepan(url) {
  return YSEPAN_HOST.test(String(url || ""));
}

function codeLabel(item) {
  return isYsepan(item.url) ? text.value.codePassword : text.value.code;
}

function codeCopyHint(item) {
  return isYsepan(item.url) ? text.value.codePasswordCopyHint : text.value.codeCopyHint;
}

watch([() => props.record, () => props.versionKey], ([next, versionKey]) => {
  const versions = next && next.versions ? next.versions : [];
  // A build named by the deep link wins over "latest", so a shared link opens
  // the panel it was copied from rather than the newest one.
  const requested = versionKey ? versions.find((v) => v.verKey === versionKey) : null;
  const current = next && next.expandedFrom && next.current
    ? next.current
    : (requested || versions.find((v) => v.latest) || versions[0] || null);
  activeVersion.value = current ? current.verKey : null;
  lightbox.value = null;  if (next) {
    requestAnimationFrame(() => {
      const body = document.querySelector(".nx-drawer-body");
      if (body) body.scrollTop = 0;
    });
  }
}, { immediate: true });

const version = computed(() => {
  const record = props.record;
  const versions = record && record.versions ? record.versions : [];
  if (versions.length === 0) return null;
  if (record.expandedFrom && record.current) return record.current;
  return versions.find((v) => v.verKey === activeVersion.value) || versions[0];
});

// ── MF play instructions ───────────────────────────────────
// The legacy download modal explained what to do with the file it handed out
// (its "?" tooltip). The drawer restores that text and follows the selected
// build. These instructions are authored in Simplified Chinese only, so the
// section is shown on the Simplified interface and hidden everywhere else — a
// Traditional Chinese (or English/Polish) drawer omits it rather than mixing two
// scripts or showing a half-translated block. `te()` alone is not enough: the
// locale fallback chain would still reach the Simplified messages.
const PLAY_NOTE_TYPES = ["installer", "exe", "apk", "apkMobile", "mobile", "macos", "linux", "archive"];

const hasPlayNotes = computed(() => (
  dataLangOf(props.locale) === "zh"
  && !localeNeedsConversion(props.locale)
  && te("detail.playNotes.installer")
));

function playNote(type) {
  const key = `detail.playNotes.${PLAY_NOTE_TYPES.includes(type) ? type : "archive"}`;
  const note = t(key);
  return note === key ? [] : note.split("\n").filter(Boolean);
}

// Same classification as the legacy modal's tooltip (MfGamesEntry.vue).
function playTypeOf(files, verKey) {
  const names = files.map((name) => String(name).toLowerCase());
  if (names.some((name) => name.includes("install") || name.includes("setup") || name.includes("安装"))) {
    return "installer";
  }
  if (names.some((name) => name.endsWith(".exe"))) return "exe";
  if (names.some((name) => name.endsWith(".apk"))) return "apk";
  const key = String(verKey || "").toLowerCase();
  if (key.includes("linux") || names.some((name) => name.includes("linux")
    || name.endsWith(".tar.xz") || name.endsWith(".tar.gz") || name.endsWith(".tgz"))) {
    return "linux";
  }
  if (key.includes("macos") || names.some((name) => name.includes("macos") || name.endsWith(".dmg"))) {
    return "macos";
  }
  return "archive";
}

const playNotes = computed(() => {
  if (!hasPlayNotes.value || !props.record || props.record.kind !== "mf") return [];
  const v = version.value;
  if (!v || !v.downloads || v.downloads.length === 0) return [];
  const files = (v.files || []).filter(Boolean);
  // Java builds (.jar) had no tooltip in the legacy design either.
  if (files.some((name) => String(name).toLowerCase().endsWith(".jar"))) return [];
  const type = playTypeOf(files, v.verKey);
  if (isMobile.value) return playNote(type === "apk" ? "apkMobile" : "mobile");
  return playNote(type);
});

// Gallery = title image first, then every showcase shot. The adapter already
// de-duplicates, so no further filtering is needed here. A non-expanded
// multi-version MF record brings `galleryImages` — every build's title screen
// newest to oldest, then the showcases — while expanded rows and other record
// kinds keep their own `images`.
const gallery = computed(() => {
  const record = props.record;
  if (!record) return [];
  return record.galleryImages || record.images || [];
});

const tagColors = computed(() => (props.record ? props.record.tags.map((tag) => ({
  ...tag,
  colors: getTagPillColor(tag, theme.value === "dark"),
})) : []));

// The legacy catalog linked an author's name to their folder on the File Hub,
// but only where such a folder exists: international MF works, Android builds
// and MW levels. The helper mirrors that decision by handing
// `getAuthorFolderURL` a minimal legacy-shaped item, so the folder rules stay in
// one place.
function authorFolderHref(record, lan) {
  const raw = (record && record.raw) || {};
  // MF display names are converted for zh-Hant; the File Hub folder is named
  // after the original author string, so use the raw one here.
  const author = (record.kind === "mf" && record.authorZh)
    || (record.authors && record.authors[0])
    || record.author || "";

  if (record.kind === "mw") {
    const folder = record.authors && record.authors.length > 1 ? "合作作品" : author;
    return getAuthorFolderURL({ category: "mw", smwp_ver: raw.smwp_ver, author: folder }, folder, lan);
  }
  if (record.kind !== "mf") return null;

  // Like the legacy modal, the Android branch follows the displayed build.
  const selected = version.value;
  const item = {
    type: raw.type,
    author_alias: raw.author_alias,
    // Only used as the "is this an Android build?" probe.
    currentVer: selected && selected.isApk
      ? { file_name: (selected.files && selected.files[0]) || "" }
      : null,
  };
  return getAuthorFolderURL(item, author, lan);
}

const facts = computed(() => {
  const record = props.record;
  if (!record) return [];
  const t = text.value;
  const rows = [];

  if (record.kind === "softendo") {
    // The YAML `type` is a slug (mff / flash …); the drawer shows the series'
    // formal name, matching the filter labels and card tooltip. "Non-Mario" is a
    // category rather than a name, so it follows the interface language.
    const series = record.softendoType || (record.raw && record.raw.type);
    const seriesLabel = series === "non-mario" ? t.nonMario : getFullTypeLabel(series);
    rows.push({ label: t.series, value: series ? seriesLabel : "" });
    // A game can list several makers (e.g. flash + mmf); each is shown by its
    // full name rather than the YAML slug.
    const softwareValues = Array.isArray(record.software) ? record.software : record.software ? [record.software] : [];
    rows.push({
      label: t.madeWith,
      value: softwareValues.map((item) => softendoSoftwareLabel(item, props.locale)).join(", "),
    });
    if (record.languageLabel) rows.push({ label: t.language, value: record.languageLabel });
    rows.push({ label: t.years, value: record.yearLabel });
    return rows;
  }

  if (record.kind === "asset") {
    rows.push({ label: t.author, value: record.author });
    rows.push({ label: t.type, value: record.assetTypeLabel });
    if (version.value && version.value.label) rows.push({ label: t.variant, value: version.value.label });
    if (record.date) rows.push({ label: t.date, value: formatIsoDate(record.date) });
    return rows;
  }

  // "See all their works" runs the author search; the File Hub folder, where one
  // exists, is offered as a second link. A multi-author MW level is labelled
  // 合作作品 throughout the catalog, so its link searches that label instead of
  // a single name (MF works keep the first author).
  const firstAuthor = (record.authors && record.authors[0]) || record.author;
  const isMwCollab = record.kind === "mw" && record.authors && record.authors.length > 1;
  rows.push({
    label: t.author,
    value: record.author,
    href: authorFolderHref(record, contentLang.value),
    authorQuery: record.kind === "mf" || record.kind === "mw"
      ? (isMwCollab ? text.value.collab : firstAuthor)
      : null,
  });
  if (record.kind === "mf") {
    const region = record.region === "chinese" ? t.chinese
      : record.region === "international" ? t.international : "—";
    rows.push({ label: t.region, value: region });
  }
  if (record.kind === "mw" && record.versionLabel) {
    rows.push({ label: t.mw, value: mwVersionLabel(record.versionLabel) });
  }
  if (record.software) {
    rows.push({ label: t.madeWith, value: softwareLabel(record.software, props.locale) });
  }
  // Every version's platform, not just the selected one: a fangame may ship a
  // Windows build for its current version and a Linux build for an older one.
  // An expanded row is a single build, so it states that build's platform only.
  const platforms = isExpandedVersion.value
    ? (record.platform ? [record.platform] : [])
    : ((record.platforms && record.platforms.length)
      ? record.platforms
      : (record.platform ? [record.platform] : []));
  if (platforms.length) {
    rows.push({ label: t.platform, value: platforms.join(" · ") });
  }
  if (record.date) {
    // A fangame's YAML date is the last time its entry/version was updated,
    // while an MW level's date is its release date. A row that lists one build
    // on its own shows that build's release date instead.
    const dateLabel = record.kind === "mw" || isExpandedVersion.value ? t.released : t.updated;
    rows.push({ label: dateLabel, value: formatIsoDate(record.date) });
  }
  return rows;
});

const hasDownloads = computed(() => {
  const v = version.value;
  if (!v) return false;
  return !!((v.downloads && v.downloads.length) || (v.dataDownloads && v.dataDownloads.length));
});

// The release posts are version-scoped, so they sit beside that version's
// download buttons rather than in the record-level links section. Both the
// primary and the alternate post are shown, the reader's language first:
// Chinese (Simplified or Traditional) leads with the primary post, every other
// locale — English, Polish and future ones — with the alternate post.
const versionSources = computed(() => {
  const v = version.value;
  if (!v) return [];
  const posts = prefersAltLinks(props.locale)
    ? [{ url: v.sourceAlt, invalid: v.sourceAltInvalid }, { url: v.source, invalid: v.sourceInvalid }]
    : [{ url: v.source, invalid: v.sourceInvalid }, { url: v.sourceAlt, invalid: v.sourceAltInvalid }];
  const seen = new Set();
  const links = [];
  for (const post of posts) {
    const url = post.url;
    if (!url || seen.has(url)) continue;
    seen.add(url);
    // Name the site the post lives on (config.js `sourceName`), as the download
    // buttons already do for their mirrors. The invalid tag joins that same
    // parenthesis instead of forming a second one: "发布页 (B 站, 已失效)".
    // The interface locale (not the content language) picks the name: the tables
    // can carry `desc_zh_hant`, and a Simplified name has to be converted.
    const service = sourceServiceName(url, props.locale);
    const name = text.value.source;
    const tag = post.invalid ? text.value.sourceInvalid : null;
    const detail = [service, tag].filter(Boolean).join(", ");
    const label = detail ? `${name} (${detail})` : name;
    links.push({ url, label, invalid: !!post.invalid, kind: "source" });

    // Older Tieba posts have an archive mirror; offer it alongside the post so
    // an invalid thread is still readable. A post already flagged invalid has
    // nothing left to back up, so it gets no archive button.
    const backup = post.invalid ? null : tiebaArchiveUrl(url);
    if (backup && !seen.has(backup)) {
      seen.add(backup);
      const backupService = sourceServiceName(backup, props.locale);
      const backupLabel = `${text.value.source} (${backupService || t("detail.sourceBackup")})`;
      links.push({ url: backup, label: backupLabel, invalid: false, kind: "backup" });
    }
  }
  return links;
});

// The whole "versions & downloads" block is pointless for a record with nothing
// to download — an asset that only links to a repository has no files here.
const showVersionsSection = computed(() => {
  const record = props.record;
  if (!record) return false;
  const versions = record.versions || [];
  if (versions.length === 0) return false;
  return versions.some((v) => (v.downloads && v.downloads.length) || (v.dataDownloads && v.dataDownloads.length) || v.source || v.sourceAlt);
});

// The "version" line is only meaningful when it carries information.
//  - mf-games: platform alone is worth showing, so the row stays;
//  - assets: an empty version row adds nothing, so it is hidden;
//  - mw-levels: the SMWP version is already stated in the runtime section, so
//    it must not be repeated here.
const showVersionName = computed(() => {
  const record = props.record;
  const v = version.value;
  if (!record || !v) return false;
  // An MW record's version is already stated in the drawer header and its
  // runtime block, so this line would render empty.
  if (record.kind === "mw") return false;
  if (v.label) return true;
  if (record.kind === "asset") return false;
  return !!v.platform;
});

// The MW runtime block already prints the SMWP version; suppress the duplicate.
const versionLineLabel = computed(() => {
  const v = version.value;
  if (!v) return "";
  if (props.record && props.record.kind === "mw") return "";
  return v.label || "";
});

// The runtime line names the editor: versions like "v1.7.12" get the "SMWP"
// prefix, while values that already start with "MW" (the old MW 4.0 / 4.4
// line) are left as written.
function mwVersionLabel(raw) {
  const text = String(raw || "").trim();
  if (!text) return "";
  return /^mw/i.test(text) ? text : `SMWP ${text}`;
}

const smwpDisplayVersion = computed(() => mwVersionLabel(props.record && props.record.smwpVersion));

const hasLinks = computed(() => {
  const links = props.record && props.record.links;
  if (!links) return false;
  return !!(links.home || links.repo || links.wiki);
});

// Data-package downloads of the selected version. They keep their own box in the
// drawer because a data package is a different thing from the level/game file.
const dataDownloads = computed(() => (version.value && version.value.dataDownloads) || []);

// ── download buttons ───────────────────────────────────────
// Softendo builds are colour-coded exactly as the legacy modal documents them
// (markdown/en/softendo.md): blue installer, orange installer-with-toolbar, green exe,
// purple archive, red swf, pink self-extracting, turquoise Kliktopia.
const TONE_CLASS = {
  exe: "is-tone-exe",
  archive: "is-tone-archive",
  swf: "is-tone-swf",
  kliktopia: "is-tone-kliktopia",
  selfextract: "is-tone-selfextract",
  installer: "is-tone-installer",
};

function downloadToneClass(item) {
  if (item.toolbar) return "is-tone-toolbar";
  if (item.tone && TONE_CLASS[item.tone]) return TONE_CLASS[item.tone];
  if (item.kind === "installer") return TONE_CLASS.installer;
  return "";
}

// Clicking a download that carries an extraction code copies it, so the drawer
// needs no separate copy button. The copy runs synchronously inside the click
// handler (clipboard access requires a user gesture) and falls back to a
// temporary selection when the async clipboard API is unavailable.
const copiedCode = ref("");
const copiedCodeIsPassword = ref(false);
let copiedTimer = null;

function writeClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
      return true;
    } catch (_e) {
      // fall through
    }
  }
  return legacyCopy(text);
}

function legacyCopy(text) {
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch (_e) {
    return false;
  }
}

function onDownloadClick(event, item) {
  if (!item.code) return;
  // Copy the code, then let the link open as usual. The copy must happen inside
  // the click handler's synchronous turn for the clipboard permission to hold.
  writeClipboard(item.code);
  copiedCode.value = item.code;
  copiedCodeIsPassword.value = isYsepan(item.url);
  if (copiedTimer) clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => { copiedCode.value = ""; }, 2400);
}

// ── share ──────────────────────────────────────────────────
// The shared address must name the catalog that owns the record, not the page
// the drawer happens to be open on: a documentation page embeds the same drawer
// through NxEntryPreview (see NxEntry.vue), and its own address cannot reopen
// the record. `design=next` is kept because only the redesigned catalog reads
// the `?id=` deep link — a recipient still on the legacy UI would otherwise land
// on a page where the drawer never opens.
const KIND_PAGE = {
  mf: "mf-games",
  mw: "mw-levels",
  asset: "assets",
  softendo: "softendo",
};

const shareHint = ref("");
let shareTimer = null;

function shareUrl() {
  const record = props.record;
  if (!record) return "";
  const pageId = KIND_PAGE[record.kind];
  if (!pageId) return "";
  return buildPageUrl(pageId, { design: "next", id: record.id });
}

function onShare() {
  const url = shareUrl();
  if (!url) return;
  writeClipboard(url);
  shareHint.value = text.value.shareCopied;
  if (shareTimer) clearTimeout(shareTimer);
  shareTimer = setTimeout(() => { shareHint.value = ""; }, 2400);
}

// A toast left over from the previous record must not greet the next one.
watch(() => props.record, () => { shareHint.value = ""; });

// ── file size (restored from the legacy modal) ─────────────
// Sizes of the selected version's downloads and data packages, keyed by URL
// (only the File Hub exposes a size; netdisk mirrors have no public metadata).
const downloadSizeMap = ref({});
const downloadSizeLoading = ref(false);
let downloadSizeRequest = 0;
const dataSizeMap = ref({});
const dataSizeLoading = ref(false);
let dataSizeRequest = 0;

async function fetchDownloadSizes(version) {
  downloadSizeMap.value = {};
  downloadSizeLoading.value = false;
  const urls = ((version && version.downloads) || [])
    .map((item) => item.url)
    .filter((url) => url && String(url).includes("file.marioforever.net"));
  if (urls.length === 0) return;

  const request = ++downloadSizeRequest;
  downloadSizeLoading.value = true;
  try {
    const sizes = await batchFetchFileSizes(urls);
    if (request === downloadSizeRequest) downloadSizeMap.value = sizes;
  } catch (_e) {
    // Silent: sizes are a nicety, not a prerequisite for downloading.
  } finally {
    if (request === downloadSizeRequest) downloadSizeLoading.value = false;
  }
}

async function fetchDataSizes(version) {
  dataSizeMap.value = {};
  dataSizeLoading.value = false;
  const urls = ((version && version.dataDownloads) || [])
    .map((item) => item.url)
    .filter((url) => url && String(url).includes("file.marioforever.net"));
  if (urls.length === 0) return;

  const request = ++dataSizeRequest;
  dataSizeLoading.value = true;
  try {
    const sizes = await batchFetchFileSizes(urls);
    if (request === dataSizeRequest) dataSizeMap.value = sizes;
  } catch (_e) {
    // Silent for the same reason as above.
  } finally {
    if (request === dataSizeRequest) dataSizeLoading.value = false;
  }
}

// Names and sizes are paired per file, so a multi-file build reads
// "file A 1 MB · file B 2 MB" instead of a list of names followed by a list of
// sizes whose order the reader has to work out.
function fileSizePairs(downloads, sizeMap, loading) {
  return (downloads || [])
    .filter((item) => item.file)
    .map((item) => ({
      key: `${item.url}::${item.file}`,
      name: item.file,
      size: loading ? "" : (sizeMap[item.url] || ""),
    }));
}

// Softendo builds have several differently-packaged links per version, so a
// per-file name/size line only added noise there; that catalogue omits it.
const versionFilePairs = computed(() => {
  if (props.record && props.record.kind === "softendo") return [];
  return fileSizePairs(
    version.value && version.value.downloads,
    downloadSizeMap.value,
    downloadSizeLoading.value,
  );
});

const dataFilePairs = computed(() => fileSizePairs(
  dataDownloads.value,
  dataSizeMap.value,
  dataSizeLoading.value,
));

// The meta line only exists when it has something to say; hiding an empty one
// keeps the download buttons from being pushed down.
const showVersionMeta = computed(() => {
  const v = version.value;
  if (!v) return false;
  const hasDate = props.record && props.record.kind !== "mw" && !!v.date;
  return !!(hasDate || versionFilePairs.value.length);
});

watch([() => props.record, activeVersion], () => {
  // Nothing asks for sizes on a Softendo record, so do not query them either.
  if (props.record && props.record.kind === "softendo") {
    downloadSizeMap.value = {};
    dataSizeMap.value = {};
    downloadSizeLoading.value = false;
    dataSizeLoading.value = false;
    return;
  }
  fetchDownloadSizes(version.value);
  fetchDataSizes(version.value);
}, { immediate: false });

function onKeydown(event) {
  if (event.key === "Escape") {
    if (lightbox.value) {
      lightbox.value = null;
      return;
    }
    emit("close");
  }
}

// The Android back button closes the drawer — or the image lightbox first, when
// one is open, so it behaves like Escape does here.
let releaseBack = null;

watch(isOpen, (open) => {
  lockScroll(open);
  if (open) {
    releaseBack = pushBackGuard(() => {
      if (lightbox.value) {
        lightbox.value = null;
        return;
      }
      emit("close");
    });
  } else if (releaseBack) {
    releaseBack();
    releaseBack = null;
  }
});

// Theme changes must recolour the tag chips while the drawer is open.
let themeObserver = null;

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
  updateIsMobile();
  window.addEventListener("resize", updateIsMobile);
  theme.value = document.documentElement.dataset.nxTheme || "light";
  themeObserver = new MutationObserver(() => {
    theme.value = document.documentElement.dataset.nxTheme || "light";
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-nx-theme"] });
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
  window.removeEventListener("resize", updateIsMobile);
  if (shareTimer) clearTimeout(shareTimer);
  if (releaseBack) releaseBack();
  releaseScroll();
  if (themeObserver) {
    themeObserver.disconnect();
    themeObserver = null;
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="nx-fade">
      <button
        v-if="isOpen"
        class="nx-scrim"
        type="button"
        :aria-label="text.esc"
        @click="emit('close')"
      />
    </Transition>

    <Transition name="nx-slide">
      <aside
        v-if="isOpen"
        class="nx-drawer"
        role="dialog"
        aria-modal="true"
        :aria-label="record.name"
      >
        <div class="nx-drawer-head">
          <div style="min-width: 0; flex: 1;">
            <div
              v-if="record.kind === 'asset' && record.assetTypeLabel"
              class="nx-section-label"
              style="margin-bottom: 3px;"
            >{{ record.assetTypeLabel }}</div>
            <h2 class="nx-drawer-title">{{ record.name }}</h2>
            <div class="nx-drawer-sub">
              <!-- A multi-author level is labelled 合作作品 here like it is in the
                   list; the facts section below still names every author. -->
              <span>{{ record.displayAuthor || record.author }}</span>
              <!-- A row listing one build at a time has no version picker below,
                   so the build it stands for is stated here. -->
              <template v-if="isExpandedVersion && record.versionLabel">
                <span>·</span>
                <span class="nx-num">{{ record.versionLabel }}</span>
              </template>
              <template v-if="record.date">
                <span>·</span>
                <span class="nx-num">{{ formatIsoDate(record.date) }}</span>
              </template>
              <template v-if="record.kind === 'softendo' && record.yearLabel">
                <span>·</span>
                <span class="nx-num">{{ record.yearLabel }}</span>
              </template>
            </div>
          </div>
          <div class="nx-head-actions">
            <!-- Share sits to the left of close: it copies the drawer's own deep
                 link, so the recipient lands on this record. -->
            <button
              class="nx-close"
              type="button"
              :aria-label="text.share"
              :title="text.share"
              @click="onShare"
            >
              <NxIcon
                name="share"
                :size="14"
              />
            </button>
            <button
              class="nx-close"
              type="button"
              :aria-label="text.esc"
              @click="emit('close')"
            >
              <NxIcon
                name="close"
                :size="15"
              />
            </button>
          </div>
        </div>

        <div class="nx-drawer-body">
          <!-- gallery: title image + showcase slider, pagination below -->
          <div
            v-if="gallery.length"
            class="nx-section"
          >
            <div class="nx-section-label">{{ text.screenshots }}</div>

            <!-- one shared gallery component, so the drawer, the entry cards
                 and the documentation pages cannot drift apart -->
            <NxGallery
              :images="gallery"
              :alt="record.name"
              :locale="locale"
              aspect-ratio="16 / 9"
              :autoplay="3000"
              @select="lightbox = $event"
            />
          </div>

          <!-- facts -->
          <div
            v-if="facts.length"
            class="nx-section"
          >
            <div class="nx-section-label">{{ text.details }}</div>
            <dl class="nx-facts">
              <template
                v-for="fact in facts"
                :key="fact.label"
              >
                <dt>{{ fact.label }}</dt>
                <dd>
                  {{ fact.value || "—" }}
                  <button
                    v-if="fact.authorQuery"
                    type="button"
                    class="nx-author-link"
                    @click="emit('searchAuthor', fact.authorQuery)"
                  >{{ text.authorWorks }}</button>
                  <a
                    v-if="fact.href"
                    class="nx-author-link"
                    :href="fact.href"
                    target="_blank"
                    rel="noopener"
                  >{{ text.authorFolder }}</a>
                </dd>
              </template>
            </dl>
          </div>

          <!-- tags: MW levels' badges (bundled MW / BGM) live in the runtime
               block instead, so the section is hidden for them -->
          <div
            v-if="tagColors.length && record.kind !== 'mw'"
            class="nx-section"
          >
            <div class="nx-section-label">{{ text.tags }}</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">
              <span
                v-for="tag in tagColors"
                :key="tag.key"
                class="nx-tag"
                :style="{ color: tag.colors.text, borderColor: tag.colors.border, background: tag.colors.bg }"
              >{{ tag.label }}</span>
            </div>
          </div>

          <!-- versions & downloads -->
          <div
            v-if="showVersionsSection"
            class="nx-section"
          >
            <div class="nx-section-label">{{ text.versions }}</div>

            <div
              v-if="record.versions.length > 1 && !isExpandedVersion"
              class="nx-picker"
            >
              <button
                v-for="v in record.versions"
                :key="v.verKey"
                type="button"
                class="nx-pick"
                :class="{ on: v.verKey === activeVersion }"
                @click="activeVersion = v.verKey"
              >
                {{ v.displayLabel || v.label }}
                <span
                  v-if="v.latest"
                  class="nx-pick-cur"
                >{{ text.latest }}</span>
              </button>
            </div>

            <div
              v-if="version"
              class="nx-versions"
            >
              <div class="nx-version">
                <div
                  v-if="showVersionName"
                  class="nx-version-name"
                >
                  <span v-if="versionLineLabel">{{ versionLineLabel }}</span>
                  <span
                    v-if="version.repacker"
                    class="nx-dot nx-dot-warn"
                  >{{ text.repack }}</span>
                  <span
                    v-if="version.platform"
                    class="nx-dot nx-dot-plain nx-platform-dot"
                    :title="version.platform"
                    :aria-label="version.platform"
                  >
                    <NxIcon
                      v-if="platformIcon(version.platform)"
                      :name="platformIcon(version.platform)"
                      :size="12"
                    />
                    <template v-else>{{ version.platform }}</template>
                  </span>
                </div>
                <div
                  v-if="showVersionMeta"
                  class="nx-version-meta"
                >
                  <!-- Values only: the position in the line already says what each
                       one is (date, file name, file size). An MW level has no date
                       here because the drawer header and runtime block carry it. -->
                  <span v-if="version.date && record.kind !== 'mw'">{{ formatIsoDate(version.date) }}</span>
                  <span
                    v-if="versionFilePairs.length"
                    class="nx-file-list"
                  >
                    <template
                      v-for="(item, index) in versionFilePairs"
                      :key="item.key"
                    >
                      <span
                        v-if="index > 0"
                        class="nx-file-sep"
                      >·</span>
                      <span class="nx-file-pair">
                        <span>{{ item.name }}</span>
                        <span
                          v-if="item.size"
                          class="nx-file-size"
                        >{{ item.size }}</span>
                      </span>
                    </template>
                  </span>
                </div>

                <div
                  v-if="hasDownloads || versionSources.length"
                  class="nx-dl-row"
                >
                  <!-- Each download is a link; when the target needs an
                       extraction code the code is copied on click, so no
                       separate copy button is needed. -->
                  <a
                    v-for="item in version.downloads"
                    :key="item.url + item.label"
                    class="nx-dl"
                    :class="[
                      downloadToneClass(item),
                      { 'is-primary': item.primary && !item.tone, 'is-invalid': item.invalid, 'is-warn': item.toolbar },
                    ]"
                    :href="item.url"
                    target="_blank"
                    rel="noopener"
                    :title="item.code ? `${codeCopyHint(item)}: ${item.code}` : item.label"
                    @click="onDownloadClick($event, item)"
                  >
                    <NxIcon
                      name="download"
                      :size="12"
                    />
                    {{ item.label }}
                    <span
                      v-if="item.code"
                      class="nx-dl-code-inline"
                    >{{ codeLabel(item) }} {{ item.code }}</span>
                  </a>
                  <!-- The release posts belong to this build, so they trail its
                       download buttons. -->
                  <a
                    v-for="link in versionSources"
                    :key="link.url"
                    class="nx-dl"
                    :class="{ 'is-source-invalid': link.invalid }"
                    :href="link.url"
                    target="_blank"
                    rel="noopener"
                  >
                    <NxIcon
                      name="link"
                      :size="12"
                    />
                    <span class="nx-dl-label">{{ link.label }}</span>
                  </a>
                </div>

                <div
                  v-if="copiedCode"
                  class="nx-code-row"
                >
                  <span class="nx-code-label">{{ copiedCodeIsPassword ? text.codePassword : text.code }}</span>
                  <span class="nx-code">{{ copiedCode }}</span>
                  <span style="font-size:10.5px;color:var(--nx-cur);">{{ copiedCodeIsPassword ? text.codePasswordCopied : text.copied }}</span>
                </div>

                <!-- Legacy download-modal help (Chinese only): what to do with
                     the selected build's file once it is on disk. -->
                <div
                  v-if="playNotes.length"
                  class="nx-play-note"
                >
                  <div
                    class="nx-section-label"
                    style="margin-bottom: 3px;"
                  >{{ text.playNote }}</div>
                  <p>{{ playNotes.join("\n") }}</p>
                </div>
              </div>

              <!-- The data package shares the work's download frame, but keeps
                   its own name/size line so the two are not confused. -->
              <div
                v-if="dataDownloads.length"
                class="nx-version"
              >
                <div
                  v-if="dataDownloads.length"
                  class="nx-version-meta"
                >
                  <span class="nx-data-line">
                    <span class="nx-meta-key">{{ text.data }}</span>
                    <span
                      v-if="dataFilePairs.length"
                      class="nx-file-list"
                    >
                      <template
                        v-for="(item, index) in dataFilePairs"
                        :key="item.key"
                      >
                        <span
                          v-if="index > 0"
                          class="nx-file-sep"
                        >·</span>
                        <span class="nx-file-pair">
                          <span>{{ item.name }}</span>
                          <span
                            v-if="item.size"
                            class="nx-file-size"
                          >{{ item.size }}</span>
                        </span>
                      </template>
                    </span>
                  </span>
                </div>
                <div class="nx-dl-row">
                  <a
                    v-for="item in dataDownloads"
                    :key="`data-${item.url}`"
                    class="nx-dl"
                    :class="{
                      'is-primary': item.kind === 'filehub' && !item.tone,
                      'is-invalid': item.invalid,
                    }"
                    :href="item.url"
                    target="_blank"
                    rel="noopener"
                    :title="item.code ? `${codeCopyHint(item)}: ${item.code}` : item.label"
                    @click="onDownloadClick($event, item)"
                  >
                    <NxIcon
                      name="download"
                      :size="12"
                    />
                    {{ item.label }}
                    <span
                      v-if="item.code"
                      class="nx-dl-code-inline"
                    >{{ codeLabel(item) }} {{ item.code }}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- MW runtime note -->
          <div
            v-if="record.kind === 'mw' && record.smwpVersion"
            class="nx-section"
          >
            <div class="nx-section-label">{{ text.runtime }}</div>
            <p style="font-size:12.5px;line-height:1.6;color:var(--nx-ink-2);">
              {{ record.bundled ? text.bundled : text.requires }} {{ smwpDisplayVersion }}
            </p>
            <div
              v-if="record.smwpUrl || record.smwpDataUrl"
              class="nx-dl-row"
            >
              <a
                v-if="record.smwpUrl"
                class="nx-dl"
                :href="record.smwpUrl"
                target="_blank"
                rel="noopener"
                :title="text.downloadIt"
              >
                <NxIcon
                  name="download"
                  :size="12"
                />
                {{ smwpDisplayVersion }}
              </a>
              <a
                v-if="record.smwpDataUrl"
                class="nx-dl"
                :href="record.smwpDataUrl"
                target="_blank"
                rel="noopener"
              >
                <NxIcon
                  name="download"
                  :size="12"
                />
                {{ text.musicPack }}
              </a>
            </div>
            <!-- The BGM warning is about the level itself, so it follows the
                 SMWP downloads instead of reading as one of them. -->
            <p
              v-if="record.hasBgm"
              style="font-size:12px;line-height:1.6;color:var(--nx-muted);margin-top:6px;"
            >{{ text.bgmNote }}</p>
          </div>

          <!-- links -->
          <div
            v-if="hasLinks"
            class="nx-section"
          >
            <div class="nx-section-label">{{ text.links }}</div>
            <div class="nx-dl-row" style="margin-top:0;">
              <a
                v-if="record.links.home"
                class="nx-dl"
                :href="record.links.home"
                target="_blank"
                rel="noopener"
              >
                <NxIcon
                  name="home"
                  :size="12"
                />
                {{ text.homepage }}
              </a>
              <a
                v-if="record.links.repo"
                class="nx-dl"
                :href="record.links.repo"
                target="_blank"
                rel="noopener"
              >
                <NxIcon
                  name="github"
                  :size="12"
                />
                {{ text.repo }}
              </a>
              <a
                v-if="record.links.wiki"
                class="nx-dl"
                :href="record.links.wiki"
                target="_blank"
                rel="noopener"
              >
                <NxIcon
                  name="wiki"
                  :size="12"
                />
                {{ text.wiki }}
              </a>
            </div>
          </div>

          <!-- videos -->
          <div
            v-if="record.links && record.links.video && record.links.video.length"
            class="nx-section"
          >
            <div class="nx-section-label">{{ text.videos }}</div>
            <ul style="display:grid;gap:5px;">
              <li
                v-for="video in record.links.video"
                :key="video.url"
                style="display:flex;align-items:center;gap:7px;font-size:12px;"
              >
                <NxIcon
                  name="video"
                  :size="12"
                />
                <a
                  :href="video.url"
                  target="_blank"
                  rel="noopener"
                  style="color:var(--nx-accent);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
                >{{ video.title }}</a>
                <span style="color:var(--nx-faint);font-size:10.5px;">{{ video.site }}</span>
              </li>
            </ul>
          </div>

          <!-- The write-up goes last: a long description would otherwise push
               the downloads and facts below the fold of the drawer. -->
          <div
            v-if="record.description || longDescriptionHtml"
            class="nx-section"
          >
            <div class="nx-section-label">{{ text.about }}</div>
            <p
              v-if="record.description"
              style="font-size:12.5px;line-height:1.65;color:var(--nx-ink-2);white-space:pre-wrap;overflow-wrap:break-word;"
            >
              {{ record.description }}
            </p>
            <div
              v-if="longDescriptionHtml"
              class="nx-detail-md"
              v-html="longDescriptionHtml"
            />
          </div>
        </div>
      </aside>
    </Transition>

    <Transition name="nx-fade">
      <button
        v-if="lightbox"
        class="nx-lightbox"
        type="button"
        @click="lightbox = null"
      >
        <img
          :src="lightbox"
          alt=""
        />
      </button>
    </Transition>

    <!-- Outside the drawer so its overflow cannot clip the popup. -->
    <Transition name="nx-fade">
      <div
        v-if="shareHint"
        class="nx-share-toast"
        role="status"
      >
        <NxIcon
          name="check"
          :size="13"
        />
        {{ shareHint }}
      </div>
    </Transition>
  </Teleport>
</template>
