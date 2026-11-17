// Boot path for the original design.
import { createApp } from "vue";
import "../assets/fonts.css";
import "../assets/dark-mode.css";
import "../assets/legacy-scroll-lock.css";

export function bootLegacy(App) {
  createApp(App).mount("#app");
}
