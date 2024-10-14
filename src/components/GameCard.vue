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
  <div class="container card">
    <div class="first-line">
      <div class="game-name">
        <span class="tooltip" v-if="game.type == 'repacked'">
          <RepackIcon class="icon"></RepackIcon>
          <span class="tooltiptext tooltip-bottom">
            {{ lan == "en" ? "Repacked Game" : "重打包作品" }}
          </span><i></i>
        </span>
        {{ getName(game, lan) }}
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
        {{ game.smwp_ver == "" ? "" : "SMWP "+game.smwp_ver }}
      </div>
    </div>
    <div class="body-line">
      <div class="game-date">{{ lan == "en" ? "Release on " : "发布于 " }}{{ game.currentVer.date.toISOString().split('T')[0] }}</div>
    </div>
    <div class="last-line-padding">
      <span v-if="typeof getAuthorList(game, lan) == 'string'">
        &nbsp;
      </span>
      <span v-if="typeof getAuthorList(game, lan) != 'string'" v-for="(author, authorindex) in getAuthorList(game, lan)">
        <br v-if="authorindex != 0">&nbsp;
      </span>
    </div>
    <div class="last-line">
      <a class="tooltip" v-if="game.wiki_zh_url != null && lan == 'zh'" :href="game.wiki_zh_url" target="_blank">
        <WikiIcon class="icon button"></WikiIcon>
        <span class="tooltiptext tooltip-bottom">Wiki 页面</span><i></i>
      </a>
      <a class="tooltip" v-if="game.wiki_en_url != null && lan == 'en'" :href="game.wiki_en_url" target="_blank">
        <WikiIcon class="icon button"></WikiIcon>
        <span class="tooltiptext tooltip-bottom">Wiki Page</span><i></i>
      </a>
      <a class="tooltip" v-if="game.video_en != null && lan == 'en'" @click="$emit('selectVideos', game)" target="_blank">
        <VideoIcon class="icon button"></VideoIcon>
        <span class="tooltiptext tooltip-bottom">Related Videos</span><i></i>
      </a>
      <a class="tooltip" v-if="game.video_zh != null && lan == 'zh'" @click="$emit('selectVideos', game)" target="_blank">
        <VideoIcon class="icon button"></VideoIcon>
        <span class="tooltiptext tooltip-bottom">相关视频</span><i></i>
      </a>
      <a class="tooltip" v-if="getSourceLink(game, lan) && getSourceDesc(game, lan) == 'Youtube'" :href="getSourceLink(game, lan)" target="_blank">
        <YoutubeIcon class="icon button" :class="getSourceLinkValidity(game, lan) ? '' : 'invalid'"></YoutubeIcon>
        <span class="tooltiptext tooltip-bottom">
          {{ lan == "en" ? "Release Video" : "发布视频" }}
        </span><i></i>
      </a>
      <a class="tooltip" v-if="getSourceLink(game, lan) && getSourceDesc(game, lan) != 'Youtube'" :href="getSourceLink(game, lan)" target="_blank">
        <LinkIcon class="icon button" :class="getSourceLinkValidity(game, lan) ? '' : 'invalid'"></LinkIcon>
        <span class="tooltiptext tooltip-bottom">
          {{ lan == "en" ? "Source Link" : "发布页" }}
          <span v-if="getSourceDesc(game, lan)" class="small"><br>({{ getSourceDesc(game, lan) }})</span>
        </span><i></i>
      </a>
      <a class="tooltip" v-if="!game.disable_download">
        <DownloadIcon class="icon button" @click="$emit('selectGame', game)"></DownloadIcon>
        <span class="tooltiptext tooltip-bottom">
          {{ lan == "en" ? "Download" : "下载链接" }}
        </span><i></i>
      </a>
      <div class="game-author">
        <span v-if="typeof getAuthorList(game, lan) == 'string'">
          {{lan == "en" ? "By " : "作者："}}{{ getAuthorList(game, lan) }}
        </span>
        <span v-if="typeof getAuthorList(game, lan) != 'string'" v-for="(author, authorindex) in getAuthorList(game, lan)">
          {{ authorindex == 0 ? (lan == "en" ? "By " : "作者：") : "" }}<br v-if="authorindex != 0">{{ author }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @import "../assets/general.css";
</style>

<style scoped>
  .card {
    box-sizing: border-box;
    display: block;
    position: relative;
    padding: 1em;
    width: 100%;
    height: 100%;
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

  .game-name {
    width: calc(100% - 165px);
    display: inline-block;
    vertical-align: top;
  }

  .game-version {
    width: 165px;
    display: inline-block;
    vertical-align: top;
    text-align: right;
  }

  .first-line {
    width: 100%;
    vertical-align: top;
  }

  .dropdown-content {
    right: 0;
    transform: translateX(-15px);
  }

  .game-date {
    font-size: 0.9em;
    color: #666;
  }

  .last-line-padding {
    padding-bottom: 1em;
    opacity: 0;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
  }

  .last-line {
    position: absolute;
    bottom: .5em;
    width: calc(100% - 2em);
    border-top: 1px solid #ccc;
    padding-top: .5em;
  }

  .button {
    border: 1px solid rgba(0, 0, 0, 0);
    padding: 4px;
    border-radius: .25em;
    transition: all 250ms;
    cursor: pointer;
    margin-left: -5px;
    margin-right: 5px;
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

  .game-author {
    float: right;
    text-align: right;
    margin-top: .1em;
  }
</style>