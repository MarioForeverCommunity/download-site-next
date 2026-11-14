<script setup>
// App shell for the redesigned pages.
//
// Layout mirrors a catalog tool rather than a marketing page: a slim warm-grey
// navigation rail (which also carries the footer, so the content column ends
// where the records end), a white content canvas, a topbar holding the page
// title, the two searches and the global actions, and a secondary filter pane
// next to the results.
//
// The legacy design stays one click away, but the hand-off moved into "Global
// settings" — a permanent topbar button advertising a second design was louder
// than the catalog itself.
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { navTop, topBar, siteVersion } from "../../config.js";

import { getTheme, toggleTheme } from "../../util/Theme.js";

import ChangelogDrawer from "./ChangelogDrawer.vue";
import NxSettings from "./NxSettings.vue";
import NxIcon from "./NxIcon.vue";

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
  // Catalog pages supply a search model; doc pages leave it out and the topbar
  // shows only the page title and the global actions.
  search: {
    type: Object,
    default: null
  },
  showRandom: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["changeLanZh", "changeLanEn", "random"]);

// The build timestamp was lost when the footer moved into the rail; restore it
// alongside the version so the rail carries the same provenance as before.
const buildTimeText = (() => {
  try {
    const date = new Date(BUILD_TIME);
    const pad = (v) => String(v).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  } catch (_e) {
    return "";
  }
})();

const pageEntry = computed(() => navTop.find((item) => item.id === props.pageId) || null);

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

const NAV_ICONS = {
  index: "home",
  "mf-games": "list",
  "mw-levels": "grid",
  assets: "layers",
  engines: "package",
  "mario-worker": "package",
  softendo: "grid",
};

const text = computed(() => (displayLan.value === "zh" ? {
  search: "搜索标题、别名、文件名…",
  author: "搜索作者…",
  random: "随机游戏",
  settings: "全局设置",
  changelog: "更新履历",
  language: "语言",
  legacy: "切换到旧版设计",
  light: "浅色模式",
  dark: "深色模式",
  compact: "紧凑模式",
  catalogs: "目录",
  elsewhere: "站外",
  menu: "菜单",
} : {
  search: "Search titles, aliases, filenames…",
  author: "Search authors…",
  random: "Random game",
  settings: "Global settings",
  changelog: "Changelog",
  language: "Language",
  legacy: "Switch to legacy design",
  light: "Light mode",
  dark: "Dark mode",
  compact: "Compact mode",
  catalogs: "Catalogs",
  elsewhere: "Elsewhere",
  menu: "Menu",
}));

const theme = getTheme();

// ── menus ────────────────────────────────────────────────────
const openMenu = ref(null); // 'lang' | 'settings' | null
const showChangelog = ref(false);
const settingsOpen = ref(false);
const rootRef = ref(null);
// Narrow screens collapse the rail into a toggleable panel.
const railOpen = ref(false);

function toggleMenu(name) {
  openMenu.value = openMenu.value === name ? null : name;
}

function closeMenus() {
  openMenu.value = null;
}

function onDocClick(event) {
  // Clicking anywhere outside the topbar's menus closes them; clicking outside
  // the (fixed) rail also collapses it on mobile. Both menu triggers must be
  // excluded, otherwise the click that opens a menu immediately closes it.
  const target = event.target;
  const insideMenu = target.closest && target.closest(".nx-menu, .nx-menu-trigger, .nx-rail-toggle");
  if (!insideMenu && openMenu.value) closeMenus();
  if (railOpen.value) {
    const insideRail = target.closest && target.closest(".nx-rail");
    const isToggle = target.closest && target.closest(".nx-rail-toggle");
    if (!insideRail && !isToggle) railOpen.value = false;
  }
}

function onKeydown(event) {
  if (event.key !== "Escape") return;
  if (openMenu.value) closeMenus();
  else if (railOpen.value) railOpen.value = false;
}

const showLanguageMenu = computed(() => isBilingual.value);

function chooseLanguage(value) {
  closeMenus();
  if (value === "zh") emit("changeLanZh");
  else emit("changeLanEn");
}

const languageLabel = computed(() => (displayLan.value === "zh" ? "中文" : "English"));

// The page title sits in the topbar of the main area, per review.
const pageTitle = computed(() => {
  if (props.title) return props.title;
  const entry = pageEntry.value;
  return entry ? label(entry, "title") : "";
});

// The two searches are independent: one matches titles/aliases/filenames, the
// other matches authors only.
const titleQuery = computed({
  get: () => (props.search ? props.search.query.value : ""),
  set: (value) => { if (props.search) props.search.setQuery(value); },
});

const authorQuery = computed({
  get: () => (props.search ? props.search.authorQuery.value : ""),
  set: (value) => { if (props.search) props.search.setAuthorQuery(value); },
});

onMounted(() => {
  document.addEventListener("click", onDocClick);
  document.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick);
  document.removeEventListener("keydown", onKeydown);
});

watch(showChangelog, (open) => {
  document.body.classList.toggle("nx-locked", open);
});
</script>

<template>
  <div
    ref="rootRef"
    class="nx-root"
    :class="{ 'rail-open': railOpen }"
  >
    <!-- left navigation rail; on narrow screens it collapses behind the
         topbar's menu button -->
    <aside class="nx-rail">
      <a
        class="nx-rail-brand"
        href="./"
        :aria-label="displayLan === 'zh' ? 'Mario Forever 资源站首页' : 'Mario Forever archive home'"
      >
        <img
          :src="displayLan === 'zh' ? './images/logo_hd.png' : './images/logo2_hd.png'"
          alt="Mario Forever"
        />
      </a>

      <nav class="nx-rail-group">
        <div class="nx-rail-title">{{ text.catalogs }}</div>
        <a
          v-for="item in navEntries"
          :key="item.id"
          class="nx-rail-item"
          :class="{ on: item.id === pageId }"
          :href="item.link"
          :aria-current="item.id === pageId ? 'page' : undefined"
        >
          <span class="nx-rail-icon"><NxIcon :name="NAV_ICONS[item.id] || 'list'" :size="14" /></span>
          <span>{{ label(item, "option") }}</span>
        </a>
      </nav>

      <nav class="nx-rail-group">
        <div class="nx-rail-title">{{ text.elsewhere }}</div>
        <a
          v-for="item in externalLinks.slice(0, 6)"
          :key="item.link"
          class="nx-rail-item"
          :href="item.link"
          target="_blank"
          rel="noopener"
        >
          <span>{{ label(item, "name") }}</span>
        </a>
      </nav>

      <!-- Site-level entries use the same row style as the catalog and
           external groups above. -->
      <nav class="nx-rail-group nx-rail-meta">
        <button
          type="button"
          class="nx-rail-item"
          @click="showChangelog = true"
        >
          <span class="nx-rail-icon"><NxIcon name="history" :size="14" /></span>
          <span>{{ text.changelog }}</span>
        </button>
        <a
          class="nx-rail-item"
          href="https://github.com/MarioForeverCommunity/download-site-next"
          target="_blank"
          rel="noopener"
        >
          <span class="nx-rail-icon"><NxIcon name="github" :size="14" /></span>
          <span>{{ displayLan === "zh" ? "本站源码" : "Source code" }}</span>
        </a>
        <!-- The status page is a Chinese-only service, so the English rail
             omits the entry rather than linking to a page in another language. -->
        <a
          v-if="displayLan === 'zh'"
          class="nx-rail-item"
          href="https://status.marioforever.net/"
          target="_blank"
          rel="noopener"
        >
          <span class="nx-rail-icon"><NxIcon name="info" :size="14" /></span>
          <span>网站状态</span>
        </a>
      </nav>

      <div class="nx-rail-foot">
        <p class="nx-rail-legal">
          {{ displayLan === "zh"
            ? "本站非 Softendo / 任天堂官方网站，马里奥相关版权归任天堂所有。"
            : "This is NOT a Softendo/Nintendo official site. Mario and its related copyrights belong to Nintendo." }}
        </p>
        <span class="nx-rail-foot-meta">{{ siteVersion }}</span>
        <span class="nx-rail-foot-meta">{{ displayLan === "zh" ? "构建于" : "Built" }} {{ buildTimeText }}</span>
      </div>
    </aside>

    <div class="nx-main">
      <!-- topbar: page title | two searches | actions -->
      <header class="nx-topbar">
        <button
          type="button"
          class="nx-icon-btn nx-rail-toggle"
          :aria-label="text.menu"
          :aria-expanded="railOpen"
          @click.stop="railOpen = !railOpen"
        >
          <NxIcon name="menu" :size="16" />
        </button>

        <h1 class="nx-topbar-title">{{ pageTitle }}</h1>

        <div
          v-if="search"
          class="nx-search"
        >
          <span class="nx-search-icon"><NxIcon name="search" :size="14" /></span>
          <input
            :value="titleQuery"
            type="search"
            :placeholder="text.search"
            :aria-label="text.search"
            @input="titleQuery = $event.target.value"
          />
          <button
            v-if="titleQuery"
            class="nx-search-clear"
            type="button"
            :aria-label="displayLan === 'zh' ? '清除' : 'Clear'"
            @click="titleQuery = ''"
          >×</button>
        </div>

        <div
          v-if="search"
          class="nx-search"
        >
          <span class="nx-search-icon"><NxIcon name="user" :size="14" /></span>
          <input
            :value="authorQuery"
            type="search"
            :placeholder="text.author"
            :aria-label="text.author"
            @input="authorQuery = $event.target.value"
          />
          <button
            v-if="authorQuery"
            class="nx-search-clear"
            type="button"
            :aria-label="displayLan === 'zh' ? '清除' : 'Clear'"
            @click="authorQuery = ''"
          >×</button>
        </div>

        <span class="nx-topbar-spacer" />

        <!-- order per review: language → theme → settings -->
        <div class="nx-actions">
          <div
            v-if="showLanguageMenu"
            class="nx-lang"
          >
            <button
              type="button"
              class="nx-lang-btn nx-menu-trigger"
              :aria-expanded="openMenu === 'lang'"
              :aria-label="text.language"
              @click="toggleMenu('lang')"
            >
              <NxIcon name="globe" :size="14" />
              {{ languageLabel }}
              <NxIcon name="chevronDown" :size="11" />
            </button>
            <Transition name="nx-fade">
              <div
                v-if="openMenu === 'lang'"
                class="nx-menu"
              >
                <button
                  type="button"
                  :class="{ on: displayLan === 'zh' }"
                  @click="chooseLanguage('zh')"
                >
                  <NxIcon
                    name="check"
                    :size="13"
                    :style="{ opacity: displayLan === 'zh' ? 1 : 0 }"
                  />
                  中文
                </button>
                <button
                  type="button"
                  :class="{ on: displayLan === 'en' }"
                  @click="chooseLanguage('en')"
                >
                  <NxIcon
                    name="check"
                    :size="13"
                    :style="{ opacity: displayLan === 'en' ? 1 : 0 }"
                  />
                  English
                </button>
              </div>
            </Transition>
          </div>

          <button
            type="button"
            class="nx-icon-btn"
            :aria-label="theme === 'dark' ? text.light : text.dark"
            :title="theme === 'dark' ? text.light : text.dark"
            @click="toggleTheme()"
          >
            <NxIcon
              :name="theme === 'dark' ? 'sun' : 'moon'"
              :size="15"
            />
          </button>

          <button
            type="button"
            class="nx-icon-btn"
            :class="{ 'is-on': settingsOpen }"
            :aria-expanded="settingsOpen"
            :aria-label="text.settings"
            :title="text.settings"
            @click="settingsOpen = true"
          >
            <NxIcon
              name="settingsDots"
              :size="16"
            />
          </button>
        </div>
      </header>

      <slot />
    </div>

    <ChangelogDrawer
      :show="showChangelog"
      :lan="displayLan"
      @close="showChangelog = false"
    />

    <NxSettings
      :show="settingsOpen"
      :lan="displayLan"
      @close="settingsOpen = false"
    />
  </div>
</template>
