<script setup>
// Changelog as a side drawer rather than a modal, matching how details and the
// version history are presented everywhere else in the redesigned UI: the page
// behind stays visible and the visitor keeps their place in the catalog.
import { watch, onMounted, onBeforeUnmount } from "vue";
import { changelog } from "../../data/changelog.js";
import { siteVersion } from "../../config.js";
import NxIcon from "./NxIcon.vue";
import { lockScroll, releaseScroll } from "../../util/next/scrollLock.js";
import { pushBackGuard } from "../../util/next/backGuard.js";

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  lan: {
    type: String,
    required: true
  }
});

const emit = defineEmits(["close"]);

const categories = [
  { key: "features", zh: "新功能", en: "New" },
  { key: "improvements", zh: "优化", en: "Improved" },
  { key: "fixes", zh: "修复", en: "Fixed" },
  { key: "misc", zh: "其他", en: "Other" },
];

function entryItems(entry, key) {
  if (props.lan === "en") {
    const en = entry[`${key}_en`];
    if (en && en.length > 0) return en;
  }
  return entry[key] || [];
}

function entryCategories(entry) {
  return categories.filter((cat) => entryItems(entry, cat.key).length > 0);
}

function isCurrentVersion(version) {
  return siteVersion === `v${version}`;
}

function onKeydown(event) {
  if (event.key === "Escape" && props.show) emit("close");
}

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
  releaseScroll();
});

// The Android back button closes the drawer instead of leaving the page.
let releaseBack = null;

watch(() => props.show, (open) => {
  lockScroll(open);
  if (open) {
    releaseBack = pushBackGuard(() => emit("close"));
  } else if (releaseBack) {
    releaseBack();
    releaseBack = null;
  }
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
        :aria-label="lan === 'zh' ? '更新履历' : 'Changelog'"
        style="--nx-drawer-w: min(560px, 100vw);"
      >
        <div class="nx-drawer-head">
          <div style="flex:1; min-width:0;">
            <h2 class="nx-drawer-title">{{ lan === "zh" ? "更新履历" : "Changelog" }}</h2>
            <p class="nx-drawer-sub">{{ lan === "zh" ? "本站自身的改动记录" : "Changes to this site" }}</p>
          </div>
          <button
            class="nx-close"
            type="button"
            :aria-label="lan === 'zh' ? '关闭' : 'Close'"
            @click="emit('close')"
          >
            <NxIcon name="close" :size="15" />
          </button>
        </div>

        <div class="nx-drawer-body">
          <section
            v-for="entry in changelog"
            :key="entry.version"
            class="nx-cl"
          >
            <div class="nx-cl-head">
              <span class="nx-cl-version nx-num">v{{ entry.version }}</span>
              <span
                v-if="isCurrentVersion(entry.version)"
                class="nx-cl-current"
              >{{ lan === "zh" ? "当前版本" : "Current" }}</span>
              <span class="nx-cl-date nx-num">{{ entry.date }}</span>
            </div>

            <div
              v-for="cat in entryCategories(entry)"
              :key="cat.key"
              class="nx-cl-cat"
            >
              <span class="nx-cl-pill" :class="`is-${cat.key}`">{{ lan === "zh" ? cat.zh : cat.en }}</span>
              <ul class="nx-cl-list">
                <li
                  v-for="(item, index) in entryItems(entry, cat.key)"
                  :key="index"
                >{{ item }}</li>
              </ul>
            </div>
          </section>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .nx-cl {
    padding-bottom: 18px;
    margin-bottom: 18px;
    border-bottom: 1px solid var(--nx-line);
  }

  .nx-cl:last-child {
    border-bottom: 0;
    margin-bottom: 0;
  }

  .nx-cl-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .nx-cl-version {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .nx-cl-current {
    font-size: 10px;
    font-weight: 600;
    color: var(--nx-accent);
    background: var(--nx-accent-soft);
    border: 1px solid var(--nx-accent-border);
    border-radius: 3px;
    padding: 1px 5px;
  }

  .nx-cl-date {
    margin-left: auto;
    font-size: 11.5px;
    color: var(--nx-faint);
  }

  .nx-cl-cat {
    display: grid;
    grid-template-columns: 56px minmax(0, 1fr);
    gap: 8px;
    margin-top: 9px;
  }

  .nx-cl-pill {
    align-self: start;
    font-size: 10px;
    font-weight: 600;
    text-align: center;
    border-radius: 3px;
    padding: 2px 0;
    border: 1px solid var(--nx-line);
    background: var(--nx-fill);
    color: var(--nx-muted);
  }

  .nx-cl-pill.is-features {
    color: var(--nx-cur);
    border-color: color-mix(in srgb, var(--nx-cur) 28%, transparent);
    background: color-mix(in srgb, var(--nx-cur) 7%, transparent);
  }

  /* Improvements read as blue, fixes as orange, and anything uncategorised
     stays grey — the same meaning-carrying palette used elsewhere. */
  .nx-cl-pill.is-improvements {
    color: var(--nx-intl);
    border-color: color-mix(in srgb, var(--nx-intl) 28%, transparent);
    background: color-mix(in srgb, var(--nx-intl) 7%, transparent);
  }

  .nx-cl-pill.is-fixes {
    color: var(--nx-warn);
    border-color: color-mix(in srgb, var(--nx-warn) 32%, transparent);
    background: color-mix(in srgb, var(--nx-warn) 8%, transparent);
  }

  .nx-cl-pill.is-misc {
    color: var(--nx-muted);
    border-color: var(--nx-line);
    background: var(--nx-fill);
  }

  .nx-cl-list {
    margin: 0;
    padding-left: 14px;
    list-style: disc;
  }

  .nx-cl-list li {
    font-size: 12.5px;
    line-height: 1.6;
    color: var(--nx-ink-2);
  }

  .nx-cl-list li + li {
    margin-top: 4px;
  }

  .nx-cl-list li::marker {
    color: var(--nx-faint);
  }
</style>
