<script setup>
import { ref, computed, watch } from "vue";
import DownloadHeader from "../../components/HeaderNav.vue";
import { getLanguage, getDisplayMode, setDisplayModeLine, setDisplayModeCard, setLanguageZh, setLanguageEn } from "../../util/Language.js";
import { navTop } from "../../config.js";
import SiteFooter from "../../components/SiteFooter.vue";
import { readList } from "../../util/ReadList.js";
import SoftendoGameLine from "../../components/SoftendoGameLine.vue";
import SoftendoGameCard from "../../components/SoftendoGameCard.vue";
import SoftendoGameLineHeader from "../../components/SoftendoGameLineHeader.vue";
import { normalizeSoftendoList, getSoftendoGameName, getSoftwareLabel, getTypeLabel } from "../../util/SoftendoUtil.js";
import { createGameImageResolver } from "../../util/ImageUtil.js";
import { SortUpIcon, SortDownIcon, SortUpDownIcon, InfoIcon, FilterIcon, ListIcon, GridIcon } from "../../components/icons/Icons.js";
import axios from "axios";
import Tooltip from "../../components/ToolTip.vue";
import ButtonBackToTop from "../../components/ButtonBackToTop.vue";
import ButtonDarkMode from "../../components/ButtonDarkMode.vue";
import { useFloating, flip, shift, offset, autoUpdate } from "@floating-ui/vue";
import FullscreenModal from "../../components/FullscreenModal.vue";
import { disableScroll, enableScroll } from "../../util/OverlayScrollbarsUtil.js";
import { batchFetchFileSizes } from "../../util/OpenListApi.js";

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

const selectedDownload = ref(null);
const fileSizeMap = ref({});
const fileSizeLoading = ref(false);
const selectedGameDetail = ref(null);

watch([selectedDownload, selectedGameDetail], ([newDownload, newDetail]) => {
  if (newDownload || newDetail) {
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");
    disableScroll();
  } else {
    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");
    enableScroll();
  }
});

watch(selectedDownload, (newDownload) => {
  if (newDownload) {
    fetchFileSizes(newDownload);
  } else {
    fileSizeMap.value = {};
    fileSizeLoading.value = false;
  }
});

async function fetchFileSizes(game) {
  if (!game || !game.currentVer) {
    fileSizeMap.value = {};
    fileSizeLoading.value = false;
    return;
  }

  fileSizeLoading.value = true;
  fileSizeMap.value = {};

  const urls = [];
  if (game.currentVer.installer_url) {
    urls.push(game.currentVer.installer_url);
  }
  if (game.currentVer.portable_urls) {
    for (const p of game.currentVer.portable_urls) {
      urls.push(p.url);
    }
  }

  if (urls.length > 0) {
    const sizes = await batchFetchFileSizes(urls);
    fileSizeMap.value = sizes;
  }

  fileSizeLoading.value = false;
}

// Sort operations.
const sort_option = ref({
  active: false,
  field: null,
  asc: true
});

function defaultSort() {
  games.value.sort((a, b) => {
    const yearA = a.currentVer && a.currentVer.year !== "unknown" ? a.currentVer.year : 0;
    const yearB = b.currentVer && b.currentVer.year !== "unknown" ? b.currentVer.year : 0;
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
    const yearA = a.currentVer && a.currentVer.year !== "unknown" ? a.currentVer.year : 0;
    const yearB = b.currentVer && b.currentVer.year !== "unknown" ? b.currentVer.year : 0;
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
  games.value = games.value.sort((a, b) =>
    sort_option.value.asc
      ? (a.software || "").localeCompare(b.software || "")
      : (b.software || "").localeCompare(a.software || "")
  );
}

// Filter operations.
const filter_option = ref({
  active: false,
  name: "",
  year: "",
  type: "",
  software: ""
});

function clearName() {
  filter_option.value.name = "";
}

function clearFilter() {
  filter_option.value.name = "";
  filter_option.value.year = "";
  filter_option.value.type = "";
  filter_option.value.software = "";
}

const expandAllVersions = ref(false);

const filteredGames = computed(() => {
  const list = games.value.filter((a) => {
    const name = getSoftendoGameName(a);
    const nameMatch =
      filter_option.value.name.trim() == "" ||
      name.toUpperCase().includes(filter_option.value.name.trim().toUpperCase()) ||
      (a.alias && a.alias.some((al) => al.toUpperCase().includes(filter_option.value.name.trim().toUpperCase())));
    const yearMatch =
      filter_option.value.year == "" ||
      (a.currentVer && String(a.currentVer.year) == filter_option.value.year);
    const typeMatch =
      filter_option.value.type == "" ||
      a.type == filter_option.value.type;
    const softwareMatch =
      filter_option.value.software == "" ||
      a.software == filter_option.value.software;
    return nameMatch && yearMatch && typeMatch && softwareMatch;
  });

  if (!expandAllVersions.value) {
    return list;
  }

  // Expand all versions
  const expanded = games.value.flatMap((entry) => {
    const name = getSoftendoGameName(entry);
    const nameMatch =
      filter_option.value.name.trim() == "" ||
      name.toUpperCase().includes(filter_option.value.name.trim().toUpperCase()) ||
      (entry.alias && entry.alias.some((al) => al.toUpperCase().includes(filter_option.value.name.trim().toUpperCase())));
    if (!nameMatch) return [];
    if (!Array.isArray(entry.ver)) return [];

    return entry.ver.map((verRaw) => {
      const verKey = Object.keys(verRaw)[0];
      const verObj = verRaw[verKey];
      const yearMatch =
        filter_option.value.year == "" ||
        String(verObj.year) == filter_option.value.year;
      const typeMatch =
        filter_option.value.type == "" ||
        entry.type == filter_option.value.type;
      const softwareMatch =
        filter_option.value.software == "" ||
        entry.software == filter_option.value.software;
      if (yearMatch && typeMatch && softwareMatch) {
        return {
          ...entry,
          ver: [verRaw],
          currentVer: verObj,
          currentVerStr: verKey,
          _isVersionSplit: true
        };
      }
      return null;
    }).filter(Boolean);
  });

  // Sort expanded
  if (sort_option.value.field === "game") {
    expanded.sort((a, b) =>
      sort_option.value.asc
        ? getSoftendoGameName(a).localeCompare(getSoftendoGameName(b))
        : getSoftendoGameName(b).localeCompare(getSoftendoGameName(a))
    );
  } else if (sort_option.value.field === "type") {
    expanded.sort((a, b) =>
      sort_option.value.asc
        ? (a.type || "").localeCompare(b.type || "")
        : (b.type || "").localeCompare(a.type || "")
    );
  } else if (sort_option.value.field === "year") {
    expanded.sort((a, b) => {
      const yearA = a.currentVer && a.currentVer.year !== "unknown" ? a.currentVer.year : 0;
      const yearB = b.currentVer && b.currentVer.year !== "unknown" ? b.currentVer.year : 0;
      return sort_option.value.asc ? yearA - yearB : yearB - yearA;
    });
  } else if (sort_option.value.field === "software") {
    expanded.sort((a, b) =>
      sort_option.value.asc
        ? (a.software || "").localeCompare(b.software || "")
        : (b.software || "").localeCompare(a.software || "")
    );
  } else {
    expanded.sort((a, b) => {
      const yearA = a.currentVer && a.currentVer.year !== "unknown" ? a.currentVer.year : 0;
      const yearB = b.currentVer && b.currentVer.year !== "unknown" ? b.currentVer.year : 0;
      return yearB - yearA;
    });
  }
  return expanded;
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

// Get window width.
const wideScreen = ref(window.innerWidth >= 1100);
const isMobile = ref(window.innerWidth <= 480);
window.addEventListener("resize", () => {
  wideScreen.value = window.innerWidth >= 1100;
  isMobile.value = window.innerWidth <= 480;
});

// Display mode toggle (line/card).
const displayMode = ref(getDisplayMode());

function toggleDisplayMode() {
  if (displayMode.value === "line") {
    displayMode.value = setDisplayModeCard();
  } else {
    displayMode.value = setDisplayModeLine();
  }
}

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

// Collect available years for filter dropdown.
const availableYears = computed(() => {
  const years = new Set();
  for (const game of games.value) {
    if (game.currentVer && game.currentVer.year !== "unknown") {
      years.add(game.currentVer.year);
    }
    if (Array.isArray(game.ver)) {
      for (const verRaw of game.ver) {
        const verObj = verRaw[Object.keys(verRaw)[0]];
        if (verObj.year && verObj.year !== "unknown") {
          years.add(verObj.year);
        }
      }
    }
  }
  return Array.from(years).sort((a, b) => b - a);
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
    if (game.software) softwares.add(game.software);
  }
  return Array.from(softwares).sort();
});

// Image utilities.
const getGameImage = (game) => {
  return imageResolver.resolve(game);
};

// Toolbar detection for installer
const hasToolbar = (installerUrl) => {
  if (!installerUrl) return false;
  const lowerUrl = installerUrl.toLowerCase();
  return lowerUrl.includes('toolbar');
};

const handleInstallerClick = (event, installerUrl) => {
  if (!hasToolbar(installerUrl)) return;

  const messageZh = '该安装程序包含 Mario Forever Toolbar（广告插件），请在安装过程中取消勾选"Install the Mario Forever Toolbar"选项；建议优先下载绿色版。'
  const messageEn = 'Warning: This installer includes the "Mario Forever Toolbar". Please make sure to uncheck the "Install the Mario Forever Toolbar" option to avoid installing it.'
  const message = lan.value === "zh" ? messageZh : messageEn

  if (!confirm(message)) {
    event.preventDefault();
  }
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
    <p v-if="lastUpdate" class="last-update">{{ lan == "en" ? "Last updated: " : "最后更新：" }}{{ lastUpdate }}</p>
  </div>

  <div class="hidden-container">
    <div class="container filter-container" :class="sort_option.active ? 'expand' : '' ">
      <div class="icon-container">
        {{ lan == "en" ? "Filter" : "筛选" }}
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
          {{ lan == "en" ? "Year" : "年份" }}
          <select v-model="filter_option.year">
            <option value="">{{ lan == "en" ? "Select..." : "请选择.." }}</option>
            <option v-for="year in availableYears" :key="year">{{ year }}</option>
          </select>&nbsp;
        </div>
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
        <div class="inline-block">
          <input v-model="expandAllVersions" type="checkbox" id="expandAllVersions">
          <label for="expandAllVersions">{{ lan == "en" ? "Expand all versions" : "展开全部版本" }}</label>
          <Tooltip :in-card="false" @show-tooltip="(obj)=>tooltipMouseEnter(obj)" @hide-tooltip="(obj) => tooltipMouseLeave(obj)">
            <InfoIcon class="icon button-shift" style="margin-left: 0.4em;"></InfoIcon>
            <template #popper>
              <span style="text-align: left; display: block;">
                {{ lan == "en"
                  ? "When checked, all games with multiple versions will be fully expanded in the list, with each version shown as a separate entry."
                  : "勾选此项后，所有包含多个版本的作品将在列表中全部展开，每个版本单独显示。"
                }}
              </span>
            </template>
          </Tooltip>
        </div>
        <Tooltip :in-card="false" @show-tooltip="(obj)=>tooltipMouseEnter(obj)" @hide-tooltip="(obj) => tooltipMouseLeave(obj)">
          <FilterIcon class="icon button" @click="clearFilter()" />
          <template #popper>{{ lan == 'en' ? 'Reset filters' : '重置筛选' }}</template>
        </Tooltip>
        <div class="inline-block display-mode-toggle" v-if="wideScreen">
          <Tooltip :in-card="false" @show-tooltip="(obj)=>tooltipMouseEnter(obj)" @hide-tooltip="(obj) => tooltipMouseLeave(obj)">
            <ListIcon class="icon button" v-if="displayMode === 'card'" @click="toggleDisplayMode()" />
            <GridIcon class="icon button" v-if="displayMode === 'line'" @click="toggleDisplayMode()" />
            <template #popper>{{ displayMode === 'line' ? (lan == 'en' ? 'Switch to Card' : '切换到卡片') : (lan == 'en' ? 'Switch to List' : '切换到列表') }}</template>
          </Tooltip>
        </div>
        <div class="inline-block item-count">
          {{ lan == "en" ? `${filteredGames.length} items` : `${filteredGames.length} 个条目` }}
        </div>
      </div>
      <div class="icon-container" v-if="!wideScreen || (wideScreen && displayMode === 'card')">
        {{ lan == "en" ? "Sort by " : "排序选项 " }}
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
          {{ lan == "en" ? "Software" : "制作软件" }}
          <span v-if="sort_option.field == 'software'">
            <SortUpIcon class="icon button-shift" v-if="sort_option.asc"></SortUpIcon>
            <SortDownIcon class="icon button-shift" v-if="!sort_option.asc"></SortDownIcon>
          </span>
          <span v-if="sort_option.field != 'software'">
            <SortUpDownIcon class="icon button-shift"></SortUpDownIcon>
          </span>
        </div>
      </div>
    </div>
  </div>

  <SoftendoGameLineHeader
    v-if="wideScreen && displayMode === 'line'"
    :lan="lan"
    :sort_option="sort_option"
    @sort-by-name="sortByName();"
    @sort-by-year="sortByYear();"
    @sort-by-software="sortBySoftware();"
  />
  <div v-if="wideScreen && displayMode === 'line'">
    <div v-for="(game, idx) in filteredGames" :key="getSoftendoGameName(game) + '|' + (game.type || '') + '|' + (game.currentVerStr || '') + '|' + idx">
      <SoftendoGameLine
        :game="game"
        :lan="lan"
        :get-game-image="getGameImage"
        :expand-all-versions="expandAllVersions"
        @select-game="(entry) => {selectedDownload = entry;}"
        @select-version="(entry) => {Object.assign(game, entry);}"
        @show-tooltip="(obj)=>tooltipMouseEnter(obj)"
        @hide-tooltip="(obj) => tooltipMouseLeave(obj)"
        @show-game-detail="(entry) => {selectedGameDetail = entry;}"
      />
    </div>
  </div>
  <div v-if="(wideScreen && displayMode === 'card') || !wideScreen" class="card-container">
    <div v-for="(game, idx) in filteredGames" :key="getSoftendoGameName(game) + '|' + (game.type || '') + '|' + (game.currentVerStr || '') + '|' + idx">
      <SoftendoGameCard
        :game="game"
        :lan="lan"
        :get-game-image="getGameImage"
        :expand-all-versions="expandAllVersions"
        @select-game="(entry) => {selectedDownload = entry;}"
        @select-version="(entry) => {Object.assign(game, entry);}"
        @show-tooltip="(obj)=>tooltipMouseEnter(obj)"
        @hide-tooltip="(obj) => tooltipMouseLeave(obj)"
        @show-game-detail="(entry) => {selectedGameDetail = entry;}"
      />
    </div>
  </div>

  <!-- Download modal -->
  <Transition name="modal">
    <div v-if="selectedDownload != null" class="modal-bg" @click="selectedDownload = null;">
      <div class="modal-content" @click.stop="">
        <div>
          {{ lan == "en" ? "Download" : "下载" }} {{ getSoftendoGameName(selectedDownload) }}<template v-if="selectedDownload.currentVerStr"> ({{ selectedDownload.currentVerStr }})</template>
        </div>
        <div v-if="fileSizeLoading" class="file-size-info">
          <span class="file-size-loading">{{ lan == "en" ? "Fetching file size..." : "获取文件大小中..." }}</span>
        </div>
        <!-- Download buttons -->
        <div class="button-line" v-if="selectedDownload.currentVer && (selectedDownload.currentVer.installer_url || (selectedDownload.currentVer.portable_urls && selectedDownload.currentVer.portable_urls.length > 0))">
          <a
            v-if="selectedDownload.currentVer.installer_url"
            class="download"
            :class="{ 'has-toolbar': hasToolbar(selectedDownload.currentVer.installer_url) }"
            :href="selectedDownload.currentVer.installer_url"
            target="_blank"
            @click="handleInstallerClick($event, selectedDownload.currentVer.installer_url)"
          >
            {{ lan == "en" ? "Download Installer" : "下载安装版" }}<template v-if="hasToolbar(selectedDownload.currentVer.installer_url)"> ({{ lan == "en" ? "with toolbar" : "含广告插件" }})</template>
            <span v-if="fileSizeMap[selectedDownload.currentVer.installer_url]" class="btn-file-size">
              ({{ fileSizeMap[selectedDownload.currentVer.installer_url] }})
            </span>
          </a>
          <template v-for="p in selectedDownload.currentVer.portable_urls" :key="p.url">
            <a
              v-if="selectedDownload.currentVer.portable_urls && selectedDownload.currentVer.portable_urls.length > 0"
              class="download"
              :href="p.url"
              target="_blank"
            >
              {{ lan == "en" ? "Download Portable" : "下载绿色版" }}<template v-if="selectedDownload.type === 'flash' || selectedDownload.type === 'mff'"> ({{ p.label }})</template>
              <span v-if="fileSizeMap[p.url]" class="btn-file-size">
                ({{ fileSizeMap[p.url] }})
              </span>
            </a>
          </template>
        </div>
      </div>
    </div>
  </Transition>

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
    margin-right: .5em;
    border-radius: .25em;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    cursor: pointer;
    display: inline-block;
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

  body.dark .visible-button:active {
    background-color: #444 !important;
    box-shadow: rgba(0, 0, 0, 0.06) 1px 1px 2px !important;
    color: #bbb !important;
  }

  .modal-bg {
    position: fixed;
    z-index: 1001;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0,0,0,0.4);
  }

  .modal-enter-active, .modal-leave-active {
    transition: opacity 0.5s ease;
  }

  .modal-enter-from, .modal-leave-to {
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
    font-family: Helvetica, Arial, "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", "tohoma,sans-serif";
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
    line-height: 1.5em;
  }

  .download:hover, .download:focus {
    background-color: #30acff;
    text-decoration: none;
  }

  .download:active {
    background-color: #007cdf;
  }

  .download.has-toolbar {
    background-color: #e67e22;
  }

  .download.has-toolbar:hover,
  .download.has-toolbar:focus {
    background-color: #f39c12 !important;
  }

  .download.has-toolbar:active {
    background-color: #d35400 !important;
  }

  body.dark .download.has-toolbar:hover,
  body.dark .download.has-toolbar:focus {
    background-color: #d35400 !important;
  }

  body.dark .download.has-toolbar:active {
    background-color: #c0392b !important;
  }

  .btn-file-size {
    font-size: 0.85em;
    opacity: 0.85;
  }

  .button-line {
    margin-top: .5em;
    display: flex;
    flex-wrap: wrap;
    gap: 0.25em;
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
    padding: .2em .6em;
  }

  select:hover, select:focus {
    cursor: pointer;
    border-color: #008cff
  }

  .file-size-info {
    margin-bottom: 8px;
    font-size: 0.9em;
  }

  .file-size-loading {
    color: #888;
  }

  body.dark .file-size-loading {
    color: #aaa;
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

  p {
    margin: .5em 0;
  }

  h1 {
    font-size: 30px;
    margin-top: 12px;
  }

  p, h5, h6, button {
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
    line-height: 1.5em;
  }
</style>
