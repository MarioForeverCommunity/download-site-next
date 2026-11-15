<script setup>
// About & Contact — the same document-style page as the reference archive:
// a centered reading column with credit properties, the technical stack, a
// short public-API reference and the contact list.
//
// The page is bilingual, so it publishes its own language handlers to the shell
// (the rail's language menu drives them) and keeps the whole copy in one object.
import { ref, computed, watchEffect } from "vue";
import NxIcon from "../../../components/next/NxIcon.vue";
import { getLanguage, setLanguageZh, setLanguageEn } from "../../../util/Language.js";
import { publishShell, publishShellHandlers } from "../../../util/next/shellStore.js";
import { siteVersion, setPageTitle } from "../../../config.js";

const lan = ref(getLanguage());

// Authors and contributors. The special-thanks list is the README's credits
// roster (minus the authors already named above it), with the names each
// community uses in that language.
const authors = computed(() => (lan.value === "zh"
  ? ["newlife2017", "无视我233"]
  : ["newlife2017", "WSW"]));

const specialThanks = computed(() => (lan.value === "zh"
  ? [
    "Fisjokas",
    "七地一天",
    "劝君更尽一碗翔",
    "超级玛丽迷01",
    "克洛伊Prime",
    "快乐mario8",
    "绿色的糖果",
    "JUE13",
    "TwoSpacesSG",
    "Zik the Green",
  ]
  : [
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
  ]));

// Contact channels, shared by both languages.
const CONTACTS = [
  { label: "Discord", value: "newlife2017" },
  { label: "QQ", value: "1849714671" },
];

const API_ENDPOINTS = [
  {
    path: "/api/index.json",
    zh: "清单，列出全部端点、记录数与生成时间。",
    en: "Manifest: every endpoint, its record count and the generation time.",
  },
  {
    path: "/api/mf.json",
    zh: "Mario Forever 同人作品。",
    en: "Mario Forever fangames.",
  },
  {
    path: "/api/mw.json",
    zh: "Super Mario Worker Project 作品。",
    en: "Super Mario Worker Project levels.",
  },
  {
    path: "/api/assets.json",
    zh: "创作资源（引擎、素材、特效、工具等）。",
    en: "Creative assets: engines, sprites, effects and tools.",
  },
  {
    path: "/api/softendo.json",
    zh: "Softendo / Buziol Games 游戏。",
    en: "Softendo / Buziol Games titles.",
  },
  {
    path: "/api/original-mf.json",
    zh: "原版 Mario Forever 全版本。",
    en: "Every release of the original Mario Forever.",
  },
];

const text = computed(() => (lan.value === "zh" ? {
  title: "关于本站",
  subtitle: "本站的制作人员、技术栈、公开 API 与维护者联系方式。",
  credits: "制作人员",
  creator: "网站作者",
  specialThanks: "特别鸣谢",
  separator: ", ",
  designTitle: "设计灵感",
  designBefore: "本站新版（v3）界面的版式与交互灵感借鉴自 ",
  designAfter: "，在此致以诚挚谢意。",
  techStack: "技术栈",
  techFrontend: "前端核心",
  techData: "数据与 API",
  techStorage: "文件列表与云存储",
  techBuild: "构建与工具",
  api: "公开 API",
  apiDesc: "本站提供一套静态 JSON API，收录作品的参数、下载链接、图片路径与描述内容，可直接用于二次开发或搭建镜像站。",
  endpoints: "端点",
  apiNote: "所有端点都是静态 JSON 文件，直接 GET 即可，无需鉴权，也没有速率限制；不支持服务端筛选或排序，相关逻辑请在客户端完成。",
  apiUsage: "调用示例",
  apiExample: "const games = await fetch(\"/api/mf.json\").then((r) => r.json());\nconsole.log(games.length);",
  apiDoc: "完整的字段说明见 API 文档",
  contact: "联系方式",
  contactNote: "若发现数据错误或有作品补充，欢迎通过以上任一方式联系。",
  footer: "Mario Forever 作品目录站 · 由 Mario Forever 社区维护",
} : {
  title: "About & Contact",
  subtitle: "Catalog credits, the technical stack that powers this website, and where to reach the maintainer.",
  credits: "Credits",
  creator: "Creator",
  specialThanks: "Special thanks",
  separator: ", ",
  designTitle: "Design inspiration",
  designBefore: "The v3 interface borrows its layout and interaction patterns from ",
  designAfter: " — its information density, navigation rail and filter pane were a major inspiration, and we are grateful for its work.",
  techStack: "Technical stack",
  techFrontend: "Frontend core",
  techData: "Data & API",
  techStorage: "File list & cloud storage",
  techBuild: "Build & tooling",
  api: "Public API",
  apiDesc: "This site ships a static JSON API covering each record's metadata, download links, image paths and descriptions — ready for your own tools or a mirror site.",
  endpoints: "Endpoints",
  apiNote: "Every endpoint is a static JSON file: plain GET, no key, no rate limit. There is no server-side filtering or sorting, so any query logic belongs on the client.",
  apiUsage: "Example",
  apiExample: "const games = await fetch(\"/api/mf.json\").then((r) => r.json());\nconsole.log(games.length);",
  apiDoc: "The API documentation covers every field",
  contact: "Contact",
  contactNote: "Found misinfo or have a fangame to add? Reach us through any of the channels above.",
  footer: "Mario Forever Download Portal · Maintained by the Chinese Mario Forever community",
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
      { name: lan.value === "zh" ? "中国移动云盘" : "China Mobile 139 Cloud", url: "https://yun.139.com/" },
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
  desc: lan.value === "zh" ? endpoint.zh : endpoint.en,
})));

const apiDocUrl = computed(() => (
  lan.value === "zh"
    ? "https://github.com/MarioForeverCommunity/download-site-next/blob/main/API.zh-cn.md"
    : "https://github.com/MarioForeverCommunity/download-site-next/blob/main/API.md"
));

const footer = computed(() => `${text.value.footer} · ${siteVersion}`);

setPageTitle(text.value.title, lan.value);

function pageSetLanguageZh() {
  lan.value = setLanguageZh();
  setPageTitle(text.value.title, "zh");
}

function pageSetLanguageEn() {
  lan.value = setLanguageEn();
  setPageTitle(text.value.title, "en");
}

// The app shell is rendered once by the SPA root; this page only publishes the
// parts that differ (title, language). Leaving `search` and `doc` unset gives a
// documentation-style topbar without the catalog controls.
watchEffect(() => {
  publishShell({
    pageId: "about",
    title: text.value.title,
    lan: lan.value,
  });
});

publishShellHandlers({
  changeLanZh: pageSetLanguageZh,
  changeLanEn: pageSetLanguageEn,
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
