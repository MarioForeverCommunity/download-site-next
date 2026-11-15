// Boot path for the original design. Kept exactly as it shipped so the legacy
// pages remain byte-for-byte equivalent to 2.5.x behaviour.
import { createApp } from "vue";
import "overlayscrollbars/styles/overlayscrollbars.css";
import { initOverlayScrollbars } from "../util/OverlayScrollbarsUtil.js";
import "../assets/fonts.css";
import "../assets/dark-mode.css";

export function bootLegacy(App) {
  createApp(App).mount("#app");
  initOverlayScrollbars();
}
