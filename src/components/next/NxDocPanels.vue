<script setup>
// Inline reader for the hidden content blocks the legacy pages exposed through
// modals (`#history-content`, `#credits-content`, `#smwp-data-placement`).
//
// The markdown still marks those blocks up exactly as before; clicking the
// triggering link opens them here in a side panel instead of a modal, so the
// prose stays where it was and the reading position is preserved.
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import NxIcon from "./NxIcon.vue";
import { pushBackGuard } from "../../util/next/backGuard.js";

const props = defineProps({
  lan: {
    type: String,
    required: true
  },
  root: {
    type: Object,
    default: null
  }
});

const open = ref(false);
const html = ref("");
const title = ref("");

// The legacy blocks open with an <h2> repeating the panel title and contain
// stray <hr> separators; strip both so the body starts with the content.
const cleanedHtml = computed(() => {
  let out = html.value || "";
  out = out.replace(/<hr\s*\/?>/gi, "");
  out = out.replace(/<h2[^>]*>[\s\S]*?<\/h2>/i, "");
  return out.trim();
});

const TARGETS = {
  "open-history": { content: "history-content", zh: "Mario Forever 发展史", en: "History of Mario Forever" },
  "open-credits": { content: "credits-content", zh: "致谢", en: "Credits" },
  "open-data-placement": { content: "smwp-data-placement", zh: "音乐包放置说明", en: "Data package setup" },
  "open-credits-assets": { content: "credits-content", zh: "致谢", en: "Credits" },
};

function onClick(event) {
  const trigger = event.target.closest ? event.target.closest("a[id]") : null;
  if (!trigger) return;
  const config = TARGETS[trigger.id];
  if (!config) return;
  const scope = props.root || document;
  const content = scope.querySelector(`#${config.content}`);
  if (!content) return;
  event.preventDefault();
  html.value = content.innerHTML;
  title.value = props.lan === "zh" ? config.zh : config.en;
  open.value = true;
}

function onKeydown(event) {
  if (event.key === "Escape") open.value = false;
}

// The Android back button closes the panel instead of leaving the page.
let releaseBack = null;

watch(open, (isOpen) => {
  if (isOpen) {
    releaseBack = pushBackGuard(() => { open.value = false; });
  } else if (releaseBack) {
    releaseBack();
    releaseBack = null;
  }
});

onMounted(() => {
  document.addEventListener("click", onClick);
  document.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onClick);
  document.removeEventListener("keydown", onKeydown);
  if (releaseBack) releaseBack();
});
</script>

<template>
  <Teleport to="body">
    <Transition name="nx-fade">
      <button
        v-if="open"
        class="nx-scrim"
        type="button"
        :aria-label="lan === 'zh' ? '关闭' : 'Close'"
        @click="open = false"
      />
    </Transition>
    <Transition name="nx-slide">
      <aside
        v-if="open"
        class="nx-drawer"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <div class="nx-drawer-head">
          <h2 class="nx-drawer-title" style="font-size: 17px; flex: 1; min-width: 0;">{{ title }}</h2>
          <button
            class="nx-close"
            type="button"
            :aria-label="lan === 'zh' ? '关闭' : 'Close'"
            @click="open = false"
          >
            <NxIcon name="close" :size="15" />
          </button>
        </div>
        <div class="nx-drawer-body">
          <!-- The legacy markup starts each block with an <h2> that repeats the
               panel title, and carries stray <hr> separators; both are dropped
               here so the panel body starts with the content itself. -->
          <div
            class="nx-doc nx-panel-doc"
            v-html="cleanedHtml"
          />
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>
