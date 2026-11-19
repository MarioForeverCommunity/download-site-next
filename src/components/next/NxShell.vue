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
//
// Every string here comes from the i18n catalogues (src/i18n/locales/*), and the
// language menu is built from the locale registry: adding a language file adds a
// menu entry, it does not touch this component.
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { navTop, topBar, siteVersion } from "../../config.js";

import { getTheme, toggleTheme } from "../../util/Theme.js";
import {
  getLocale,
  dataLangOf,
  localeNeedsConversion,
  localizedField,
  localeInfo,
  normalizeLocale,
  tFor
} from "../../i18n/index.js";
import { localeForEntry } from "../../util/next/pageLocale.js";
import { isEntryVisible } from "../../util/next/entryVisibility.js";
import { shellConfig } from "../../util/next/shellStore.js";

import ChangelogDrawer from "./ChangelogDrawer.vue";
import NxDocDrawer from "./NxDocDrawer.vue";
import NxSettings from "./NxSettings.vue";
import NxIcon from "./NxIcon.vue";
import { lockScroll } from "../../util/next/scrollLock.js";
import { pushBackGuard, abandonBackGuard } from "../../util/next/backGuard.js";
import { pageIdForHref } from "../../util/next/router.js";

const props = defineProps({
  pageId: {
    type: String,
    required: true
  },
  // Interface locale the page publishes. Empty means "whatever the visitor
  // chose"; the shell then resolves it against the page's own capability.
  locale: {
    type: String,
    default: ""
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
  // Catalog write-up shown in a side drawer from a topbar button: the pages own
  // their markdown, the shell only presents it.
  doc: {
    type: Object,
    default: null
  },
  docTitle: {
    type: String,
    default: ""
  },
  docUpdated: {
    type: String,
    default: ""
  },
  // Softendo entries have no authors (the catalog's "series" column borrows the
  // author slot), so that page hides the second search box.
  showAuthorSearch: {
    type: Boolean,
    default: true
  },
  showRandom: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["changeLocale", "random"]);

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

// Short commit hash of the build, linked to that exact commit on GitHub. The
// full hash is injected at build time; the link needs the full one while the
// label reads as the familiar seven characters.
const commitHash = typeof COMMIT_HASH === "string" ? COMMIT_HASH : "";
const commitShort = commitHash ? commitHash.slice(0, 7) : "";
const commitUrl = commitHash
  ? `https://github.com/MarioForeverCommunity/download-site-next/commit/${commitHash}`
  : null;

const pageEntry = computed(() => navTop.find((item) => item.id === props.pageId) || null);

// The locale the whole shell renders in. The page resolves it against the
// documents it actually has and publishes it; only if a page has not published
// one yet do we fall back to the config.js flags.
const displayLocale = computed(() => normalizeLocale(props.locale)
  || localeForEntry(getLocale(), pageEntry.value));

// Content language: which of the site's written languages the records and
// markdown are in (`zh` / `en`). Several legacy branches key off this rather than
// off the interface language — the legal notice, the brand logo, the status link.
const contentLang = computed(() => dataLangOf(displayLocale.value));

const t = (key, params) => tFor(displayLocale.value, key, params);

// Traditional Chinese interface (the locale that reads Simplified data through
// the converter). `show_zh_hant` keys off it, not off `zh` as a whole: an entry
// aimed at the mainland audience only has to disappear from the 繁體 rail.
const isTraditionalUi = computed(() => localeNeedsConversion(displayLocale.value));

// Only the Simplified Chinese interface counts as "Chinese" for the pieces that
// are deliberately localised to a single audience. Traditional Chinese reads the
// same Simplified data but presents the international variant.
const isSimplifiedUi = computed(() => contentLang.value === "zh" && !isTraditionalUi.value);

// The rail's brand mark follows the interface, not the written content language:
// Traditional Chinese uses the international logo like English / Polski.
const brandLogoSrc = computed(() => (isSimplifiedUi.value
  ? "./images/logo_new.png"
  : "./images/logo2_hd.png"));

// `show_new` / `show_zh_hant` / `show_zh` / `show_en` are resolved in one place
// (util/next/entryVisibility.js); only the language used for the check differs.
//
// The rail's own catalog links follow English/Polish on a Traditional Chinese
// interface: the English-only engines and Mario Worker editor pages are shown,
// and the Chinese-only level/assets catalogs are not. External site links keep
// the Chinese/English visibility rules (and their `show_zh_hant` switches), so
// the 繁體 rail can carry both sets without contradiction.
const navContentLang = computed(() => (isTraditionalUi.value ? "en" : contentLang.value));

const entryVisible = (item, language = contentLang.value) => isEntryVisible(item, {
  contentLang: language,
  traditionalUi: isTraditionalUi.value,
});

const navEntries = computed(() => navTop.filter((item) => entryVisible(item, navContentLang.value)));
const externalLinks = computed(() => topBar.filter((item) => entryVisible(item)));

// Labels of config.js entries: `option` / `option_alt` (rail) and `name` /
// `name_alt` (external links) are resolved with the locale's own field chain, so
// a locale can add `option_ru` later without touching this file.
function label(item, key) {
  return localizedField(item, key, displayLocale.value) || item[key] || "";
}

// Redesigned-only names are `<base>_<locale>_new` (`name_zh_hant_new`,
// `option_zh_new`, …). The suffix order follows the other config fields so a new
// locale needs no code change: exact locale → content language → English → bare
// `<base>_new`. Values are authored, not machine-converted.
function newField(item, base, code) {
  const info = localeInfo(code);
  // Config suffixes are snake_case (`zh_hant`), locale codes are `zh-Hant`.
  const suffix = (value) => value.toLowerCase().replace(/-/g, "_");
  return item[`${base}_${suffix(info.code)}_new`]
    || item[`${base}_${suffix(info.data)}_new`]
    || item[`${base}_en_new`]
    || item[`${base}_new`]
    || "";
}

// The Chinese rail can carry a fuller name for a catalog than the legacy
// header's short `option` ("Mario Forever 作品目录" vs "MF 作品目录"). Only the
// new-design Simplified Chinese interface uses it; the legacy header and every
// other locale keep their own fields.
function optionLabel(item) {
  return (isSimplifiedUi.value && newField(item, "option", displayLocale.value))
    || label(item, "option");
}

// Rail-only wording. `name_*_new` describes the same destination more fully, so
// it takes precedence over the shared `name` in the redesigned UI. The legacy
// design ignores these fields entirely.
function newLabel(item) {
  return newField(item, "name", displayLocale.value) || label(item, "name");
}

const NAV_ICONS = {
  index: "home",
  "mf-games": "list",
  "mw-levels": "hammer",
  assets: "layers",
  engines: "package",
  "mario-worker": "hammer",
  softendo: "grid",
};

const theme = getTheme();

// ── menus ────────────────────────────────────────────────────
const openMenu = ref(null); // 'lang' | 'settings' | null
const showChangelog = ref(false);
const settingsOpen = ref(false);
const docOpen = ref(false);
const rootRef = ref(null);
// Narrow screens collapse the rail into a toggleable panel.
const railOpen = ref(false);

// The catalog's results bar sticks directly beneath the topbar. On a phone the
// topbar wraps to two rows (title + actions, then the two searches) and doc
// pages have no searches at all, so its height cannot be a constant; it is
// measured here and published as a custom property that NxCatalog's bar reads
// as its sticky offset.
const topbarRef = ref(null);
let topbarObserver = null;

function syncTopbarHeight() {
  if (!rootRef.value || !topbarRef.value) return;
  const height = topbarRef.value.getBoundingClientRect().height;
  rootRef.value.style.setProperty("--nx-topbar-h", `${height}px`);
}

// The rail becomes an off-canvas drawer on phones. While it is open the page
// behind must not scroll, exactly like the other overlays.
// The Android back button closes the rail drawer instead of leaving the page.
let releaseBack = null;

watch(railOpen, (open) => {
  lockScroll(open);
  if (open) {
    releaseBack = pushBackGuard(() => { railOpen.value = false; });
  } else if (releaseBack) {
    releaseBack();
    releaseBack = null;
  }
});

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

// On a phone the rail is a drawer, so choosing anything in it must close the
// drawer: the visitor has made their choice and the page behind is what they
// want to see. Without this the panel stayed open over the page they had just
// navigated to. Links that open in a new tab are left alone — the current page
// is not going anywhere.
//
// A same-document link (the catalog tabs, the brand link) has to drop the back
// guard without unwinding it: the router replaces the sentinel entry with the
// new page, and calling `history.back()` here raced that navigation — when the
// target module was already cached the new entry landed first, the back press
// popped it, and the browser bounced to the page being left.
//
// Re-selecting the tab that is already open is not a navigation — the router
// only scrolls to the top — so that path keeps the normal unwind and leaves no
// stray entry in history.
function onRailClick(event) {
  if (!railOpen.value) return;
  const anchor = event.target.closest ? event.target.closest("a[href]") : null;
  if (anchor && anchor.target === "_blank") return;
  if (anchor) {
    const targetId = pageIdForHref(anchor.getAttribute("href"));
    if (targetId && targetId !== props.pageId) {
      abandonBackGuard();
      releaseBack = null;
    }
  }
  railOpen.value = false;
}

// Language choices come from what the page actually has: its markdown files (or,
// for a fully translated page such as About, its registered locale list). A page
// with only one available language has nothing to switch to, so the menu hides.
// Dropping in a new `<page>-<locale>.md` is all it takes to add an option.
//
// Sort by canonical locale code, not by the native display name: `de`, `en`,
// `pl`, `zh-Hans`, `zh-Hant` stay in code order no matter how those names are
// written or how the browser's locale collation behaves.
const byLocaleCode = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

const languageChoices = computed(() => (shellConfig.locales.length > 1
  ? [...shellConfig.locales].sort(byLocaleCode).map((code) => localeInfo(code)).filter(Boolean)
  : []));

const showLanguageMenu = computed(() => languageChoices.value.length > 1);

function chooseLanguage(value) {
  closeMenus();
  if (value === displayLocale.value) return;
  emit("changeLocale", value);
}

const languageLabel = computed(() => localeInfo(displayLocale.value).name);

// The page title sits in the topbar of the main area, per review.
//
// On a phone the full English (and some Traditional Chinese) titles are long
// enough to wrap the topbar, which pushed the language/theme/settings buttons
// onto a second line — and a dropdown anchored to a button that is no longer at
// the right edge spilled off-screen. Phones therefore use the sidebar's page
// name (`option_zh_hant` / `option_alt` / …), the same compact label the
// navigation already shows. Simplified titles are already short, and desktop
// always gets the full title.
const isNarrow = ref(false);

function updateNarrow() {
  isNarrow.value = window.innerWidth <= 860;
}

const pageTitle = computed(() => {
  const entry = pageEntry.value;
  // Phones + a non-Simplified interface (English, Polish, Traditional Chinese):
  // use the sidebar's compact label. This has to win over a `title` prop too —
  // some pages pass their full title explicitly, and that is what wrapped the
  // topbar and pushed the action buttons off the right edge.
  if (isNarrow.value && (contentLang.value !== "zh" || isTraditionalUi.value) && entry) {
    return optionLabel(entry);
  }
  // The Softendo catalog is the one page whose Chinese title is long enough to
  // crowd the phone topbar (the others are already short), so it uses the
  // sidebar name there too.
  if (isNarrow.value && entry && entry.id === "softendo") {
    return optionLabel(entry);
  }
  if (props.title) return props.title;
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

// ── back to top ──────────────────────────────────────────────
// Long catalogs and write-ups mean a lot of scrolling. The shell owns the
// button, so every redesigned page gets it without duplicating the listener.
const showBackToTop = ref(false);

function updateBackToTop() {
  showBackToTop.value = window.scrollY > 300;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(() => {
  document.addEventListener("click", onDocClick);
  document.addEventListener("keydown", onKeydown);
  updateNarrow();
  window.addEventListener("resize", updateNarrow);
  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();
  // The topbar's height changes with the page (searches appear on catalogs) and
  // with its own wrapping, so observe it rather than recomputing on resize only.
  if (typeof ResizeObserver !== "undefined" && topbarRef.value) {
    topbarObserver = new ResizeObserver(syncTopbarHeight);
    topbarObserver.observe(topbarRef.value);
  }
  syncTopbarHeight();
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick);
  document.removeEventListener("keydown", onKeydown);
  window.removeEventListener("resize", updateNarrow);
  window.removeEventListener("scroll", updateBackToTop);
  if (topbarObserver) topbarObserver.disconnect();
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
    <!-- Scrim for the phone-only rail drawer: covers the page, dims it and
         takes the clicks that would otherwise reach the content behind. -->
    <Transition name="nx-fade">
      <button
        v-if="railOpen"
        type="button"
        class="nx-scrim nx-rail-scrim"
        :aria-label="t('shell.menu')"
        @click="railOpen = false"
      />
    </Transition>

    <!-- left navigation rail; on narrow screens it collapses behind the
         topbar's menu button -->
    <aside
      class="nx-rail"
      @click="onRailClick"
    >
      <a
        class="nx-rail-brand"
        href="./"
      >
        <img
          :src="brandLogoSrc"
          alt="Mario Forever"
        />
        <span class="nx-rail-brand-text">{{ t("app.brandText") }}</span>
      </a>

      <nav class="nx-rail-group">
        <div class="nx-rail-title">{{ t("shell.catalogs") }}</div>
        <a
          v-for="item in navEntries"
          :key="item.id"
          class="nx-rail-item"
          :class="{ on: item.id === pageId }"
          :href="item.link"
          :aria-current="item.id === pageId ? 'page' : undefined"
        >
          <span class="nx-rail-icon"><NxIcon :name="NAV_ICONS[item.id] || 'list'" :size="14" /></span>
          <span>{{ optionLabel(item) }}</span>
        </a>
      </nav>

      <nav class="nx-rail-group">
        <div class="nx-rail-title">{{ t("shell.elsewhere") }}</div>
        <a
          v-for="item in externalLinks"
          :key="item.link"
          class="nx-rail-item"
          :href="item.link"
          target="_blank"
          rel="noopener"
        >
          <span>{{ newLabel(item) }}</span>
        </a>
      </nav>

      <!-- Site-level entries use the same row style as the catalog and
           external groups above. -->
      <nav class="nx-rail-group nx-rail-meta">
        <a
          class="nx-rail-item"
          :class="{ on: pageId === 'about' }"
          href="./about.html"
          :aria-current="pageId === 'about' ? 'page' : undefined"
        >
          <span class="nx-rail-icon"><NxIcon name="mail" :size="14" /></span>
          <span>{{ t("shell.aboutSite") }}</span>
        </a>
        <button
          type="button"
          class="nx-rail-item"
          @click="showChangelog = true"
        >
          <span class="nx-rail-icon"><NxIcon name="history" :size="14" /></span>
          <span>{{ t("shell.changelog") }}</span>
        </button>
        <a
          class="nx-rail-item"
          href="https://github.com/MarioForeverCommunity/download-site-next"
          target="_blank"
          rel="noopener"
        >
          <span class="nx-rail-icon"><NxIcon name="github" :size="14" /></span>
          <span>{{ t("shell.sourceCode") }}</span>
        </a>
        <!-- The status page is a Chinese-only service, so the other rails omit
             the entry rather than linking to a page in another language. -->
        <a
          v-if="contentLang === 'zh'"
          class="nx-rail-item"
          href="https://status.marioforever.net/"
          target="_blank"
          rel="noopener"
        >
          <span class="nx-rail-icon"><NxIcon name="info" :size="14" /></span>
          <span>{{ t("shell.siteStatus") }}</span>
        </a>
      </nav>

      <div class="nx-rail-foot">
        <!-- Every interface except Simplified Chinese shows this notice here;
             Traditional Chinese reads Simplified data but presents the
             international wording, so it needs the footer line back. -->
        <p
          v-if="!isSimplifiedUi"
          class="nx-rail-legal"
        >
          {{ t("app.legal") }}
        </p>
        <span class="nx-rail-foot-meta">
          {{ siteVersion }}<template v-if="commitUrl">
            (<a
              class="nx-rail-commit"
              :href="commitUrl"
              target="_blank"
              rel="noopener"
              :title="t('shell.viewCommit')"
            >{{ commitShort }}</a>)
          </template>
        </span>
        <span class="nx-rail-foot-meta">{{ t("shell.lastBuilt") }} {{ buildTimeText }}</span>
      </div>
    </aside>

    <div class="nx-main">
      <!-- topbar: page title | two searches | actions -->
      <header
        ref="topbarRef"
        class="nx-topbar"
      >
        <button
          type="button"
          class="nx-icon-btn nx-rail-toggle"
          :aria-label="t('shell.menu')"
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
            :placeholder="t('shell.search')"
            :aria-label="t('shell.search')"
            @input="titleQuery = $event.target.value"
          />
          <button
            v-if="titleQuery"
            class="nx-search-clear"
            type="button"
            :aria-label="t('common.clear')"
            @click="titleQuery = ''"
          >×</button>
        </div>

        <div
          v-if="search && showAuthorSearch"
          class="nx-search"
        >
          <span class="nx-search-icon"><NxIcon name="user" :size="14" /></span>
          <input
            :value="authorQuery"
            type="search"
            :placeholder="t('shell.searchAuthor')"
            :aria-label="t('shell.searchAuthor')"
            @input="authorQuery = $event.target.value"
          />
          <button
            v-if="authorQuery"
            class="nx-search-clear"
            type="button"
            :aria-label="t('common.clear')"
            @click="authorQuery = ''"
          >×</button>
        </div>

        <span class="nx-topbar-spacer" />

        <!-- order per review: about → language → theme → settings -->
        <div class="nx-actions">
          <button
            v-if="doc"
            type="button"
            class="nx-icon-btn"
            :class="{ 'is-on': docOpen }"
            :aria-expanded="docOpen"
            :aria-label="t('shell.aboutDoc')"
            :title="t('shell.aboutDoc')"
            @click="docOpen = true"
          >
            <NxIcon
              name="info"
              :size="15"
            />
          </button>

          <div
            v-if="showLanguageMenu"
            class="nx-lang"
          >
            <button
              type="button"
              class="nx-lang-btn nx-menu-trigger"
              :aria-expanded="openMenu === 'lang'"
              :aria-label="t('shell.language')"
              @click="toggleMenu('lang')"
            >
              <NxIcon name="globe" :size="14" />
              <span class="nx-lang-label">{{ languageLabel }}</span>
              <NxIcon
                class="nx-lang-caret"
                name="chevronDown"
                :size="11"
              />
            </button>
            <Transition name="nx-fade">
              <div
                v-if="openMenu === 'lang'"
                class="nx-menu"
              >
                <button
                  v-for="item in languageChoices"
                  :key="item.code"
                  type="button"
                  :class="{ on: item.code === displayLocale }"
                  :lang="item.htmlLang"
                  @click="chooseLanguage(item.code)"
                >
                  <NxIcon
                    name="check"
                    :size="13"
                    :style="{ opacity: item.code === displayLocale ? 1 : 0 }"
                  />
                  {{ item.name }}
                </button>
              </div>
            </Transition>
          </div>

          <button
            type="button"
            class="nx-icon-btn"
            :aria-label="theme === 'dark' ? t('shell.lightMode') : t('shell.darkMode')"
            :title="theme === 'dark' ? t('shell.lightMode') : t('shell.darkMode')"
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
            :aria-label="t('shell.settings')"
            :title="t('shell.settings')"
            @click="settingsOpen = true"
          >
            <NxIcon
              name="settingsDots"
              :size="16"
            />
          </button>
        </div>
      </header>

      <!-- The page body. The SPA root owns the transition around it (see
           boot/NxApp.vue); the shell itself — rail, topbar, drawers — is
           mounted once and must never animate on a page change. -->
      <slot />
    </div>

    <ChangelogDrawer
      :show="showChangelog"
      :locale="displayLocale"
      @close="showChangelog = false"
    />

    <NxDocDrawer
      :show="docOpen"
      :locale="displayLocale"
      :title="docTitle || pageTitle"
      :doc="doc"
      :updated="docUpdated"
      @close="docOpen = false"
    />

    <NxSettings
      :show="settingsOpen"
      :locale="displayLocale"
      @close="settingsOpen = false"
    />

    <Transition name="nx-fade">
      <button
        v-if="showBackToTop"
        type="button"
        class="nx-to-top"
        :aria-label="t('shell.backToTop')"
        :title="t('shell.backToTop')"
        @click="scrollToTop"
      >
        <NxIcon
          name="arrowUp"
          :size="16"
        />
      </button>
    </Transition>
  </div>
</template>
