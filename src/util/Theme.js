import { ref, watch } from "vue";

// Theme is intentionally separate from the legacy `body.dark` class so the two
// designs cannot fight over the page, but it shares the localStorage key so a
// visitor's light/dark choice carries across the design switch.
const STORAGE_KEY = "darkMode";
const THEME_LIGHT = "light";
const THEME_DARK = "dark";

const theme = ref(THEME_LIGHT);

function systemPrefersDark() {
  return typeof window !== "undefined"
    && window.matchMedia
    && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function readTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "1") return THEME_DARK;
    if (saved === "0") return THEME_LIGHT;
  } catch (_e) {
    // Private mode / disabled storage: fall through to the system preference.
  }
  return systemPrefersDark() ? THEME_DARK : THEME_LIGHT;
}

function applyTheme(value) {
  theme.value = value;
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.nxTheme = value;
  root.style.colorScheme = value;
  // Keep the legacy `body.dark` contract in sync so a visitor who switches
  // designs keeps the same light/dark preference across both UIs.
  document.body.classList.toggle("dark", value === THEME_DARK);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", value === THEME_DARK ? "#121417" : "#ebede9");
  }
}

export function initTheme() {
  applyTheme(readTheme());
}

export function getTheme() {
  return theme;
}

export function setTheme(value) {
  const next = value === THEME_DARK ? THEME_DARK : THEME_LIGHT;
  applyTheme(next);
  try {
    localStorage.setItem(STORAGE_KEY, next === THEME_DARK ? "1" : "0");
  } catch (_e) {
    // Ignore: the theme still applies for this page view.
  }
  window.dispatchEvent(new CustomEvent("theme-changed", { detail: { theme: next } }));
}

export function toggleTheme() {
  setTheme(theme.value === THEME_DARK ? THEME_LIGHT : THEME_DARK);
}

export function isDarkTheme() {
  return theme.value === THEME_DARK;
}

// Density is a reading preference for long records: comfortable for browsing,
// compact for scanning a 600-entry catalog.
const DENSITY_KEY = "nxDensity";
const density = ref("comfortable");

function readDensity() {
  try {
    return localStorage.getItem(DENSITY_KEY) === "compact" ? "compact" : "comfortable";
  } catch (_e) {
    return "comfortable";
  }
}

function applyDensity(value) {
  density.value = value;
  if (typeof document === "undefined") return;
  document.documentElement.dataset.nxDensity = value;
}

export function initDensity() {
  applyDensity(readDensity());
}

export function getDensity() {
  return density;
}

export function toggleDensity() {
  const next = density.value === "compact" ? "comfortable" : "compact";
  applyDensity(next);
  try {
    localStorage.setItem(DENSITY_KEY, next);
  } catch (_e) {
    // Ignore.
  }
}

// Keep the DOM in sync when a theme is set from another component.
watch(theme, (value) => {
  if (typeof document !== "undefined" && document.documentElement.dataset.nxTheme !== value) {
    applyTheme(value);
  }
});
