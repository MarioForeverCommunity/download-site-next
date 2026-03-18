<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import DownloadHeader from '../../components/HeaderNav.vue';
import { getLanguage, setLanguageZh, setLanguageEn } from "../../util/Language.js";
import introEn from '../../markdown/mw-en.md';
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import { navTop } from "../../config.js";
import ButtonBackToTop from '../../components/ButtonBackToTop.vue';
import ButtonDarkMode from '../../components/ButtonDarkMode.vue';
import SiteFooter from '../../components/SiteFooter.vue';
import 'vue3-carousel/dist/carousel.css'

const originalLan = ref(getLanguage());

const pageId = "mario-worker"

const titleEn = navTop.find(item => item.id === pageId).title_alt;

document.title = titleEn;

const lastUpdate = ref(null);
const mdUpdateDate = ref(null);
const allDatesLoaded = ref(false);

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
};

const getLatestDate = () => {
  const dates = [];
  if (mdUpdateDate.value) dates.push(new Date(mdUpdateDate.value));
  if (dates.length === 0) return null;
  const maxDate = new Date(Math.max(...dates));
  return formatDate(maxDate);
};

const updateLastUpdate = () => {
  lastUpdate.value = getLatestDate();
};

const fetchMdUpdate = () => {
  return axios.get("https://api.github.com/repos/MarioForeverCommunity/download-site-next/commits?path=src%2Fmarkdown%2Fmw-en.md&page=1&per_page=1").then((response) => {
    mdUpdateDate.value = response.data[0].commit.committer.date;
  });
};

fetchMdUpdate().then(() => {
  allDatesLoaded.value = true;
  updateLastUpdate();
});

const currentTab = ref("smwp");

const imagesRemake = [
  "/data/mw-index/MWR1.webp",
  "/data/mw-index/MWR2.webp",
  "/data/mw-index/MWR3.webp",
  "/data/mw-index/MWR4.webp",
  "/data/mw-index/MWR5.webp",
  "/data/mw-index/MWR6.webp",
  "/data/mw-index/MWR7.webp",
  "/data/mw-index/MWR8.webp",
  "/data/mw-index/MWR9.webp",
  "/data/mw-index/MWR10.webp",
];

const imagesSmwp = [
  "/data/mw-index/smwp-title.webp",
  "/data/mw-index/smwp-editor.webp",
  "/data/mw-index/smwp-blocks.webp",
  "/data/mw-index/smwp-musicselector.webp",
  "/data/mw-index/smwp-additional.webp",
  "/data/mw-index/smwp-decade.webp",
  "/data/mw-index/smwp-nightsand.webp",
  "/data/mw-index/smwp-classicepic.webp",
  "/data/mw-index/smwp-muitfaceted.webp",
];

const currentImages = computed(() => {
  if (currentTab.value === "remake") {
    return imagesRemake;
  } else if (currentTab.value === "smwp") {
    return imagesSmwp;
  }
  return imagesRemake;
});

const tabs = [
  { id: "remake", label: "Mario Worker Remake" },
  { id: "smwp", label: "Super Mario Worker Project" }
];
</script>

<template>
  <DownloadHeader
    :pageId="pageId"
    :lan-var="originalLan"
    @change-lan-zh="originalLan = setLanguageZh(); "
    @change-lan-en="originalLan = setLanguageEn(); "
  />

  <div class="md-container">
    <h1>{{ titleEn }}</h1>
    <p v-if="lastUpdate" class="last-update">Last updated: {{ lastUpdate }}</p>
    <introEn />
    <h2>Screenshots</h2>
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
