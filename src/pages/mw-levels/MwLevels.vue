<script setup>
  import { ref, computed } from 'vue';
  import DownloadHeader from '../../components/HeaderNav.vue';
  import {getLanguage, setLanguageZh, setLanguageEn} from "../../util/Language.js";
  import SiteFooter from '../../components/SiteFooter.vue';
  import { navTop } from "../../config.js";
  import {readList} from "../../util/ReadList.js";
  import GameLine from "../../components/GameLine.vue";
  import GameCard from '../../components/GameCard.vue';
  import GameLineHeader from '../../components/GameLineHeader.vue';
  import { SortUpIcon, SortDownIcon, SortUpDownIcon, FilterIcon, ListIcon, GridIcon } from "../../components/icons/Icons.js";
  import introZh from '../../markdown/mw-games-zh.md';
  import {getAuthor, getDownloadLink, getDownloadDesc, getDownloadCode, getName, getVideoDesc, filterList} from "../../util/GemeUtil.js"
  import ClipboardButton from '../../components/ButtonClipboard.vue';
  import axios from 'axios';
  import { useFloating, flip, shift, offset, autoUpdate } from '@floating-ui/vue';
  import {SmwpVersions} from "../../util/SmwpVersions.js"
  import ButtonBackToTop from '../../components/ButtonBackToTop.vue';
  import ButtonDarkMode from '../../components/ButtonDarkMode.vue';
  import Tooltip from '../../components/ToolTip.vue';
  const originalLan = ref(getLanguage());

  const lan = "zh"

  const pageId = "mw-levels"

  const titleZh = navTop.find(item => item.id === pageId).title;

  const games = ref([]);

  function generateResourceUrl(entry, fname) {
    return `https://file.marioforever.net/Mario Worker/${entry.author == "合作作品" ? "合作作品" : `吧友作品/${entry.author}`}/${fname}`
  }

// Fetch game list.

  readList("list-mw.yaml").then((list) => {
    for (var entry of list) {
      entry.category = "mw";

      if (entry.file_url) {
        entry.file_urls = [{
          name: `社区资源站`,
          url: entry.file_url
        }];
      } else if (entry.file_name) {
        // Automatically generate resource site link.
        if (Array.isArray(entry.file_name)) {
          entry.file_urls = [];
          // For array, we generate all download links and give each link a name.
          for (var file_name_entry of entry.file_name) {
            if (file_name_entry == null) {
              continue;
            }
            // Extract only the filename after the last slash for display
            var displayFileName = file_name_entry.split('/').pop();
            displayFileName = displayFileName.replace(/\.[^.]*$/, "");
            try {
              displayFileName = decodeURIComponent(displayFileName);
            } catch(e) {
              // Ignore decodeURIComponent errors
            }
            entry.file_urls.push({
              name: `社区资源站（${displayFileName}）`,
              url: generateResourceUrl(entry, file_name_entry)
            });
          }
        } else {
          // For single file, we generate a download link.
          entry.file_urls = [{
            name: "社区资源站",
            url: generateResourceUrl(entry, entry.file_name)
          }];
        }
      }

      if (entry.smwp_ver && !entry.has_bundled_smwp) {
        if (SmwpVersions[entry.smwp_ver]) {
          entry.smwp_url = `https://file.marioforever.net/smwp/${SmwpVersions[entry.smwp_ver]}`;
        }
      }

      // For compability, we still have a "fake" currentVer field.
      entry.currentVer = {
        code : entry.code,
        date : entry.date,
        download_url : entry.download_url,
        file_url : entry.file_url,
        source_url : entry.source_url,
      }

      // Check validity of urls.
      if (entry.currentVer.source_url != null && entry.currentVer.source_url[0] == "~") {
        entry.currentVer.source_url = entry.currentVer.source_url.substring(1);
        entry.currentVer.source_url_invalid = true
      } else {
        entry.currentVer.source_url_invalid = false
      }

      if (entry.currentVer.download_url != null && entry.currentVer.download_url[0] == "~") {
        entry.currentVer.download_url = entry.currentVer.download_url.substring(1);
        entry.currentVer.download_url_invalid = true
      } else {
        entry.currentVer.download_url_invalid = false
      }

      games.value.push(entry);
      // Disable download button if link does not exist.
      if (entry.download_url == null && entry.file_urls == null) {
        entry.disable_download = true;
      }
    }
    games.value.sort((a, b) => b.date - a.date)
    // console.log(games);
  });

  const selectedDownload = ref(null); // For download modal.
  const selectedVideo = ref(null); // For download modal.
  const tiebaDialog = ref(null); // For tieba dialog.

  // Sort operations.

  const sort_option = ref({
    active : false,
    field : null,
    asc : true
  });

  function defaultSort() {
    games.value.sort((a, b) => b.date - a.date);
    sort_option.value.field = null;
  }

  function sortByName() {
    if (sort_option.value.field != "game") {
      sort_option.value.field = "game";
      sort_option.value.asc = true;
    } else if (sort_option.value.asc == true) {
      sort_option.value.asc = false;
    } else {
      defaultSort();
      return; 
    }
    games.value = games.value.sort((a, b) => sort_option.value.asc ? a.game.localeCompare(b.game) : b.game.localeCompare(a.game));
  }

  function sortByAuthor() {
    if (sort_option.value.field != "author") {
      sort_option.value.field = "author";
      sort_option.value.asc = true;
    } else if (sort_option.value.asc == true) {
      sort_option.value.asc = false;
    } else {
      defaultSort();
      return; 
    }
    games.value = games.value.sort((a, b) => sort_option.value.asc ? getAuthor(a, "zh").localeCompare(getAuthor(b, "zh")) : getAuthor(b, "zh").localeCompare(getAuthor(a, "zh")));
  }

  function sortByDate() {
    if (sort_option.value.field != "date") {
      sort_option.value.field = "date";
      sort_option.value.asc = true;
    } else {
      sort_option.value.asc = !sort_option.value.asc;
    }
    games.value = games.value.sort((a, b) => sort_option.value.asc ? a.date - b.date : b.date - a.date);
  }

  // Filter operations.

  const filter_option = ref({
    active : false,
    name : "",
    year : ""
  });

  function clearFilter() {
    filter_option.value.name = "";
    filter_option.value.author = "";
    filter_option.value.year = "";
    showOnlyBundledSmwp.value = false;
    selectedSmwpVer.value = "";
  }

  const showOnlyBundledSmwp = ref(false);

  const smwpVersionOptions = computed(() => {
    // 收集所有主版本（如1.7）和完整版本（如1.7.6），只保留纯数字版本（不含字母）
    const allVers = Object.keys(SmwpVersions)
      .map(v => v.replace(/^v/, ""))
      .filter(v => /^\d+\.\d+\.\d+$/.test(v));
    // 语义版本排序函数
    function semverDesc(a, b) {
      const pa = a.split('.').map(Number);
      const pb = b.split('.').map(Number);
      for (let i = 0; i < 3; ++i) {
        if ((pa[i]||0) !== (pb[i]||0)) return (pb[i]||0) - (pa[i]||0);
      }
      return 0;
    }
    // 主版本集合
    const mainVersSet = new Set(allVers.map(v => v.split(".").slice(0,2).join(".")));
    const mainVers = Array.from(mainVersSet).sort(semverDesc);
    // 每个主版本下，主版本.x在最前，其次为所有完整版本
    let options = [];
    for (const main of mainVers) {
      // 该主版本下所有完整版本，倒序
      const subVers = allVers.filter(v => v.startsWith(main+".")).sort(semverDesc);
      if (subVers.length > 1) {
        options.push({ label: main+".x", value: main });
        options.push(...subVers.map(v => ({ label: v, value: v })));
      } else if (subVers.length === 1) {
        // 只有一个次版本时，该次版本加粗
        options.push({ label: subVers[0], value: subVers[0], bold: true });
      }
    }
    return options;
  });
  const selectedSmwpVer = ref("");

  const filteredGames = computed(() => {
    let result = games.value.filter((a) => 
      (
        (filter_option.value.name.trim() == "" || a.game.toUpperCase().match(filter_option.value.name.trim().toUpperCase()))
        || (filter_option.value.name.trim() == "" || a.author.toUpperCase().match(filter_option.value.name.trim().toUpperCase()))
        || filterList(filter_option.value.name.trim(), a.alias)
        || (Array.isArray(a.file_name)
            ? a.file_name.some(fn => fn && fn.toUpperCase().includes(filter_option.value.name.trim().toUpperCase()))
            : (a.file_name && a.file_name.toUpperCase().includes(filter_option.value.name.trim().toUpperCase()))
        )
      )
      && (isNaN(parseInt(filter_option.value.year)) || (parseInt(a.date.toISOString().split('-')[0]) == parseInt(filter_option.value.year)))
    );
    if (showOnlyBundledSmwp.value) {
      result = result.filter(a => a.has_bundled_smwp);
    }
    if (selectedSmwpVer.value) {
      result = result.filter(a => {
        if (selectedSmwpVer.value === "unspecified") {
          // 选中"未指定"时，筛出没有指定SMWP版本的作品
          return !a.smwp_ver;
        }
        if (!a.smwp_ver) return false;
        const ver = a.smwp_ver.replace(/^v/, "");
        // 精确匹配主版本或完整版本，若选中如1.7.11，则1.7.11和1.7.11b都包含
        if (/^\d+\.\d+$/.test(selectedSmwpVer.value)) {
          // 选中主版本如1.7，匹配1.7.x
          return ver.startsWith(selectedSmwpVer.value + ".");
        } else if (/^\d+\.\d+\.\d+$/.test(selectedSmwpVer.value)) {
          // 选中如1.7.11，匹配1.7.11和1.7.11+字母
          return ver === selectedSmwpVer.value || ver.startsWith(selectedSmwpVer.value) && /[a-zA-Z]$/.test(ver);
        }
        return false;
      });
    }
    return result;
  });

  // Get last update date.

  const lastUpdate = ref(null);

  axios.get("https://api.github.com/repos/MarioForeverCommunity/download-site-next/commits?path=public%2Flists%2Flist-mw.yaml&page=1&per_page=1").then((response) => {
    const date = new Date(response.data[0].commit.committer.date);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const formattedDate = date.toLocaleDateString('zh-CN', options).replace(/\//g, '-'); // YYYY-MM-DD
    lastUpdate.value = formattedDate;
  });

  // Get window width.

  const wideScreen = ref(window.innerWidth >= 1100);
  window.addEventListener('resize', () => {
    wideScreen.value = window.innerWidth >= 1100;
  })

  // Display mode toggle (line/card)
  const displayMode = ref('line'); // 'line' or 'card'
  
  function toggleDisplayMode() {
    displayMode.value = displayMode.value === 'line' ? 'card' : 'line';
  }

  // Optimized tooltip.

  function tooltipMouseEnter(obj) {
    if (obj[0] != reference.value) {
      reference.value = obj[0];
      floatingText.value = obj[1];
    }
  }

  function tooltipMouseLeave(obj) {
    if (obj == reference.value) {
      reference.value = null;
      floatingText.value = null;
    }
  }

  const reference = ref(null);
  const floating = ref(null);
  const floatingText = ref(null);
  const { floatingStyles} = useFloating(reference, floating, 
  {
    middleware: [flip(), shift(), offset(10)],
    whileElementsMounted: autoUpdate,
  });

</script>

<template>
  <DownloadHeader pageId="mw-levels" :lan-var="originalLan" @change-lan-zh="originalLan = setLanguageZh(); " @change-lan-en="originalLan = setLanguageEn(); "/>

  <div class="container md-container">
    <h1>{{ titleZh }}</h1>
    <introZh />
    <p v-if="lastUpdate" class="last-update">最后更新：{{ lastUpdate }}</p>
  </div>

  <div class="hidden-container">
    <div class="container icon-container" :class="sort_option.active ? 'expand' : '' ">
      <!-- <SortIcon v-if="!wideScreen" class="icon button" :class="sort_option.active ? 'active' : '' " @click="sort_option.active = !sort_option.active"></SortIcon> -->
      <div class="icon-container">
        {{ lan == "en" ? "Filter" : "筛选" }}
        <div class="inline-block">
          <input v-model="filter_option.name" class="input">&nbsp;
        </div>
        <div class="inline-block">
          {{ lan == "en" ? "Year" : "年份" }}
          <select v-model="filter_option.year">
            <option value="">{{ lan == "en" ? "Select..." : "请选择.." }}</option>
            <option v-for="year in Array.from({length: new Date().getFullYear()-2016+1}, (_, i) => i + 2016).reverse()" :key="year">{{year}}</option>
          </select>&nbsp;
        </div>
        <div class="inline-block">
          SMWP 版本
          <select v-model="selectedSmwpVer">
            <option value="" style="font-weight:bold">全部</option>
            <option v-for="opt in smwpVersionOptions" :key="opt.value" :value="opt.value" :style="(opt.label.endsWith('.x') || opt.bold) ? 'font-weight:bold' : ''">{{opt.label}}</option>
            <option value="unspecified" style="font-weight:bold">未指定</option>
          </select>&nbsp;
        </div>
        <div class="inline-block">
          <input v-model="showOnlyBundledSmwp" type="checkbox" id="filterBundledSmwp" />
          <label for="filterBundledSmwp">仅显示附带 MW 的作品</label>
        </div>
        <Tooltip :in-card="false" @show-tooltip="(obj)=>tooltipMouseEnter(obj)" @hide-tooltip="(obj) => tooltipMouseLeave(obj)">
          <FilterIcon class="icon button" @click="clearFilter()" />
          <template #popper>{{ lan == 'en' ? 'Reset filters' : '重置筛选' }}</template>
        </Tooltip>
        <div class="inline-block display-mode-toggle" v-if="wideScreen">
          <Tooltip :in-card="false" @show-tooltip="(obj)=>tooltipMouseEnter(obj)" @hide-tooltip="(obj) => tooltipMouseLeave(obj)">
            <div class="icon button" @click="toggleDisplayMode()">
              <ListIcon v-if="displayMode === 'card'" />
              <GridIcon v-if="displayMode === 'line'" />
            </div>
            <template #popper>{{ displayMode === 'line' ? '切换到卡片' : '切换到列表' }}</template>
          </Tooltip>
        </div>
        <div class="inline-block item-count">
          {{ lan == "en" ? `${filteredGames.length} items` : `${filteredGames.length} 个条目` }}
        </div>
      </div>
      <div class="icon-container" v-if="!wideScreen || (wideScreen && displayMode === 'card')">
        排序选项
        <div class="visible-button" @click="sortByName();">
          名称
          <span v-if="sort_option.field == 'game'">
            <SortUpIcon class="icon button-shift" v-if="sort_option.asc"></SortUpIcon>
            <SortDownIcon class="icon button-shift" v-if="!sort_option.asc"></SortDownIcon>
          </span>
          <span v-if="sort_option.field != 'game'">
            <SortUpDownIcon class="icon button-shift"></SortUpDownIcon>
          </span>
        </div>
        <div class="visible-button" @click="sortByAuthor();">
          作者
          <span v-if="sort_option.field == 'author'">
            <SortUpIcon class="icon button-shift" v-if="sort_option.asc"></SortUpIcon>
            <SortDownIcon class="icon button-shift" v-if="!sort_option.asc"></SortDownIcon>
          </span>
          <span v-if="sort_option.field != 'author'">
            <SortUpDownIcon class="icon button-shift"></SortUpDownIcon>
          </span>
        </div>
        <div class="visible-button" @click="sortByDate();">
          日期
          <span v-if="sort_option.field == 'date'">
            <SortUpIcon class="icon button-shift" v-if="sort_option.asc"></SortUpIcon>
            <SortDownIcon class="icon button-shift" v-if="!sort_option.asc"></SortDownIcon>
          </span>
          <span v-if="sort_option.field != 'date'">
            <SortUpDownIcon class="icon button-shift"></SortUpDownIcon>
          </span>
        </div>
      </div>
    </div>
  </div>

  <GameLineHeader v-if="wideScreen && displayMode === 'line'" lan="zh" category="mw" :sort_option="sort_option" @sort-by-name="sortByName();" @sort-by-author="sortByAuthor();" @sort-by-date="sortByDate();"/>
  <template v-if="wideScreen && displayMode === 'line'">
    <div v-for="game in filteredGames" :key="game.game" v-memo="game.game">
      <GameLine :game="game" lan="zh" @select-game="(entry) => {selectedDownload = entry;}" @select-videos="(entry) => {selectedVideo = entry;}" @select-version="(entry) => {Object.assign(game, entry);}" @show-tooltip="(obj)=>tooltipMouseEnter(obj)" @hide-tooltip="(obj) => tooltipMouseLeave(obj)" @show-tieba-dialog="(data) => {tiebaDialog = data;}"/>
    </div>
  </template>
  <div v-if="(wideScreen && displayMode === 'card') || !wideScreen" class="card-container">
    <div v-for="game in filteredGames" :key="game.game" v-memo="[game.game, 'zh']">
      <GameCard :game="game" lan="zh" @select-game="(entry) => {selectedDownload = entry;}" @select-videos="(entry) => {selectedVideo = entry;}" @select-version="(entry) => {Object.assign(game, entry);}" @show-tooltip="(obj)=>tooltipMouseEnter(obj)" @hide-tooltip="(obj) => tooltipMouseLeave(obj)" @show-tieba-dialog="(data) => {tiebaDialog = data;}"/>
    </div>
  </div>

  <Transition name="modal">
    <div v-if="selectedDownload != null" class="modal-bg" @click="selectedDownload = null;">
      <div class="modal-content" @click.stop="">
        <div>
          下载 {{ selectedDownload.game }}
        </div>
        <div class="button-line">
          <span v-if="selectedDownload.file_urls">
            <a class="download" v-for="url in selectedDownload.file_urls" :key="url.url" :href="url.url" target="_blank">{{url.name}}</a>
          </span>
          <a class="download" v-if="getDownloadLink(selectedDownload, 'zh')" :href="getDownloadLink(selectedDownload, 'zh')" target="_blank">{{ getDownloadDesc(selectedDownload, 'zh') }}</a>
          <ClipboardButton v-if="getDownloadCode(selectedDownload, 'zh')" :code="getDownloadCode(selectedDownload, 'zh')" lan="zh"></ClipboardButton>
        </div>
      </div>
    </div>
  </Transition>

  <Transition name="modal">
    <div v-if="selectedVideo != null" class="modal-bg" @click="selectedVideo = null;">
      <div class="modal-content" @click.stop="">
        <div>
          相关视频：{{ getName(selectedVideo, "zh") }}
          <p v-for="video in selectedVideo.video" :key="Object.keys(video)[0]">
            <a :href="Object.values(video)[0]" target="_blank">▶ {{ Object.keys(video)[0] }}（{{ getVideoDesc(Object.values(video)[0], "zh") }}）</a>
          </p>
        </div>
      </div>
    </div>
  </Transition>

  <Transition name="modal">
    <div v-if="tiebaDialog != null" class="modal-bg" @click="tiebaDialog = null;">
      <div class="modal-content" @click.stop="">
        <div>
          选择要访问的链接
        </div>
        <div class="button-line">
          <a class="download" :href="tiebaDialog.originalUrl" target="_blank">百度贴吧源站</a>
          <a class="download" :href="tiebaDialog.archiveUrl" target="_blank">社区备份站</a>
        </div>
      </div>
    </div>
  </Transition>

  <div ref="floating" class="floating-obj" v-if="floatingText" :style="floatingStyles" v-html="floatingText">
  </div>
  
  <ButtonBackToTop />
  <ButtonDarkMode />

  <SiteFooter />

</template>

<style scoped>
  @import "../../assets/general.css";
</style>

<style scoped>
  html {
    max-width: 100%;
    overflow-x: hidden;
  }

  .hidden-container {
    width: 100vw;
    margin-top: -10px;
  }

  .icon-container {
    padding: .25em 10px;
  }

  .md-container {
    width: 100vw;
    box-sizing: border-box;
    padding: 10px 20px;
    margin: 20px auto;
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

  @media (max-width: 1333px) and (min-width: 800px) {
    .md-container {
      width: 90vw;
      border-radius: 2px;
    }

    .hidden-container {
      width: 90vw;
      margin: auto;
      margin-top: -10px;
    }
  }

  @media (min-width: 1333px) {
    .md-container {
      width: 1200px;
      border-radius: 2px;
    }

    .hidden-container {
      width: 1200px;
      margin: auto;
      margin-top: -10px;
    }
  }
  
  .icon {
    color: #000;
    width: 16px;
    height: 16px;
    display: inline-block;
    vertical-align: middle;
    margin: 2px;
  }

  .button {
    border: 1px solid rgba(0, 0, 0, 0);
    padding: 4px;
    border-radius: .25em;
    transition: all 250ms;
    cursor: pointer;
    display: inline-block;
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

  .button.active {
    border: 1px solid rgba(0, 0, 0, 0.15);
    padding: 4px;
    border-radius: .25em;
    background-color: #eee;
    cursor: pointer;
  }

  .visible-button {
    border: 1px solid rgba(0, 0, 0, 0.15);
    padding: 2px .5em;
    margin-right: .5em;
    border-radius: .25em;
    transition: all 250ms;
    cursor: pointer;
    display: inline-block;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .visible-button:hover, .visible-button:focus {
    box-shadow: rgba(0, 0, 0, 0.1) 2px 2px 6px;
  }

  .visible-button:active {
    background-color: #F0F0F1;
    box-shadow: rgba(0, 0, 0, 0.06) 1px 1px 2px;
    color: rgba(0, 0, 0, 0.65);
    transform: translateY(0);
  }

  .modal-bg {
    position: fixed; /* Stay in place */
    z-index: 2; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
  }

  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.5s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }

  .modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-right: -50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    max-width: 80vw;
    max-height: 80vh;
    padding: 1em;
    border-radius: .5em;
    overflow-y: auto;
  }

  .download {
    color: white;
    cursor: pointer;
    background-color: #008cff;
    padding: .5em;
    border-radius: .5em;
    margin-right: .5em;
    margin: .25em;
    display: inline-block;
  }

  .download:hover, .download:focus {
    background-color: #30acff;
    text-decoration: none;
  }

  .download:active {
    background-color: #007cdf;
  }

  .button-line {
    margin-top: .5em;
  }

  .input {
    cursor: text;
    color: #4e6e8e;
    display: inline-block;
    border: 1px solid #cfd4db;
    border-radius: 5px;
    outline: none;
    transition: all .2s ease;
    height: 1.3em;
    line-height: 1.3em;
  }

  .input:focus {
      cursor: auto;
      border-color: #008cff
  }

  select {
    cursor: text;
    color: #4e6e8e;
    display: inline-block;
    border: 1px solid #cfd4db;
    border-radius: 5px;
    outline: none;
    transition: all .2s ease;
    padding: .2em .6em;
  }

  select:focus {
      cursor: auto;
      border-color: #008cff
  }

  .tooltip {
    position: relative;
    display: inline-block;
  }

  .tooltip .tooltiptext {
    top:40px;
    left:50%;
    transform:translate(-50%, 0);
    display:none;
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;
    position: absolute;
    z-index: 1;
    padding: .25em .75em;
    width: max-content;
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

  .tooltiptext i {
    position:absolute;
    bottom:100%;
    left:50%;
    margin-left:-12px;
    width:24px;
    height:12px;
    overflow:hidden;
  }

  .tooltiptext i::after {
    content:'';
    position:absolute;
    width:12px;
    height:12px;
    left:50%;
    transform:translate(-50%,50%) rotate(45deg);
    background-color: rgba(0, 0, 0, 0.7);
  }

  .tooltip:hover .tooltiptext {
    display:block;
  }

  .button-shift {
    transform: translateY(-1px);
  }

  .floating-obj {
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;
    text-align: center;
    border-radius: 6px;
    width: max-content;
    max-width: calc(min(800px, 90vw));
    padding: .25em .75em;
    z-index: 3;
  }

</style>
<style>

  a {
    color: #008cff;
    text-decoration: none;
    font-weight: normal;
  }

  a:hover {
    color: #006eff;
    text-decoration: underline;
  }

  table {
    width: 100%;
  }

  p {
    margin: .5em 0;
  }

  ul {
    margin: .5em 0;
    padding-left: 30px;
  }

  h1 {
    font-size: 30px;
    margin-top: 12px;
  }

  p, ol, ul, h4, h5, h6, table, button {
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline; 
    line-height: 1.5em;
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  table thead {
    background: #404248;
    color: #fff;
    text-align: left;
  }

  table tr:first-child {
    border-top: 0 !important;
  }

  table tr {
    border-top: solid 1px #eee;
  }
  
  table td {
    padding: 0.5em 1em 0.5em 1em;
  }
  
  table th {
    padding: 0.5em 1em 0.5em 1em;
  }

  .md-button {
    color: white;
    cursor: pointer;
    background-color: #008cff;
    padding: .5em;
    border-radius: .5em;
    margin-right: .5em;
    margin: .25em;
    display: inline-block;
  }

  .md-button:hover, .md-button:focus {
    background-color: #30acff;
  }

  .md-button:active {
    background-color: #007cdf;
  }

  .md-button:hover {
    color: white;
    text-decoration: none;
  }
</style>
