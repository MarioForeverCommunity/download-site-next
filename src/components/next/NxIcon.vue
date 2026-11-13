<script setup>
// One stroke-icon component for the redesigned UI. Keeping the paths in a single
// map avoids a directory of one-path components and keeps optical weight
// consistent: everything is 1.6px on a 24 grid, scaled to 16px by default.
import { computed } from "vue";

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 16
  }
});

const PATHS = {
  search: ["M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14", "M20 20l-4.2-4.2"],
  download: ["M12 3v11", "M8 11l4 4 4-4", "M4 19h16"],
  external: ["M14 4h6v6", "M20 4l-9 9", "M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"],
  link: ["M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1", "M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"],
  video: ["M4 6h11v12H4z", "M15 10l5-3v10l-5-3"],
  home: ["M4 11l8-7 8 7", "M6 10v9h12v-9"],
  github: ["M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 4.5-1.6 4.5-5a4 4 0 0 0-1.1-2.8 3.7 3.7 0 0 0-.1-2.8s-1.1-.3-3.6 1.3a8.6 8.6 0 0 0-4.6 0C6.1 4.6 5 4.9 5 4.9a3.7 3.7 0 0 0-.1 2.8A4 4 0 0 0 3.8 10.5c0 3.4 1.7 4.7 4.5 5-.6.6-.5 1-.5 2V21"],
  wiki: ["M4 5h6l2 5 2-5h6", "M12 10v9", "M9 19h6"],
  info: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18", "M12 11v5", "M12 8h.01"],
  close: ["M6 6l12 12", "M18 6L6 18"],
  chevronDown: ["M6 9l6 6 6-6"],
  chevronRight: ["M9 6l6 6-6 6"],
  arrowUp: ["M12 20V4", "M6 10l6-6 6 6"],
  list: ["M8 6h13", "M8 12h13", "M8 18h13", "M3 6h.01", "M3 12h.01", "M3 18h.01"],
  grid: ["M4 4h7v7H4z", "M13 4h7v7h-7z", "M4 13h7v7H4z", "M13 13h7v7h-7z"],
  sort: ["M8 5v14", "M5 8l3-3 3 3", "M16 19V5", "M13 16l3 3 3-3"],
  sortUp: ["M8 5v14", "M5 8l3-3 3 3"],
  sortDown: ["M16 19V5", "M13 16l3 3 3-3"],
  filter: ["M4 5h16", "M7 12h10", "M10 19h4"],
  shuffle: ["M4 6h4l8 12h4", "M4 18h4l8-12h4", "M17 3l3 3-3 3", "M17 15l3 3-3 3"],
  clipboard: ["M9 4h6v3H9z", "M7 5H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-1"],
  sun: ["M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10", "M12 2v2", "M12 20v2", "M4 12H2", "M22 12h-2", "M5 5l1.5 1.5", "M17.5 17.5L19 19", "M5 19l1.5-1.5", "M17.5 6.5L19 5"],
  moon: ["M20 14a8 8 0 0 1-10-10 8 8 0 1 0 10 10"],
  check: ["M4 12l5 5L20 6"],
  copy: ["M9 9h10v10H9z", "M5 15V5h10"],
  image: ["M4 5h16v14H4z", "M4 15l5-4 4 3 3-2 4 3", "M9 9h.01"],
  swap: ["M4 8h13", "M14 5l3 3-3 3", "M20 16H7", "M10 13l-3 3 3 3"],
  layers: ["M12 3l9 5-9 5-9-5 9-5", "M3 13l9 5 9-5"],
  package: ["M12 3l8 4v10l-8 4-8-4V7l8-4", "M4 7l8 4 8-4", "M12 11v10"],
  warning: ["M12 4l9 16H3z", "M12 10v5", "M12 18h.01"],
  random: ["M4 6h4l8 12h4", "M4 18h4l8-12h4", "M16 3l4 3-4 3", "M16 15l4 3-4 3"],
  tag: ["M4 4h9l7 7-9 9-7-7z", "M8 8h.01"],
  settings: ["M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6", "M12 3v2", "M12 19v2", "M3 12h2", "M19 12h2", "M5.6 5.6l1.4 1.4", "M17 17l1.4 1.4", "M5.6 18.4L7 17", "M17 7l1.4-1.4"],
};

const paths = computed(() => PATHS[props.name] || []);
const px = computed(() => `${props.size}px`);
</script>

<template>
  <svg
    :width="px"
    :height="px"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path
      v-for="(d, i) in paths"
      :key="i"
      :d="d"
    />
  </svg>
</template>
