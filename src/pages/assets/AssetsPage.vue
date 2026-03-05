<script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import axios from 'axios';
  import DownloadHeader from '../../components/HeaderNav.vue';
  import {setLanguageZh} from "../../util/Language.js";
  import SiteFooter from '../../components/SiteFooter.vue';
  import AssetCard from '../../components/AssetCard.vue';
  import {getName, getDownloadEntries} from "../../util/GemeUtil.js";
  import { FilterIcon } from "../../components/icons/Icons.js";
  import {filterList, getStrFromList} from "../../util/GemeUtil.js"
  import ClipboardButton from '../../components/ButtonClipboard.vue';
  import Tooltip from '../../components/ToolTip.vue';
  import ButtonBackToTop from '../../components/ButtonBackToTop.vue';
  import ButtonDarkMode from '../../components/ButtonDarkMode.vue';
  import { useFloating, flip, shift, offset, autoUpdate } from '@floating-ui/vue';
  import {readList} from "../../util/ReadList.js";
  import {parseVer} from "../../util/Misc.js";
  import introContent from '../../markdown/assets.md';

  const lan = ref("zh");

  const pageId = "assets"

  const title = "Mario Forever 创作资源汇总";

  document.title = title;

  const assets = ref([]);

  readList("list-assets.yaml").then((list) => {
    for (var entry of list) {
      if (entry.variants) {
        entry.currentVer = parseVer(entry.variants[0]);
        entry.currentVerStr = Object.keys(entry.variants[0])[0];
        entry.ver = entry.variants;
      } else {
        entry.currentVer = {
          ver: entry.ver,
          date: entry.date ? new Date(entry.date) : null,
          file_name: entry.file_name,
          download_url: entry.download_url,
          download_url_alt: entry.download_url_alt,
          code: entry.code,
          code_alt: entry.code_alt,
          source_url: entry.source_url,
          source_url_alt: entry.source_url_alt
        };
        entry.currentVerStr = entry.ver;
        entry.ver = entry.ver ? [{[entry.ver]: entry.currentVer}] : [];
      }
      assets.value.push(entry);
    }
  });

  const selectedDownload = ref(null);
  const tiebaDialog = ref(null);

  const lastUpdate = ref(null);

  axios.get("https://api.github.com/repos/MarioForeverCommunity/download-site-next/commits?path=public%2Flists%2Flist-assets.yaml&page=1&per_page=1").then((response) => {
    const date = new Date(response.data[0].commit.committer.date);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const formattedDate = date.toLocaleDateString('zh-CN', options).replace(/\//g, '-');
    lastUpdate.value = formattedDate;
  });

  const filter_option = ref({
    active : false,
    name : "",
    type_engine: true,
    type_addon: true,
    type_effect: true,
  });

  function clearName() {
    filter_option.value.name = "";
  }
  function clearFilter() {
    filter_option.value.name = "";
    filter_option.value.type_engine = true;
    filter_option.value.type_addon = true;
    filter_option.value.type_effect = true;
  }

  const filteredAssets = computed(() => {
    const expanded = assets.value.flatMap((entry) => {
      if (!entry.ver || entry.ver.length === 0) {
        const nameMatch = (
          (entry.name && (filter_option.value.name.trim() == "" || entry.name.toUpperCase().match(filter_option.value.name.trim().toUpperCase())))
          || (entry.name_alt && (filter_option.value.name.trim() == "" || entry.name_alt.toUpperCase().match(filter_option.value.name.trim().toUpperCase())))
          || (getStrFromList(entry.author) && (filter_option.value.name.trim() == "" || getStrFromList(entry.author).toUpperCase().match(filter_option.value.name.trim().toUpperCase())))
          || filterList(filter_option.value.name.trim(), entry.alias)
        );
        const typeMatch = (filter_option.value.type_engine && entry.type == "engine")
          || (filter_option.value.type_addon && entry.type == "addon")
          || (filter_option.value.type_effect && entry.type == "effect");
        if (!nameMatch || !typeMatch) return [];
        return [entry];
      }
      const hasMultipleVariants = entry.ver.length > 1;
      return entry.ver.map((verRaw) => {
        const verKey = Object.keys(verRaw)[0];
        const verObj = verRaw[verKey];
        const nameMatch = (
          (entry.name && (filter_option.value.name.trim() == "" || entry.name.toUpperCase().match(filter_option.value.name.trim().toUpperCase())))
          || (entry.name_alt && (filter_option.value.name.trim() == "" || entry.name_alt.toUpperCase().match(filter_option.value.name.trim().toUpperCase())))
          || (getStrFromList(entry.author) && (filter_option.value.name.trim() == "" || getStrFromList(entry.author).toUpperCase().match(filter_option.value.name.trim().toUpperCase())))
          || filterList(filter_option.value.name.trim(), entry.alias)
        );
        const fileNameMatch = verObj.file_name && verObj.file_name.toUpperCase().includes(filter_option.value.name.trim().toUpperCase());
        if (!nameMatch && !fileNameMatch) return null;
        const typeMatch = (filter_option.value.type_engine && entry.type == "engine")
          || (filter_option.value.type_addon && entry.type == "addon")
          || (filter_option.value.type_effect && entry.type == "effect");
        if (!typeMatch) return null;
        return {
          ...entry,
          currentVer: parseVer(verRaw),
          currentVerStr: verKey,
          _variantName: hasMultipleVariants ? verKey : null
        };
      }).filter(item => item !== null);
    });
    expanded.sort((a, b) => {
      const dateA = a.currentVer && a.currentVer.date ? new Date(a.currentVer.date) : null;
      const dateB = b.currentVer && b.currentVer.date ? new Date(b.currentVer.date) : null;
      if (dateA === null && dateB === null) return 0;
      if (dateA === null) return 1;
      if (dateB === null) return -1;
      return dateB - dateA;
    });
    return expanded;
  });

  function pageSetLanguageZh() {
    lan.value = setLanguageZh();
    document.title = title;
  }

  const wideScreen = ref(window.innerWidth > 800);

  function updateWideScreen() {
    wideScreen.value = window.innerWidth > 800;
  }

  onMounted(() => {
    window.addEventListener('resize', updateWideScreen);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateWideScreen);
  });

  function getAssetImage(asset) {
    if (asset.image) {
      return `/images/assets/${asset.image}`;
    }
    return null;
  }

  function getAssetResourceURL(asset) {
    if (!asset.currentVer || !asset.currentVer.file_name) {
      return null;
    }
    const fileName = asset.currentVer.file_name;
    const encodedFileName = encodeURIComponent(fileName);
    if (asset.type === 'effect') {
      return `https://file.marioforever.net/Mario Forever/引擎/CTF 特效/${encodedFileName}`;
    } else if (asset.type === 'addon') {
      return `https://file.marioforever.net/Mario Forever/引擎/CTF 拓展资源包/${encodedFileName}`;
    } else if (asset.type === 'engine') {
      const path = asset.path || '';
      const encodedPath = path ? encodeURIComponent(path) + '/' : '';
      return `https://file.marioforever.net/Mario Forever/引擎/${encodedPath}${encodedFileName}`;
    }
    return null;
  }

  // Optimized tooltip.

  function tooltipMouseEnter(obj) {
    if (obj[0] != reference.value) {
      reference.value = obj[0];
      floatingText.value = obj[1];
    }
  }

  function tooltipMouseLeave(obj) {
    if (obj == reference.value) {
      reference.value = null;
      floatingText.value = null;
    }
  }
  
  const reference = ref(null);
  const floating = ref(null);
  const floatingText = ref(null);
  const { floatingStyles} = useFloating(reference, floating, 
  {
    middleware: [flip(), shift(), offset(10)],
    whileElementsMounted: autoUpdate,
  });
</script>

<template>
  <DownloadHeader :pageId="pageId" :lan-var="lan" @change-lan-zh="pageSetLanguageZh();"/>

  <div class="container md-container">
    <h1>{{ title }}</h1>
    <introContent />
    <p v-if="lastUpdate" class="last-update">最后更新：{{ lastUpdate }}</p>
  </div>

  <div class="hidden-container">
    <div class="container icon-container expand">
      <div class="icon-container">
        筛选
        <div class="inline-block search-box">
          <input v-model="filter_option.name" class="input">
          <span v-if="filter_option.name" class="clear-btn" @click="clearName" title="清除">✕</span>
        </div>&nbsp;
        <div class="inline-block">
          <input v-model="filter_option.type_engine" type="checkbox" id="filterEngine">
          <label for="filterEngine">引擎</label>
        </div>
        <div class="inline-block">
          <input v-model="filter_option.type_addon" type="checkbox" id="filterAddon">
          <label for="filterAddon">拓展资源</label>
        </div>
        <div class="inline-block">
          <input v-model="filter_option.type_effect" type="checkbox" id="filterEffect">
          <label for="filterEffect">特效</label>
        </div>
        <Tooltip :in-card="false" @show-tooltip="(obj)=>tooltipMouseEnter(obj)" @hide-tooltip="(obj) => tooltipMouseLeave(obj)">
          <FilterIcon class="icon button" @click="clearFilter()" />
          <template #popper>重置筛选</template>
        </Tooltip>
        <div class="inline-block item-count">
          {{ filteredAssets.length }} 个条目
        </div>
      </div>
    </div>
  </div>

  <div class="card-container">
    <div v-for="(asset, idx) in filteredAssets" :key="asset.name + '|' + getStrFromList(asset.author) + '|' + idx">
      <AssetCard :asset="asset" :get-asset-image="getAssetImage" @select-download="(entry) => {selectedDownload = entry;}" @show-tooltip="(obj)=>tooltipMouseEnter(obj)" @hide-tooltip="(obj) => tooltipMouseLeave(obj)" @show-tieba-dialog="(data) => {tiebaDialog = data;}"/>
    </div>
  </div>

  <Transition name="modal">
    <div v-if="selectedDownload != null" class="modal-bg" @click="selectedDownload = null;">
      <div class="modal-content" @click.stop="">
        <div>
          下载 {{ getName(selectedDownload, lan) }}
        </div>
        <div class="button-line">
          <a class="download" v-if="getAssetResourceURL(selectedDownload)" :href="getAssetResourceURL(selectedDownload)" target="_blank">社区资源站</a>
          <template v-for="entry in getDownloadEntries(selectedDownload, lan)" :key="entry.url">
            <a class="download" :href="entry.url" target="_blank">{{ entry.desc }}</a>
            <ClipboardButton
              v-if="entry.code"
              :code="entry.code"
              :lan="lan"
            ></ClipboardButton>
          </template>
        </div>
      </div>
    </div>
  </Transition>

  <Transition name="modal">
    <div v-if="tiebaDialog != null" class="modal-bg" @click="tiebaDialog = null;">
      <div class="modal-content" @click.stop="">
        <div>
          选择要访问的链接
        </div>
        <div class="button-line">
          <a class="download" :href="tiebaDialog.originalUrl" target="_blank" @click="tiebaDialog = null;">
            百度贴吧源站
          </a>
          <a class="download" :href="tiebaDialog.archiveUrl" target="_blank" @click="tiebaDialog = null;">
            社区备份站
          </a>
        </div>
      </div>
    </div>
  </Transition>

  <div ref="floating" class="floating-obj" v-if="floatingText" :style="floatingStyles" v-html="floatingText">
  </div>
  
  <ButtonBackToTop />
  <ButtonDarkMode />

  <SiteFooter />
</template>

<style scoped>
  @import "../../assets/general.css";
</style>

<style scoped>
  html {
    max-width: 100%;
    overflow-x: hidden;
  }

  .hidden-container {
    width: 100vw;
    margin-top: -10px;
  }

  .icon-container {
    padding: .25em 10px;
  }

  .md-container {
    width: 100vw;
    box-sizing: border-box;
    padding: 10px 20px;
    margin: 20px auto;
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
  }

  @media (max-width: 1333px) and (min-width: 800px) {
    .md-container {
      width: 90vw;
      border-radius: 2px;
    }

    .hidden-container {
      width: 90vw;
      margin: auto;
      margin-top: -10px;
    }
  }

  @media (min-width: 1333px) {
    .md-container {
      width: 1200px;
      border-radius: 2px;
    }

    .hidden-container {
      width: 1200px;
      margin: auto;
      margin-top: -10px;
    }
  }

  .icon {
    color: #000;
    width: 16px;
    height: 16px;
    display: inline-block;
    vertical-align: middle;
    margin: 2px;
  }

  .button {
    border: 1px solid rgba(0, 0, 0, 0);
    padding: 4px;
    border-radius: .25em;
    transition: all 250ms;
    cursor: pointer;
    display: inline-block;
  }

  .button:hover, .button:focus {
    border: 1px solid rgba(0, 0, 0, 0.15);
    box-shadow: rgba(0, 0, 0, 0.1) 2px 2px 6px;
    color: rgba(0, 0, 0, 0.65);
  }

  .button:hover {
    transform: translateY(-1px);
  }

  .button:active {
    background-color: #F0F0F1;
    border: 1px solid rgba(0, 0, 0, 0.15);
    box-shadow: rgba(0, 0, 0, 0.06) 1px 1px 2px;
    color: rgba(0, 0, 0, 0.65);
    transform: translateY(0);
  }

  .visible-button {
    border: 1px solid rgba(0, 0, 0, 0.15);
    padding: 2px .5em;
    margin-right: .5em;
    border-radius: .25em;
    transition: all 250ms;
    cursor: pointer;
    display: inline-block;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .visible-button:hover, .visible-button:focus {
    box-shadow: rgba(0, 0, 0, 0.1) 2px 2px 6px;
  }

  .visible-button:active {
    background-color: #F0F0F1;
    box-shadow: rgba(0, 0, 0, 0.06) 1px 1px 2px;
    color: rgba(0, 0, 0, 0.65);
    transform: translateY(0);
  }

  .modal-bg {
    position: fixed;
    z-index: 2;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0,0,0,0.4);
  }

  .modal-enter-active, .modal-leave-active {
    transition: opacity 0.5s ease;
  }

  .modal-enter-from, .modal-leave-to {
    opacity: 0;
  }

  .modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-right: -50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    max-width: 80vw;
    max-height: 80vh;
    padding: 1em;
    border-radius: .5em;
    overflow-y: auto;
  }

  .download {
    color: white;
    cursor: pointer;
    background-color: #008cff;
    padding: .5em;
    border-radius: .5em;
    margin-right: .5em;
    margin: .25em;
    display: inline-block;
  }

  .download:hover, .download:focus {
    background-color: #30acff;
    text-decoration: none;
  }

  .download:active {
    background-color: #007cdf;
  }

  .button-line {
    margin-top: .5em;
  }

  .input {
    cursor: text;
    color: #4e6e8e;
    display: inline-block;
    border: 1px solid #cfd4db;
    border-radius: 5px;
    outline: none;
    transition: all .2s ease;
    height: 1.3em;
    padding: 0 .5em;
    width: 120px;
  }

  .input:focus {
      cursor: auto;
      border-color: #008cff
  }

  .search-box {
    position: relative;
    display: inline-block;
  }

  .clear-btn {
    position: absolute;
    right: 2px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #999;
    font-size: 14px;
    line-height: 1;
    padding: 2px 4px;
    user-select: none;
  }

  .clear-btn:hover {
    color: #666;
  }

  select {
    cursor: text;
    color: #4e6e8e;
    display: inline-block;
    border: 1px solid #cfd4db;
    border-radius: 5px;
    outline: none;
    transition: all .2s ease;
    padding: .2em .6em;
  }

  select:focus {
      cursor: auto;
      border-color: #008cff
  }

  .italic {
    font-style: italic;
  }

  .floating-obj {
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;
    text-align: center;
    border-radius: 6px;
    width: max-content;
    max-width: calc(min(800px, 90vw));
    padding: .25em .75em;
    z-index: 3;
  }
</style>

<style>

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
    background: #404248;
    color: #fff;
    text-align: left;
  }

  table tr:first-child {
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
</style>
