<script setup>
import { ArrowIcon, DownloadIcon } from "./icons/Icons.js";
import { getTypeLabel, getTypeDotWidth, getSoftendoGameName, getSoftwareLabel } from "../util/SoftendoUtil.js";
import Tooltip from "./ToolTip.vue";

const props = defineProps({
  game: {
    type: Object,
    required: true
  },
  lan: {
    type: String,
    required: true
  },
  getGameImage: {
    type: Function,
    required: false,
    default: () => null
  },
  expandAllVersions: {
    type: Boolean,
    default: false
  },
  hideDot: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["selectGame", "showGameDetail", "selectVersion"]);

const selectVersion = (ver) => {
  const verKey = Object.keys(ver)[0];
  const verObj = ver[verKey];
  emit("selectVersion", {
    ...props.game,
    currentVer: verObj,
    currentVerStr: verKey
  });
};

const handleGameNameClick = () => {
  emit("showGameDetail", props.game);
};

const typeDotWidth = () => getTypeDotWidth(props.game.type);
const isMultiVersion = () => props.game.ver && props.game.ver.length > 1;
const showVersion = () => !props.game._singleVersion;

const handleImageError = (event) => {
  // 图片加载失败时隐藏图片容器
  event.target.parentElement.style.display = 'none';
};

const getGameImageSrc = () => {
  return props.getGameImage ? props.getGameImage(props.game) : null;
};
</script>

<template>
  <div class="container card">
    <div class="first-line">
      <div class="game-name" :class="showVersion() ? '' : 'no-version'">
        <span class="game-name-link" @click="handleGameNameClick">{{ getSoftendoGameName(game) }}</span>
      </div>
      <div class="game-version" v-if="showVersion()">
        <span style="display: inline-block;" :class="isMultiVersion() ? 'dropdown' : ''">{{ game.currentVerStr }}</span>
        <div :class="isMultiVersion() ? 'dropdown' : ''">
          <ArrowIcon v-if="isMultiVersion()" class="icon rotate-button"></ArrowIcon>
          <div v-if="isMultiVersion()" class="dropdown-content">
            <div
              v-for="ver in game.ver"
              :key="Object.keys(ver)[0]"
              class="dropdown-item"
              @click="selectVersion(ver)"
            >{{ Object.keys(ver)[0] }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="body-line">
      <div class="game-meta">
        <Tooltip v-if="!hideDot">
          <span class="dot type-dot" :style="{ width: typeDotWidth() }" :data-type="game.type">
            <span class="type-text">{{ getTypeLabel(game.type) }}</span>
          </span>
          <template #popper>{{ getTypeLabel(game.type) }}</template>
        </Tooltip>
        {{ game.currentVer && game.currentVer.year !== "unknown" ? game.currentVer.year : "?" }}
      </div>
    </div>
    <slot name="gallery">
      <div class="game-image" v-if="getGameImageSrc()">
        <img :src="getGameImageSrc()" :alt="getSoftendoGameName(game)" @error="handleImageError" />
      </div>
    </slot>
    <div class="last-line-padding">
      <span>&nbsp;</span>
    </div>
    <div class="last-line">
      <div class="game-author">
        <span class="author-ellipsis">
          <span class="author-text">{{ lan === "en" ? "Engine: " : "制作软件: " }}{{ getSoftwareLabel(game.software) }}</span>
        </span>
      </div>
      <div class="game-options">
        <Tooltip v-if="game.currentVer && (game.currentVer.installer_url || (game.currentVer.portable_urls && game.currentVer.portable_urls.length > 0))">
          <DownloadIcon class="icon button" @click="$emit('selectGame', game)"></DownloadIcon>
          <template #popper>{{ lan === "en" ? "Download" : "下载链接" }}</template>
        </Tooltip>
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
  }

  .icon {
    fill: #000;
    width: 16px;
    height: 16px;
    margin-left: 5px;
    display: inline-block;
    vertical-align: middle;
  }

  .game-name {
    display: inline-block;
    vertical-align: top;
    line-height: 1.25em;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    padding-right: 0.5em;
  }

  .game-name-link {
    cursor: pointer;
    color: inherit;
    text-decoration: none;
    margin-right: 0.25em;
  }

  .game-name-link:hover {
    color: inherit;
    text-decoration: underline;
  }

  .game-name.no-version {
    width: 100%;
    line-height: 1.25em;
  }

  .game-version {
    display: inline-flex;
    vertical-align: top;
    line-height: 1.25em;
    flex-shrink: 0;
  }

  .first-line {
    width: 100%;
    vertical-align: top;
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.1em;
  }

  .dropdown-content {
    right: 0;
    transform: translateX(-15px);
  }

  .game-meta {
    font-size: 0.9em;
    color: #666;
  }

  .game-meta > :not(:first-child) .dot {
    margin-left: 4px;
  }

  .last-line-padding {
    padding-bottom: 1em;
    opacity: 0;
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
    transition: transform 0.25s ease, box-shadow 0.25s ease;
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

  .rotate-button {
    transition: transform 0.25s ease;
  }

  .rotate-button:hover, .rotate-button:focus {
    transform: rotate(180deg);
  }

  .game-options {
    display: inline;
    float: right;
    text-align: right;
  }

  .dot {
    display: inline-block;
    height: 1em;
    border-radius: 0.6em;
    vertical-align: middle;
    box-sizing: border-box;
    position: relative;
    text-align: center;
    line-height: 1em;
    transform: translateY(-1px);
  }

  .dot.type-dot {
    padding: 0 0.4em;
    border: 1.5px solid;
  }

  .dot.type-dot[data-type="mario"] {
    background: #ff3330;
    border-color: #b71c1c;
  }

  .dot.type-dot[data-type="mff"] {
    background: #ff9800;
    border-color: #e65100;
  }

  .dot.type-dot[data-type="flash"] {
    background: #9c27b0;
    border-color: #6a1b9a;
  }

  .dot.type-dot[data-type="non-mario"] {
    background: #008cff;
    border-color: #0d47a1;
  }

  .dot.type-dot[data-type="banesoft"] {
    background: #4caf50;
    border-color: #2e7d32;
  }

  body.dark .dot.type-dot {
    background: #bbb;
    border: 0px;
  }

  body.dark .dot .type-text {
    color: #555;
  }

  body.dark .dot.type-dot[data-type="mario"] .type-text {
    color: #eb3333;
  }

  body.dark .dot.type-dot[data-type="mff"] .type-text {
    color: #f87400;
  }

  body.dark .dot.type-dot[data-type="flash"] .type-text {
    color: #9c27b0;
  }

  body.dark .dot.type-dot[data-type="non-mario"] .type-text {
    color: #1160d8;
  }

  body.dark .dot.type-dot[data-type="banesoft"] .type-text {
    color: #4caf50;
  }

  .dot .type-text {
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

  .game-author {
    display: inline-block;
    margin-top: .1em;
    max-width: calc(100% - 100px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: top;
  }

  .author-ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 100%;
    vertical-align: top;
  }

  .author-text {
    display: inline-block;
    vertical-align: middle;
    position: relative;
  }

  .game-image {
    width: 100%;
    margin-top: 0.4em;
    overflow: hidden;
    background-color: #f5f5f5;
  }

  .game-image img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
  }

  body.dark .game-image {
    background-color: #2a2a2a;
  }
</style>
