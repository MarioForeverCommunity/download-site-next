<script setup>
import { ref, computed, watch } from "vue";
import DownloadHeader from "../../components/HeaderNav.vue";
import { getLanguage, setLanguageZh, setLanguageEn } from "../../util/Language.js";
import { navTop } from "../../config.js";
import SiteFooter from "../../components/SiteFooter.vue";
import { readList } from "../../util/ReadList.js";
import SoftendoGameCard from "../../components/SoftendoGameCard.vue";
import { normalizeSoftendoList, getSoftendoGameName, getSoftwareLabel, getTypeLabel, getSoftendoYearRange } from "../../util/SoftendoUtil.js";
import { createGameImageResolver } from "../../util/ImageUtil.js";
import { fuzzyMatch, fuzzyMatchList } from "../../util/SearchUtil.js";
import { SortUpIcon, SortDownIcon, SortUpDownIcon, FilterIcon } from "../../components/icons/Icons.js";
import axios from "axios";
import Tooltip from "../../components/ToolTip.vue";
import ButtonBackToTop from "../../components/ButtonBackToTop.vue";
import ButtonDarkMode from "../../components/ButtonDarkMode.vue";
import { useFloating, flip, shift, offset, autoUpdate } from "@floating-ui/vue";
import FullscreenModal from "../../components/FullscreenModal.vue";
import { disableScroll, enableScroll } from "../../util/OverlayScrollbarsUtil.js";
import { getTagColor, getTagLabel, matchTagStates, nextTagState } from "../../util/TagUtil.js";
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
const showGenreModal = ref(false);

watch([selectedGameDetail, showGenreModal], ([newDetail, newGenreModal]) => {
  if (newDetail || newGenreModal) {
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");
  } else {
    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");
  }
  if (!newDetail) {
    enableScroll();
  }
  if (!newGenreModal) {
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
  genres: {}
});

function clearName() {
  filter_option.value.name = "";
}

function clearFilter() {
  filter_option.value.name = "";
  filter_option.value.type = "";
  filter_option.value.software = "";
  filter_option.value.genres = {};
}

const filteredGames = computed(() => {
  return games.value.filter((a) => {
    const name = getSoftendoGameName(a);
    const query = filter_option.value.name;
    const nameMatch =
      query.trim() == "" ||
      fuzzyMatch(name, query) ||
      fuzzyMatchList(a.alias, query);
    const typeMatch =
      filter_option.value.type == "" ||
      a.type == filter_option.value.type;
    const softwareMatch =
      filter_option.value.software == "" ||
      (Array.isArray(a.software) ? a.software.includes(filter_option.value.software) : a.software == filter_option.value.software);
    const genreMatch =
      Object.keys(filter_option.value.genres).length === 0 ||
      (() => {
        const entryGenres = a.genre ? (Array.isArray(a.genre) ? a.genre : [a.genre]) : [];
        return matchTagStates(entryGenres, filter_option.value.genres);
      })();
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

// Collect unique genre values for tag filter modal.
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

const genreGameCount = computed(() => {
  const countMap = {};
  for (const game of games.value) {
    const genres = game.genre
      ? (Array.isArray(game.genre) ? game.genre : [game.genre])
      : [];
    for (const g of genres) {
      countMap[g] = (countMap[g] || 0) + 1;
    }
  }
  return countMap;
});

// Genre tag modal state
const tempGenreStates = ref({});

const activeGenreCount = computed(() => Object.keys(filter_option.value.genres).length);

const tempGenreMatchCount = computed(() => {
  const states = tempGenreStates.value;
  if (Object.keys(states).length === 0) return games.value.length;
  return games.value.filter(a => {
    const entryGenres = a.genre ? (Array.isArray(a.genre) ? a.genre : [a.genre]) : [];
    return matchTagStates(entryGenres, states);
  }).length;
});

function openGenreModal() {
  tempGenreStates.value = { ...filter_option.value.genres };
  showGenreModal.value = true;
  disableScroll();
}

function confirmGenreModal() {
  filter_option.value.genres = { ...tempGenreStates.value };
  showGenreModal.value = false;
  enableScroll();
}

function cancelGenreModal() {
  showGenreModal.value = false;
  enableScroll();
}

function cycleGenreState(genre) {
  const current = tempGenreStates.value[genre] || null;
  const next = nextTagState(current);
  const newStates = { ...tempGenreStates.value };
  if (next) {
    newStates[genre] = next;
  } else {
    delete newStates[genre];
  }
  tempGenreStates.value = newStates;
}

function removeGenreState(genre) {
  const newStates = { ...tempGenreStates.value };
  delete newStates[genre];
  tempGenreStates.value = newStates;
}

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
          {{ lan == "en" ? "Engine" : "制作软件" }}
          <select v-model="filter_option.software">
            <option value="">{{ lan == "en" ? "All" : "全部" }}</option>
            <option v-for="s in availableSoftwares" :key="s" :value="s">{{ getSoftwareLabel(s) }}</option>
          </select>&nbsp;
        </div>
        <div class="visible-button" @click="openGenreModal">
          {{ lan == "en" ? "Genres" : "标签筛选" }}
          <span v-if="activeGenreCount > 0" class="tag-count-badge">{{ activeGenreCount }}</span>
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

  <!-- Genre Tag Filter Modal -->
  <Transition name="modal">
    <div v-if="showGenreModal" class="tag-modal-overlay" @click="cancelGenreModal">
      <div class="tag-modal" @click.stop>
        <div class="tag-modal-header">
          <h3>{{ lan === 'zh' ? '标签筛选' : 'Genre Filter' }}</h3>
        </div>

        <div v-if="Object.keys(tempGenreStates).length > 0" class="tag-modal-selected">
          <span class="tag-selected-label">{{ lan === 'zh' ? '已选：' : 'Selected: ' }}</span>
          <template v-for="(state, genre) in tempGenreStates" :key="genre">
            <span
              class="tag-pill tag-pill-sm tag-pill-selected"
              :class="{
                'tag-pill-state-or': state === 'or',
                'tag-pill-state-and': state === 'and',
                'tag-pill-state-not': state === 'not',
              }"
              :style="{
                '--tag-bg': getTagColor(genre, false).bg,
                '--tag-border': getTagColor(genre, false).border,
                '--tag-text': getTagColor(genre, false).text,
                '--tag-bg-dark': getTagColor(genre, true).bg,
                '--tag-border-dark': getTagColor(genre, true).border,
                '--tag-text-dark': getTagColor(genre, true).text,
              }"
            ><span class="tag-state-indicator">{{ state === 'or' ? '∨' : state === 'and' ? '+' : '−' }}</span>{{ getTagLabel(genre, lan) }}<span class="tag-remove" @click="removeGenreState(genre)">&times;</span></span>
          </template>
          <button class="tag-clear-all" @click="tempGenreStates = {}">{{ lan === 'zh' ? '清除全部' : 'Clear all' }}</button>
          <span class="tag-match-count">{{ lan === 'zh' ? `${tempGenreMatchCount} 个匹配` : `${tempGenreMatchCount} match${tempGenreMatchCount !== 1 ? 'es' : ''}` }}</span>
        </div>

        <div class="tag-modal-body">
          <div class="tag-modal-grid">
            <span
              v-for="genre in availableGenres"
              :key="genre"
              class="tag-pill"
              :class="{
                'tag-pill-state-or': tempGenreStates[genre] === 'or',
                'tag-pill-state-and': tempGenreStates[genre] === 'and',
                'tag-pill-state-not': tempGenreStates[genre] === 'not',
              }"
              :style="{
                '--tag-bg': getTagColor(genre, false).bg,
                '--tag-border': getTagColor(genre, false).border,
                '--tag-text': getTagColor(genre, false).text,
                '--tag-bg-dark': getTagColor(genre, true).bg,
                '--tag-border-dark': getTagColor(genre, true).border,
                '--tag-text-dark': getTagColor(genre, true).text,
              }"
              @click="cycleGenreState(genre)"
            >
              <span v-if="tempGenreStates[genre]" class="tag-state-indicator">{{ tempGenreStates[genre] === 'or' ? '∨' : tempGenreStates[genre] === 'and' ? '+' : '−' }}</span>{{ getTagLabel(genre, lan) }}<span class="tag-game-count">{{ genreGameCount[genre] || 0 }}</span>
            </span>
          </div>
          <p class="tag-modal-help">{{ lan === 'zh' ? '点击标签切换状态：∨ 或（满足任一）→ + 与（全部满足）→ − 非（排除）→ 关闭' : 'Click to cycle: ∨ OR (any) → + AND (all) → − NOT (exclude) → Off' }}</p>
        </div>

        <div class="tag-modal-footer">
          <button class="md-button md-button-secondary" @click="cancelGenreModal">{{ lan === 'zh' ? '取消' : 'Cancel' }}</button>
          <button class="md-button" @click="confirmGenreModal">{{ lan === 'zh' ? '确认' : 'Confirm' }}</button>
        </div>
      </div>
    </div>
  </Transition>
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

  body.dark .visible-button {
    background-color: #222222;
    border-color: #444;
    color: #ddd;
  }

  body.dark .visible-button:hover,
  body.dark .visible-button:focus {
    background-color: #333;
    border-color: #555;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
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

  /* Tag Count Badge */
  .tag-count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 1.2em;
    padding: 0 0.3em;
    margin-left: 0.3em;
    border-radius: 999px;
    background: #008cff;
    color: #fff;
    font-size: 0.75em;
    font-weight: 600;
    line-height: 1;
  }

  body.dark .tag-count-badge {
    background: #222222;
    color: #bbbbbb;
  }

  /* Tag Modal */
  .modal-enter-active, .modal-leave-active {
    transition: opacity 0.3s ease;
  }

  .modal-enter-from, .modal-leave-to {
    opacity: 0;
  }

  .tag-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
  }

  .tag-modal {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    width: 90vw;
    max-width: 520px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: Helvetica, Arial, "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", "tohoma,sans-serif";
  }

  .tag-modal-header {
    padding: 1em 1.2em 0.6em;
    border-bottom: 1px solid #eee;
  }

  .tag-modal-header h3 {
    margin: 0;
    font-size: 1.15em;
    color: #333;
  }

  .tag-modal-selected {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4em;
    padding: 0.6em 1.2em;
    border-bottom: 1px solid #eee;
    background: #f9f9f9;
  }

  .tag-selected-label {
    font-size: 0.85em;
    color: #666;
    margin-right: 0.2em;
  }

  .tag-clear-all {
    background: none;
    border: none;
    color: #999;
    font-size: 0.8em;
    cursor: pointer;
    padding: 0.2em 0.4em;
    text-decoration: underline;
    transition: color 0.2s;
  }

  .tag-clear-all:hover {
    color: #333;
  }

  .tag-match-count {
    font-size: 0.8em;
    color: #888;
    margin-left: 0.4em;
  }

  .tag-modal-body {
    padding: 1em 1.2em;
    overflow-y: auto;
    flex: 1;
  }

  .tag-modal-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em;
  }

  /* Tag Pills */
  .tag-pill {
    display: inline-flex;
    align-items: center;
    padding: 0.3em 0.75em;
    border-radius: 999px;
    border: 1.5px solid var(--tag-border);
    background-color: var(--tag-bg);
    color: var(--tag-text);
    font-size: 0.9em;
    font-weight: 500;
    line-height: 1.4;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
  }

  .tag-pill:hover {
    opacity: 0.85;
  }

  .tag-pill-state-or {
    border-width: 2.5px;
    background-color: var(--tag-bg-dark);
    color: var(--tag-text-dark);
    border-color: var(--tag-border);
    font-weight: 600;
  }

  .tag-pill-state-and {
    border-width: 2.5px;
    background-color: var(--tag-bg-dark);
    color: var(--tag-text-dark);
    border-color: var(--tag-border);
    font-weight: 600;
    border-style: dashed;
  }

  .tag-pill-state-not {
    border-width: 2.5px;
    background-color: var(--tag-bg-dark);
    color: var(--tag-text-dark);
    border-color: var(--tag-border);
    font-weight: 600;
    opacity: 0.6;
  }

  .tag-state-indicator {
    font-weight: 700;
    margin-right: 0.15em;
    font-size: 0.9em;
  }

  .tag-pill-state-not .tag-state-indicator {
    color: #d04040;
  }

  .tag-game-count {
    margin-left: 0.3em;
    font-size: 0.8em;
    opacity: 0.7;
    font-weight: 400;
  }

  .tag-pill-sm {
    font-size: 0.8em;
    padding: 0.15em 0.5em;
  }

  .tag-pill-selected {
    cursor: default;
    background-color: var(--tag-bg);
    color: var(--tag-text);
    border-color: var(--tag-border);
  }

  .tag-pill-selected.tag-pill-state-and {
    border-style: dashed;
  }

  .tag-pill-selected.tag-pill-state-not {
    opacity: 0.6;
  }

  .tag-remove {
    margin-left: 0.3em;
    cursor: pointer;
    opacity: 0.6;
    font-weight: normal;
    transition: opacity 0.2s;
  }

  .tag-remove:hover {
    opacity: 1;
  }

  .tag-modal-footer {
    display: flex;
    justify-content: flex-end;
    padding: 0.8em 1.2em;
    border-top: 1px solid #eee;
  }

  .tag-modal-help {
    margin-top: 0.8em;
    font-size: 0.78em;
    color: #888;
    line-height: 1.4;
  }

  .tag-modal-footer .md-button {
    font-size: 0.9em;
    padding: 0.4em 1em;
  }

  .md-button-secondary {
    background-color: #eee;
    color: #555;
    border-color: #ccc;
  }

  .md-button-secondary:hover {
    background-color: #ddd;
    color: #555;
  }

  /* Dark mode for tag modal */
  body.dark .tag-modal {
    background: #2a2a2a;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  }

  body.dark .tag-modal-header {
    border-bottom-color: #444;
  }

  body.dark .tag-modal-header h3 {
    color: #eee;
  }

  body.dark .tag-modal-selected {
    border-bottom-color: #444;
    background: #333;
  }

  body.dark .tag-selected-label {
    color: #aaa;
  }

  body.dark .tag-clear-all {
    color: #888;
  }

  body.dark .tag-clear-all:hover {
    color: #ccc;
  }

  body.dark .tag-match-count {
    color: #777;
  }

  body.dark .tag-pill {
    border-color: var(--tag-border-dark);
    background-color: var(--tag-bg-dark);
    color: var(--tag-text-dark);
  }

  body.dark .tag-pill-state-or {
    background-color: var(--tag-bg);
    color: var(--tag-text);
    border-color: var(--tag-border-dark);
  }

  body.dark .tag-pill-state-and {
    background-color: var(--tag-bg);
    color: var(--tag-text);
    border-color: var(--tag-border-dark);
  }

  body.dark .tag-pill-state-not {
    background-color: var(--tag-bg);
    color: var(--tag-text);
    border-color: var(--tag-border-dark);
  }

  body.dark .tag-pill-selected {
    border-color: var(--tag-border-dark);
    background-color: var(--tag-bg-dark);
    color: var(--tag-text-dark);
  }

  body.dark .tag-pill-selected.tag-pill-state-and {
    border-style: dashed;
  }

  body.dark .tag-pill-selected.tag-pill-state-not {
    opacity: 0.6;
  }

  body.dark .tag-modal-help {
    color: #777;
  }

  body.dark .tag-modal-footer {
    border-top-color: #444;
  }

  body.dark .md-button-secondary {
    background-color: #3a3a3a !important;
    color: #bbb !important;
    border-color: #555 !important;
  }

  body.dark .md-button-secondary:hover {
    background-color: #444 !important;
    color: #bbb !important;
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
