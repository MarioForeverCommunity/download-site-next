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

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const pad = (v) => String(v).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// Commit date of the newest commit touching `path`, or null on failure.
function fetchCommitDate(path) {
  return axios
    .get(`${COMMITS_API}?path=${encodeURIComponent(path)}&page=1&per_page=1`)
    .then((response) => (response.data[0] ? response.data[0].commit.committer.date : null))
    .catch(() => null);
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

// The original-MF index reports per language, because its two documents are
// edited independently.
export async function getMfDocLastUpdated() {
  const [data, zh, en] = await Promise.all([
    fetchCommitDate("public/data/list-original-mf.yaml"),
    fetchCommitDate("src/markdown/mf-zh.md"),
    fetchCommitDate("src/markdown/mf-en.md"),
  ]);
  return { zh: newest([data, zh]), en: newest([data, en]) };
}

export async function getMwDocLastUpdated() {
  return newestOf(["public/data/list-mw.yaml", "src/markdown/mw-en.md"]);
}

// Catalog pages: the newest of the catalog's YAML data and its write-up, so the
// stamp reflects "when did the content behind this table last change".
const CATALOG_FILES = {
  mfGames: ["public/data/list-mf.yaml", "src/markdown/mf-games-zh.md", "src/markdown/mf-games-en.md"],
  mwLevels: ["public/data/list-mw.yaml", "src/markdown/mw-levels-zh.md"],
  assets: ["public/data/list-assets.yaml", "src/markdown/assets.md"],
  softendo: ["public/data/list-softendo.yaml", "src/markdown/softendo-zh.md", "src/markdown/softendo-en.md"],
};

export async function getCatalogLastUpdated(key) {
  const files = CATALOG_FILES[key];
  if (!files) return null;
  return newestOf(files);
}
