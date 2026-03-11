<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import DownloadHeader from '../../components/HeaderNav.vue';
import { getLanguage, setLanguageZh, setLanguageEn } from "../../util/Language.js";
import indexZh from '../../markdown/mf-zh.md';
import indexEn from '../../markdown/mf-en.md';
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import { navTop } from "../../config.js";
import ButtonBackToTop from '../../components/ButtonBackToTop.vue';
import ButtonDarkMode from '../../components/ButtonDarkMode.vue';
import SiteFooter from '../../components/SiteFooter.vue';
import 'vue3-carousel/dist/carousel.css'

const lan = ref(getLanguage());
const lastUpdateZh = ref(null);
const lastUpdateEn = ref(null);

const yamlUpdateDate = ref(null);
const mdUpdateDateZh = ref(null);
const mdUpdateDateEn = ref(null);
const allDatesLoaded = ref(false);

const formatDate = (date) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return date.toLocaleDateString('zh-CN', options).replace(/\//g, '-');
};

const getLatestDateZh = () => {
  const dates = [];
  if (yamlUpdateDate.value) dates.push(new Date(yamlUpdateDate.value));
  if (mdUpdateDateZh.value) dates.push(new Date(mdUpdateDateZh.value));
  if (dates.length === 0) return null;
  const maxDate = new Date(Math.max(...dates));
  return formatDate(maxDate);
};

const getLatestDateEn = () => {
  const dates = [];
  if (yamlUpdateDate.value) dates.push(new Date(yamlUpdateDate.value));
  if (mdUpdateDateEn.value) dates.push(new Date(mdUpdateDateEn.value));
  if (dates.length === 0) return null;
  const maxDate = new Date(Math.max(...dates));
  return formatDate(maxDate);
};

const updateLastUpdate = () => {
  lastUpdateZh.value = getLatestDateZh();
  lastUpdateEn.value = getLatestDateEn();
};

const fetchYamlUpdate = () => {
  return axios.get("https://api.github.com/repos/MarioForeverCommunity/download-site-next/commits?path=public%2Fdata%2Flist-original-mf.yaml&page=1&per_page=1").then((response) => {
    yamlUpdateDate.value = response.data[0].commit.committer.date;
  });
};

const fetchMdUpdateZh = () => {
  return axios.get("https://api.github.com/repos/MarioForeverCommunity/download-site-next/commits?path=src%2Fmarkdown%2Fmf-zh.md&page=1&per_page=1").then((response) => {
    mdUpdateDateZh.value = response.data[0].commit.committer.date;
  });
};

const fetchMdUpdateEn = () => {
  return axios.get("https://api.github.com/repos/MarioForeverCommunity/download-site-next/commits?path=src%2Fmarkdown%2Fmf-en.md&page=1&per_page=1").then((response) => {
    mdUpdateDateEn.value = response.data[0].commit.committer.date;
  });
};

Promise.all([fetchYamlUpdate(), fetchMdUpdateZh(), fetchMdUpdateEn()]).then(() => {
  allDatesLoaded.value = true;
  updateLastUpdate();
});

const pageId = "index"

const titleZh = navTop.find(item => item.id === pageId).title;
const titleEn = navTop.find(item => item.id === pageId).title_alt;

document.title = lan.value == "zh" ? titleZh : titleEn;

const currentTab = ref(lan.value === "zh" ? "original" : "ce");

const imagesOriginal = [
  "/images/index/title.webp",
  "/images/index/3-2.webp",
  "/images/index/3-4.webp",
  "/images/index/4-1.webp",
  "/images/index/6-3.webp",
  "/images/index/8-3.webp",
  "/images/index/8-4.webp",
  "/images/index/HC2-3.webp",
  "/images/index/HL-1.webp",
  "/images/index/LM-4.webp",
];

const imagesRemakeZh = [
  "/data/mf-games/Mario Forever Remake/title.webp",
  "/data/mf-games/Mario Forever Remake/showcase_1.webp",
  "/data/mf-games/Mario Forever Remake/showcase_2.webp",
  "/data/mf-games/Mario Forever Remake/showcase_3.webp",
  "/data/mf-games/Mario Forever Remake/showcase_4.webp",
  "/data/mf-games/Mario Forever Remake/showcase_5.webp",
  "/data/mf-games/Mario Forever Remake/showcase_6.webp",
  "/data/mf-games/Mario Forever Remake/showcase_7.webp",
  "/data/mf-games/Mario Forever Remake/showcase_8.webp",
  "/data/mf-games/Mario Forever Remake/showcase_9.webp",
  "/data/mf-games/Mario Forever Remake/showcase_10.webp",
];

const imagesRemakeEn = [
  "/data/mf-games/Mario Forever Remake (PAL)/title.webp",
  "/data/mf-games/Mario Forever Remake (PAL)/showcase_1.webp",
  "/data/mf-games/Mario Forever Remake (PAL)/showcase_2.webp",
  "/data/mf-games/Mario Forever Remake (PAL)/showcase_3.webp",
  "/data/mf-games/Mario Forever Remake (PAL)/showcase_4.webp",
  "/data/mf-games/Mario Forever Remake (PAL)/showcase_5.webp",
  "/data/mf-games/Mario Forever Remake (PAL)/showcase_6.webp",
  "/data/mf-games/Mario Forever Remake (PAL)/showcase_7.webp",
  "/data/mf-games/Mario Forever Remake (PAL)/showcase_8.webp",
  "/data/mf-games/Mario Forever Remake (PAL)/showcase_9.webp",
];

const imagesCe = [
  "/data/mf-games/Mario Forever - Community Edition/title.webp",
  "/data/mf-games/Mario Forever - Community Edition/showcase_1.webp",
  "/data/mf-games/Mario Forever - Community Edition/showcase_2.webp",
  "/data/mf-games/Mario Forever - Community Edition/showcase_3.webp",
  "/data/mf-games/Mario Forever - Community Edition/showcase_4.webp",
  "/data/mf-games/Mario Forever - Community Edition/showcase_5.webp",
  "/data/mf-games/Mario Forever - Community Edition/showcase_6.webp",
  "/data/mf-games/Mario Forever - Community Edition/showcase_7.webp",
  "/data/mf-games/Mario Forever - Community Edition/showcase_8.webp",
  "/data/mf-games/Mario Forever - Community Edition/showcase_9.webp",
  "/data/mf-games/Mario Forever - Community Edition/showcase_10.webp",
  "/data/mf-games/Mario Forever - Community Edition/showcase_11.webp",
];

const currentImages = computed(() => {
  if (currentTab.value === "original") {
    return imagesOriginal;
  } else if (currentTab.value === "remake") {
    return lan.value === "zh" ? imagesRemakeZh : imagesRemakeEn;
  } else if (currentTab.value === "ce") {
    return imagesCe;
  }
  return imagesOriginal;
});

const tabs = computed(() => {
  if (lan.value === "zh") {
    return [
      { id: "original", label: "原版 Mario Forever" },
      { id: "remake", label: "Mario Forever Remake" },
      { id: "ce", label: "Mario Forever: Community Edition" }
    ];
  } else {
    return [
      { id: "ce", label: "Mario Forever: Community Edition" },
      { id: "remake", label: "Mario Forever Remake" },
      { id: "original", label: "Original Mario Forever" }
    ];
  }
});

function pageSetLanguageZh() {
  lan.value =  setLanguageZh();
  document.title=titleZh;
  currentTab.value = "original";
  if (allDatesLoaded.value) {
    updateLastUpdate();
  }
}

function pageSetLanguageEn() {
  lan.value =  setLanguageEn();
  document.title=titleEn;
  currentTab.value = "ce";
  if (allDatesLoaded.value) {
    updateLastUpdate();
  }
}
</script>

<template>
  <DownloadHeader
    :pageId="pageId"
    :lan-var="lan"
    @change-lan-zh="pageSetLanguageZh();"
    @change-lan-en="pageSetLanguageEn();"
  />

  <div class="md-container">
    <h1>{{ lan == "en" ? titleEn : titleZh }}</h1>
    <indexZh v-if="lan === 'zh'" :lastUpdateZh="lastUpdateZh" />
    <indexEn v-if="lan === 'en'" :lastUpdateEn="lastUpdateEn" />
    <h2>{{ lan == "zh" ? "截图预览" : "Screenshots" }}</h2>
    <div class="radio-inputs">
      <a
        v-for="tab in tabs"
        :key="tab.id"
        class="radio"
        :class="{ 'checked': currentTab === tab.id }"
        @click="currentTab = tab.id"
      >
        <span class="radio-text">
          {{ tab.label }}
        </span>
      </a>
    </div>
    <Carousel :autoplay="3000" :wrap-around="true" :items-to-show="2">
      <Slide v-for="image in currentImages" :key="image" style="width: 50%; aspect-ratio: 4/3;">
        <img :src="image" style="width: 100%; height: 100%;">
      </Slide>
      <template #addons>
        <Navigation />
        <Pagination />
      </template>
    </Carousel>
  </div>

  <ButtonBackToTop />
  <ButtonDarkMode />

  <SiteFooter />
</template>

<style>
  .md-container {
    width: 100vw;
    box-sizing: border-box;
    background-color: white;
    padding: 10px 20px;
    margin: 20px auto;
    border: 1px solid #eaeaea;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, .1);
    font-family: Helvetica, Arial, "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", "tohoma,sans-serif";
    font-feature-settings: normal;
    font-kerning: auto;
    font-optical-sizing: auto;
    font-size-adjust: none;
    font-stretch: 100%;
    font-style: normal;
    font-variant-alternates: normal;
    font-variant-caps: normal;
    font-variant-east-asian: normal;
    font-variant-ligatures: normal;
    font-variant-numeric: normal;
    font-variant-position: normal;
    font-variation-settings: normal;
    margin-bottom: 0;
  }

  @media (max-width: 1333px) and (min-width: 800px) {
    .md-container {
      width: 90vw;
      border-radius: 2px;
    }
  }

  @media (min-width: 1333px) {
    .md-container {
      width: 1200px;
      border-radius: 2px;
    }
  }

  a {
    color: #008cff;
    text-decoration: none;
    font-weight: normal;
  }

  a:hover {
    color: #006eff;
    text-decoration: underline;
  }

  table {
    width: 100%;
    max-width: 100vw;
    white-space: nowrap;
  }

  .table-container {
    overflow-x: auto;
    width: 100%;
  }

  p {
    margin: .5em 0;
  }

  ul {
    margin: .5em 0;
    padding-left: 30px;
  }

  h1 {
    font-size: 30px;
    margin-top: 12px;
  }

  p, ol, ul, h4, h5, h6, table, button {
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
    line-height: 1.5em;
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  table thead {
    text-align: left;
  }

  table thead tr:first-child {
    border-top: 0 !important;
  }

  table tr {
    border-top: solid 1px #eee;
  }

  table td {
    padding: 0.5em 1em 0.5em 1em;
  }

  table th {
    padding: 0.5em 1em 0.5em 1em;
  }

  .md-button {
    color: white;
    cursor: pointer;
    background-color: #008cff;
    padding: .5em;
    border-radius: .5em;
    margin-right: .5em;
    margin: .25em;
    display: inline-block;
  }

  .md-button:hover, .md-button:focus {
    background-color: #30acff;
    text-decoration: none;
  }

  .md-button:active {
    background-color: #007cdf;
  }

  .md-button:hover {
    color: white;
  }

  .foot-note ol {
    padding-left: 30px;
  }
</style>
<style scoped>
  .radio-inputs {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    border-radius: 0.5rem;
    background-color: #EEE;
    box-sizing: border-box;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
    font-size: 14px;
    border: 1px solid #ddd;
    margin-bottom: 20px;
    line-height: 1.2em;
  }

  .radio-inputs .radio {
    flex: 1 1 auto;
    text-align: center;
    border-radius: 0.35rem;
    margin: 0.2rem;
  }

  .radio-inputs .radio-text {
    display: flex;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    border: none;
    padding: .5rem;
    color: rgba(51, 65, 85, 1);
    display: inline-block;
  }

  @media (min-width: 864px) {
    .radio-inputs .radio {
      flex: 1 1 0;
    }
  }

  .radio-inputs .radio.checked {
    background-color: #fff;
    font-weight: 600;
  }

  .radio-inputs .radio:hover {
    background-color: #f7f7f7;
  }

  body.dark .radio-inputs {
    background-color: #3a3a3a;
    border-color: #444;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.3);
  }

  body.dark .radio-inputs .radio-text {
    color: rgba(220, 220, 220, 1);
  }

  body.dark .radio-inputs .radio.checked {
    background-color: #4a4a4a;
  }

  body.dark .radio-inputs .radio:hover {
    background-color: #555;
  }
</style>
