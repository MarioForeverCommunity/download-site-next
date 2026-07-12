<script setup>
import { ArrowIcon, DownloadIcon, ImageIcon } from "./icons/Icons.js";
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

const getImageUrl = () => {
  if (!props.getGameImage) return null;
  return props.getGameImage(props.game);
};
</script>

<template>
  <div class="container game-container">
    <div class="game-name">
      <span class="game-name-link" @click="handleGameNameClick">{{ getSoftendoGameName(game) }}</span>
      <Tooltip>
        <span class="dot type-dot" :style="{ width: typeDotWidth() }" :data-type="game.type">
          <span class="type-text">{{ getTypeLabel(game.type) }}</span>
        </span>
        <template #popper>{{ getTypeLabel(game.type) }}</template>
      </Tooltip>
      <Tooltip v-if="getImageUrl()">
        <ImageIcon class="icon image-icon"></ImageIcon>
        <template #popper>
          <div class="image-preview">
            <img :src="getImageUrl()" :alt="getSoftendoGameName(game)" />
          </div>
        </template>
      </Tooltip>
    </div>
    <div class="game-version">
      <template v-if="showVersion()">
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
      </template>
    </div>
    <div class="game-year">{{ game.currentVer?.year || "?" }}</div>
    <div class="game-software">{{ getSoftwareLabel(game.software) }}</div>
    <div class="game-buttons">
      <Tooltip v-if="game.currentVer && (game.currentVer.installer_url || (game.currentVer.portable_urls && game.currentVer.portable_urls.length > 0))">
        <DownloadIcon class="icon button" @click="$emit('selectGame', game)"></DownloadIcon>
        <template #popper>{{ lan === "en" ? "Download" : "下载链接" }}</template>
      </Tooltip>
    </div>
  </div>
</template>

<style scoped>
  @import "../assets/download-style-table.css";
  @import "../assets/general.css";
</style>

<style scoped>
  /* Softendo-specific column widths (with software column) */
  .game-name {
    width: 40%;
  }

  .game-version {
    width: 20%;
  }

  .game-year {
    width: 10%;
  }

  .game-software {
    width: 20%;
  }

  .game-buttons {
    width: 10%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .icon {
    fill: #000;
    width: 16px;
    height: 16px;
    margin-left: 5px;
    display: inline-block;
    vertical-align: middle;
  }

  .button {
    border: 1px solid rgba(0, 0, 0, 0);
    padding: 4px;
    border-radius: .25em;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
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

  .rotate-button {
    transition: transform 0.25s ease;
  }

  .rotate-button:hover, .rotate-button:focus {
    transform: rotate(180deg);
  }

  .dot {
    display: inline-block;
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

  .image-icon {
    margin-left: 5px;
    color: #666;
    transform: translateY(-1px);
  }

  body.dark .image-icon {
    color: #aaa;
  }

  .image-preview {
    max-width: 320px;
  }

  .image-preview img {
    width: 100%;
    height: auto;
    margin: 6px 0 4px 0;
  }
</style>
