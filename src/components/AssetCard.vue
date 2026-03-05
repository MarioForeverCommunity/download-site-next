<script setup>
  import { LinkIcon, DownloadIcon, UserIcon, GithubIcon } from "./icons/Icons.js";
  import { getName, getAuthorList, hasDownloadableContent } from "../util/GemeUtil.js";
  import { sourceName } from "../config.js";
  import Tooltip from "./ToolTip.vue";

  const props = defineProps({
    asset: {
      type: Object,
      required: true
    },
    getAssetImage: {
      type: Function,
      required: false
    }
  });

  const emit = defineEmits(['selectDownload', 'showTooltip', 'hideTooltip', 'showTiebaDialog']);

  const handleImageError = (event) => {
    event.target.parentElement.style.display = 'none';
  };

  const getAssetImage = () => {
    return props.getAssetImage ? props.getAssetImage(props.asset) : null;
  };

  const getAssetSourceLink = (asset) => {
    return asset.source_url || null;
  };

  const getAssetSourceLinkValidity = (asset) => {
    return !asset.source_url_invalid;
  };

  const getAssetSourceDesc = (asset) => {
    const link = getAssetSourceLink(asset);
    if (!link) {
      return null;
    }
    for (var entry of sourceName) {
      if (link.match(entry.domain)) {
        return entry.desc_zh || entry.desc_en;
      }
    }
    return null;
  };

  const handleSourceClick = (event) => {
    const sourceUrl = getAssetSourceLink(props.asset);
    if (sourceUrl && sourceUrl.includes('tieba.baidu.com/p/')) {
      const postId = sourceUrl.match(/\/p\/(\d+)/);
      if (postId) {
        const tid = parseInt(postId[1]);
        if (tid > 6856592056) {
          return;
        }
        event.preventDefault();
        emit('showTiebaDialog', {
          originalUrl: sourceUrl,
          archiveUrl: `https://archive.marioforever.net/post/${postId[1]}`
        });
      }
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      engine: '引擎',
      addon: '拓展',
      effect: '特效',
      sprite: '素材'
    };
    return types[type] || type;
  };

  const getTypeClass = (type) => {
    const classes = {
      engine: 'engine-dot',
      addon: 'addon-dot',
      effect: 'effect-dot',
      sprite: 'sprite-dot'
    };
    return classes[type] || '';
  };

  const getTypeTooltip = (type) => {
    const tooltips = {
      engine: '引擎',
      addon: '拓展',
      effect: '特效',
      sprite: '素材'
    };
    return tooltips[type] || type;
  };

  const getVersionString = () => {
    if (props.asset.currentVer && props.asset.currentVer.ver) {
      return props.asset.currentVer.ver;
    }
    return '';
  };

  const getDateString = () => {
    if (props.asset.currentVer && props.asset.currentVer.date) {
      const date = props.asset.currentVer.date;
      if (typeof date === 'string') {
        return date;
      }
      return date.toISOString().split('T')[0];
    }
    return '';
  };

  const getVariantName = () => {
    return props.asset._variantName || null;
  };
</script>

<template>
  <div class="container card">
    <div class="first-line">
      <div class="asset-name">
        {{ getName(asset, 'zh') }}<span v-if="getVariantName()" class="asset-variant"> ({{ getVariantName() }})</span><span v-if="getVersionString()" class="asset-ver">{{ getVersionString() }}</span>
      </div>
      <div class="asset-type">
        <Tooltip>
          <span class="dot" :class="getTypeClass(asset.type)"><span class="dot-text">{{ getTypeLabel(asset.type) }}</span></span>
          <template #popper>{{ getTypeTooltip(asset.type) }}</template>
        </Tooltip>
      </div>
    </div>
    <div class="body-line">
      <div class="asset-date" v-if="getDateString()">发布于 {{ getDateString() }}</div>
      <p v-if="asset.description">{{ asset.description }}</p>
    </div>
    <div class="asset-image" v-if="getAssetImage()">
      <img :src="getAssetImage()" :alt="getName(asset, 'zh')" @error="handleImageError" />
    </div>
    <div class="last-line-padding">
      &nbsp;
    </div>
    <div class="last-line">
      <div class="asset-author">
        <Tooltip>
          <span class="inline-block author-ellipsis">
            <UserIcon class="icon author-icon"></UserIcon>
            <span class="author-text">
            <template v-if="typeof getAuthorList(asset, 'zh') == 'string'">
              {{ getAuthorList(asset, 'zh') }}
            </template>
            <template v-else>
              <span class="inline-block" v-for="(author, authorindex) in getAuthorList(asset, 'zh')" 
                  :key="author + authorindex">
                {{ author }}<span v-if="authorindex != getAuthorList(asset, 'zh').length - 1">,&nbsp;</span>
              </span>
            </template>
            </span>
          </span>
          <template #popper>
            <span>
              <span v-if="typeof getAuthorList(asset, 'zh') == 'string'">{{ getAuthorList(asset, 'zh') }}</span>
              <template v-else>
                <span v-for="(author, authorindex) in getAuthorList(asset, 'zh')" :key="author + authorindex">
                  {{ author }}<span v-if="authorindex != getAuthorList(asset, 'zh').length - 1">, </span>
                </span>
              </template>
            </span>
          </template>
        </Tooltip>
      </div>
      <div class="asset-options">
        <Tooltip v-if="getAssetSourceLink(asset)">
          <a :href="getAssetSourceLink(asset)" target="_blank" @click="handleSourceClick">
            <LinkIcon class="icon button" :class="getAssetSourceLinkValidity(asset) ? '' : 'invalid'"></LinkIcon>
          </a>
          <template #popper>
            <span class="content-center">
              发布页
              <span v-if="getAssetSourceDesc(asset)" class="small"><br>({{ getAssetSourceDesc(asset) }})</span>
            </span>
          </template>
        </Tooltip>
        <Tooltip v-if="asset.repo">
          <a :href="asset.repo" target="_blank">
            <GithubIcon class="icon button"></GithubIcon>
          </a>
          <template #popper>源代码</template>
        </Tooltip>
        <Tooltip v-if="hasDownloadableContent(asset)">
          <DownloadIcon class="icon button" @click="$emit('selectDownload', asset)"></DownloadIcon>
          <template #popper>下载链接</template>
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

  .asset-image {
    width: 100%;
    margin-top: 0.4em;
    overflow: hidden;
    background-color: #f5f5f5;
  }

  .asset-image img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
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

  .author-icon {
    margin-left: 0;
    margin-right: 3px;
    width: 24px;
    height: 24px;
  }

  .author-text {
    display: inline-block;
    vertical-align: middle;
    position: relative;
  }

  .asset-name {
    display: inline-block;
    vertical-align: top;
    line-height: 1.25em;
  }

  .asset-ver {
    color: #666;
    margin-left: 0.5em;
    font-size: 0.9em;
  }

  .asset-type {
    display: inline-block;
    vertical-align: top;
    line-height: 1.25em;
  }

  .first-line {
    width: 100%;
    vertical-align: top;
  }

  .asset-date {
    font-size: 0.9em;
    color: #666;
  }

  .asset-variant {
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

  .asset-options {
    display: inline;
    float: right;
    text-align: right;
  }

  .asset-author {
    display: inline-block;
    margin-top: .1em;
    max-width: calc(100% - 80px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: top;
    cursor: pointer;
  }

  .author-ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 100%;
    vertical-align: top;
  }

  .content-center {
    display: inline-block;
    text-align: center;
  }

  .dot {
    display: inline-block;
    width: 2.1em;
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

  .dot.engine-dot {
    background: #9c27b0;
    border: 1.5px solid #6a1b9a;
  }

  .dot.addon-dot {
    background: #2196f3;
    border: 1.5px solid #1565c0;
  }

  .dot.effect-dot {
    background: #ff9800;
    border: 1.5px solid #e65100;
  }

  .dot.sprite-dot {
    background: #4caf50;
    border: 1.5px solid #388e3c;
  }

  body.dark .dot.engine-dot,
  body.dark .dot.addon-dot,
  body.dark .dot.effect-dot,
  body.dark .dot.sprite-dot {
    background: #bbb;
    border: 0px;
  }

  body.dark .dot.engine-dot .dot-text {
    color: #ab47bc;
  }

  body.dark .dot.addon-dot .dot-text {
    color: #2196f3;
  }

  body.dark .dot.effect-dot .dot-text {
    color: #f87400;
  }

  body.dark .dot.sprite-dot .dot-text {
    color: #4caf50;
  }

  body.dark .asset-image {
    background-color: #2a2a2a;
  }

  body.dark .asset-ver,
  body.dark .asset-date,
  body.dark .asset-variant {
    color: #888;
  }

  .dot .dot-text {
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

  .rotate-button {
    transition: all 250ms;
  }

  .dropdown:hover .rotate-button {
    transform: rotate(180deg);
  }
</style>
