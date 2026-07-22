// Fuzzy search helpers used by the name filter across all list pages.
// These tolerate missing special characters (' - : etc.), fragmented input
// (extra spaces, e.g. "mem ories"), and minor typos, so that queries like
// "phantomsmagoria" still match "PHANTOM'SMAGORIA", "oldblood" matches
// "Old-Blood", and "mem ories" matches "Memories".

/**
 * Normalize a string for search: uppercase and strip every non-alphanumeric
 * character. Uses Unicode property escapes so CJK and other scripts are
 * preserved; only punctuation, symbols and whitespace are removed. After
 * normalization, "Phantom'sMagoria" and "phantomsmagoria" collapse to the
 * same token, so a plain substring check becomes tolerant of punctuation
 * and spacing differences.
 * @param {string|*} str
 * @returns {string}
 */
export function normalizeForSearch(str) {
  if (str == null) return "";
  return String(str).toUpperCase().replace(/[^\p{L}\p{N}]/gu, "");
}

/**
 * Fuzzy substring distance: the minimum edit distance between `query` and any
 * contiguous substring of `target`. Unlike plain Levenshtein (which compares
 * whole strings), the match may start at any position in `target`, so a partial
 * query with a typo can still match -- e.g. "mamor" matches "Memory" with
 * distance 1 (it aligns to the "Memor" substring with one substitution).
 *
 * Uses the Optimal String Alignment (OSA) metric, which counts an adjacent
 * character transposition (e.g. "zo" -> "oz") as a single edit instead of two
 * substitutions. This is the standard approximate-string-matching DP with the
 * first row initialized to 0 (free start position); the result is the minimum
 * value in the last row. O(m*n) time, O(n) space.
 * @param {string} query
 * @param {string} target
 * @returns {number}
 */
function fuzzySubstringDistance(query, target) {
  const m = query.length;
  const n = target.length;
  if (m === 0) return 0;
  if (n === 0) return m;
  let prev2 = null;
  let prev = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = 0;
  let curr = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    const qc = query.charCodeAt(i - 1);
    const qcPrev = i > 1 ? query.charCodeAt(i - 2) : -1;
    for (let j = 1; j <= n; j++) {
      const cost = qc === target.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,        // insertion
        prev[j] + 1,            // deletion
        prev[j - 1] + cost      // substitution
      );
      // transposition: two adjacent characters swapped (counts as 1 edit)
      if (i > 1 && j > 1 && qc === target.charCodeAt(j - 2) && qcPrev === target.charCodeAt(j - 1)) {
        curr[j] = Math.min(curr[j], prev2[j - 2] + 1);
      }
    }
    const tmp = prev2 || new Array(n + 1);
    prev2 = prev;
    prev = curr;
    curr = tmp;
  }
  let min = prev[0];
  for (let j = 1; j <= n; j++) {
    if (prev[j] < min) min = prev[j];
  }
  return min;
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
 *  2. Fuzzy substring distance fallback - allows the (normalized) query to
 *     match any contiguous substring of the normalized target with a small
 *     number of edits. This handles both whole-word and partial-word typos
 *     (e.g. "mamor" matches "Memory"). Only applied for queries of length
 *     >= 4 to avoid noise.
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

  return fuzzySubstringDistance(nQuery, nTarget) <= threshold;
}

/**
 * Normalized substring match: applies the same punctuation/space-insensitive
 * normalization as fuzzyMatch, but WITHOUT the Levenshtein typo fallback.
 * Intended for structured fields (file_name, alias) where approximate typo
 * matching would produce false positives.
 *
 * @param {string|null|undefined} target - The string to search within.
 * @param {string} query - The search term typed by the user.
 * @returns {boolean}
 */
export function normalizedIncludes(target, query) {
  const q = query == null ? "" : String(query).trim();
  if (q === "") return true;
  if (target == null) return false;
  const nQuery = normalizeForSearch(q);
  if (nQuery === "") return true;
  return normalizeForSearch(target).includes(nQuery);
}
