<script setup>
// Catalog description drawer.
//
// Each catalog page has a markdown write-up (mf-games-zh.md, mw-levels-zh.md, …)
// that the legacy design printed above the table. On the redesigned pages it is
// opened from an icon in the topbar instead, so the catalog itself starts at the
// first row and a long introduction never pushes the table down.
import { watch, onMounted, onBeforeUnmount } from "vue";
import NxIcon from "./NxIcon.vue";
import { lockScroll, releaseScroll } from "../../util/next/scrollLock.js";

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  lan: {
    type: String,
    default: "zh"
  },
  title: {
    type: String,
    default: ""
  },
  // The compiled markdown component, or null when the page has no write-up.
  doc: {
    type: Object,
    default: null
  },
  // "Last updated" stamp shown under the drawer title.
  updated: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["close"]);

function onKeydown(event) {
  if (event.key === "Escape" && props.show) emit("close");
}

function onPopState() {
  if (props.show) emit("close");
}

watch(() => props.show, (open) => {
  if (typeof document === "undefined") return;
  lockScroll(open);
});

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
  window.addEventListener("popstate", onPopState);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
  window.removeEventListener("popstate", onPopState);
  releaseScroll();
});
</script>

<template>
  <Teleport to="body">
    <Transition name="nx-fade">
      <button
        v-if="show"
        class="nx-scrim"
        type="button"
        :aria-label="lan === 'zh' ? '关闭' : 'Close'"
        @click="emit('close')"
      />
    </Transition>
    <Transition name="nx-slide">
      <aside
        v-if="show"
        class="nx-drawer"
        role="dialog"
        aria-modal="true"
        :aria-label="title || (lan === 'zh' ? '目录说明' : 'About this catalog')"
        style="--nx-drawer-w: min(620px, 100vw);"
      >
        <div class="nx-drawer-head">
          <div style="flex:1; min-width:0;">
            <h2 class="nx-drawer-title">{{ title || (lan === "zh" ? "目录说明" : "About this catalog") }}</h2>
            <p
              v-if="updated"
              class="nx-drawer-sub nx-num"
            >
              {{ lan === "zh" ? "最后更新：" : "Last updated: " }}{{ updated }}
            </p>
          </div>
          <button
            class="nx-close"
            type="button"
            :aria-label="lan === 'zh' ? '关闭' : 'Close'"
            @click="emit('close')"
          >
            <NxIcon
              name="close"
              :size="15"
            />
          </button>
        </div>

        <div class="nx-drawer-body">
          <div
            v-if="doc"
            class="nx-doc nx-doc-embedded"
          >
            <component :is="doc" />
          </div>
          <p
            v-else
            class="nx-drawer-sub"
          >
            {{ lan === "zh" ? "本页暂无说明。" : "No description for this page yet." }}
          </p>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
  /* The markdown body already carries the document's own typography; only the
     outer padding has to go, since the drawer supplies it. */
  .nx-doc-embedded {
    padding: 0;
    max-width: none;
  }
</style>
