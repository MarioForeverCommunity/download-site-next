<script setup>
// App shell for the redesigned pages.
//
// Layout mirrors a catalog tool rather than a marketing page: a slim warm-grey
// navigation rail, a white content canvas, a topbar carrying the two searches
// and the global actions, and (per catalog page) a secondary filter pane next
// to the results.
//
// The legacy design stays one click away, but the hand-off moved into "Global
// settings" — a permanent topbar button advertising a second design was louder
// than the catalog itself.
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { navTop, topBar, siteVersion } from "../../config.js";
import { NEXT_DESIGN } from "../../util/Design.js";
import { getTheme, toggleTheme, getDensity, toggleDensity } from "../../util/Theme.js";
import DesignSwitch from "../DesignSwitch.vue";
import ChangelogDrawer from "./ChangelogDrawer.vue";
import NxFooter from "./NxFooter.vue";
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
  // shows only the global actions.
  search: {
    type: Object,
    default: null
  },
  showRandom: {
    type: Boolean,
    default: false
  },
  showFilterToggle: {
    type: Boolean,
    default: false
  },
  filterOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["changeLanZh", "changeLanEn", "random", "toggleFilters"]);

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
  filters: "筛选",
  legacy: "切换到旧版设计",
  light: "浅色模式",
  dark: "深色模式",
  comfortable: "舒适模式",
  compact: "紧凑模式",
  catalogs: "目录",
  elsewhere: "站外",
} : {
  search: "Search titles, aliases, filenames…",
  author: "Search authors…",
  random: "Random game",
  settings: "Global settings",
  changelog: "Changelog",
  language: "Language",
  filters: "Filters",
  legacy: "Switch to legacy design",
  light: "Light mode",
  dark: "Dark mode",
  comfortable: "Comfortable",
  compact: "Compact mode",
  catalogs: "Catalogs",
  elsewhere: "Elsewhere",
}));

const theme = getTheme();
const density = getDensity();

// ── menus ────────────────────────────────────────────────────
const openMenu = ref(null); // 'lang' | 'settings' | null
const showChangelog = ref(false);
const rootRef = ref(null);

function toggleMenu(name) {
  openMenu.value = openMenu.value === name ? null : name;
}

function closeMenus() {
  openMenu.value = null;
}

function onDocClick(event) {
  if (!rootRef.value || !rootRef.value.contains(event.target)) {
    closeMenus();
  }
}

function onKeydown(event) {
  if (event.key === "Escape" && openMenu.value) closeMenus();
}

const showLanguageMenu = computed(() => isBilingual.value);

function chooseLanguage(value) {
  closeMenus();
  if (value === "zh") emit("changeLanZh");
  else emit("changeLanEn");
}

const languageLabel = computed(() => (displayLan.value === "zh" ? "中文" : "English"));

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
  >
    <!-- left navigation rail -->
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

      <div class="nx-rail-foot">
        <button
          type="button"
          style="border:0;background:transparent;color:inherit;font-size:11.5px;text-align:left;padding:0;cursor:pointer;"
          @click="showChangelog = true"
        >{{ text.changelog }}</button>
        <span>{{ siteVersion }}</span>
      </div>
    </aside>

    <div class="nx-main">
      <!-- topbar: title search | author search | actions -->
      <header class="nx-topbar">
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

        <div class="nx-actions">
          <button
            v-if="showFilterToggle"
            type="button"
            class="nx-icon-btn"
            :aria-label="text.filters"
            :title="text.filters"
            :aria-expanded="filterOpen"
            @click="emit('toggleFilters')"
          >
            <NxIcon name="filter" :size="15" />
          </button>

          <button
            v-if="showRandom"
            type="button"
            class="nx-icon-btn"
            :aria-label="text.random"
            :title="text.random"
            @click="emit('random')"
          >
            <NxIcon name="shuffle" :size="15" />
          </button>

          <!-- theme: always visible top-right, one click -->
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

          <!-- language: dropdown, not an inline pair -->
          <div
            v-if="showLanguageMenu"
            class="nx-lang"
          >
            <button
              type="button"
              class="nx-lang-btn"
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

          <!-- global settings: theme, density, changelog, design hand-off -->
          <div class="nx-lang">
            <button
              type="button"
              class="nx-icon-btn"
              :class="{ 'is-on': openMenu === 'settings' }"
              :aria-expanded="openMenu === 'settings'"
              :aria-label="text.settings"
              :title="text.settings"
              @click="toggleMenu('settings')"
            >
              <NxIcon name="settings" :size="15" />
            </button>
            <Transition name="nx-fade">
              <div
                v-if="openMenu === 'settings'"
                class="nx-menu"
                style="min-width: 216px;"
              >
                <button
                  type="button"
                  @click="toggleDensity()"
                >
                  <NxIcon name="rows" :size="14" />
                  {{ density === "compact" ? text.comfortable : text.compact }}
                </button>
                <button
                  type="button"
                  @click="showChangelog = true; closeMenus()"
                >
                  <NxIcon name="info" :size="14" />
                  {{ text.changelog }}
                </button>
                <div class="nx-menu-sep" />
                <DesignSwitch
                  :current="NEXT_DESIGN"
                  variant="menu"
                  :label="text.legacy"
                />
              </div>
            </Transition>
          </div>
        </div>
      </header>

      <slot />

      <NxFooter
        :lan="displayLan"
        @open-changelog="showChangelog = true"
      />
    </div>

    <ChangelogDrawer
      :show="showChangelog"
      :lan="displayLan"
      @close="showChangelog = false"
    />
  </div>
</template>
