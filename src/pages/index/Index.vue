<script setup>
  import { ref } from 'vue';
  import DownloadHeader from '../../components/Header.vue';
  import {getLanguage, setLanguageZh, setLanguageEn} from "../../util/Language.js";
  import indexZh from '../../markdown/mf-zh.md';
  import indexEn from '../../markdown/mf-en.md';
  import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
  import { navTop } from "../../config.js";
  import FooterZh from '../../components/FooterZh.vue';
  import FooterEn from '../../components/FooterEn.vue';
  import 'vue3-carousel/dist/carousel.css'

  const lan = ref(getLanguage());

  const pageId = "index"

  const titleZh = navTop.find(item => item.id === pageId).title;
  const titleEn = navTop.find(item => item.id === pageId).title_alt;

  document.title = lan.value == "zh" ? titleZh : titleEn;

  const images = [
    "/images/3-2.webp",
    "/images/3-4.webp",
    "/images/4-1.webp",
    "/images/6-3.webp",
    "/images/8-3.webp",
    "/images/8-4.webp",
    "/images/HC2-3.webp",
    "/images/HL-1.webp",
    "/images/LM-4.webp",
    "/images/title.webp",
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
    <indexZh v-if="lan == 'zh'" />
    <indexEn v-if="lan == 'en'" />
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

  <FooterZh v-if="lan == 'zh'" />
  <FooterEn v-if="lan == 'en'" />
</template>

<style> 

  .md-container {
    width: 100vw;
    box-sizing: border-box;
    background-color: white;
    padding: 10px;
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
    overflow-x: scroll;
  }

  @media (max-width: 1333px) and (min-width: 800px) {
    .md-container {
      width: 90vw;
      border-radius: 10px;
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
    overflow-x:scroll
  }

  p {
    margin: .5em 0;
  }

  ul {
    margin: .5em 0;
  }

  p, ol, h4, h5, h6, table, button {
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  table thead {
    background: #404248;
    color: #fff;
    text-align: left;
  }

  table tr:first-child {
    border-top: 0;
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
</style>
