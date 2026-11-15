<script setup>
// Pager for the legacy catalog pages.
//
// The page size itself is a global setting (see usePagination), so this
// component only renders the controls and reports the requested page.
import { computed } from "vue";

const props = defineProps({
  page: {
    type: Number,
    required: true
  },
  pageCount: {
    type: Number,
    required: true
  },
  lan: {
    type: String,
    default: "zh"
  }
});

const emit = defineEmits(["change"]);

const text = computed(() => (props.lan === "zh"
  ? { nav: "分页", prev: "上一页", next: "下一页" }
  : { nav: "Pagination", prev: "Previous", next: "Next" }));

// First and last are always reachable, with a window around the current page
// and an ellipsis where the sequence skips.
const items = computed(() => {
  const total = props.pageCount;
  const current = props.page;
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const start = Math.max(2, Math.min(current - 1, total - 4));
  const end = Math.min(total - 1, Math.max(current + 1, 5));
  const list = [1];
  if (start > 2) list.push("…");
  for (let value = start; value <= end; value++) list.push(value);
  if (end < total - 1) list.push("…");
  list.push(total);
  return list;
});

function go(value) {
  if (!Number.isFinite(value) || value === props.page) return;
  emit("change", value);
  // The controls sit under the list, so a new page would otherwise open below
  // the fold with the previous page's last rows in view.
  if (typeof window !== "undefined") window.scrollTo({ top: 0 });
}
</script>

<template>
  <nav
    v-if="pageCount > 1"
    class="page-bar"
    :aria-label="text.nav"
  >
    <button
      type="button"
      class="page-btn"
      :disabled="page <= 1"
      @click="go(page - 1)"
    >{{ text.prev }}</button>

    <template
      v-for="(item, index) in items"
      :key="`page-${index}-${item}`"
    >
      <span
        v-if="item === '…'"
        class="page-gap"
        aria-hidden="true"
      >…</span>
      <button
        v-else
        type="button"
        class="page-btn"
        :class="{ on: item === page }"
        :aria-current="item === page ? 'page' : undefined"
        @click="go(item)"
      >{{ item }}</button>
    </template>

    <button
      type="button"
      class="page-btn"
      :disabled="page >= pageCount"
      @click="go(page + 1)"
    >{{ text.next }}</button>
  </nav>
</template>

<style scoped>
  .page-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: .4em;
    margin: 1.5em 0;
    font-family: Inter, Helvetica, Arial, "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", Tahoma, sans-serif;
  }

  /* Same shape and colours as the legacy toolbar's .visible-button (the "Tags"
     button in the filter bar), so the pager reads as part of the old design. */
  .page-btn {
    min-width: 2em;
    border: 1px solid rgba(0, 0, 0, 0.15);
    background: #fff;
    color: inherit;
    padding: .2em .65em;
    border-radius: .25em;
    line-height: 1.5em;
    font: inherit;
    cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .page-btn:hover:not(:disabled):not(.on) {
    box-shadow: rgba(0, 0, 0, 0.1) 2px 2px 6px;
  }

  .page-btn:disabled {
    opacity: .45;
    cursor: default;
  }

  .page-btn.on {
    background: #008cff;
    border-color: #008cff;
    color: #fff;
    font-weight: 600;
  }

  .page-gap {
    padding: 0 .2em;
    opacity: .6;
  }

  body.dark .page-btn {
    background: #222222;
    border-color: #444;
    color: #ddd;
  }

  body.dark .page-btn:hover:not(:disabled):not(.on) {
    background: #333333;
    border-color: #555;
  }

  body.dark .page-btn.on {
    background: #008cff;
    border-color: #008cff;
    color: #fff;
  }
</style>
