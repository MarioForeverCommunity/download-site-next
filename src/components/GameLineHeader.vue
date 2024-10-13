<script setup>
  import {listToText, parseVer} from "../util/Misc.js";
  import ArrowIcon from "./icons/IconArrow.vue"
  import WikiIcon from "./icons/IconWiki.vue";
  import LinkIcon from "./icons/IconLink.vue";
  import DownloadIcon from "./icons/IconDownload.vue";
  import YoutubeIcon from "./icons/IconYoutube.vue";
  import RepackIcon from "./icons/IconRepack.vue";
  import {getSourceLink, getSourceLinkValidity, getSourceDesc, getName, getAuthorList} from "../util/GemeUtil.js";

  const props = defineProps({
    lan : {
      required: true
    },
    category : {
      required: true
    },
    sort_option : {
      required: true
    }
  });

  function getSortOption() {
    return props.sort_option;
  }

</script>

<template>
  <div class="container game-container header">
    <div class="game-name header">
      {{ lan == "en" ? "Game" : "作品名" }}
      <div class="button" @click="$emit('sortByName')">{{ getSortOption().field == "game" ? (getSortOption().asc ? "↑" : "↓") : "⇵" }}</div>
    </div>
    <div class="game-author header">
      {{ lan == "en" ? "Author" : "作者" }}
      <div class="button" @click="$emit('sortByAuthor')">{{ getSortOption().field == "author" ? (getSortOption().asc ? "↑" : "↓") : "⇵" }}</div>
    </div>
    <div class="game-version header" v-if="category == 'mf'">
      {{ lan == "en" ? "Version" : "版本" }}
    </div>
    <div class="game-version header" v-if="category == 'mw'">
      SMWP 版本
    </div>
    <div class="game-date header">
      {{ lan == "en" ? "Date" : "发布日期" }}
      <div class="button" @click="$emit('sortByDate')">{{ getSortOption().field == "date" ? (getSortOption().asc ? "↑" : "↓") : "⇵" }}</div>
    </div>
    <div class="game-buttons header"></div>
  </div>
</template>

<style scoped>
  @import "../assets/download-style-table.css";
</style>

<style scoped>
  .game-container.header {
    padding: 10px 10px;
    margin-top: .5em;
    font-weight: bold;
  }

  .button {
    display: inline-block;
    cursor: pointer;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
    width: 1em;
    transition: all 250ms;
  }

  .button:hover {
    transform: translateY(-2px);
  }
</style>