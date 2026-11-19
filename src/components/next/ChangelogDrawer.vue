<script setup>
// Changelog as a side drawer rather than a modal, matching how details and the
// version history are presented everywhere else in the redesigned UI: the page
// behind stays visible and the visitor keeps their place in the catalog.
import { computed, watch, onMounted, onBeforeUnmount } from "vue";
import { changelog } from "../../data/changelog.js";
import { siteVersion } from "../../config.js";
import NxIcon from "./NxIcon.vue";
import { lockScroll, releaseScroll } from "../../util/next/scrollLock.js";
import { pushBackGuard } from "../../util/backGuard.js";
import { dataLangOf, localeNeedsConversion, localizeText, useI18n } from "../../i18n/index.js";
import { prepareConversion } from "../../i18n/convert.js";

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  // Interface locale (see src/i18n/locales/*).
  locale: {
    type: String,
    required: true
  }
});

const emit = defineEmits(["close"]);

const { t } = useI18n(() => props.locale);

// The changelog data itself exists in Chinese and English only (src/data/
// changelog.js); a third locale reads whichever of the two matches its content
// language, so a new interface language needs no changelog translation to ship.
// The Chinese list is written in Simplified Chinese, so a converting interface
// (Traditional Chinese) reads it through the character converter — that is the
// one piece of site-written prose that is machine-converted, because it is the
// site's own history rather than a contributor's text.
const CATEGORY_KEYS = ["features", "improvements", "fixes", "misc"];

const categories = computed(() => CATEGORY_KEYS.map((key) => ({
  key,
  label: t(`changelog.${key}`),
})));

function entryItems(entry, key) {
  if (dataLangOf(props.locale) === "en") {
    const en = entry[`${key}_en`];
    if (en && en.length > 0) return en;
  }
  return (entry[key] || []).map((item) => localizeText(item, props.locale));
}

function entryCategories(entry) {
  return categories.value.filter((cat) => entryItems(entry, cat.key).length > 0);
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
    // The changelog has no Traditional source file; load the ~1 MB dictionary
    // on first open only (and only for a converting locale).
    if (localeNeedsConversion(props.locale)) prepareConversion(true);
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
        :aria-label="t('common.close')"
        @click="emit('close')"
      />
    </Transition>
    <Transition name="nx-slide">
      <aside
        v-if="show"
        class="nx-drawer"
        role="dialog"
        aria-modal="true"
        :aria-label="t('changelog.title')"
        style="--nx-drawer-w: min(560px, 100vw);"
      >
        <div class="nx-drawer-head">
          <div style="flex:1; min-width:0;">
            <h2 class="nx-drawer-title">{{ t("changelog.title") }}</h2>
            <p class="nx-drawer-sub">{{ t("changelog.subtitle") }}</p>
          </div>
          <button
            class="nx-close"
            type="button"
            :aria-label="t('common.close')"
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
              >{{ t("changelog.current") }}</span>
              <span class="nx-cl-date nx-num">{{ entry.date }}</span>
            </div>

            <div
              v-for="cat in entryCategories(entry)"
              :key="cat.key"
              class="nx-cl-cat"
            >
              <span class="nx-cl-pill" :class="`is-${cat.key}`">{{ cat.label }}</span>
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
