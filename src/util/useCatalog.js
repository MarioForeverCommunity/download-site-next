import { ref, computed, watch } from "vue";

/**
 * Catalog state for the redesigned list pages.
 *
 * Every catalog page (fangames, MW levels, assets, Softendo) has the same
 * interaction: a free-text query, a handful of single-select facets, one
 * tri-state tag filter, a sort field and a view density. Keeping that state
 * here means the four pages stay behavioural twins and the toolbar component
 * only has to describe *which* facets exist.
 *
 * Facets are declarative: `{ key, label, options: [{ value, label }], test: fn }`.
 * `test` receives the raw record and returns a boolean, so a facet can inspect
 * anything the adapter exposes without the engine knowing the domain. Pass
 * `facets` as a getter when the option labels depend on the current language.
 */
export function useCatalog({
  records,
  searchFields,
  facets = [],
  sorters = [],
  defaultSort = null,
  tags = null,
  initialQuery = "",
}) {
  const resolveFacets = () => (typeof facets === "function" ? facets() : facets);
  const facetDefs = computed(resolveFacets);

  const query = ref(initialQuery);
  const facetValues = ref({});
  const sort = ref(defaultSort ? { field: defaultSort.field, asc: defaultSort.asc } : { field: null, asc: true });
  const view = ref("list");
  const tagStates = ref({});
  const activeId = ref(null);

  for (const facet of resolveFacets()) {
    facetValues.value[facet.key] = "";
  }

  const tagList = computed(() => {
    if (!tags) return [];
    const counts = new Map();
    for (const record of records.value) {
      const recordTags = record.tags || [];
      if (recordTags.length === 0) {
        counts.set("Untagged", (counts.get("Untagged") || 0) + 1);
      }
      for (const tag of recordTags) {
        const key = tag.key;
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => (a[0] === "Untagged" ? 1 : b[0] === "Untagged" ? -1 : a[0].localeCompare(b[0])))
      .map(([tag, count]) => ({ tag, count }));
  });

  const activeFacets = computed(() => {
    const active = [];
    for (const facet of facetDefs.value) {
      const value = facetValues.value[facet.key];
      if (!value) continue;
      const option = facet.options.find((o) => o.value === value);
      active.push({ key: facet.key, value, label: option ? option.label : value, facet });
    }
    return active;
  });

  const activeTagCount = computed(() => Object.keys(tagStates.value).length);

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

  // Local copy of the shared normalisation rule (upper-case, strip punctuation)
  // so a query like "phantomsmagoria" still finds "PHANTOM'SMAGORIA".
  function normalizedContains(haystack, needle) {
    const normalize = (s) => String(s).toUpperCase().replace(/[^\p{L}\p{N}]/gu, "");
    const n = normalize(needle);
    if (!n) return true;
    return normalize(haystack).includes(n);
  }

  function matchesQuery(record, needle) {
    for (const getter of searchFields) {
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

  const filtered = computed(() => {
    const needle = query.value.trim();
    const activeFacetDefs = facetDefs.value.filter((f) => facetValues.value[f.key]);

    let list = records.value.filter((record) => {
      if (needle && !matchesQuery(record, needle)) return false;
      for (const facet of activeFacetDefs) {
        if (!facet.test(record, facetValues.value[facet.key])) return false;
      }
      if (tags && !matchesTags(record.tags)) return false;
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

  function setFacet(key, value) {
    facetValues.value = { ...facetValues.value, [key]: value };
  }

  function setQuery(value) {
    query.value = value;
  }

  function setView(value) {
    view.value = value === "cards" ? "cards" : "list";
  }

  function toggleView() {
    setView(view.value === "cards" ? "list" : "cards");
  }

  function setActive(id) {
    activeId.value = id ?? null;
  }

  function clearAll() {
    query.value = "";
    const cleared = {};
    for (const facet of facetDefs.value) cleared[facet.key] = "";
    facetValues.value = cleared;
    tagStates.value = {};
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
    || activeFacets.value.length > 0
    || Object.keys(tagStates.value).length > 0);

  const count = computed(() => filtered.value.length);
  const total = computed(() => records.value.length);

  // Keep the open record valid when filters change (a filtered-out row must not
  // stay open forever with stale content).
  watch(filtered, (list) => {
    if (activeId.value == null) return;
    if (!list.some((record) => record.id === activeId.value)) {
      activeId.value = null;
    }
  });

  return {
    query,
    facetValues,
    facetDefs,
    sort,
    view,
    tagStates,
    tagList,
    activeTagCount,
    activeFacets,
    filtered,
    count,
    total,
    isFiltered,
    activeId,
    // Unfiltered source, used by deep links so a shared URL always resolves.
    allRecords: records,
    setFacet,
    setQuery,
    setView,
    toggleView,
    setActive,
    clearAll,
    toggleSort,
    cycleTag,
    clearTags,
  };
}
