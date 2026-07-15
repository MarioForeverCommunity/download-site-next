<script setup>
import { ref, computed, watch } from "vue";
import DownloadHeader from "../../components/HeaderNav.vue";
import { getLanguage, setLanguageZh, setLanguageEn } from "../../util/Language.js";
import { navTop } from "../../config.js";
import SiteFooter from "../../components/SiteFooter.vue";
import { readList } from "../../util/ReadList.js";
import SoftendoGameCard from "../../components/SoftendoGameCard.vue";
import { normalizeSoftendoList, getSoftendoGameName, getSoftwareLabel, getTypeLabel, getSoftendoYearRange, getGenreLabel } from "../../util/SoftendoUtil.js";
import { createGameImageResolver } from "../../util/ImageUtil.js";
import { SortUpIcon, SortDownIcon, SortUpDownIcon, FilterIcon } from "../../components/icons/Icons.js";
import axios from "axios";
import Tooltip from "../../components/ToolTip.vue";
import ButtonBackToTop from "../../components/ButtonBackToTop.vue";
import ButtonDarkMode from "../../components/ButtonDarkMode.vue";
import { useFloating, flip, shift, offset, autoUpdate } from "@floating-ui/vue";
import FullscreenModal from "../../components/FullscreenModal.vue";
import { disableScroll, enableScroll } from "../../util/OverlayScrollbarsUtil.js";
import softendoZh from '../../markdown/softendo-zh.md'
import softendoEn from '../../markdown/softendo-en.md'

const lan = ref(getLanguage());

const pageId = "softendo";

// Change title.
const titleZh = navTop.find((item) => item.id === pageId).title;
const titleEn = navTop.find((item) => item.id === pageId).title_alt;
document.title = lan.value == "zh" ? titleZh : titleEn;

// Fetch game list.
const games = ref([]);
const rawList = ref(null);

const imageResolver = createGameImageResolver('softendo');

const loadGamesList = async () => {
  if (!rawList.value) {
    const list = await readList("list-softendo.yaml");
    rawList.value = list;
  }
  games.value = [];
  const normalized = normalizeSoftendoList(rawList.value, lan.value);
  for (const entry of normalized) {
    games.value.push(entry);
  }
  defaultSort();
};

Promise.all([readList("list-softendo.yaml"), imageResolver.init()]).then(([list]) => {
  rawList.value = list;
  loadGamesList();
});

const selectedGameDetail = ref(null);

watch(selectedGameDetail, (newDetail) => {
  if (newDetail) {
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");
    disableScroll();
  } else {
    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");
    enableScroll();
  }
});

// Sort operations.
const sort_option = ref({
  active: false,
  field: null,
  asc: true
});

function defaultSort() {
  games.value.sort((a, b) => {
    const yearA = getSoftendoYearRange(a).latestYear || 0;
    const yearB = getSoftendoYearRange(b).latestYear || 0;
    return yearB - yearA;
  });
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
  games.value = games.value.sort((a, b) =>
    sort_option.value.asc
      ? getSoftendoGameName(a).localeCompare(getSoftendoGameName(b))
      : getSoftendoGameName(b).localeCompare(getSoftendoGameName(a))
  );
}

function sortByType() {
  if (sort_option.value.field != "type") {
    sort_option.value.field = "type";
    sort_option.value.asc = true;
  } else if (sort_option.value.asc == true) {
    sort_option.value.asc = false;
  } else {
    defaultSort();
    return;
  }
  games.value = games.value.sort((a, b) =>
    sort_option.value.asc
      ? (a.type || "").localeCompare(b.type || "")
      : (b.type || "").localeCompare(a.type || "")
  );
}

function sortByYear() {
  if (sort_option.value.field != "year") {
    sort_option.value.field = "year";
    sort_option.value.asc = true;
  } else {
    sort_option.value.asc = !sort_option.value.asc;
  }
  games.value = games.value.sort((a, b) => {
    const yearA = getSoftendoYearRange(a).latestYear || 0;
    const yearB = getSoftendoYearRange(b).latestYear || 0;
    return sort_option.value.asc ? yearA - yearB : yearB - yearA;
  });
}

function sortBySoftware() {
  if (sort_option.value.field != "software") {
    sort_option.value.field = "software";
    sort_option.value.asc = true;
  } else if (sort_option.value.asc == true) {
    sort_option.value.asc = false;
  } else {
    defaultSort();
    return;
  }
  games.value = games.value.sort((a, b) => {
    const sa = typeof a.software === "string" ? a.software : (Array.isArray(a.software) ? a.software.join(",") : "");
    const sb = typeof b.software === "string" ? b.software : (Array.isArray(b.software) ? b.software.join(",") : "");
    return sort_option.value.asc
      ? sa.localeCompare(sb)
      : sb.localeCompare(sa);
  });
}

// Filter operations.
const filter_option = ref({
  active: false,
  name: "",
  type: "",
  software: "",
  genre: ""
});

function clearName() {
  filter_option.value.name = "";
}

function clearFilter() {
  filter_option.value.name = "";
  filter_option.value.type = "";
  filter_option.value.software = "";
  filter_option.value.genre = "";
}

const filteredGames = computed(() => {
  return games.value.filter((a) => {
    const name = getSoftendoGameName(a);
    const nameMatch =
      filter_option.value.name.trim() == "" ||
      name.toUpperCase().includes(filter_option.value.name.trim().toUpperCase()) ||
      (a.alias && a.alias.some((al) => al.toUpperCase().includes(filter_option.value.name.trim().toUpperCase())));
    const typeMatch =
      filter_option.value.type == "" ||
      a.type == filter_option.value.type;
    const softwareMatch =
      filter_option.value.software == "" ||
      (Array.isArray(a.software) ? a.software.includes(filter_option.value.software) : a.software == filter_option.value.software);
    const genreMatch =
      filter_option.value.genre == "" ||
      (Array.isArray(a.genre) ? a.genre.includes(filter_option.value.genre) : a.genre == filter_option.value.genre);
    return nameMatch && typeMatch && softwareMatch && genreMatch;
  });
});

// Language changes.
function pageSetLanguageZh() {
  lan.value = setLanguageZh();
  document.title = titleZh;
  loadGamesList();
}

function pageSetLanguageEn() {
  lan.value = setLanguageEn();
  document.title = titleEn;
  loadGamesList();
}

// Get last update date.
const lastUpdate = ref(null);
const yamlUpdateDate = ref(null);

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const fetchYamlUpdate = () => {
  return axios
    .get("https://api.github.com/repos/MarioForeverCommunity/download-site-next/commits?path=public%2Fdata%2Flist-softendo.yaml&page=1&per_page=1")
    .then((response) => {
      yamlUpdateDate.value = response.data[0].commit.committer.date;
      lastUpdate.value = formatDate(new Date(yamlUpdateDate.value));
    });
};

fetchYamlUpdate();

// Tooltip.
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
const { floatingStyles } = useFloating(reference, floating, {
  middleware: [flip(), shift(), offset(10)],
  whileElementsMounted: autoUpdate
});

// Collect unique types for filter dropdown.
const availableTypes = computed(() => {
  const types = new Set();
  for (const game of games.value) {
    if (game.type) types.add(game.type);
  }
  // Return array of { value, label } objects, sorted by label
  return Array.from(types)
    .map(t => ({ value: t, label: getTypeLabel(t) }))
    .sort((a, b) => a.label.localeCompare(b.label));
});

// Collect unique software values for filter dropdown.
const availableSoftwares = computed(() => {
  const softwares = new Set();
  for (const game of games.value) {
    if (game.software) {
      if (Array.isArray(game.software)) {
        for (const s of game.software) {
          softwares.add(s);
        }
      } else {
        softwares.add(game.software);
      }
    }
  }
  return Array.from(softwares).sort();
});

// Collect unique genre values for filter dropdown.
const availableGenres = computed(() => {
  const genres = new Set();
  for (const game of games.value) {
    if (game.genre) {
      if (Array.isArray(game.genre)) {
        for (const g of game.genre) {
          genres.add(g);
        }
      } else {
        genres.add(game.genre);
      }
    }
  }
  return Array.from(genres).sort();
});

// Image utilities.
const getGameImage = (game) => {
  return imageResolver.resolve(game);
};
</script>

<template>
  <DownloadHeader
    :pageId="pageId"
    :lan-var="lan"
    @change-lan-zh="pageSetLanguageZh();"
    @change-lan-en="pageSetLanguageEn();"
  />

  <div class="container md-container">
    <h1>{{ lan == "en" ? titleEn : titleZh }}</h1>
    <softendoZh v-if="lan === 'zh'" />
    <softendoEn v-if="lan === 'en'" />
    <p v-if="lastUpdate" class="last-update">{{ lan == "en" ? "Last updated: " : "最后更新：" }}{{ lastUpdate }}</p>
  </div>

  <div class="hidden-container">
    <div class="container filter-container" :class="sort_option.active ? 'expand' : '' ">
      <div class="icon-container">
        <span class="filter-label">{{ lan == "en" ? "Filter" : "筛选" }}</span>
        <div class="inline-block search-box">
          <input v-model="filter_option.name" class="input">
          <span
            v-if="filter_option.name"
            class="clear-btn"
            @click="clearName"
            title="Clear"
          >✕</span>
        </div>&nbsp;
        <div class="inline-block">
          {{ lan == "en" ? "Type" : "类别" }}
          <select v-model="filter_option.type">
            <option value="">{{ lan == "en" ? "All" : "全部" }}</option>
            <option v-for="t in availableTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>&nbsp;
        </div>
        <div class="inline-block">
          {{ lan == "en" ? "Genre" : "特色" }}
          <select v-model="filter_option.genre">
            <option value="">{{ lan == "en" ? "All" : "全部" }}</option>
            <option v-for="g in availableGenres" :key="g" :value="g">{{ getGenreLabel(g, lan) }}</option>
          </select>&nbsp;
        </div>
        <div class="inline-block">
          {{ lan == "en" ? "Engine" : "制作软件" }}
          <select v-model="filter_option.software">
            <option value="">{{ lan == "en" ? "All" : "全部" }}</option>
            <option v-for="s in availableSoftwares" :key="s" :value="s">{{ getSoftwareLabel(s) }}</option>
          </select>&nbsp;
        </div>
        <Tooltip :in-card="false" @show-tooltip="(obj)=>tooltipMouseEnter(obj)" @hide-tooltip="(obj) => tooltipMouseLeave(obj)">
          <FilterIcon class="icon button" @click="clearFilter()" />
          <template #popper>{{ lan == 'en' ? 'Reset filters' : '重置筛选' }}</template>
        </Tooltip>
        <div class="visible-button" @click="sortByName();">
          {{ lan == "en" ? "Name" : "名称" }}
          <span v-if="sort_option.field == 'game'">
            <SortUpIcon class="icon button-shift" v-if="sort_option.asc"></SortUpIcon>
            <SortDownIcon class="icon button-shift" v-if="!sort_option.asc"></SortDownIcon>
          </span>
          <span v-if="sort_option.field != 'game'">
            <SortUpDownIcon class="icon button-shift"></SortUpDownIcon>
          </span>
        </div>
        <div class="visible-button" @click="sortByType();">
          {{ lan == "en" ? "Type" : "类别" }}
          <span v-if="sort_option.field == 'type'">
            <SortUpIcon class="icon button-shift" v-if="sort_option.asc"></SortUpIcon>
            <SortDownIcon class="icon button-shift" v-if="!sort_option.asc"></SortDownIcon>
          </span>
          <span v-if="sort_option.field != 'type'">
            <SortUpDownIcon class="icon button-shift"></SortUpDownIcon>
          </span>
        </div>
        <div class="visible-button" @click="sortByYear();">
          {{ lan == "en" ? "Year" : "年份" }}
          <span v-if="sort_option.field == 'year'">
            <SortUpIcon class="icon button-shift" v-if="sort_option.asc"></SortUpIcon>
            <SortDownIcon class="icon button-shift" v-if="!sort_option.asc"></SortDownIcon>
          </span>
          <span v-if="sort_option.field != 'year'">
            <SortUpDownIcon class="icon button-shift"></SortUpDownIcon>
          </span>
        </div>
        <div class="visible-button" @click="sortBySoftware();">
          {{ lan == "en" ? "Engine" : "制作软件" }}
          <span v-if="sort_option.field == 'software'">
            <SortUpIcon class="icon button-shift" v-if="sort_option.asc"></SortUpIcon>
            <SortDownIcon class="icon button-shift" v-if="!sort_option.asc"></SortDownIcon>
          </span>
          <span v-if="sort_option.field != 'software'">
            <SortUpDownIcon class="icon button-shift"></SortUpDownIcon>
          </span>
        </div>
        <span class="visible-button item-count-badge">{{ lan == "en" ? `${filteredGames.length} items` : `${filteredGames.length} 个条目` }}</span>
      </div>
    </div>
  </div>

  <div class="card-container">
    <div v-for="(game, idx) in filteredGames" :key="getSoftendoGameName(game) + '|' + (game.type || '') + '|' + idx">
      <SoftendoGameCard
        :game="game"
        :lan="lan"
        :get-game-image="getGameImage"
        @show-game-detail="(entry) => {selectedGameDetail = entry;}"
      />
    </div>
  </div>

  <FullscreenModal
    :show="selectedGameDetail != null"
    :game="selectedGameDetail"
    :lan="lan"
    category="softendo"
    @close="selectedGameDetail = null"
  />

  <div
    ref="floating"
    class="floating-obj"
    v-if="floatingText"
    :style="floatingStyles"
    v-html="floatingText"
  >
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
    font-family: Helvetica, Arial, "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", "tohoma,sans-serif";
  }

  .filter-container {
    padding: .25em 20px;
  }

  @media (max-width: 800px) {
    .filter-container {
      padding: .25em 1em;
    }
  }

  .icon-container {
    padding: .25em 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: .5em 0;
  }

  .filter-label {
    margin-right: .25em;
  }

  .md-container {
    width: 100vw;
    box-sizing: border-box;
    padding: 10px 20px;
    margin: 20px auto;
    font-family: Helvetica, Arial, "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", "tohoma,sans-serif";
  }

  @media (max-width: 800px) {
    .md-container {
      padding: 10px 1em;
    }
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
    transition: transform 0.25s ease, box-shadow 0.25s ease;
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

  .visible-button {
    border: 1px solid rgba(0, 0, 0, 0.15);
    padding: 2px .5em;
    margin-right: .3em;
    border-radius: .25em;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
    line-height: 1.5em;
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

  body.dark .visible-button:active {
    background-color: #444 !important;
    box-shadow: rgba(0, 0, 0, 0.06) 1px 1px 2px !important;
    color: #bbb !important;
  }

  .item-count-badge {
    cursor: default;
  }

  .input {
    cursor: text;
    color: #4e6e8e;
    display: inline-block;
    border: 1px solid #cfd4db;
    border-radius: 5px;
    outline: none;
    height: 1.3em;
    line-height: 1.3em;
  }

  .input:hover, .input:focus {
    cursor: auto;
    border-color: #008cff
  }

  .search-box {
    position: relative;
    display: inline-block;
  }

  .clear-btn {
    position: absolute;
    right: 2px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #999;
    font-size: 14px;
    line-height: 1;
    padding: 2px 4px;
    user-select: none;
  }

  .clear-btn:hover {
    color: #333;
  }

  select {
    cursor: text;
    color: #4e6e8e;
    display: inline-block;
    border: 1px solid #cfd4db;
    border-radius: 5px;
    outline: none;
    padding: .2em .3em;
  }

  select:hover, select:focus {
    cursor: pointer;
    border-color: #008cff
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
    z-index: 1002;
    font-family: Helvetica, Arial, "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", "tohoma,sans-serif";
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

  p, ol, ul, h5, h6, table, button {
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
    line-height: 1.5em;
  }

  h4 {
    font-size: 17px;
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-weight: bold;
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
    text-decoration: none;
  }

  .md-button:active {
    background-color: #007cdf;
  }

  .md-button:hover {
    color: white;
  }
</style>
