<script setup>
  import { ref, computed } from 'vue';
  import DownloadHeader from '../../components/Header.vue';
  import {getLanguage, setLanguageZh, setLanguageEn} from "../../util/Language.js";
  import FooterZh from '../../components/FooterZh.vue';
  import {readList} from "../../util/ReadList.js";
  import GameLine from "../../components/GameLine.vue";
  import SortIcon from "../../components/icons/IconSort.vue";
  import FilterIcon from "../../components/icons/IconFilter.vue";
  import introZh from '../../markdown/mw-games-zh.md';
  import {getAuthor} from "../../util/GemeUtil.js";
  import {getDownloadLink, getDownloadDesc} from "../../util/GemeUtil.js"
  import { Collapse } from 'vue-collapsed'
  import axios from 'axios';

  const originalLan = ref(getLanguage());

  const lan = "zh"

  const games = ref([]);

  readList("list-mw.yaml").then((list) => {
    for (var entry of list) {
      entry.category = "mw";
      // For compability, we still have a "fake" currentVer field.
      entry.currentVer = {
        code : entry.code,
        date : entry.date,
        download_url : entry.download_url,
        file_url : entry.file_url,
        source_url : entry.source_url,
      }

      // adjust smwp_ver
      if (entry.smwp_ver) {
        entry.smwp_ver = "SMWP " + entry.smwp_ver
      }

      // Check validity of urls.
      if (entry.currentVer.source_url != null && entry.currentVer.source_url[0] == "~") {
        entry.currentVer.source_url = entry.currentVer.source_url.substring(1);
        entry.currentVer.source_url_invalid = true
      } else {
        entry.currentVer.source_url_invalid = false
      }

      if (entry.currentVer.download_url != null && entry.currentVer.download_url[0] == "~") {
        entry.currentVer.download_url = entry.currentVer.download_url.substring(1);
        entry.currentVer.download_url_invalid = true
      } else {
        entry.currentVer.download_url_invalid = false
      }

      games.value.push(entry);
      // Disable download button if link does not exist.
      if (entry.download_url == null && entry.file_url == null) {
        entry.disable_download = true;
      }
    }
    games.value.sort((a, b) => b.date - a.date)
    // console.log(games);
  });

  const selectedGame = ref(null);

  
  const sort_option = ref({
    active : false,
    field : null,
    asc : true
  });

  function sortByName() {
    if (sort_option.value.field != "game") {
      sort_option.value.field = "game";
      sort_option.value.asc = true;
    } else {
      sort_option.value.asc = !sort_option.value.asc;
    }
    games.value = games.value.sort((a, b) => sort_option.value.asc ? a.game.localeCompare(b.game) : b.game.localeCompare(a.game));
  }

  function sortByAuthor() {
    if (sort_option.value.field != "author") {
      sort_option.value.field = "author";
      sort_option.value.asc = true;
    } else {
      sort_option.value.asc = !sort_option.value.asc;
    }
    games.value = games.value.sort((a, b) => sort_option.value.asc ? getAuthor(a, "zh").localeCompare(getAuthor(b, "zh")) : getAuthor(b, "zh").localeCompare(getAuthor(a, "zh")));
  }

  function sortByDate() {
    if (sort_option.value.field != "date") {
      sort_option.value.field = "date";
      sort_option.value.asc = true;
    } else {
      sort_option.value.asc = !sort_option.value.asc;
    }
    games.value = games.value.sort((a, b) => sort_option.value.asc ? a.date - b.date : b.date - a.date);
  }

  const filter_option = ref({
    active : false,
    name : "",
    year : ""
  });

  function clearFilter() {
    filter_option.value.name = "";
    filter_option.value.author = "";
    filter_option.value.year = "";
  }

  const filteredGames = computed(() => {
    return games.value.filter((a) => 
      ((filter_option.value.name.trim() == "" || a.game.toUpperCase().match(filter_option.value.name.trim().toUpperCase()))
      || (filter_option.value.name.trim() == "" || (getAuthor(a, "zh").toUpperCase().match(filter_option.value.name.trim().toUpperCase()))))
      && (isNaN(parseInt(filter_option.value.year)) || (parseInt(a.date.toISOString().split('-')[0]) == parseInt(filter_option.value.year)))
    )
  });

  const lastUpdate = ref(null);

  axios.get("https://api.github.com/repos/MarioForeverCommunity/download-site-next/commits?path=public%2Flists%2Flist-mw.yaml&page=1&per_page=1").then((response) => {
    lastUpdate.value = new Date(response.data[0].commit.committer.date).toISOString().split('T')[0];
  });
</script>

<template>
  <DownloadHeader pageId="mw-levels" :lan-var="originalLan" @change-lan-zh="originalLan = setLanguageZh(); " @change-lan-en="originalLan = setLanguageEn(); "/>

  <div class="container md-container">
    <introZh />
    <p v-if="lastUpdate" class="last-update">最后更新：{{ lastUpdate }}</p>
  </div>

  <div class="hidden-container">
    <div class="container icon-container" :class="sort_option.active ? 'expand' : '' ">
      <SortIcon class="icon button" :class="sort_option.active ? 'active' : '' " @click="sort_option.active = !sort_option.active"></SortIcon>
      <FilterIcon class="icon button" :class="filter_option.active ? 'active' : '' " @click="clearFilter(); filter_option.active = !filter_option.active"></FilterIcon>
      <Collapse :when="sort_option.active">
        <div class="icon-container">
          排序选项：
          <div class="visible-button" @click="sortByName();">
            名称
            {{ sort_option.field == "game" ? (sort_option.asc ? "▲" : "▼") : "" }}
          </div>
          <div class="visible-button" @click="sortByAuthor();">
            作者
            {{ sort_option.field == "author" ? (sort_option.asc ? "▲" : "▼") : "" }}
          </div>
          <div class="visible-button" @click="sortByDate();">
            日期
            {{ sort_option.field == "date" ? (sort_option.asc ? "▲" : "▼") : "" }}
          </div>
        </div>
      </Collapse>
      <Collapse :when="filter_option.active">
        <div class="icon-container">
          {{ lan == "en" ? "Filter: " : "筛选：" }}
          <div class="inline-block">
            <input v-model="filter_option.name" class="input">&nbsp;
          </div>
          <div class="inline-block">
            {{ lan == "en" ? "Year" : "年份" }}
            <select v-model="filter_option.year">
              <option value="">{{ lan == "en" ? "Select..." : "请选择.." }}</option>
              <option v-for="year in Array.from({length: new Date().getFullYear()-2016+1}, (_, i) => i + 2016).reverse()">{{year}}</option>
            </select>&nbsp;
          </div>
        </div>
      </Collapse>
    </div>
  </div>

  <div v-for="game in filteredGames" key="game.game" v-memo="game.game">
    <GameLine :game="game" :lan="lan" @select-game="(entry) => {selectedGame = entry;}"/>
  </div>

  <Transition>
    <div v-if="selectedGame != null" class="modal-bg" @click="selectedGame = null;">
      <div class="modal-content" @click.stop="">
        <div>
          下载 {{ selectedGame.game }}
        </div>
        <div class="button-line">
          <a class="download" v-if="selectedGame.file_url" :href="selectedGame.file_url" target="_blank">社区资源站</a>
          <a class="download" v-if="getDownloadLink(selectedGame, lan)" :href="getDownloadLink(selectedGame, lan)" target="_blank">{{ getDownloadDesc(selectedGame, lan) }}</a>
        </div>
      </div>
    </div>
  </Transition>

  <FooterZh/>
</template>

<style scoped>
  html {
    max-width: 100%;
    overflow-x: hidden;
  }

  .inline-block {
    display: inline-block;
  }

  .hidden-container {
    width: 100vw;
    margin-top: -10px;
  }

  .icon-container {
    padding: .25em;
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

  .v-enter-active,
  .v-leave-active {
    transition: opacity 0.5s ease;
  }

  .v-enter-from,
  .v-leave-to {
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
    margin-top: 1em;
    margin-bottom: .5em;
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
  }

  p, ol, h4, h5, h6, table, button {
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
</style>
