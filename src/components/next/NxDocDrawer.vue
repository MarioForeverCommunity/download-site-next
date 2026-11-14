<script setup>
// Catalog description drawer.
//
// Each catalog page has a markdown write-up (mf-games-zh.md, mw-levels-zh.md, …)
// that the legacy design printed above the table. On the redesigned pages it is
// opened from an icon in the topbar instead, so the catalog itself starts at the
// first row and a long introduction never pushes the table down.
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
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

// The catalog write-ups carry inline triggers for hidden blocks (credits, the
// SMWP data-package note). Inside this drawer they must *reveal* that content in
// place as a card at the bottom, not open a second, competing drawer on top.
// The legacy markup is unchanged, so the mapping lives here.
const PANEL_TARGETS = {
  "open-credits": { content: "credits-content", zh: "致谢", en: "Credits" },
  "open-credits-assets": { content: "credits-content", zh: "致谢", en: "Credits" },
  "open-data-placement": { content: "smwp-data-placement", zh: "音乐包放置说明", en: "Data package setup" },
  "open-history": { content: "history-content", zh: "Mario Forever 发展史", en: "History of Mario Forever" }
};

// Cards revealed in this drawer, in click order, each with its cleaned HTML.
const panels = ref([]);
const bodyRef = ref(null);

function cleanPanelHtml(raw) {
  // The blocks open with an <h3> that repeats the card title and may contain
  // stray <hr>; both are dropped so the card body is just the content.
  return String(raw || "")
    .replace(/<hr\s*\/?>/gi, "")
    .replace(/<h[23][^>]*>[\s\S]*?<\/h[23]>/i, "")
    .trim();
}

function onDrawerClick(event) {
  const trigger = event.target.closest ? event.target.closest("a[id]") : null;
  if (!trigger) return;
  const config = PANEL_TARGETS[trigger.id];
  if (!config) return;
  // The hidden block lives inside the document rendered here, so look it up in
  // this drawer rather than in the page behind.
  const scope = bodyRef.value || document;
  const block = scope.querySelector(`#${config.content}`);
  if (!block) return;
  event.preventDefault();
  event.stopPropagation();

  const title = props.lan === "zh" ? config.zh : config.en;
  if (panels.value.some((p) => p.id === config.content)) {
    // Already open: scroll it into view instead of adding a duplicate.
    const existing = bodyRef.value?.querySelector(`[data-panel="${config.content}"]`);
    if (existing) existing.scrollIntoView({ block: "nearest", behavior: "smooth" });
    return;
  }
  panels.value = [...panels.value, { id: config.content, title, html: cleanPanelHtml(block.innerHTML) }];
  nextTick(() => {
    const added = bodyRef.value?.querySelector(`[data-panel="${config.content}"]`);
    if (added) added.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}

function closePanel(id) {
  panels.value = panels.value.filter((p) => p.id !== id);
}

// The panels belong to one open of the drawer; drop them when it closes.
watch(() => props.show, (open) => {
  if (!open) panels.value = [];
});

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

        <div
          ref="bodyRef"
          class="nx-drawer-body"
          @click="onDrawerClick"
        >
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

          <!-- Revealed by the write-up's own inline links; shown as cards at the
               bottom so the reader never loses the document they were reading. -->
          <section
            v-for="panel in panels"
            :key="panel.id"
            class="nx-doc-card"
            :data-panel="panel.id"
          >
            <div class="nx-doc-card-head">
              <h3 class="nx-doc-card-title">{{ panel.title }}</h3>
              <button
                type="button"
                class="nx-close"
                :aria-label="lan === 'zh' ? '收起' : 'Collapse'"
                @click="closePanel(panel.id)"
              >
                <NxIcon
                  name="close"
                  :size="13"
                />
              </button>
            </div>
            <div
              class="nx-doc nx-doc-embedded"
              v-html="panel.html"
            />
          </section>
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

  /* A revealed block reads as a card appended to the write-up, not as another
     layer on top of it. */
  .nx-doc-card {
    margin-top: 16px;
    border: 1px solid var(--nx-line);
    border-radius: var(--nx-r-lg);
    background: var(--nx-fill);
    padding: 12px 14px 14px;
  }

  .nx-doc-card-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .nx-doc-card-title {
    flex: 1;
    min-width: 0;
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--nx-ink);
  }
</style>
