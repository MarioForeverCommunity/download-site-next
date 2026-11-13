<script setup>
// Masthead + rail for the redesigned pages.
//
// The rail is the cross-page navigation (it replaces the legacy tab strip), and
// the masthead carries identity plus off-site links. Page-level tools live in
// the sticky toolbar inside the page, not here, so this chrome never competes
// with the records for attention.
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { navTop, topBar } from "../../config.js";
import { NEXT_DESIGN } from "../../util/Design.js";
import DesignSwitch from "../DesignSwitch.vue";
import SiteFooter from "../SiteFooter.vue";

const props = defineProps({
  pageId: {
    type: String,
    required: true
  },
  lan: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ""
  },
  showFooter: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(["changeLanZh", "changeLanEn"]);

const pageEntry = computed(() => navTop.find((item) => item.id === props.pageId) || null);

// A page limited to one language displays that language's labels everywhere.
const displayLan = computed(() => {
  const entry = pageEntry.value;
  if (!entry) return props.lan;
  if (entry.show_en == false && props.lan === "en") return "zh";
  if (entry.show_zh == false && props.lan === "zh") return "en";
  return props.lan;
});

const isBilingual = computed(() => {
  const entry = pageEntry.value;
  if (!entry) return true;
  return entry.show_en !== false && entry.show_zh !== false;
});

const navEntries = computed(() => navTop.filter((item) => {
  if (item.show_zh === false && displayLan.value === "zh") return false;
  if (item.show_en === false && displayLan.value === "en") return false;
  return true;
}));

const externalLinks = computed(() => topBar.filter((item) => {
  if (item.show_zh === false && displayLan.value === "zh") return false;
  if (item.show_en === false && displayLan.value === "en") return false;
  return true;
}));

function label(item, key) {
  if (displayLan.value === "zh") return item[key];
  return item[`${key}_alt`] || item[key];
}

const pageTitle = computed(() => {
  if (props.title) return props.title;
  const entry = pageEntry.value;
  return entry ? label(entry, "title") : "";
});

// Off-site links collapse behind a single control on narrow screens.
const linksOpen = ref(false);
const mastRef = ref(null);

function onDocClick(event) {
  if (mastRef.value && !mastRef.value.contains(event.target)) {
    linksOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", onDocClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick);
});
</script>

<template>
  <div class="nx-root">
    <a
      class="nx-skip"
      href="#nx-content"
    >跳到主要内容 / Skip to content</a>

    <div
      ref="mastRef"
      class="nx-mast"
    >
      <div class="nx-mast-inner">
        <a
          class="nx-brand"
          href="./"
          :aria-label="displayLan === 'zh' ? 'Mario Forever 资源站首页' : 'Mario Forever archive home'"
        >
          <img
            :src="displayLan === 'zh' ? './images/logo_hd.png' : './images/logo2_hd.png'"
            alt="Mario Forever"
          />
        </a>
        <span class="nx-brand-sep" />
        <span class="nx-brand-page">{{ pageTitle }}</span>

        <span class="nx-mast-spacer" />

        <nav
          class="nx-mast-links"
          :aria-label="displayLan === 'zh' ? '社区站点' : 'Community links'"
        >
          <a
            v-for="item in externalLinks.slice(0, 6)"
            :key="item.link"
            class="nx-mast-link"
            :href="item.link"
            target="_blank"
            rel="noopener"
          >{{ label(item, "name") }}</a>
          <a
            v-if="externalLinks.length > 6"
            class="nx-mast-link"
            href="#nx-more-links"
            @click.prevent="linksOpen = !linksOpen"
          >{{ displayLan === "zh" ? "更多" : "More" }}</a>
        </nav>

        <div
          v-if="linksOpen"
          class="nx-more"
        >
          <a
            v-for="item in externalLinks.slice(6)"
            :key="item.link"
            :href="item.link"
            target="_blank"
            rel="noopener"
          >{{ label(item, "name") }}</a>
        </div>

        <div
          v-if="isBilingual"
          class="nx-lang"
          role="group"
          :aria-label="displayLan === 'zh' ? '界面语言' : 'Interface language'"
        >
          <a
            :class="{ on: lan === 'zh' }"
            @click="emit('changeLanZh')"
          >中文</a>
          <a
            :class="{ on: lan === 'en' }"
            @click="emit('changeLanEn')"
          >EN</a>
        </div>

        <DesignSwitch
          :current="NEXT_DESIGN"
          variant="link"
        />
      </div>
    </div>

    <div class="nx-body-area">
      <nav
        class="nx-rail"
        :aria-label="displayLan === 'zh' ? '站内导航' : 'Site navigation'"
      >
        <div class="nx-rail-group">
          <div class="nx-rail-title">{{ displayLan === "zh" ? "目录" : "CATALOGS" }}</div>
          <a
            v-for="item in navEntries"
            :key="item.id"
            :href="item.link"
            :class="{ on: item.id === pageId }"
            :aria-current="item.id === pageId ? 'page' : undefined"
          >
            <span>{{ label(item, "option") }}</span>
          </a>
        </div>
      </nav>

      <main
        id="nx-content"
        class="nx-main"
      >
        <slot />
      </main>
    </div>

    <div
      v-if="showFooter"
      class="nx-foot-wrap"
    >
      <SiteFooter />
    </div>
  </div>
</template>

<style scoped>
  .nx-skip {
    position: absolute;
    left: -9999px;
    top: 0;
    z-index: 100;
    background: #ffffff;
    color: #15181a;
    padding: 8px 14px;
    border-radius: 0 0 4px 0;
    font-size: 13px;
  }

  .nx-skip:focus {
    left: 0;
  }

  .nx-mast {
    position: relative;
    z-index: 50;
  }

  .nx-more {
    position: absolute;
    top: calc(100% + 6px);
    right: 20px;
    background: var(--nx-panel);
    border: 1px solid var(--nx-line);
    border-radius: 6px;
    box-shadow: var(--nx-shadow-2);
    padding: 6px;
    display: grid;
    min-width: 160px;
    z-index: 60;
  }

  .nx-more a {
    padding: 7px 10px;
    border-radius: 4px;
    font-size: 13px;
    color: var(--nx-ink-2);
  }

  .nx-more a:hover {
    background: var(--nx-panel-2);
    color: var(--nx-ink);
  }

  .nx-foot-wrap {
    border-top: 1px solid var(--nx-line);
    background: var(--nx-bg);
  }

  .nx-foot-wrap :deep(footer) {
    max-width: 1680px;
    margin: 0 auto;
    padding: 16px 28px 26px;
    color: var(--nx-muted);
    font-size: 12px;
    text-align: left;
  }

  .nx-foot-wrap :deep(footer span) {
    border: 0;
    margin: 0;
    padding: 0;
    display: inline-block;
  }

  .nx-foot-wrap :deep(footer span + span) {
    margin-left: 14px;
  }

  .nx-foot-wrap :deep(footer a) {
    color: var(--nx-muted);
    text-decoration: underline;
    text-decoration-color: var(--nx-line);
    text-underline-offset: 2px;
  }

  .nx-foot-wrap :deep(footer a:hover) {
    color: var(--nx-ink);
  }

  .nx-foot-wrap :deep(.copyright-notice) {
    margin-bottom: 4px;
  }

  @media (max-width: 900px) {
    .nx-mast-inner {
      padding: 0 14px;
      gap: 12px;
    }

    .nx-brand-page,
    .nx-brand-sep {
      display: none;
    }
  }
</style>
