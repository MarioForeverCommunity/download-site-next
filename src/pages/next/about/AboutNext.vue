<script setup>
// About & Contact — the same document-style page as the reference archive:
// a centered reading column with credit properties, the technical stack, a
// short public-API reference and the contact list.
//
// Every string comes from the i18n catalogues, so the page renders in whatever
// locale the visitor picked; it publishes its own locale handler to the shell (the
// topbar's language menu drives it) and keeps the whole copy in one object.
import { ref, computed, watchEffect } from "vue";
import NxIcon from "../../../components/next/NxIcon.vue";
import {
  applyLocale,
  dataLangOf,
  getLocale,
  localeList,
  localeNeedsConversion,
  useI18n,
} from "../../../i18n/index.js";
import { publishShell, publishShellHandlers } from "../../../util/next/shellStore.js";
import { siteVersion, setPageTitle } from "../../../config.js";
import { localeForLocales } from "../../../util/next/pageLocale.js";

// No markdown document here: every string is in the i18n catalogues, so all
// registered locales are available and the switcher lists all of them.
const locales = localeList().map((item) => item.code);

const locale = ref(localeForLocales(getLocale(), locales));
const { t } = useI18n(() => locale.value);

// Content language: the credits roster carries the names each community uses in
// that language, so a Traditional Chinese visitor reads the Chinese names.
const contentLang = computed(() => dataLangOf(locale.value));

// Authors and contributors. The special-thanks list is the README's credits
// roster (minus the authors already named above it), with the names each
// community uses in that language.
const ZH_AUTHORS = ["newlife2017", "无视我233"];
const EN_AUTHORS = ["newlife2017", "WSW"];
const ZH_THANKS = [
  "Fisjokas",
  "七地一天",
  "劝君更尽一碗翔",
  "超级玛丽迷01",
  "克洛伊Prime",
  "快乐mario9",
  "绿色的糖果",
  "JUE13",
  "TwoSpacesSG",
  "Zik the Green",
];
const EN_THANKS = [
  "Fisjokas",
  "Classic Yoshi 666",
  "wufeiling",
  "SuperMarioFan01",
  "ChloePrime",
  "Happy Mario 9",
  "Green Sweet",
  "JUE13",
  "TwoSpacesSG",
  "Zik the Green",
];

// Traditional usernames are *authored*, not machine-converted: these spellings
// come from the credits list in `src/markdown/mf-games-zh-hant.md` (notably
// 「超級瑪莉迷01」 and 「ChloePrime」, which opencc would not produce).
const ZH_HANT_NAMES = {
  "无视我233": "無視我233",
  "劝君更尽一碗翔": "勸君更盡一碗翔",
  "超级玛丽迷01": "超級瑪莉迷01",
  "克洛伊Prime": "ChloePrime",
  "快乐mario9": "快樂mario9",
  "绿色的糖果": "綠色的糖果",
};

const isTraditional = computed(() => localeNeedsConversion(locale.value));
const displayNames = (names) => (isTraditional.value
  ? names.map((name) => ZH_HANT_NAMES[name] || name)
  : names);

const authors = computed(() => displayNames(contentLang.value === "zh" ? ZH_AUTHORS : EN_AUTHORS));
const specialThanks = computed(() => displayNames(contentLang.value === "zh" ? ZH_THANKS : EN_THANKS));

// Contact channels, shared by both languages.
const CONTACTS = [
  { label: "Discord", value: "newlife2017" },
  { label: "QQ", value: "1849714671" },
];

// Endpoint list: the path is data, the description comes from the catalogues.
const API_ENDPOINTS = [
  { path: "/api/index.json", label: "about.endpointIndex" },
  { path: "/api/mf.json", label: "about.endpointMf" },
  { path: "/api/mw.json", label: "about.endpointMw" },
  { path: "/api/assets.json", label: "about.endpointAssets" },
  { path: "/api/softendo.json", label: "about.endpointSoftendo" },
  { path: "/api/original-mf.json", label: "about.endpointOriginalMf" },
];

const text = computed(() => ({
  title: t("about.title"),
  subtitle: t("about.subtitle"),
  credits: t("about.credits"),
  creator: t("about.creator"),
  specialThanks: t("about.specialThanks"),
  separator: t("about.separator"),
  designTitle: t("about.designTitle"),
  designBefore: t("about.designBefore"),
  designAfter: t("about.designAfter"),
  techStack: t("about.techStack"),
  techFrontend: t("about.techFrontend"),
  techData: t("about.techData"),
  techStorage: t("about.techStorage"),
  techBuild: t("about.techBuild"),
  api: t("about.api"),
  apiDesc: t("about.apiDesc"),
  endpoints: t("about.endpoints"),
  apiNote: t("about.apiNote"),
  apiUsage: t("about.apiUsage"),
  apiExample: t("about.apiExample"),
  apiDoc: t("about.apiDoc"),
  contact: t("about.contact"),
  contactNote: t("about.contactNote"),
  footer: t("about.footer"),
}));

// The stack the site actually runs on: a Vue SPA over YAML data, a build-time
// JSON API and a Bun-pinned toolchain.
const TECH_GROUPS = computed(() => [
  {
    label: text.value.techFrontend,
    items: [
      { name: "Vue 3", url: "https://vuejs.org/" },
      { name: "Vite 8", url: "https://vite.dev/" },
      { name: "JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
      { name: "Markdown", url: "https://github.com/markdown-it/markdown-it" },
      { name: "CSS", url: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
    ],
  },
  {
    label: text.value.techData,
    items: [
      { name: "YAML", url: "https://yaml.org/" },
      { name: "js-yaml", url: "https://github.com/nodeca/js-yaml" },
      { name: "Axios", url: "https://axios-http.com/" },
      { name: "JSON", url: "https://www.json.org/" },
    ],
  },
  {
    label: text.value.techStorage,
    items: [
      { name: "OpenList", url: "https://github.com/OpenListTeam/OpenList" },
      { name: "OneDrive", url: "https://onedrive.live.com/" },
      { name: t("about.cloud139"), url: "https://yun.139.com/" },
    ],
  },
  {
    label: text.value.techBuild,
    items: [
      { name: "Bun", url: "https://bun.sh/" },
      { name: "Node.js", url: "https://nodejs.org/" },
      { name: "ESLint", url: "https://eslint.org/" },
      { name: "vite-plugin-compression", url: "https://github.com/vbenjs/vite-plugin-compression" },
    ],
  },
]);

const apiEndpoints = computed(() => API_ENDPOINTS.map((endpoint) => ({
  path: endpoint.path,
  url: endpoint.path,
  desc: t(endpoint.label),
})));

// The API reference exists in Chinese and English only, so the link follows the
// content language rather than the interface language.
const apiDocUrl = computed(() => (
  contentLang.value === "zh"
    ? "https://github.com/MarioForeverCommunity/download-site-next/blob/main/API.zh-cn.md"
    : "https://github.com/MarioForeverCommunity/download-site-next/blob/main/API.md"
));

const footer = computed(() => `${text.value.footer} · ${siteVersion}`);

function changeLocale(code) {
  locale.value = applyLocale(code);
}

// The app shell is rendered once by the SPA root; this page only publishes the
// parts that differ (title, language). Leaving `search` and `doc` unset gives a
// documentation-style topbar without the catalog controls.
watchEffect(() => {
  setPageTitle(text.value.title, locale.value);
  publishShell({
    pageId: "about",
    title: text.value.title,
    locale: locale.value,
    locales,
  });
});

publishShellHandlers({
  changeLocale,
});
</script>

<template>
  <div class="about-view">
    <article class="about-doc">
      <header class="about-head">
        <h1 class="about-title">
          <span class="about-title-ic"><NxIcon name="mail" :size="20" /></span>
          {{ text.title }}
        </h1>
        <p class="about-sub">{{ text.subtitle }}</p>
      </header>

      <section class="about-section">
        <div class="about-label">{{ text.credits }}</div>
        <div class="about-table">
          <div class="about-row about-prop">
            <span class="about-key">{{ text.creator }}</span>
            <span class="about-val about-authors">
              <span v-for="author in authors" :key="author">{{ author }}</span>
            </span>
          </div>
          <div class="about-row about-prop">
            <span class="about-key">{{ text.specialThanks }}</span>
            <span class="about-val">{{ specialThanks.join(text.separator) }}</span>
          </div>
        </div>
      </section>

      <section class="about-section">
        <div class="about-label">{{ text.designTitle }}</div>
        <p class="about-note">
          {{ text.designBefore }}<a
            class="about-link"
            href="https://fangame-archive.com/"
            target="_blank"
            rel="noopener noreferrer"
          >Fangame Archive</a>{{ text.designAfter }}
        </p>
      </section>

      <section class="about-section">
        <div class="about-label">{{ text.techStack }}</div>
        <div class="about-tags">
          <div v-for="group in TECH_GROUPS" :key="group.label">
            <div class="about-tag-label">{{ group.label }}</div>
            <div class="about-tagrow">
              <a
                v-for="item in group.items"
                :key="item.name"
                class="about-tag"
                :href="item.url"
                target="_blank"
                rel="noopener noreferrer"
              >{{ item.name }}</a>
            </div>
          </div>
        </div>
      </section>

      <section class="about-section">
        <div class="about-label">{{ text.api }}</div>
        <p class="about-note about-intro">{{ text.apiDesc }}</p>

        <div class="about-sub-label">{{ text.endpoints }}</div>
        <div class="about-table">
          <div
            v-for="endpoint in apiEndpoints"
            :key="endpoint.path"
            class="about-row about-api-row"
          >
            <span class="about-api-key">
              <a :href="endpoint.url" target="_blank" rel="noopener noreferrer">{{ endpoint.path }}</a>
            </span>
            <span class="about-api-desc">{{ endpoint.desc }}</span>
          </div>
        </div>

        <p class="about-note">{{ text.apiNote }}</p>

        <div class="about-sub-label">{{ text.apiUsage }}</div>
        <pre class="about-code"><code>{{ text.apiExample }}</code></pre>
        <a
          class="about-doc-link"
          :href="apiDocUrl"
          target="_blank"
          rel="noopener noreferrer"
        >{{ text.apiDoc }}</a>
      </section>

      <section class="about-section">
        <div class="about-label">{{ text.contact }}</div>
        <div class="about-table">
          <div
            v-for="item in CONTACTS"
            :key="item.label"
            class="about-row about-prop"
          >
            <span class="about-key">{{ item.label }}</span>
            <span class="about-val about-mono">{{ item.value }}</span>
          </div>
        </div>
        <p class="about-note">{{ text.contactNote }}</p>
      </section>

      <footer class="about-foot">{{ footer }}</footer>
    </article>
  </div>
</template>

<style scoped>
  .about-view {
    flex: 1;
    padding: 38px 24px 72px;
  }

  .about-doc {
    max-width: 780px;
    margin: 0 auto;
  }

  /* ── page header ── */
  .about-head {
    margin-bottom: 28px;
  }

  .about-title {
    display: flex;
    align-items: center;
    gap: 11px;
    margin: 0 0 9px;
    font-size: 25px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.2;
    color: var(--nx-ink);
  }

  .about-title-ic {
    display: inline-flex;
    color: var(--nx-muted);
  }

  .about-sub {
    margin: 0;
    font-size: 13.5px;
    line-height: 1.62;
    color: var(--nx-muted);
  }

  /* ── sections ── */
  .about-section {
    margin-top: 30px;
  }

  .about-section:first-of-type {
    margin-top: 26px;
  }

  .about-label {
    margin-bottom: 11px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--nx-faint);
  }

  .about-sub-label {
    margin: 22px 0 10px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--nx-faint);
  }

  /* ── property table ── */
  .about-table {
    border: 1px solid var(--nx-line);
    border-radius: var(--nx-r-lg);
    background: var(--nx-canvas);
    box-shadow: var(--nx-shadow-1);
    overflow: hidden;
  }

  .about-row {
    display: grid;
    align-items: center;
    gap: 16px;
    padding: 13px 16px;
    border-bottom: 1px solid var(--nx-line);
  }

  .about-row:last-child {
    border-bottom: 0;
  }

  .about-prop {
    grid-template-columns: 132px 1fr;
    gap: 14px;
    padding: 11px 16px;
    transition: background-color 0.12s ease;
  }

  .about-prop:hover {
    background: var(--nx-fill);
  }

  .about-key {
    font-size: 12px;
    color: var(--nx-muted);
  }

  .about-val {
    min-width: 0;
    font-size: 13px;
    font-weight: 500;
    color: var(--nx-ink);
    overflow-wrap: anywhere;
  }

  .about-authors {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
  }

  /* ── technical stack ── */
  .about-tags {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .about-tag-label {
    margin-bottom: 8px;
    font-size: 11px;
    color: var(--nx-muted);
  }

  .about-tagrow {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .about-tag {
    display: inline-flex;
    align-items: center;
    height: 24px;
    padding: 0 9px;
    border: 1px solid var(--nx-line);
    border-radius: 999px;
    background: var(--nx-canvas);
    color: var(--nx-ink-2);
    font-size: 11.5px;
    white-space: nowrap;
    transition: border-color 0.12s ease, background-color 0.12s ease, color 0.12s ease;
  }

  .about-tag:hover {
    border-color: var(--nx-accent-border);
    background: var(--nx-accent-soft);
    color: var(--nx-accent);
  }

  /* ── public API ── */
  /* Prose uses the full reading column: a `ch` cap is sized for Latin text and
     breaks Chinese sentences (e.g. the API description) far earlier than the
     column actually runs out of room. */
  .about-note {
    margin: 0;
    font-size: 12.5px;
    line-height: 1.62;
    color: var(--nx-muted);
  }

  .about-intro {
    margin-bottom: 14px;
  }

  .about-link {
    color: var(--nx-accent);
  }

  .about-link:hover {
    text-decoration: underline;
  }

  .about-table + .about-note {
    margin-top: 14px;
  }

  .about-api-row {
    grid-template-columns: 190px 1fr;
    gap: 14px;
    padding: 11px 16px;
    transition: background-color 0.12s ease;
  }

  .about-api-row:hover {
    background: var(--nx-fill);
  }

  .about-api-key {
    font-family: ui-monospace, "SFMono-Regular", Consolas, monospace;
    font-size: 12px;
    color: var(--nx-ink);
    overflow-wrap: anywhere;
  }

  .about-api-key a {
    color: var(--nx-accent);
  }

  .about-api-key a:hover {
    text-decoration: underline;
  }

  .about-api-desc {
    font-size: 12.5px;
    line-height: 1.55;
    color: var(--nx-muted);
  }

  .about-code {
    margin: 0;
    padding: 11px 13px;
    border: 1px solid var(--nx-line);
    border-radius: var(--nx-r);
    background: var(--nx-fill);
    overflow-x: auto;
    font-family: ui-monospace, "SFMono-Regular", Consolas, monospace;
    font-size: 12px;
    line-height: 1.65;
    color: var(--nx-ink-2);
  }

  .about-code code {
    padding: 0;
    border: 0;
    background: transparent;
    font: inherit;
  }

  .about-doc-link {
    display: inline-flex;
    margin-top: 10px;
    font-size: 12px;
    color: var(--nx-accent);
  }

  .about-doc-link:hover {
    text-decoration: underline;
  }

  /* ── contact ── */
  .about-mono {
    font-family: ui-monospace, "SFMono-Regular", Consolas, monospace;
    font-size: 12.5px;
    font-weight: 400;
  }

  /* ── footer ── */
  .about-foot {
    margin-top: 44px;
    padding-top: 18px;
    border-top: 1px solid var(--nx-line);
    text-align: center;
    font-size: 11px;
    color: var(--nx-faint);
  }

  @media (max-width: 640px) {
    .about-view {
      padding: 22px 14px 56px;
    }

    .about-prop {
      grid-template-columns: 104px 1fr;
    }

    .about-api-row {
      grid-template-columns: 1fr;
      gap: 4px;
    }
  }
</style>
