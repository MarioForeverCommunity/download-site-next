// "Last updated" dates for the documentation and catalog pages.
//
// Same source as the legacy pages: the newest commit touching each tracked file
// is read from the GitHub commits API, and the newest of a page's files is what
// gets shown. The request is rate-limited (it answers 403 when unauthenticated
// and busy); a failed request yields no date, which hides the line — the legacy
// pages behaved the same way.
//
// The dates used to be baked in at build time, but the data files are deployed
// without rebuilding the site, so a build-time stamp went stale until the next
// build. Fetching at runtime keeps the line honest, matching the legacy design.
import axios from "axios";

const COMMITS_API = "https://api.github.com/repos/MarioForeverCommunity/download-site-next/commits";

// One page visit can ask for several files (the home page tracks five), and an
// unauthenticated GitHub client only gets 60 requests an hour. Cache the answers
// for a short while so navigating between pages does not re-ask for the same
// file, and so a burst of 403s is not retried on every navigation either.
const CACHE_TTL = 30 * 60 * 1000;
const CACHE_PREFIX = "docUpdated:";

function readCache(path) {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + path);
    if (!raw) return undefined;
    const { value, at } = JSON.parse(raw);
    if (typeof at !== "number" || Date.now() - at > CACHE_TTL) return undefined;
    return value;
  } catch (_e) {
    return undefined;
  }
}

function writeCache(path, value) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + path, JSON.stringify({ value, at: Date.now() }));
  } catch (_e) {
    // Private mode / disabled storage: fall back to asking again next time.
  }
}

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const pad = (v) => String(v).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// Commit date of the newest commit touching `path`, or null on failure.
function fetchCommitDate(path) {
  const cached = readCache(path);
  if (cached !== undefined) return Promise.resolve(cached);
  return axios
    .get(`${COMMITS_API}?path=${encodeURIComponent(path)}&page=1&per_page=1`)
    .then((response) => {
      const value = response.data[0] ? response.data[0].commit.committer.date : null;
      writeCache(path, value);
      return value;
    })
    .catch(() => {
      writeCache(path, null);
      return null;
    });
}

// Newest of several ISO stamps, formatted for display.
function newest(dates) {
  const valid = dates
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()));
  if (valid.length === 0) return null;
  return formatDate(new Date(Math.max(...valid)));
}

async function newestOf(paths) {
  return newest(await Promise.all(paths.map(fetchCommitDate)));
}

// The original-MF index reports per language/document, because each write-up is
// edited independently. The key is the interface locale so the page can pass the
// right stamp straight to the document it has chosen.
export async function getMfDocLastUpdated() {
  const [data, zh, zhHant, en, pl] = await Promise.all([
    fetchCommitDate("public/data/list-original-mf.yaml"),
    fetchCommitDate("src/markdown/mf-zh.md"),
    fetchCommitDate("src/markdown/mf-zh-hant.md"),
    fetchCommitDate("src/markdown/mf-en.md"),
    fetchCommitDate("src/markdown/mf-pl.md"),
  ]);
  return {
    zh: newest([data, zh]),
    "zh-Hant": newest([data, zhHant]),
    en: newest([data, en]),
    pl: newest([data, pl]),
  };
}

// The Mario Worker write-ups are edited independently, so each language gets its
// own stamp (the key is the interface locale, including the dedicated zh-Hant
// document). No cross-language fallback: a missing stamp hides the line.
export async function getMwDocLastUpdated() {
  const [en, pl, zhHant] = await Promise.all([
    fetchCommitDate("src/markdown/mw-en.md"),
    fetchCommitDate("src/markdown/mw-pl.md"),
    fetchCommitDate("src/markdown/mw-zh-hant.md"),
  ]);
  return { en: newest([en]), pl: newest([pl]), "zh-Hant": newest([zhHant]) };
}

// Same for the engines write-ups. The legacy design only uses `en`.
export async function getEngineDocLastUpdated() {
  const [en, pl, zhHant] = await Promise.all([
    fetchCommitDate("src/markdown/engines-en.md"),
    fetchCommitDate("src/markdown/engines-pl.md"),
    fetchCommitDate("src/markdown/engines-zh-hant.md"),
  ]);
  return { en: newest([en]), pl: newest([pl]), "zh-Hant": newest([zhHant]) };
}

// Catalog pages: the newest of the catalog's YAML data and its write-up, so the
// stamp reflects "when did the content behind this table last change".
const CATALOG_FILES = {
  mfGames: ["public/data/list-mf.yaml"],
  mwLevels: ["public/data/list-mw.yaml"],
  assets: ["public/data/list-assets.yaml"],
  softendo: ["public/data/list-softendo.yaml"],
};

export async function getCatalogLastUpdated(key) {
  const files = CATALOG_FILES[key];
  if (!files) return null;
  return newestOf(files);
}
