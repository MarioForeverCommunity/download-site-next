<script setup>
  import {listToText, parseVer} from "../util/Misc.js";
  import ArrowIcon from "./icons/IconArrow.vue"
  import WikiIcon from "./icons/IconWiki.vue";
  import LinkIcon from "./icons/IconLink.vue";
  import DownloadIcon from "./icons/IconDownload.vue";
  import YoutubeIcon from "./icons/IconYoutube.vue";
  import {getSourceLink, getSourceLinkValidity, getSourceDesc, getName} from "../util/GemeUtil.js";

  const props = defineProps({
    game: {
      type: Object,
      required: true
    }, 
    lan : {
      required: true
    }
  });
</script>

<template>
  <div class="container game-container">
    <div class="game-name">{{ getName(game, lan) }}</div>
    <div class="game-author" v-html="lan == 'en' && game.author_alt != null ? listToText(game.author_alt) : listToText(game.author)"></div>
    <div class="game-version" v-if="game.category == 'mf'">
      <span style="display: inline-block;" :class="game.ver.length > 1 ? 'dropdown' : ''">{{ lan == "en" && game.currentVerStrAlt ? game.currentVerStrAlt : game.currentVerStr }}</span>
      <div :class="game.ver.length > 1 ? 'dropdown' : ''">
        <ArrowIcon v-if="game.ver.length > 1" class="icon rotate-button"></ArrowIcon>
        <div v-if="game.ver.length > 1" class="dropdown-content">
          <div v-for="ver in game.ver" class="dropdown-item" @click="game.currentVer=parseVer(ver); game.currentVerStr = Object.keys(ver)[0]; game.currentVerStrAlt = parseVer(ver).ver_alt;">{{ lan == "en" && parseVer(ver).ver_alt != null ? parseVer(ver).ver_alt : Object.keys(ver)[0] }}</div>
        </div>
      </div>
    </div>
    <div class="game-version" v-if="game.category == 'mw'">
      {{ game.smwp_ver }}
    </div>
    <div class="game-date">{{ game.currentVer.date.toISOString().split('T')[0] }}</div>
    <div class="game-buttons">
      <a class="tooltip" v-if="!game.disable_download">
        <DownloadIcon class="icon button" @click="$emit('selectGame', game)"></DownloadIcon>
        <span class="tooltiptext tooltip-bottom">
          {{ lan == "en" ? "Download" : "下载链接" }}
        </span>
      </a>
      <a class="tooltip" v-if="getSourceLink(game, lan) && getSourceDesc(game, lan) != 'Youtube'" :href="getSourceLink(game, lan)" target="_blank">
        <LinkIcon class="icon button" :class="getSourceLinkValidity(game, lan) ? '' : 'invalid'"></LinkIcon>
        <span class="tooltiptext tooltip-bottom">
          {{ lan == "en" ? "Source Link" : "发布页" }}
          <span v-if="getSourceDesc(game, lan)" class="small"><br>({{ getSourceDesc(game, lan) }})</span>
        </span>
      </a>
      <a class="tooltip" v-if="getSourceLink(game, lan) && getSourceDesc(game, lan) == 'Youtube'" :href="getSourceLink(game, lan)" target="_blank">
        <YoutubeIcon class="icon button" :class="getSourceLinkValidity(game, lan) ? '' : 'invalid'"></YoutubeIcon>
        <span class="tooltiptext tooltip-bottom">
          {{ lan == "en" ? "Video" : "发布视频" }}
        </span>
      </a>
      <a class="tooltip" v-if="game.wiki_zh_url != null && lan == 'zh'" :href="game.wiki_zh_url" target="_blank">
        <WikiIcon class="icon button"></WikiIcon>
        <span class="tooltiptext tooltip-bottom">Wiki 页面</span>
      </a>
      <a class="tooltip" v-if="game.wiki_en_url != null && lan == 'en'" :href="game.wiki_en_url" target="_blank">
        <WikiIcon class="icon button"></WikiIcon>
        <span class="tooltiptext tooltip-bottom">Wiki Page</span>
      </a>
    </div>
  </div>
</template>
<style scoped>
  .game-container {
    width: 100vw;
    box-sizing: border-box;
    padding: 15px 10px;
    margin: 3px auto;
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
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
  }

  @media (max-width: 1333px) and (min-width: 800px) {
    .game-container {
      width: 90vw;
      border-radius: 2px;
    }
  }

  @media (min-width: 1333px) {
    .game-container {
      width: 1200px;
      border-radius: 2px;
    }
  }

  .game-name {
    width: 35%;
    padding-right: 10px;
    padding-left: 10px;
    box-sizing: border-box;
  }

  .game-author {
    width: 25%;
    padding-right: 10px;
    box-sizing: border-box;
  }

  .game-version {
    width: 18%;
    padding-right: 10px;
    box-sizing: border-box;
    vertical-align: middle;
  }

  .game-date {
    width: 10%;
    padding-right: 10px;
    box-sizing: border-box;
  }

  .game-buttons {
    width: 12%;
    box-sizing: border-box;
    padding-right: 20px;
  }

  .game-buttons a {
    float: right;
  }

  .icon {
    fill: #000;
    width: 16px;
    height: 16px;
    margin-left: 5px;
    display: inline-block;
    vertical-align: middle;
  }

  .icon.invalid{
    fill: #ccc;
  }

  .button {
    border: 1px solid rgba(0, 0, 0, 0);
    padding: 4px;
    border-radius: .25em;
    transition: all 250ms;
    cursor: pointer;
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

  .rotate-button {
    transition: all 250ms;
  }

  .rotate-button:hover, .rotate-button:focus {
    transform: rotate(180deg);
  }

  .dropdown {
    display: inline-block;
    vertical-align: middle;
  }

  .dropdown-content {
    display: none;
    position: absolute;
    transform: translateX(-50%);
    border-radius: .5em;
    background-color: #ffffff;
    min-width: 80px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
  }

  .dropdown:hover .dropdown-content {
    display: block;
  }

  .dropdown:hover .rotate-button {
    transform: rotate(180deg);
  }

  .dropdown:hover .dropdown-item {
    display: block;
    padding: 5px;
    line-height: 1.2rem;
    text-align: center;
  }

  .dropdown:hover .dropdown-item:hover {
    background-color: #e0e0e0;
    cursor: pointer;
  }

  .tooltip {
    position: relative;
    display: inline-block;
  }

  .tooltip .tooltiptext {
    width: 100px;
    visibility: hidden;
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;
    position: absolute;
    z-index: 1;
    top: 150%;
    left: 50%;
    margin-left: -60px;
    padding: .25em .75em;
  }

  .tooltip .tooltiptext::after {
    content: "";
    position: absolute;
    bottom: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent black transparent;
  }

  .tooltip:hover .tooltiptext {
    visibility: visible;
  }

  .small {
    font-size: 0.8em;
  }

</style>
