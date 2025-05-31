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
      {{ getName(game, lan) }}
      <Tooltip v-if="game.type === 'chinese'">
        <span class="dot cn-dot"><span class="cn-text">{{ lan === 'en' ? 'CN' : '国内' }}</span></span>
        <template #popper>{{ lan === 'en' ? 'Chinese' : '国内作品' }}</template>
      </Tooltip>
      <Tooltip v-if="game.type === 'international'">
        <span class="dot en-dot"><span class="en-text">{{ lan === 'en' ? 'INT' : '国外' }}</span></span>
        <template #popper>{{ lan === 'en' ? 'International' : '国外作品' }}</template>
      </Tooltip>
      <Tooltip v-if="game.type == 'repacked'">
        <RepackIcon class="icon"></RepackIcon>
        <template #popper>
          {{ lan == "en" ? "Repacked Game" : "重打包作品" }}
        </template>
      </Tooltip>
      <!-- MW自带标识 -->
      <Tooltip v-if="game.category === 'mw' && game.has_bundled_smwp">
        <span class="dot mw-dot"><span class="mw-text">专用MW</span></span>
        <template #popper>需专用 MW</template>
      </Tooltip>
      <!-- BGM标识 -->
      <Tooltip v-if="game.category === 'mw' && game.has_bgm">
        <span class="dot bgm-dot"><span class="bgm-text">有BGM</span></span>
        <template #popper>需替换自定义 BGM</template>
      </Tooltip>
      <Tooltip v-if="lan == 'zh' && game.category == 'mf' && game.description_zh">
        <InfoIcon class="icon button-shift"></InfoIcon>
        <template #popper>{{ game.description_zh }}</template>
      </Tooltip>
      <Tooltip v-if="lan == 'en' && game.category == 'mf' && game.description_en">
        <InfoIcon class="icon button-shift"></InfoIcon>
        <template #popper><span class="tooltip-left-align">{{ game.description_en }}</span></template>
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
      <template v-else>
        <span v-for="(author, authorindex) in getAuthorList(game, lan)" :key="author + authorindex">
          <br v-if="authorindex != 0">{{ author }}
        </span>
      </template>
    </div>
    <div class="game-version" v-if="game.category == 'mf'">
      <span style="display: inline-block;" :class="game.ver.length > 1 ? 'dropdown' : ''">{{ lan == "en" && game.currentVerStrAlt ? game.currentVerStrAlt : game.currentVerStr }}</span>
      <Tooltip v-if="game._isLatestVersion">
        <span class="dot cur-dot"><span class="cur-text">{{ lan == 'en' ? 'CUR' : '最新' }}</span></span>
        <template #popper>{{ lan == 'en' ? 'Current version' : '当前最新' }}</template>
      </Tooltip>
      <div :class="game.ver.length > 1 ? 'dropdown' : ''">
        <ArrowIcon v-if="game.ver.length > 1" class="icon rotate-button"></ArrowIcon>
        <div v-if="game.ver.length > 1" class="dropdown-content">
          <div v-for="ver in game.ver" class="dropdown-item" @click="game.currentVer=parseVer(ver); game.currentVerStr = Object.keys(ver)[0]; game.currentVerStrAlt = parseVer(ver).ver_alt;">{{ lan == "en" && parseVer(ver).ver_alt != null ? parseVer(ver).ver_alt : Object.keys(ver)[0] }}</div>
        </div>
      </div>
    </div>
    <div class="game-version" v-if="game.category == 'mw'">
      {{ game.smwp_ver }}
      <Tooltip v-if="game.smwp_url">
        <a :href="game.smwp_url" target="_blank">
          <DownloadIcon class="icon button"></DownloadIcon>
        </a>
        <template #popper>
          下载 SMWP {{ game.smwp_ver }}
        </template>
      </Tooltip>
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

  .icon.repack-icon {
    margin-left: 0 !important;
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

  .dot {
    display: inline-block;
    width: 2em;
    height: 1em;
    border-radius: 0.6em;
    margin-left: 5px;
    margin-right: 5px;
    vertical-align: middle;
    box-sizing: border-box;
    position: relative;
    text-align: center;
    line-height: 1em;
    transform: translateY(-1px);
  }
  .dot.cn-dot {
    background: #ff3330;
    border: 1.5px solid #b71c1c;
  }
  .dot.en-dot {
    background: #008cff;
    border: 1.5px solid #0d47a1;
  }
  .dot.cur-dot {
    background: #27ae60;
    border: 1.5px solid #1e824c;
  }
  /* 新增MW和BGM标识样式 */
  .dot.mw-dot {
    background: #f39c12;
    width: 3.5em;
    border: 1.5px solid #e67e22;
  }
  .dot.bgm-dot {
    background: #d5006d;
    width: 3.2em;
    border: 1.5px solid #a50036;
  }
  body.dark .dot.cn-dot,
  body.dark .dot.en-dot,
  body.dark .dot.cur-dot,
  body.dark .dot.mw-dot, 
  body.dark .dot.bgm-dot {
    background: #bbb;
    border: 0px;
  }
  body.dark .dot .cn-text {
    color: #eb3333;
  }
  body.dark .dot .en-text {
    color: #1160d8;
  }
  body.dark .dot .cur-text {
    color: #1e824c;
  }
  body.dark .dot .mw-text {
    color: #f87400;
  }
  body.dark .dot .bgm-text {
    color: #d5006d;
  }
  .dot .cn-text,
  .dot .en-text,
  .dot .cur-text,
  .dot .mw-text,
  .dot .bgm-text {
    color: #fff;
    font-size: 0.75em;
    font-weight: bold;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    letter-spacing: 0.02em;
    pointer-events: none;
    user-select: none;
    line-height: 1;
    white-space: nowrap;
  }

</style>
