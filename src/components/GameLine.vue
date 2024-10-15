<script setup>
  import {listToText, parseVer} from "../util/Misc.js";
  import { ArrowIcon, WikiIcon, LinkIcon, DownloadIcon, YoutubeIcon, RepackIcon, VideoIcon, InfoIcon } from "./icons/Icons.js";
  import {getSourceLink, getSourceLinkValidity, getSourceDesc, getName, getAuthorList} from "../util/GemeUtil.js";

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
    <div class="game-name">
      <span class="tooltip" v-if="game.type == 'repacked'">
        <RepackIcon class="icon"></RepackIcon>
        <span class="tooltiptext tooltip-bottom">
          {{ lan == "en" ? "Repacked Game" : "重打包作品" }}
        </span><i></i>
      </span>
      {{ getName(game, lan) }}
      <a class="tooltip" v-if="lan == 'zh' && game.description_zh">
        <InfoIcon class="icon button-shift"></InfoIcon>
        <span class="tooltiptext tooltip-bottom">{{ game.description_zh }}</span><i></i>
      </a>
      <a class="tooltip" v-if="lan == 'en' && game.description_en">
        <InfoIcon class="icon button-shift"></InfoIcon>
        <span class="tooltiptext tooltip-bottom tooltip-left-align">{{ game.description_en }}</span><i></i>
      </a>
      </div>
    <div class="game-author">
      <span v-if="typeof getAuthorList(game, lan) == 'string'">
        {{ getAuthorList(game, lan) }}
      </span>
      <span v-if="typeof getAuthorList(game, lan) != 'string'" v-for="(author, authorindex) in getAuthorList(game, lan)">
        <br v-if="authorindex != 0">{{ author }}
      </span>
    </div>
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
        </span><i></i>
      </a>
      <a class="tooltip" v-if="getSourceLink(game, lan) && getSourceDesc(game, lan) != 'YouTube'" :href="getSourceLink(game, lan)" target="_blank">
        <LinkIcon class="icon button" :class="getSourceLinkValidity(game, lan) ? '' : 'invalid'"></LinkIcon>
        <span class="tooltiptext tooltip-bottom">
          {{ lan == "en" ? "Source Link" : "发布页" }}
          <span v-if="getSourceDesc(game, lan)" class="small"><br>({{ getSourceDesc(game, lan) }})</span>
        </span><i></i>
      </a>
      <a class="tooltip" v-if="getSourceLink(game, lan) && getSourceDesc(game, lan) == 'YouTube'" :href="getSourceLink(game, lan)" target="_blank">
        <YoutubeIcon class="icon button" :class="getSourceLinkValidity(game, lan) ? '' : 'invalid'"></YoutubeIcon>
        <span class="tooltiptext tooltip-bottom">
          {{ lan == "en" ? "Release Video" : "发布视频" }}
        </span><i></i>
      </a>
      <a class="tooltip" v-if="(game.video_en != null || game.video != null) && lan == 'en'" @click="$emit('selectVideos', game)" target="_blank">
        <VideoIcon class="icon button"></VideoIcon>
        <span class="tooltiptext tooltip-bottom">Related Videos</span><i></i>
      </a>
      <a class="tooltip" v-if="(game.video_zh != null || game.video != null) && lan == 'zh'" @click="$emit('selectVideos', game)" target="_blank">
        <VideoIcon class="icon button"></VideoIcon>
        <span class="tooltiptext tooltip-bottom">相关视频</span><i></i>
      </a>
      <a class="tooltip" v-if="game.wiki_zh_url != null && lan == 'zh'" :href="game.wiki_zh_url" target="_blank">
        <WikiIcon class="icon button"></WikiIcon>
        <span class="tooltiptext tooltip-bottom">Wiki 页面</span><i></i>
      </a>
      <a class="tooltip" v-if="game.wiki_en_url != null && lan == 'en'" :href="game.wiki_en_url" target="_blank">
        <WikiIcon class="icon button"></WikiIcon>
        <span class="tooltiptext tooltip-bottom">Wiki Page</span><i></i>
      </a>
    </div>
  </div>
</template>

<style scoped>
  @import "../assets/download-style-table.css";
  @import "../assets/general.css";
</style>

<style scoped>
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

  .small {
    font-size: 0.8em;
  }

  .button-shift {
    transform: translateY(-1px);
  }

</style>
