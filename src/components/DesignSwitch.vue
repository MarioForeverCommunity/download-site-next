<script setup>
// Design switcher.
//
// Three placements: a floating chip (legacy), a settings-menu row (new
// interface), and a filled button inside the legacy Global Settings dialog.
// It stays a real link so it can be copied and opened in a new tab; the click
// handler only upgrades it to an in-place swap.
import { computed } from "vue";
import { NEXT_DESIGN, LEGACY_DESIGN, otherDesignHref, setDesign, getDesignRef } from "../util/Design.js";
import NxIcon from "./next/NxIcon.vue";

const props = defineProps({
  current: {
    type: String,
    default: "next"
  },
  // "chip" (legacy floating control) | "menu" (new settings menu row)
  // | "row" (legacy global-settings button)
  variant: {
    type: String,
    default: "menu"
  },
  label: {
    type: String,
    default: ""
  }
});

const designRef = getDesignRef();

const target = computed(() => (props.current === LEGACY_DESIGN ? NEXT_DESIGN : LEGACY_DESIGN));
const href = computed(() => otherDesignHref(target.value));

const text = computed(() => {
  const toNew = props.current === LEGACY_DESIGN;
  if (props.label) return props.label;
  if (props.variant === "chip") return toNew ? "新版界面" : "旧版界面";
  return toNew ? "切换到新版设计" : "切换到旧版设计";
});

const title = computed(() => {
  const toNew = props.current === LEGACY_DESIGN;
  return toNew ? "切换到新版设计 / Switch to new design" : "切换到旧版设计 / Switch to legacy design";
});

function swap(event) {
  // Let modified clicks (new tab, middle click) behave natively.
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
    return;
  }
  event.preventDefault();
  setDesign(target.value);
  // The two designs are separate page components, so a reload is the only
  // reliable hand-off: it re-runs the entry main.js with the new design.
  window.location.assign(href.value);
}

const effectiveCurrent = computed(() => {
  void designRef.value;
  return props.current;
});

const SWAP_ICON = ["M4 8h13", "M14 5l3 3-3 3", "M20 16H7", "M10 13l-3 3 3 3"];
</script>

<template>
  <a
    :href="href"
    :title="title"
    :aria-label="title"
    :class="['design-switch', `is-${variant}`]"
    :data-current="effectiveCurrent"
    @click="swap"
  >
    <template v-if="variant === 'menu'">
      <NxIcon
        name="swap"
        :size="14"
      />
      <span>{{ text }}</span>
    </template>
    <template v-else>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path
          v-for="(d, i) in SWAP_ICON"
          :key="i"
          :d="d"
        />
      </svg>
      <span>{{ text }}</span>
    </template>
  </a>
</template>

<style scoped>
  .design-switch {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
    cursor: pointer;
    font-family: "Inter", -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
    white-space: nowrap;
  }

  /* settings-menu row: inherits the menu item styling */
  .design-switch.is-menu {
    width: 100%;
    padding: 7px 9px;
    border-radius: 4px;
    font-size: 12.5px;
    color: var(--nx-ink-2);
    text-align: left;
  }

  .design-switch.is-menu:hover {
    background: var(--nx-fill);
    color: var(--nx-ink);
    text-decoration: none;
  }

  /* filled button inside the legacy Global Settings dialog */
  .design-switch.is-row {
    width: 100%;
    justify-content: center;
    height: 34px;
    padding: 0 12px;
    border-radius: .5em;
    background-color: #008cff;
    color: #ffffff;
    font-size: 13px;
    margin-top: .9em;
    transition: background-color .15s ease;
  }

  .design-switch.is-row:hover {
    background-color: #30acff;
    color: #ffffff;
    text-decoration: none;
  }

  .design-switch.is-row:active {
    background-color: #007cdf;
  }

  :global(body.dark) .design-switch.is-row {
    background-color: #555;
    color: #bbb;
  }

  :global(body.dark) .design-switch.is-row:hover {
    background-color: #30acff;
    color: #fff;
  }
</style>
