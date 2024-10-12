<script setup>
  import { ref } from 'vue';
  import DownloadHeader from '../../components/Header.vue';
  import {getLanguage, setLanguageZh, setLanguageEn} from "../../util/Language.js";
  import {readList} from "../../util/ReadList.js";
  import GameLine from "../../components/GameLine.vue";
  import {parseVer} from "../../util/Misc.js";
  import introZh from '../../markdown/mw-games-zh.md';
  import {getDownloadLink, getDownloadDesc} from "../../util/GemeUtil.js"

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
</script>

<template>
  <DownloadHeader pageId="mw-levels" :lan-var="originalLan" @change-lan-zh="originalLan = setLanguageZh(); " @change-lan-en="originalLan = setLanguageEn(); "/>

  <div class="md-container">
    <introZh />
  </div>

  <div v-for="game in games">
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
</template>

<style>
  html {
      max-width: 100%;
      overflow-x: hidden;
  }

  .md-container {
    width: 100vw;
    box-sizing: border-box;
    background-color: white;
    padding: 10px;
    margin: 20px auto;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
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
      border-radius: 10px;
    }
  }

  @media (min-width: 1333px) {
    .md-container {
      width: 1200px;
      border-radius: 10px;
    }
  }
  a {
    color: #008cff;
    text-decoration: none;
    font-weight: normal;
  }

  table {
    width: 100%;
  }

  p {
    margin: 4px 0;
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
}

.download:hover, .download:focus {
  transform: translateY(-4px);
  background-color: #30acff;
}

.download:active {
  background-color: #007cdf;
}

.button-line {
  margin-top: 1em;
  margin-bottom: .5em;
}
</style>
