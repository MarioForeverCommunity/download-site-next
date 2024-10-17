<script setup>
  import {defineProps, defineEmits } from 'vue';
  import {parseVer} from "../util/Misc.js";
  import { ArrowIcon, WikiIcon, LinkIcon, DownloadIcon, YoutubeIcon, RepackIcon, VideoIcon, InfoIcon } from "./icons/Icons.js";
  import {getSourceLink, getSourceLinkValidity, getSourceDesc, getName, getAuthorList} from "../util/GemeUtil.js";
  import Tooltip from "./Tooltip.vue";

  const props = defineProps({
    game: {
      type: Object,
      required: true
    }, 
    lan : {
      required: true
    }
  });

  defineEmits(['selectGame', 'selectVideos', 'showTooltip', 'hideTooltip']);

</script>

<template>
  <div class="container game-container">
    <div class="game-name">
      <Tooltip v-if="game.type == 'repacked'">
        <RepackIcon class="icon"></RepackIcon>
        <template #popper>
          {{ lan == "en" ? "Repacked Game" : "重打包作品" }}
        </template>
      </Tooltip>
      {{ getName(game, lan) }}
      <Tooltip v-if="lan == 'zh' && game.category == 'mf' && game.description_zh">
        <InfoIcon class="icon button-shift"></InfoIcon>
        <template #popper>{{ game.description_zh }}</template>
      </Tooltip>
      <Tooltip v-if="lan == 'en' && game.category == 'mf' && game.description_en">
        <InfoIcon class="icon button-shift"></InfoIcon>
        <template #popper class="tooltip-left-align">{{ game.description_en }}</template>
      </Tooltip>
      <Tooltip v-if="game.category == 'mw' && game.description">
        <InfoIcon class="icon button-shift"></InfoIcon>
        <template #popper>{{ game.description }}</template>
      </Tooltip>
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
      <div>
        <Tooltip v-if="game.wiki_zh_url != null && lan == 'zh'">
          <a :href="game.wiki_zh_url" target="_blank">
            <WikiIcon class="icon button"></WikiIcon>
          </a>
          <template #popper>Wiki 页面</template>
        </Tooltip>
        <Tooltip v-if="game.wiki_en_url != null && lan == 'en'">
          <a :href="game.wiki_en_url" target="_blank">
            <WikiIcon class="icon button"></WikiIcon>
          </a>
          <template #popper>Wiki Page</template>
        </Tooltip>
        <Tooltip v-if="(game.video_en != null || game.video != null) && lan == 'en'">
          <VideoIcon class="icon button" @click="$emit('selectVideos', game)"></VideoIcon>
          <template #popper>Related Videos</template>
        </Tooltip>
        <Tooltip v-if="(game.video_zh != null || game.video != null) && lan == 'zh'">
          <VideoIcon class="icon button" @click="$emit('selectVideos', game)"></VideoIcon>
          <template #popper>相关视频</template>
        </Tooltip>
        <Tooltip v-if="getSourceLink(game, lan) && getSourceDesc(game, lan) != 'YouTube'">
          <a :href="getSourceLink(game, lan)" target="_blank" class="inline-block">
            <LinkIcon class="icon button" :class="getSourceLinkValidity(game, lan) ? '' : 'invalid'"></LinkIcon>
          </a>
          <template #popper>
            <span class="content-center">
              {{ lan == "en" ? "Source Link" : "发布页" }}
              <span v-if="getSourceDesc(game, lan)" class="small"><br>({{ getSourceDesc(game, lan) }})</span>
            </span>
          </template>
        </Tooltip>
        <Tooltip v-if="getSourceLink(game, lan) && getSourceDesc(game, lan) == 'YouTube'">
          <a :href="getSourceLink(game, lan)" target="_blank">
            <YoutubeIcon class="icon button" :class="getSourceLinkValidity(game, lan) ? '' : 'invalid'"></YoutubeIcon>
          </a>
          <template #popper>
            {{ lan == "en" ? "Release Video" : "发布视频" }}
          </template>
        </Tooltip>
        <Tooltip v-if="!game.disable_download">
          <DownloadIcon class="icon button" @click="$emit('selectGame', game)"></DownloadIcon>
          <template #popper>
            {{ lan == "en" ? "Download" : "下载链接" }}
          </template>
        </Tooltip>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @import "../assets/download-style-table.css";
  @import "../assets/general.css";
</style>

<style scoped>
  .game-buttons div {
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

  /* .button:hover {
    transform: translateY(-1px);
  } */

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

  .content-center {
    display: inline-block;
    text-align: center;
  }

</style>
