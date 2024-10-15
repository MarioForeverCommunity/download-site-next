<script setup>
  import { ref, computed } from 'vue';
  import DownloadHeader from '../../components/Header.vue';
  import {getLanguage, setLanguageZh, setLanguageEn} from "../../util/Language.js";
  import { navTop } from "../../config.js";
  import FooterZh from '../../components/FooterZh.vue';
  import FooterEn from '../../components/FooterEn.vue';
  import {readList} from "../../util/ReadList.js";
  import GameLine from "../../components/GameLine.vue";
  import GameCard from '../../components/GameCard.vue';
  import GameLineHeader from '../../components/GameLineHeader.vue';
  import {getAuthor, getName} from "../../util/GemeUtil.js";
  import {parseVer} from "../../util/Misc.js";
  import introZh from '../../markdown/mf-games-zh.md';
  import introEn from '../../markdown/mf-games-en.md';
  import { SortIcon, FilterIcon, SortUpIcon, SortDownIcon, SortUpDownIcon } from "../../components/icons/Icons.js";
  import {getDownloadLink, getDownloadDesc, getDownloadCode, getVideoDesc, getResourceURL} from "../../util/GemeUtil.js"
  import ClipboardButton from '../../components/ButtonClipboard.vue';
  import { Collapse } from 'vue-collapsed'
  import axios from 'axios';

  const lan = ref(getLanguage());

  const pageId = "mf-games"

  // Change title.

  const titleZh = navTop.find(item => item.id === pageId).title;
  const titleEn = navTop.find(item => item.id === pageId).title_alt;

  document.title = lan.value == "zh" ? titleZh : titleEn;

  // Fetch game list.

  const games = ref([]);

  readList("list.yaml").then((list) => {
    for (var entry of list) {
      entry.category = "mf";
      // Support single and multiple versions.
      if (entry.ver == null) {
        entry.ver = "";
      }
      if (typeof entry.author == "object") {
        entry.first_author = entry.author[0];
      } else {
        entry.first_author = entry.author;
      }
      if (typeof(entry.ver) != "object") {
        entry.currentVerStr = entry.ver;
        entry.currentVerStrAlt = entry.ver_alt;
        entry.ver = [{
          "" : {
            code : entry.code,
            date : entry.date,
            download_url : entry.download_url,
            download_url_alt : entry.download_url_alt,
            file_name : entry.file_name,
            file_url : entry.file_url,
            source_url : entry.source_url,
            source_url_alt : entry.source_url_alt,
            ver_alt : entry.ver_alt,
            data_download_url : entry.data_download_url
          }
        }];
      } else {
        entry.currentVerStr = Object.keys(entry.ver[0])[0];
        entry.currentVerStrAlt = entry.ver[0][entry.currentVerStr].ver_alt;
      }

      // Automatically generate file_url if file_name is provided.
      for (var verRaw of entry.ver) {
        var ver = verRaw[Object.keys(verRaw)[0]];
        if (!ver.file_url) {
          if (ver.file_name) {
            if (entry.type == "chinese") {
              ver.file_url_zh = `https://file.marioforever.net/Mario Forever/国内作品/${ver.date.toISOString().split('-')[0]}/${ver.file_name}`;
              ver.file_url_en = `https://file.marioforever.net/mario-forever/games/chinese-fangames/${ver.date.toISOString().split('-')[0]}/${ver.file_name}`;
            } if (entry.type == "repacked") {
              ver.file_url_zh = `https://file.marioforever.net/Mario Forever/重打包作品/${ver.file_name}`;
              ver.file_url_en = `https://file.marioforever.net/mario-forever/games/repacked-fangames/${ver.file_name}`;
            } if (entry.type == "international") {
              ver.file_url_zh = `https://file.marioforever.net/Mario Forever/国外作品/${entry.first_author}/${ver.file_name}`;
              ver.file_url_en = `https://file.marioforever.net/mario-forever/games/international-fangames/${entry.first_author}/${ver.file_name}`;
            }
          }
        }

        // Check validity of urls.
        if (ver.source_url != null && ver.source_url[0] == "~") {
          ver.source_url = ver.source_url.substring(1);
          ver.source_url_invalid = true
        } else {
          ver.source_url_invalid = false
        }

        if (ver.source_url_alt != null && ver.source_url_alt[0] == "~") {
          ver.source_url_alt = ver.source_url_alt.substring(1);
          ver.source_url_invalid_alt = true
        } else {
          ver.source_url_invalid_alt = false
        }

        if (ver.download_url != null && ver.download_url[0] == "~") {
          ver.download_url = ver.download_url.substring(1);
          ver.download_url_invalid = true
        } else {
          ver.download_url_invalid = false
        }

        if (ver.download_url_alt != null && ver.download_url_alt[0] == "~") {
          ver.download_url_alt = ver.download_url.substring(1);
          ver.download_url_alt_invalid = true
        } else {
          ver.download_url_alt_invalid = false
        }
      }
      entry.currentVer = parseVer(entry.ver[0]);
      games.value.push(entry);
    }
    defaultSort();
  });

  const selectedDownload = ref(null); // For download modal.
  const selectedVideo = ref(null); // For download modal.

  // Sort operations.

  const sort_option = ref({
    active : false,
    field : null,
    asc : true
  });

  function defaultSort() {
    games.value.sort((a, b) => parseVer(b.ver[0]).date - parseVer(a.ver[0]).date);
    sort_option.value.field = null;
  }

  function sortByName() {
    if (sort_option.value.field != "game") {
      sort_option.value.field = "game";
      sort_option.value.asc = true;
    } else if (sort_option.value.asc == true) {
      sort_option.value.asc = false;
    } else {
      defaultSort();
      return; 
    }
    games.value = games.value.sort((a, b) => sort_option.value.asc ? getName(a, lan.value).localeCompare(getName(b, lan.value)) : getName(b, lan.value).localeCompare(getName(a, lan.value)));
  }

  function sortByAuthor() {
    if (sort_option.value.field != "author") {
      sort_option.value.field = "author";
      sort_option.value.asc = true;
    } else if (sort_option.value.asc == true) {
      sort_option.value.asc = false;
    } else {
      defaultSort();
      return; 
    }
    games.value = games.value.sort((a, b) => sort_option.value.asc ? getAuthor(a, lan.value).localeCompare(getAuthor(b, lan.value)) : getAuthor(b, lan.value).localeCompare(getAuthor(a, lan.value)));
  }

  function sortByDate() {
    if (sort_option.value.field != "date") {
      sort_option.value.field = "date";
      sort_option.value.asc = true;
    } else if (sort_option.value.asc == true) {
      sort_option.value.asc = false;
    } else {
      defaultSort();
      return; 
    }
    games.value = games.value.sort((a, b) => sort_option.value.asc ? a.currentVer.date - b.currentVer.date : b.currentVer.date - a.currentVer.date);
  }

  // Filter operations.

  const filter_option = ref({
    active : false,
    name : "",
    year : "",
    chinese : true,
    international : true,
    repacked : true
  });

  function clearFilter() {
    filter_option.value.name = "";
    filter_option.value.year = "";
    filter_option.value.chinese = true;
    filter_option.value.international = true;
    filter_option.value.repacked = true;
  }

  const filteredGames = computed(() => {
    return games.value.filter((a) => 
      ((filter_option.value.name.trim() == "" || (getName(a, lan.value).toUpperCase().match(filter_option.value.name.trim().toUpperCase())))
      || (filter_option.value.name.trim() == "" || (getAuthor(a, lan.value).toUpperCase().match(filter_option.value.name.trim().toUpperCase()))))
      && (isNaN(parseInt(filter_option.value.year)) || (parseInt(a.currentVer.date.toISOString().split('-')[0]) == parseInt(filter_option.value.year)))
      && ((filter_option.value.chinese && a.type == "chinese")
      || (filter_option.value.international && a.type == "international")
      || (filter_option.value.repacked && a.type == "repacked"))
    )
  });

  // Language changes.

  function pageSetLanguageZh() {
    lan.value =  setLanguageZh();
    document.title=titleZh;
  }

  function pageSetLanguageEn() {
    lan.value =  setLanguageEn();
    document.title=titleEn;
  }

  // Get last update date.

  const lastUpdate = ref(null);

  axios.get("https://api.github.com/repos/MarioForeverCommunity/download-site-next/commits?path=public%2Flists%2Flist.yaml&page=1&per_page=1").then((response) => {
    lastUpdate.value = new Date(response.data[0].commit.committer.date).toLocaleString().split(' ')[0].replaceAll("/", "-");
  });

  // Get window width.

  const wideScreen = ref(window.innerWidth >= 1100);
  window.addEventListener('resize', () => {
    wideScreen.value = window.innerWidth >= 1100;
  })
</script>

<template>
  <DownloadHeader :pageId="pageId" :lan-var="lan" @change-lan-zh="pageSetLanguageZh();" @change-lan-en="pageSetLanguageEn();"/>

  <div class="container md-container">
    <h1>{{ lan == "en" ? titleEn : titleZh }}</h1>
    <introZh v-if="lan == 'zh'" />
    <introEn v-if="lan == 'en'" />
    <p v-if="lastUpdate" class="last-update">{{ lan == "en" ? "Last update: " : "最后更新：" }}{{ lastUpdate }}</p>
  </div>

  <div class="hidden-container">
    <div class="container icon-container" :class="sort_option.active ? 'expand' : '' ">
      <SortIcon v-if="!wideScreen" class="icon button" :class="sort_option.active ? 'active' : '' " @click="sort_option.active = !sort_option.active"></SortIcon>
      <FilterIcon v-if="!wideScreen" class="icon button" :class="filter_option.active ? 'active' : '' " @click="clearFilter(); filter_option.active = !filter_option.active"></FilterIcon>
      <Collapse :when="sort_option.active && !wideScreen">
        <div class="icon-container">
          {{ lan == "en" ? "Sort by " : "排序选项 " }}
          <div class="visible-button" @click="sortByName();">
            {{ lan == "en" ? "Name" : "名称" }}
            <span v-if="sort_option.field == 'game'">
              <SortUpIcon class="icon button-shift" v-if="sort_option.asc"></SortUpIcon>
              <SortDownIcon class="icon button-shift" v-if="!sort_option.asc"></SortDownIcon>
            </span>
            <span v-if="sort_option.field != 'game'">
              <SortUpDownIcon class="icon button-shift"></SortUpDownIcon>
            </span>
          </div>
          <div class="visible-button" @click="sortByAuthor();">
            {{ lan == "en" ? "Author" : "作者" }}
            <span v-if="sort_option.field == 'author'">
              <SortUpIcon class="icon button-shift" v-if="sort_option.asc"></SortUpIcon>
              <SortDownIcon class="icon button-shift" v-if="!sort_option.asc"></SortDownIcon>
            </span>
            <span v-if="sort_option.field != 'author'">
              <SortUpDownIcon class="icon button-shift"></SortUpDownIcon>
            </span>
          </div>
          <div class="visible-button" @click="sortByDate();">
            {{ lan == "en" ? "Date" : "日期" }}
            <span v-if="sort_option.field == 'date'">
              <SortUpIcon class="icon button-shift" v-if="sort_option.asc"></SortUpIcon>
              <SortDownIcon class="icon button-shift" v-if="!sort_option.asc"></SortDownIcon>
            </span>
            <span v-if="sort_option.field != 'date'">
              <SortUpDownIcon class="icon button-shift"></SortUpDownIcon>
            </span>
          </div>
        </div>
      </Collapse>
      <Collapse :when="filter_option.active || wideScreen">
        <div class="icon-container">
          {{ lan == "en" ? "Filter " : "筛选 " }}
          <div class="inline-block">
            <input v-model="filter_option.name" class="input">&nbsp;
          </div>
          <div class="inline-block">
            {{ lan == "en" ? "Year" : "年份" }}
            <select v-model="filter_option.year">
              <option value="">{{ lan == "en" ? "Select..." : "请选择.." }}</option>
              <option v-for="year in Array.from({length: new Date().getFullYear()-2013+1}, (_, i) => i + 2013).reverse()">{{year}}</option>
            </select>&nbsp;
          </div>
          <div class="inline-block">
            <input v-model="filter_option.chinese" type="checkbox">
            {{ lan == "en" ? "Chinese" : "国内作品" }}
          </div>
          <div class="inline-block">
            <input v-model="filter_option.international" type="checkbox">
            {{ lan == "en" ? "International" : "国外作品" }}
          </div>
          <div class="inline-block">
            <input v-model="filter_option.repacked" type="checkbox">
            {{ lan == "en" ? "Repacked Games" : "重打包作品" }}
          </div>
        </div>
      </Collapse>
    </div>
  </div>

  <GameLineHeader v-if="wideScreen" :lan="lan" category="mf" :sort_option="sort_option" @sort-by-name="sortByName();" @sort-by-author="sortByAuthor();" @sort-by-date="sortByDate();"/>
  <div v-if="wideScreen" v-for="game in filteredGames" key="game.game" v-memo="[game.game, lan]">
    <GameLine :game="game" :lan="lan" @select-game="(entry) => {selectedDownload = entry;}" @select-videos="(entry) => {selectedVideo = entry;}"/>
  </div>
  <div v-if="!wideScreen" class="card-container">
    <div v-for="game in filteredGames" key="game.game" v-memo="[game.game, lan]">
      <GameCard :game="game" :lan="lan" @select-game="(entry) => {selectedDownload = entry;}" @select-videos="(entry) => {selectedVideo = entry;}"/>
    </div>
  </div>

  <Transition name="modal">
    <div v-if="selectedDownload != null" class="modal-bg" @click="selectedDownload = null;">
      <div class="modal-content" @click.stop="">
        <div>
          {{ lan == 'en' ? "Download" : "下载" }} {{ getName(selectedDownload, lan) }} {{ lan == 'en' && selectedDownload.currentVerStrAlt ? selectedDownload.currentVerStrAlt : selectedDownload.currentVerStr }}
        </div>
        <div v-if="selectedDownload.type == 'repacked'" class="italic">{{ lan == "en" ? `Repacked by ${selectedDownload.currentVer.repacker_alt ? selectedDownload.currentVer.repacker_alt : selectedDownload.currentVer.repacker}.` : `该版本由 ${selectedDownload.currentVer.repacker} 打包。` }}</div>
        <div class="button-line">
          <a class="download" v-if="!getDownloadLink(selectedDownload, lan) || getDownloadLink(selectedDownload, lan).indexOf('file.marioforever.net') < 0 && getResourceURL(selectedDownload, lan)" :href="getResourceURL(selectedDownload, lan)" target="_blank">{{ lan == "en" ? "file.marioforever.net" : "社区资源站" }}</a>
          <a class="download" v-if="getDownloadLink(selectedDownload, lan)" :href="getDownloadLink(selectedDownload, lan)" target="_blank">{{ getDownloadDesc(selectedDownload, lan) }}</a>
          <ClipboardButton v-if="getDownloadCode(selectedDownload, lan)" :code="getDownloadCode(selectedDownload, lan)" :lan="lan"></ClipboardButton>
          <a class="download" v-if="selectedDownload.currentVer.data_download_url" :href="selectedDownload.currentVer.data_download_url" target="_blank">{{ lan == "en" ? "Download Data Pack" : "下载数据包" }}</a>
        </div>
      </div>
    </div>
  </Transition>

  <Transition name="modal">
    <div v-if="selectedVideo != null" class="modal-bg" @click="selectedVideo = null;">
      <div class="modal-content" @click.stop="">
        <div>
          {{ lan == 'en' ? "Related videos of " : "相关视频：" }}{{ getName(selectedVideo, lan) }}
          <p v-if="lan == 'zh'" v-for="video in selectedVideo.video_zh">
            <a :href="Object.values(video)[0]" target="_blank">▶ {{ Object.keys(video)[0] }}（{{ getVideoDesc(Object.values(video)[0], lan) }}）</a>
          </p>
          <p v-if="lan == 'en'" v-for="video in selectedVideo.video_en">
            <a :href="Object.values(video)[0]" target="_blank">▶ {{ Object.keys(video)[0] }} ({{ getVideoDesc(Object.values(video)[0], lan) }})</a>
          </p>
        </div>
      </div>
    </div>
  </Transition>

  <FooterZh v-if="lan == 'zh'" />
  <FooterEn v-if="lan == 'en'" />
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
    font-weight: 300;
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

  .button.active {
    border: 1px solid rgba(0, 0, 0, 0.15);
    padding: 4px;
    border-radius: .25em;
    background-color: #eee;
    cursor: pointer;
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
    position: fixed; /* Stay in place */
    z-index: 2; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
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
    max-width: 90vw;
    padding: 1em;
    border-radius: .5em;
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
    line-height: 1.3em;
  }

  .input:focus {
      cursor: auto;
      border-color: #008cff
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

  .last-update {
    margin-top: .5em;
    font-weight: bold;
  }

  .italic {
    font-style: italic;
  }

  .button-shift {
    transform: translateY(-1px);
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
