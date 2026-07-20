// Fuzzy search helpers used by the name filter across all list pages.
// These tolerate missing special characters (' - : etc.), fragmented input
// (extra spaces, e.g. "mem ories"), and minor typos, so that queries like
// "phantomsmagoria" still match "PHANTOM'SMAGORIA", "oldblood" matches
// "Old-Blood", and "mem ories" matches "Memories".

/**
 * Normalize a string for search: uppercase and strip every non-alphanumeric
 * character. After normalization, "Phantom'sMagoria" and "phantomsmagoria"
 * collapse to the same token, so a plain substring check becomes tolerant of
 * punctuation and spacing differences.
 * @param {string|*} str
 * @returns {string}
 */
export function normalizeForSearch(str) {
  if (str == null) return "";
  return String(str).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/**
 * Levenshtein edit distance between two strings (O(m*n) time, O(n) space).
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  let curr = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,        // insertion
        prev[j] + 1,            // deletion
        prev[j - 1] + cost      // substitution
      );
    }
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }
  return prev[n];
}

/**
 * Typo tolerance threshold based on the query length. Short queries get no
 * tolerance (too many false positives), longer ones allow roughly one edit
 * per four characters.
 * @param {number} len
 * @returns {number}
 */
function typoThreshold(len) {
  if (len < 4) return 0;
  return Math.floor(len / 4);
}

/**
 * Fuzzy match: returns true when `query` is found in `target`, tolerating
 * missing punctuation, fragmentation, and small typos.
 *
 * Matching strategy (in order):
 *  1. Normalized substring match — handles all punctuation/space differences.
 *  2. Per-word Levenshtein fallback — handles minor misspellings by comparing
 *     the (normalized) query against each whitespace-delimited word of the
 *     target. Only applied for queries of length >= 4 to avoid noise.
 *
 * @param {string|null|undefined} target - The string to search within.
 * @param {string} query - The search term typed by the user.
 * @returns {boolean}
 */
export function fuzzyMatch(target, query) {
  const q = query == null ? "" : String(query).trim();
  if (q === "") return true;
  if (target == null) return false;

  const nQuery = normalizeForSearch(q);
  if (nQuery === "") return true;

  const nTarget = normalizeForSearch(target);
  if (nTarget.includes(nQuery)) return true;

  const threshold = typoThreshold(nQuery.length);
  if (threshold === 0) return false;

  const words = String(target).toUpperCase().split(/[^A-Z0-9]+/);
  for (const word of words) {
    if (!word) continue;
    if (Math.abs(word.length - nQuery.length) > threshold) continue;
    if (levenshtein(word, nQuery) <= threshold) return true;
  }
  return false;
}

/**
 * Fuzzy match a query against a list of strings (e.g. aliases). Returns true
 * if any element matches.
 * @param {string[]|string|null|undefined} list
 * @param {string} query
 * @returns {boolean}
 */
export function fuzzyMatchList(list, query) {
  if (list == null) return false;
  if (!Array.isArray(list)) return fuzzyMatch(list, query);
  for (const item of list) {
    if (fuzzyMatch(item, query)) return true;
  }
  return false;
}
