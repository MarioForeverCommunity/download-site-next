// "Last updated" dates for the documentation pages.
//
// The legacy pages asked the GitHub commits API at runtime for the newest commit
// touching the data file and the markdown document, then showed the later one.
// That request is rate-limited (it answers 403 when unauthenticated and busy),
// and when it failed the "Last updated" line silently vanished.
//
// The dates are therefore resolved once at build time from local git history
// (see `DOC_UPDATED` in vite.config.js), so the pages need no network call and
// stay correct even when the API is unavailable.
// `DOC_UPDATED` is a build-time constant (vite.config.js). The typeof guard
// keeps this file importable from a plain Node context (tests, scripts) where
// the constant is not replaced.
const UPDATED = typeof DOC_UPDATED === "undefined" ? {} : DOC_UPDATED;

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const pad = (v) => String(v).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// The original-MF index reports per language, because its two documents are
// edited independently.
export async function getMfDocLastUpdated() {
  return {
    zh: formatDate(UPDATED.mfZh),
    en: formatDate(UPDATED.mfEn)
  };
}

export async function getMwDocLastUpdated() {
  return formatDate(UPDATED.mw);
}
