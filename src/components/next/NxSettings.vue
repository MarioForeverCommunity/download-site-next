<script setup>
// Global settings as a side drawer.
//
// A drawer (rather than the small popover it used to be) because these are real
// preferences, not menu commands: default sort, the File Hub direct-link switch,
// and the hand-off to the legacy design. Mirrors the legacy Global Settings
// dialog's options, in the new design's idiom.
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { getDefaultSort, setDefaultSort, getUseDirectLink, getPageSize, setPageSize } from "../../util/Language.js";
import { NEXT_DESIGN } from "../../util/Design.js";
import DesignSwitch from "../DesignSwitch.vue";
import NxIcon from "./NxIcon.vue";
import { lockScroll, releaseScroll } from "../../util/next/scrollLock.js";
import { pushBackGuard } from "../../util/backGuard.js";
import { useI18n } from "../../i18n/index.js";

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

const PAGE_SIZE_VALUES = [25, 50, 100, 200, 0];

const text = computed(() => ({
  title: t("settings.title"),
  subtitle: t("settings.subtitle"),
  sort: t("settings.sort"),
  pageSize: t("settings.pageSize"),
  pageSizeHint: t("settings.pageSizeHint"),
  pageSizes: PAGE_SIZE_VALUES.map((value) => ({
    value,
    label: value === 0 ? t("settings.pageSizeAll") : t("settings.pageSizeUnit", { n: value }),
  })),
  direct: t("settings.direct"),
  directText: t("settings.directText"),
  directHint: t("settings.directHint"),
  design: t("settings.design"),
  legacy: t("settings.legacy"),
  close: t("settings.close"),
  sorts: [
    { value: "name_asc", label: t("settings.sortNameAsc") },
    { value: "name_desc", label: t("settings.sortNameDesc") },
    { value: "author_asc", label: t("settings.sortAuthorAsc") },
    { value: "author_desc", label: t("settings.sortAuthorDesc") },
    { value: "date_asc", label: t("settings.sortDateAsc") },
    { value: "date_desc", label: t("settings.sortDateDesc") },
  ],
}));

const defaultSort = getDefaultSort();
const useDirectLink = getUseDirectLink();
const pageSize = getPageSize();

// Edited in the drawer, committed on close — same model as the legacy dialog.
const tempSort = ref("date_desc");
const tempDirect = ref(false);
const tempPageSize = ref(50);

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
  if (open) {
    tempSort.value = defaultSort.value;
    tempDirect.value = useDirectLink.value;
    tempPageSize.value = pageSize.value;
  } else {
    // commit on close
    setDefaultSort(tempSort.value);
    useDirectLink.value = tempDirect.value;
    setPageSize(tempPageSize.value);
  }
});

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
</script>

<template>
  <Teleport to="body">
    <Transition name="nx-fade">
      <button
        v-if="show"
        class="nx-scrim"
        type="button"
        :aria-label="text.close"
        @click="emit('close')"
      />
    </Transition>
    <Transition name="nx-slide">
      <aside
        v-if="show"
        class="nx-drawer"
        role="dialog"
        aria-modal="true"
        :aria-label="text.title"
        style="--nx-drawer-w: min(420px, 100vw);"
      >
        <div class="nx-drawer-head">
          <div style="flex:1; min-width:0;">
            <h2 class="nx-drawer-title">{{ text.title }}</h2>
            <p class="nx-drawer-sub">{{ text.subtitle }}</p>
          </div>
          <button
            class="nx-close"
            type="button"
            :aria-label="text.close"
            @click="emit('close')"
          >
            <NxIcon
              name="close"
              :size="15"
            />
          </button>
        </div>

        <div class="nx-drawer-body">
          <section class="nx-section">
            <div class="nx-section-label">{{ text.sort }}</div>
            <div
              class="nx-checks"
              role="radiogroup"
              :aria-label="text.sort"
            >
              <button
                v-for="option in text.sorts"
                :key="option.value"
                type="button"
                class="nx-check"
                :class="{ on: tempSort === option.value }"
                role="radio"
                :aria-checked="tempSort === option.value"
                @click="tempSort = option.value"
              >
                <span
                  class="nx-radio"
                  :class="{ on: tempSort === option.value }"
                />
                <span>{{ option.label }}</span>
              </button>
            </div>
          </section>

          <section class="nx-section">
            <div class="nx-section-label">{{ text.pageSize }}</div>
            <div
              class="nx-checks"
              role="radiogroup"
              :aria-label="text.pageSize"
            >
              <button
                v-for="option in text.pageSizes"
                :key="option.value"
                type="button"
                class="nx-check"
                :class="{ on: tempPageSize === option.value }"
                role="radio"
                :aria-checked="tempPageSize === option.value"
                @click="tempPageSize = option.value"
              >
                <span
                  class="nx-radio"
                  :class="{ on: tempPageSize === option.value }"
                />
                <span>{{ option.label }}</span>
              </button>
            </div>
            <p style="font-size:11.5px;color:var(--nx-muted);margin-top:6px;line-height:1.5;">
              {{ text.pageSizeHint }}
            </p>
          </section>

          <section class="nx-section">
            <div class="nx-section-label">{{ text.direct }}</div>
            <button
              type="button"
              class="nx-check"
              :class="{ on: tempDirect }"
              :aria-pressed="tempDirect"
              @click="tempDirect = !tempDirect"
            >
              <span class="nx-check-box">
                <NxIcon
                  v-if="tempDirect"
                  name="check"
                  :size="10"
                />
              </span>
              <span>{{ text.directText }}</span>
            </button>
            <p style="font-size:11.5px;color:var(--nx-muted);margin-top:6px;line-height:1.5;">
              {{ text.directHint }}
            </p>
          </section>

          <section class="nx-section">
            <div class="nx-section-label">{{ text.design }}</div>
            <DesignSwitch
              :current="NEXT_DESIGN"
              variant="menu"
              :label="text.legacy"
            />
          </section>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>
