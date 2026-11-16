import { ref, computed, watch } from "vue";
import { getPageSize } from "./Language.js";
import { readPageParam, writePageParam } from "./PageParam.js";

/**
 * Client-side pagination for the legacy catalog pages.
 *
 * The page size is the same global setting the redesigned catalogs read (the
 * settings dialog's "records per page"), so a visitor's choice applies to both
 * designs. A size of 0 means "show everything".
 *
 * The current page is mirrored in the URL (`?page=`) through PageParam.js, the
 * same parameter the redesigned catalogs use.
 *
 * @param {import("vue").ComputedRef<Array>} list - the filtered list to page
 */
export function usePagination(list) {
  const pageSize = getPageSize();
  // The list is filled asynchronously after the page mounts, so the page named
  // by the URL is held here until the first non-empty result arrives.
  const requestedPage = readPageParam();
  const page = ref(requestedPage);
  let pageFromUrlPending = requestedPage > 1;

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

  // A new filter, search or sort result starts over from the first page — but
  // the list arriving for the first time keeps the page the URL asked for.
  watch(list, () => {
    if (pageFromUrlPending && list.value.length > 0) {
      pageFromUrlPending = false;
      page.value = Math.min(requestedPage, pageCount.value);
    } else {
      page.value = 1;
    }
  });

  // A larger page size can leave the index past the end of the list.
  watch(pageSize, () => {
    page.value = Math.min(page.value, pageCount.value);
  });

  // Keep the address in step with the visible page so a reload or a copied link
  // returns to the same page.
  watch(page, (value) => writePageParam(value));

  return { page, pageCount, paged, setPage };
}
