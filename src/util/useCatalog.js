import { ref, computed, watch } from "vue";

/**
 * Catalog state for the redesigned list pages.
 *
 * Every catalog page (fangames, MW levels, assets, Softendo) shares one
 * interaction model:
 *
 *  - two independent text searches: title (titles, aliases, filenames) and
 *    author;
 *  - multi-select facets and a tri-state tag filter, rendered as an always-open
 *    secondary sidebar rather than hidden dropdowns. Facets are multi-select
 *    because narrowing a 600-record catalog is rarely a single choice — you
 *    often want "Windows or Linux" in one pass;
 *  - a date filter with two mutually exclusive modes: whole-year, or an exact
 *    range down to the day. They are exclusive because combining them produces
 *    ranges that are hard to reason about ("2021–2023 but also 2019-05-02");
 *    one control, one answer. Pages that have no meaningful release date
 *    (Softendo ships year ranges) pass `dateFilter: false`.
 *
 * Facets are declarative: `{ key, label, options: [{ value, label, count }],
 * test(record, value) }`. Passing `facets` as a getter keeps option labels in
 * sync with the current language.
 */
export function useCatalog({
  records,
  titleFields,
  authorFields,
  facets = [],
  sorters = [],
  defaultSort = null,
  tags = null,
  labels = {},
  dateFilter = true,
}) {
  const resolveFacets = () => (typeof facets === "function" ? facets() : facets);
  const facetDefs = computed(resolveFacets);

  const query = ref("");
  const authorQuery = ref("");
  // { facetKey: [value, ...] } — an empty array means "no restriction".
  const facetValues = ref({});
  const tagStates = ref({});
  const view = ref("list");
  const sort = ref(defaultSort ? { field: defaultSort.field, asc: defaultSort.asc } : { field: null, asc: true });
  const activeId = ref(null);
  // Stable id so form labels in the filter pane can point at their inputs.
  const uid = Math.random().toString(36).slice(2, 8);

  // ── date filter ────────────────────────────────────────────
  // mode: "year" | "range". Year picks one or more whole years; range takes two
  // ISO dates (inclusive). Only one mode is ever active.
  // When on, only records that actually have artwork are listed.
  const onlyWithImage = ref(false);
  const dateMode = ref("year");
  const filterYears = ref([]);
  const rangeFrom = ref("");
  const rangeTo = ref("");

  // Labels are supplied by the page so the composable stays language-agnostic.
  const yearLabel = computed(() => labels.year || "");
  const rangeLabel = computed(() => labels.range || "");

  function setDateMode(mode) {
    if (mode === dateMode.value) return;
    dateMode.value = mode;
    // Clear the other mode so a hidden filter can never keep filtering.
    if (mode === "year") {
      rangeFrom.value = "";
      rangeTo.value = "";
    } else {
      filterYears.value = [];
    }
  }

  function toggleYear(value) {
    if (!value) {
      filterYears.value = [];
      return;
    }
    const set = new Set(filterYears.value);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    filterYears.value = Array.from(set);
  }

  function setRange(from, to) {
    rangeFrom.value = from || "";
    rangeTo.value = to || "";
  }

  function clearDate() {
    filterYears.value = [];
    rangeFrom.value = "";
    rangeTo.value = "";
  }

  const hasYearFilter = computed(() => dateFilter && dateMode.value === "year" && filterYears.value.length > 0);
  const hasRangeFilter = computed(() => dateFilter && dateMode.value === "range" && (!!rangeFrom.value || !!rangeTo.value));
  const hasDateFilter = computed(() => hasYearFilter.value || hasRangeFilter.value);

  const yearOptions = computed(() => {
    const years = new Set();
    for (const record of records.value) {
      if (record.date) years.add(String(record.date.getFullYear()));
    }
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  });

  const yearCounts = computed(() => {
    const counts = new Map();
    for (const record of records.value) {
      if (!record.date) continue;
      const year = String(record.date.getFullYear());
      counts.set(year, (counts.get(year) || 0) + 1);
    }
    return counts;
  });

  // Earliest/latest dates present, so the range inputs can hint real bounds.
  const dateBounds = computed(() => {
    let min = null;
    let max = null;
    for (const record of records.value) {
      const date = record.date;
      if (!date) continue;
      if (!min || date < min) min = date;
      if (!max || date > max) max = date;
    }
    const iso = (date) => {
      if (!date) return "";
      const pad = (value) => String(value).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    };
    return { min: iso(min), max: iso(max) };
  });

  function matchesDate(record) {
    if (!hasDateFilter.value) return true;
    if (!record.date) return false;
    if (hasYearFilter.value) {
      return filterYears.value.includes(String(record.date.getFullYear()));
    }
    // Compare calendar days, not instants: a record released at 23:00 on the
    // "to" date must still match.
    const pad = (value) => String(value).padStart(2, "0");
    const day = `${record.date.getFullYear()}-${pad(record.date.getMonth() + 1)}-${pad(record.date.getDate())}`;
    if (rangeFrom.value && day < rangeFrom.value) return false;
    if (rangeTo.value && day > rangeTo.value) return false;
    return true;
  }

  // ── facets / tags ──────────────────────────────────────────
  for (const facet of resolveFacets()) {
    facetValues.value[facet.key] = [];
  }

  const tagList = computed(() => {
    if (!tags) return [];
    const counts = new Map();
    const labels = new Map();
    // "Untagged" is a synthetic bucket rather than a YAML tag, so its display
    // name comes from the page's localization, not the tag dictionary.
    const untaggedLabel = typeof tags === "object" && tags.untaggedLabel
      ? tags.untaggedLabel
      : "Untagged";

    for (const record of records.value) {
      const recordTags = record.tags || [];
      if (recordTags.length === 0) {
        counts.set("Untagged", (counts.get("Untagged") || 0) + 1);
        if (!labels.has("Untagged")) labels.set("Untagged", untaggedLabel);
      }
      for (const tag of recordTags) {
        counts.set(tag.key, (counts.get(tag.key) || 0) + 1);
        // Display the localized label (records already carry it); the raw key
        // stays the filter identity so toggling is language-independent.
        if (!labels.has(tag.key)) labels.set(tag.key, tag.label || tag.key);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => (a[0] === "Untagged" ? 1 : b[0] === "Untagged" ? -1 : a[0].localeCompare(b[0])))
      .map(([tag, count]) => ({ tag, label: labels.get(tag) || tag, count }));
  });

  const activeTagCount = computed(() => Object.keys(tagStates.value).length);

  const activeFacets = computed(() => {
    const active = [];
    for (const facet of facetDefs.value) {
      const values = facetValues.value[facet.key] || [];
      for (const value of values) {
        const option = facet.options.find((o) => o.value === value);
        active.push({
          type: "facet",
          key: facet.key,
          value,
          label: `${facet.label}: ${option ? option.label : value}`,
        });
      }
    }
    if (hasYearFilter.value) {
      active.push({ type: "date", key: "date", label: `${yearLabel.value}${filterYears.value.join(", ")}` });
    }
    if (hasRangeFilter.value) {
      const from = rangeFrom.value || "…";
      const to = rangeTo.value || "…";
      active.push({ type: "date", key: "date", label: `${rangeLabel.value}${from} – ${to}` });
    }
    // Tag pills carry the same +/− markers as the chips themselves.
    for (const [tag, state] of Object.entries(tagStates.value)) {
      const marker = state === "not" ? "−" : state === "and" ? "+" : "";
      active.push({ type: "tag", key: tag, state, label: `${marker}${tag}` });
    }
    return active;
  });

  function matchesTags(recordTags) {
    const states = tagStates.value;
    const keys = Object.keys(states);
    if (keys.length === 0) return true;
    const tagsOfRecord = (recordTags || []).length === 0 ? ["Untagged"] : recordTags.map((t) => t.key);
    const orTags = keys.filter((t) => states[t] === "or");
    const andTags = keys.filter((t) => states[t] === "and");
    const notTags = keys.filter((t) => states[t] === "not");
    const orOk = orTags.length === 0 || orTags.some((t) => tagsOfRecord.includes(t));
    const andOk = andTags.length === 0 || andTags.every((t) => tagsOfRecord.includes(t));
    const notOk = notTags.length === 0 || notTags.every((t) => !tagsOfRecord.includes(t));
    return orOk && andOk && notOk;
  }

  // ── search ─────────────────────────────────────────────────
  // Same normalisation as the legacy site: upper-case, strip punctuation, so
  // "phantomsmagoria" still finds "PHANTOM'SMAGORIA".
  function normalizedContains(haystack, needle) {
    const normalize = (s) => String(s).toUpperCase().replace(/[^\p{L}\p{N}]/gu, "");
    const n = normalize(needle);
    if (!n) return true;
    return normalize(haystack).includes(n);
  }

  function fieldsMatch(record, fields, needle) {
    for (const getter of fields) {
      const value = typeof getter === "function" ? getter(record) : record[getter];
      if (value == null) continue;
      if (Array.isArray(value)) {
        if (value.some((item) => item != null && normalizedContains(item, needle))) return true;
      } else if (normalizedContains(value, needle)) {
        return true;
      }
    }
    return false;
  }

  // A record "has an image" when it carries at least one picture path.
  function hasImage(record) {
    if (!record) return false;
    if (record.image) return true;
    return Array.isArray(record.images) && record.images.some(Boolean);
  }

  const filtered = computed(() => {
    const titleNeedle = query.value.trim();
    const authorNeedle = authorQuery.value.trim();
    const activeFacetDefs = facetDefs.value.filter((f) => (facetValues.value[f.key] || []).length > 0);

    let list = records.value.filter((record) => {
      if (titleNeedle && !fieldsMatch(record, titleFields, titleNeedle)) return false;
      if (authorNeedle && !fieldsMatch(record, authorFields, authorNeedle)) return false;
      for (const facet of activeFacetDefs) {
        // Within one facet the selected values are OR-ed: "Windows or Linux".
        const values = facetValues.value[facet.key];
        if (!values.some((value) => facet.test(record, value))) return false;
      }
      if (onlyWithImage.value && !hasImage(record)) return false;
      if (tags && !matchesTags(record.tags)) return false;
      if (!matchesDate(record)) return false;
      return true;
    });

    const field = sort.value.field;
    if (field) {
      const sorter = sorters.find((s) => s.field === field);
      if (sorter) {
        const direction = sort.value.asc ? 1 : -1;
        list = [...list].sort((a, b) => direction * sorter.compare(a, b));
      }
    }
    return list;
  });

  // ── mutators ───────────────────────────────────────────────
  function setQuery(value) {
    query.value = value;
  }

  function setAuthorQuery(value) {
    authorQuery.value = value;
  }

  function toggleFacet(key, value) {
    const current = facetValues.value[key] || [];
    const set = new Set(current);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    facetValues.value = { ...facetValues.value, [key]: Array.from(set) };
  }

  function setFacet(key, value) {
    facetValues.value = { ...facetValues.value, [key]: value ? [value] : [] };
  }

  function clearFacet(key) {
    facetValues.value = { ...facetValues.value, [key]: [] };
  }

  function setView(value) {
    view.value = value === "cards" ? "cards" : "list";
  }

  function toggleView() {
    setView(view.value === "cards" ? "list" : "cards");
  }

  function setActive(id) {
    activeId.value = id == null ? null : id;
  }

  function clearAll() {
    query.value = "";
    authorQuery.value = "";
    const cleared = {};
    for (const facet of facetDefs.value) cleared[facet.key] = [];
    facetValues.value = cleared;
    tagStates.value = {};
    clearDate();
  }

  function clearFacets() {
    const cleared = {};
    for (const facet of facetDefs.value) cleared[facet.key] = [];
    facetValues.value = cleared;
  }

  function toggleSort(field) {
    if (sort.value.field !== field) {
      sort.value = { field, asc: true };
    } else if (sort.value.asc) {
      sort.value = { field, asc: false };
    } else {
      sort.value = { field: defaultSort ? defaultSort.field : null, asc: defaultSort ? defaultSort.asc : true };
    }
  }

  function cycleTag(tag) {
    const next = { ...tagStates.value };
    const state = next[tag];
    if (!state) next[tag] = "or";
    else if (state === "or") next[tag] = "and";
    else if (state === "and") next[tag] = "not";
    else delete next[tag];
    tagStates.value = next;
  }

  function clearTags() {
    tagStates.value = {};
  }

  const isFiltered = computed(() => !!query.value.trim()
    || !!authorQuery.value.trim()
    || onlyWithImage.value
    || activeFacets.value.length > 0
    || hasDateFilter.value);

  const count = computed(() => filtered.value.length);
  const total = computed(() => records.value.length);

  // A filtered-out record must not stay open with stale content.
  watch(filtered, (list) => {
    if (activeId.value == null) return;
    if (!list.some((record) => record.id === activeId.value)) {
      activeId.value = null;
    }
  });

  return {
    uid,
    // search
    query,
    authorQuery,
    setQuery,
    setAuthorQuery,
    // facets & tags
    facetValues,
    facetDefs,
    tagStates,
    tagList,
    activeTagCount,
    activeFacets,
    toggleFacet,
    setFacet,
    clearFacet,
    cycleTag,
    clearTags,
    clearFacets,
    // date
    onlyWithImage,
    dateFilter,
    dateMode,
    filterYears,
    rangeFrom,
    rangeTo,
    yearOptions,
    yearCounts,
    dateBounds,
    hasDateFilter,
    hasYearFilter,
    hasRangeFilter,
    setDateMode,
    toggleYear,
    setRange,
    clearDate,
    // sort / view / selection
    sort,
    toggleSort,
    view,
    setView,
    toggleView,
    activeId,
    setActive,
    // results
    filtered,
    count,
    total,
    isFiltered,
    allRecords: records,
    clearAll,
  };
}
