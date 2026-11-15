import { ref, computed, watch } from "vue";
import { getPageSize } from "./Language.js";

/**
 * Client-side pagination for the legacy catalog pages.
 *
 * The page size is the same global setting the redesigned catalogs read (the
 * settings dialog's "records per page"), so a visitor's choice applies to both
 * designs. A size of 0 means "show everything".
 *
 * @param {import("vue").ComputedRef<Array>} list - the filtered list to page
 */
export function usePagination(list) {
  const pageSize = getPageSize();
  const page = ref(1);

  const total = computed(() => list.value.length);

  const pageCount = computed(() => {
    if (!pageSize.value) return 1;
    return Math.max(1, Math.ceil(total.value / pageSize.value));
  });

  const paged = computed(() => {
    if (!pageSize.value) return list.value;
    const start = (page.value - 1) * pageSize.value;
    return list.value.slice(start, start + pageSize.value);
  });

  function setPage(value) {
    const next = Math.floor(Number(value) || 1);
    page.value = Math.min(Math.max(1, next), pageCount.value);
  }

  // A new filter, search or sort result starts over from the first page.
  watch(list, () => {
    page.value = 1;
  });

  // A larger page size can leave the index past the end of the list.
  watch(pageSize, () => {
    page.value = Math.min(page.value, pageCount.value);
  });

  return { page, pageCount, paged, setPage };
}
