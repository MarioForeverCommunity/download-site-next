<script setup>
  import {parseVer} from "../util/Misc.js";
  import { ArrowIcon, WikiIcon, LinkIcon, DownloadIcon, YoutubeIcon, RepackIcon, VideoIcon } from "./icons/Icons.js";
  import {getSourceLink, getSourceLinkValidity, getSourceDesc, getName, getAuthorList, getVersion} from "../util/GemeUtil.js";
  import Tooltip from "./ToolTip.vue";
  import LazyImage from "./LazyImage.vue";

  const props = defineProps({
    game: {
      type: Object,
      required: true
    }, 
    lan : {
      required: true
    },
    getGameImage: {
      type: Function,
      required: false
    }
  });

  const emit = defineEmits(['selectGame', 'selectVideos', 'showTooltip', 'hideTooltip', 'selectVersion', 'showTiebaDialog']);

  const selectVersion = (ver) => {
    // 通过emit事件通知父组件更新版本信息
    emit('selectVersion', {
      ...props.game,
      currentVer: parseVer(ver),
      currentVerStr: Object.keys(ver)[0],
      currentVerStrAlt: parseVer(ver).ver_alt
    });
  };

  const handleImageError = (event) => {
    // 图片加载失败时隐藏图片容器
    event.target.parentElement.style.display = 'none';
  };

  const getGameImage = () => {
    return props.getGameImage ? props.getGameImage(props.game) : null;
  };

  const handleSourceClick = (event) => {
    const sourceUrl = getSourceLink(props.game, props.lan);
    if (sourceUrl && sourceUrl.includes('tieba.baidu.com/p/')) {
      const postId = sourceUrl.match(/\/p\/(\d+)/);
      if (postId) {
        const tid = parseInt(postId[1]);
        if (tid > 6856592056) {
          // 对于较新的帖子，直接访问，不弹框
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

</script>

<template>
  <div class="container card">
    <div class="first-line">
      <div class="game-name" :class="getVersion(game, lan) ? '' : 'no-version'">
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
        <RepackIcon class="icon repack-icon"></RepackIcon>
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
        <span class="dot bgm-dot"><span class="bgm-text">BGM</span></span>
        <template #popper>需替换或使用自定义 BGM</template>
      </Tooltip>
      </div>
      <div class="game-version" v-if="game.category == 'mf' && getVersion(game, lan)">
        <span style="display: inline-block;" :class="game.ver.length > 1 ? 'dropdown' : ''">{{ lan == "en" && game.currentVerStrAlt ? game.currentVerStrAlt : game.currentVerStr }}</span>
        <Tooltip v-if="game._isLatestVersion">
          <span class="dot cur-dot"><span class="cur-text">{{ lan == 'en' ? 'CUR' : '最新' }}</span></span>
          <template #popper>{{ lan == 'en' ? 'Current version' : '当前最新' }}</template>
        </Tooltip>
        <div :class="game.ver.length > 1 ? 'dropdown' : ''">
          <ArrowIcon v-if="game.ver.length > 1" class="icon rotate-button"></ArrowIcon>
          <div v-if="game.ver.length > 1" class="dropdown-content">
            <div v-for="ver in game.ver" :key="Object.keys(ver)[0]" class="dropdown-item" @click="selectVersion(ver)">{{ lan == "en" && parseVer(ver).ver_alt != null ? parseVer(ver).ver_alt : Object.keys(ver)[0] }}</div>
          </div>
        </div>
      </div>
      <div class="game-version" v-if="game.category == 'mw' && getVersion(game, lan)">
        {{ game.smwp_ver ? "SMWP "+game.smwp_ver : "" }}
      </div>
    </div>
    <div class="body-line">
      <div class="game-date">{{ lan == "en" ? "Released on " : "发布于 " }}{{ game.currentVer.date.toISOString().split('T')[0] }}</div>
      <p v-if="game.category == 'mw' && game.description">{{ game.description }}</p>
      <p v-if="lan == 'zh' && game.category == 'mf' && game.description_zh">{{ game.description_zh }}</p>
      <p v-if="lan == 'en' && game.category == 'mf' && game.description_en">{{ game.description_en }}</p>
    </div>
    <div class="game-image" v-if="getGameImage()">
      <LazyImage :src="getGameImage()" :alt="getName(game, lan)" @error="handleImageError" />
    </div>
    <div class="last-line-padding">
      <span v-if="typeof getAuthorList(game, lan) == 'string'">
        &nbsp;
      </span>
      <template v-if="typeof getAuthorList(game, lan) != 'string'">
        <span v-for="(author, authorindex) in getAuthorList(game, lan)" :key="author + authorindex">
          <br v-if="authorindex != 0">&nbsp;
        </span>
      </template>
    </div>
    <div class="last-line">
      <div class="game-author">
        <Tooltip :in-card="true">
        <span class="inline-block author-ellipsis">
            <template v-if="typeof getAuthorList(game, lan) == 'string'">
                {{ lan == "en" ? "By&nbsp;" : "作者：" }}{{ getAuthorList(game, lan) }}
            </template>
            <template v-else>
                <!-- 添加作者前缀 -->
                <span class="prefix">{{ lan == "en" ? "By&nbsp;" : "作者：" }}</span>
                <!-- 遍历作者列表 -->
                <span class="inline-block" v-for="(author, authorindex) in getAuthorList(game, lan)" 
                    :key="author + authorindex">
                {{ author }}<span v-if="authorindex != getAuthorList(game, lan).length - 1">,&nbsp;</span>
                </span>
            </template>
        </span>
          <template #popper>
            <span>
              <span v-if="typeof getAuthorList(game, lan) == 'string'">{{ getAuthorList(game, lan) }}</span>
              <template v-else>
                <span v-for="(author, authorindex) in getAuthorList(game, lan)" :key="author + authorindex">
                  {{ author }}<span v-if="authorindex != getAuthorList(game, lan).length - 1">, </span>
                </span>
              </template>
            </span>
          </template>
        </Tooltip>
      </div>
      <div class="game-options">
        <Tooltip v-if="game.wiki_zh_url != null && lan == 'zh'">
          <a :href="game.wiki_zh_url">
            <WikiIcon class="icon button"></WikiIcon>
          </a>
          <template #popper>Wiki 页面</template>
        </Tooltip>
        <Tooltip v-if="game.wiki_en_url != null && lan == 'en'">
          <a :href="game.wiki_en_url">
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
        <Tooltip v-if="getSourceLink(game, lan) && getSourceDesc(game, lan) == 'YouTube'">
          <a :href="getSourceLink(game, lan)">
            <YoutubeIcon class="icon button" :class="getSourceLinkValidity(game, lan) ? '' : 'invalid'"></YoutubeIcon>
          </a>
          <template #popper>
            {{ lan == "en" ? "YouTube" : "发布视频" }}
          </template>
        </Tooltip>
        <Tooltip v-if="getSourceLink(game, lan) && getSourceDesc(game, lan) != 'YouTube'">
          <a :href="getSourceLink(game, lan)" @click="handleSourceClick">
            <LinkIcon class="icon button" :class="getSourceLinkValidity(game, lan) ? '' : 'invalid'"></LinkIcon>
          </a>
          <template #popper>
            <span class="content-center">
              {{ lan == "en" ? "Source" : "发布页" }}
              <span v-if="getSourceDesc(game, lan)" class="small"><br>({{ getSourceDesc(game, lan) }})</span>
            </span>
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

  .game-name {
    width: calc(100% - 165px);
    display: inline-block;
    vertical-align: top;
    /* 保证与game-version垂直居中对齐 */
    line-height: 1.25em;
  }

  .game-name.no-version {
    width: 100%;
    line-height: 1.25em;
  }

  .game-version {
    width: 165px;
    display: inline-block;
    vertical-align: top;
    text-align: right;
    line-height: 1.25em;
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

  .rotate-button {
    transition: all 250ms;
  }

  .rotate-button:hover, .rotate-button:focus {
    transform: rotate(180deg);
  }

  .game-options {
    display: inline;
    float: right;
    text-align: right;
  }

  .game-author {
    display: inline-block;
    margin-top: .1em;
    max-width: calc(100% - 100px);
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
  .dot.mw-dot {
    background: #ff9800;
    width: 3.5em;
    border: 1.5px solid #e65100;
  }
  .dot.bgm-dot {
    background: #f50057;
    width: 2.5em;
    border: 1.5px solid #c51162;
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
    color: #c51162;
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