<script setup>
  import { ref } from 'vue';
  import axios from 'axios';
  import DownloadHeader from '../../components/HeaderNav.vue';
  import {getLanguage, setLanguageZh, setLanguageEn} from "../../util/Language.js";
  import indexZh from '../../markdown/mf-zh.md';
  import indexEn from '../../markdown/mf-en.md';
  import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
  import { navTop } from "../../config.js";
  import ButtonBackToTop from '../../components/ButtonBackToTop.vue';
  import ButtonDarkMode from '../../components/ButtonDarkMode.vue';
  import FooterZh from '../../components/FooterZh.vue';
  import FooterEn from '../../components/FooterEn.vue';
  import 'vue3-carousel/dist/carousel.css'

  const lan = ref(getLanguage());
  const lastUpdateZh = ref(null);
  const lastUpdateEn = ref(null);

  // 获取中文版最后更新时间
  axios.get("https://api.github.com/repos/MarioForeverCommunity/download-site-next/commits?path=src%2Fmarkdown%2Fmf-zh.md&page=1&per_page=1").then((response) => {
    const date = new Date(response.data[0].commit.committer.date);
    const options = { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' };
    const formattedDate = date.toLocaleDateString('zh-CN', options).replace(/\//g, '-'); // YYYY-MM-DD
    lastUpdateZh.value = formattedDate;
  });

  // 获取英文版最后更新时间
  axios.get("https://api.github.com/repos/MarioForeverCommunity/download-site-next/commits?path=src%2Fmarkdown%2Fmf-en.md&page=1&per_page=1").then((response) => {
    const date = new Date(response.data[0].commit.committer.date);
    const options = { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' };
    const formattedDate = date.toLocaleDateString('zh-CN', options).replace(/\//g, '-'); // YYYY-MM-DD
    lastUpdateEn.value = formattedDate;
  });

  const pageId = "index"

  const titleZh = navTop.find(item => item.id === pageId).title;
  const titleEn = navTop.find(item => item.id === pageId).title_alt;

  document.title = lan.value == "zh" ? titleZh : titleEn;

  const images = [
    "/images/index/3-2.webp",
    "/images/index/3-4.webp",
    "/images/index/4-1.webp",
    "/images/index/6-3.webp",
    "/images/index/8-3.webp",
    "/images/index/8-4.webp",
    "/images/index/HC2-3.webp",
    "/images/index/HL-1.webp",
    "/images/index/LM-4.webp",
    "/images/index/title.webp",
  ]

  function pageSetLanguageZh() {
    lan.value =  setLanguageZh();
    document.title=titleZh;
  }

  function pageSetLanguageEn() {
    lan.value =  setLanguageEn();
    document.title=titleEn;
  }
</script>

<template>
  <DownloadHeader :pageId="pageId" :lan-var="lan" @change-lan-zh="pageSetLanguageZh();" @change-lan-en="pageSetLanguageEn();"/>

  <div class="md-container">
    <h1>{{ lan == "en" ? titleEn : titleZh }}</h1>
    <indexZh v-if="lan === 'zh'" :lastUpdateZh="lastUpdateZh" />
    <indexEn v-if="lan === 'en'" :lastUpdateEn="lastUpdateEn" />
    <h2>{{ lan == "zh" ? "截图预览" : "Screenshots" }}</h2>
    <Carousel :autoplay="2000" :wrap-around="true" :items-to-show="2.5">
      <Slide v-for="image in images" :key="image" style="width: 40%; aspect-ratio: 4/3;">
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

  <FooterZh v-if="lan == 'zh'" />
  <FooterEn v-if="lan == 'en'" />
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
    font-weight: 300;
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
  }

  .md-button:active {
    background-color: #007cdf;
  }

  .md-button:hover {
    color: white;
    text-decoration: none;
  }

  .foot-note ol {
    padding-left: 30px;
  }
</style>
