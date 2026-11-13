<script setup>
// Design switcher.
//
// Rendered in both designs so a visitor can cross over from wherever they are.
// It is a real link (not a button), so it can be copied, opened in a new tab and
// crawled; the click handler only upgrades it to an in-place swap so the visitor
// keeps their scroll position and filters.
import { computed } from "vue";
import { NEXT_DESIGN, LEGACY_DESIGN, otherDesignHref, setDesign, getDesign, getDesignRef } from "../util/Design.js";

const props = defineProps({
  // "legacy" flips to the new design, "next" flips back to the old one.
  current: {
    type: String,
    default: "next"
  },
  // "chip" for the legacy floating control, "link" for the new masthead.
  variant: {
    type: String,
    default: "link"
  }
});

const designRef = getDesignRef();

const target = computed(() => (props.current === LEGACY_DESIGN ? NEXT_DESIGN : LEGACY_DESIGN));
const href = computed(() => otherDesignHref(target.value));

const label = computed(() => {
  const toNew = props.current === LEGACY_DESIGN;
  if (props.variant === "chip") {
    return toNew ? "新版界面" : "旧版界面";
  }
  return toNew ? "新版设计" : "旧版设计";
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

// Keep the rendered "current" in sync if something else flips the design.
const effectiveCurrent = computed(() => {
  void designRef.value;
  return props.current || getDesign();
});
</script>

<template>
  <a
    :href="href"
    :title="title"
    :aria-label="title"
    :class="['design-switch', 'is-' + variant]"
    :data-current="effectiveCurrent"
    @click="swap"
  >
    <svg
      v-if="variant === 'chip'"
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
      <path d="M4 8h13" />
      <path d="M14 5l3 3-3 3" />
      <path d="M20 16H7" />
      <path d="M10 13l-3 3 3 3" />
    </svg>
    <span>{{ label }}</span>
  </a>
</template>

<style scoped>
  .design-switch {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
    cursor: pointer;
    font-family: "IBM Plex Sans Variable", "IBM Plex Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
    white-space: nowrap;
  }

  /* legacy floating chip.
     The legacy pages already stack round controls at bottom-right (settings
     20px, dark mode 74px, back-to-top 128px), so this sits above that stack to
     avoid covering any of them. */
  .design-switch.is-chip {
    position: fixed;
    right: 30px;
    bottom: 184px;
    z-index: 1000;
    height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    background: #ffffff;
    border: 1px solid rgba(27, 31, 35, 0.15);
    box-shadow: rgba(27, 31, 35, 0.12) 0 2px 8px;
    color: #24292e;
    font-size: 13px;
    font-weight: 500;
    transition: background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  }

  .design-switch.is-chip:hover {
    background: #f3f4f6;
    box-shadow: rgba(27, 31, 35, 0.2) 0 4px 12px;
    transform: translateY(-1px);
  }

  :global(body.dark) .design-switch.is-chip {
    background: #3a3a3a;
    border-color: #4a4a4a;
    color: #ddd;
  }

  :global(body.dark) .design-switch.is-chip:hover {
    background: #444;
  }

  /* new design masthead link */
  .design-switch.is-link {
    color: rgba(255, 255, 255, 0.68);
    font-size: 12.5px;
    padding: 5px 8px;
    border-radius: 4px;
    transition: color 0.12s ease, background 0.12s ease;
  }

  .design-switch.is-link:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 480px) {
    .design-switch.is-chip {
      right: 12px;
      bottom: 178px;
      height: 30px;
      padding: 0 10px;
      font-size: 12px;
    }
  }
</style>
