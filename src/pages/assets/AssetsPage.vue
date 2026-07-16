<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import axios from 'axios';
import DownloadHeader from '../../components/HeaderNav.vue';
import { getLanguage, setLanguageZh, setLanguageEn } from "../../util/Language.js";
import SiteFooter from '../../components/SiteFooter.vue';
import AssetCard from '../../components/AssetCard.vue';
import { getName, getDownloadEntries } from "../../util/GameUtil.js";
import { SortUpIcon, SortDownIcon, SortUpDownIcon, FilterIcon } from "../../components/icons/Icons.js";
import { filterList, getStrFromList } from "../../util/GameUtil.js"
import ClipboardButton from '../../components/ButtonClipboard.vue';
import Tooltip from '../../components/ToolTip.vue';
import ButtonBackToTop from '../../components/ButtonBackToTop.vue';
import ButtonDarkMode from '../../components/ButtonDarkMode.vue';
import { useFloating, flip, shift, offset, autoUpdate } from '@floating-ui/vue';
import { readList } from "../../util/ReadList.js";
import { parseVer } from "../../util/Misc.js";
import introContent from '../../markdown/assets.md';
import { navTop } from "../../config.js";
import { disableScroll, enableScroll } from '../../util/OverlayScrollbarsUtil.js';
import FullscreenModal from '../../components/FullscreenModal.vue';
import { batchFetchFileSizes } from "../../util/OpenListApi.js";
const originalLan = ref(getLanguage());

const lan = ref("zh");

const pageId = "assets"

const titleZh = navTop.find(item => item.id === pageId).title;

const assets = ref([]);

readList("list-assets.yaml").then((list) => {
  for (let i = 0; i < list.length; i++) {
    const entry = list[i];
    entry._originalIndex = i;
    if (entry.variants) {
      entry.variants = entry.variants.map(variant => {
        const variantKey = Object.keys(variant)[0];
        const variantData = variant[variantKey];
        return {
          [variantKey]: {
            ...variantData,
            download_url: variantData.download_url ?? entry.download_url,
            download_url_alt: variantData.download_url_alt ?? entry.download_url_alt,
            code: variantData.code ?? entry.code,
            code_alt: variantData.code_alt ?? entry.code_alt,
            source_url: variantData.source_url ?? entry.source_url,
            source_url_alt: variantData.source_url_alt ?? entry.source_url_alt
          }
        };
      });
      entry.currentVer = parseVer(entry.variants[0]);
      entry.currentVerStr = Object.keys(entry.variants[0])[0];
      entry.ver = entry.variants;
    } else {
      entry.currentVer = {
        ver: entry.ver,
        date: entry.date ? new Date(entry.date) : null,
        file_name: entry.file_name,
        download_url: entry.download_url,
        download_url_alt: entry.download_url_alt,
        code: entry.code,
        code_alt: entry.code_alt,
        source_url: entry.source_url,
        source_url_alt: entry.source_url_alt
      };
      entry.currentVerStr = entry.ver;
      entry.ver = entry.ver ? [{ [entry.ver]: entry.currentVer }] : [];
    }
    assets.value.push(entry);
  }
});

const selectedDownload = ref(null);
const fileSizeMap = ref({});
const fileSizeLoading = ref(false);
const tiebaDialog = ref(null);
const selectedAssetDetail = ref(null);

const lastUpdate = ref(null);

const yamlUpdateDate = ref(null);
const mdUpdateDate = ref(null);

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
};

const getLatestDate = () => {
  const dates = [];
  if (yamlUpdateDate.value) dates.push(new Date(yamlUpdateDate.value));
  if (mdUpdateDate.value) dates.push(new Date(mdUpdateDate.value));
  if (dates.length === 0) return null;
  const maxDate = new Date(Math.max(...dates));
  return formatDate(maxDate);
};

const updateLastUpdate = () => {
  lastUpdate.value = getLatestDate();
};

const fetchYamlUpdate = () => {
  return axios.get("https://api.github.com/repos/MarioForeverCommunity/download-site-next/commits?path=public%2Fdata%2Flist-assets.yaml&page=1&per_page=1").then((response) => {
    yamlUpdateDate.value = response.data[0].commit.committer.date;
  });
};

const fetchMdUpdate = () => {
  return axios.get("https://api.github.com/repos/MarioForeverCommunity/download-site-next/commits?path=src%2Fmarkdown%2Fassets.md&page=1&per_page=1").then((response) => {
    mdUpdateDate.value = response.data[0].commit.committer.date;
  });
};

Promise.all([fetchYamlUpdate(), fetchMdUpdate()]).then(() => {
  updateLastUpdate();
});

const filter_option = ref({
  active : false,
  name : "",
  type_engine: true,
  type_addon: true,
  type_effect: true,
  type_sprite: true,
  type_tool: true,
  type_mwtool: true,
});

function clearName() {
  filter_option.value.name = "";
}
function clearFilter() {
  filter_option.value.name = "";
  filter_option.value.type_engine = true;
  filter_option.value.type_addon = true;
  filter_option.value.type_effect = true;
  filter_option.value.type_sprite = true;
  filter_option.value.type_tool = true;
  filter_option.value.type_mwtool = true;
}

// Sort operations.

const sort_option = ref({
  active : false,
  field : null,
  asc : true
});

function defaultSort() {
  sort_option.value.field = null;
}

function sortByName() {
  if (sort_option.value.field != "name") {
    sort_option.value.field = "name";
    sort_option.value.asc = true;
  } else if (sort_option.value.asc == true) {
    sort_option.value.asc = false;
  } else {
    defaultSort();
    return;
  }
}

function sortByDate() {
  if (sort_option.value.field != "date") {
    sort_option.value.field = "date";
    sort_option.value.asc = true;
  } else {
    sort_option.value.asc = !sort_option.value.asc;
  }
}

const filteredAssets = computed(() => {
  let expandedIndex = 0;
  const expanded = assets.value.flatMap((entry) => {
    if (!entry.ver || entry.ver.length === 0) {
      const nameMatch = (
        (entry.name && (filter_option.value.name.trim() == "" || entry.name.toUpperCase().match(filter_option.value.name.trim().toUpperCase())))
          || (entry.name_alt && (filter_option.value.name.trim() == "" || entry.name_alt.toUpperCase().match(filter_option.value.name.trim().toUpperCase())))
          || (getStrFromList(entry.author) && (filter_option.value.name.trim() == "" || getStrFromList(entry.author).toUpperCase().match(filter_option.value.name.trim().toUpperCase())))
          || filterList(filter_option.value.name.trim(), entry.alias)
      );
      const typeMatch = (filter_option.value.type_engine && entry.type == "engine")
          || (filter_option.value.type_addon && entry.type == "addon")
          || (filter_option.value.type_effect && entry.type == "effect")
          || (filter_option.value.type_sprite && entry.type == "sprite")
          || (filter_option.value.type_tool && entry.type == "tool")
          || (filter_option.value.type_mwtool && entry.type == "mwtool");
      if (!nameMatch || !typeMatch) return [];
      return [{ ...entry, _expandedIndex: expandedIndex++ }];
    }
    const hasMultipleVariants = entry.ver.length > 1;
    return entry.ver.map((verRaw) => {
      const verKey = Object.keys(verRaw)[0];
      const verObj = verRaw[verKey];
      const nameMatch = (
        (entry.name && (filter_option.value.name.trim() == "" || entry.name.toUpperCase().match(filter_option.value.name.trim().toUpperCase())))
          || (entry.name_alt && (filter_option.value.name.trim() == "" || entry.name_alt.toUpperCase().match(filter_option.value.name.trim().toUpperCase())))
          || (getStrFromList(entry.author) && (filter_option.value.name.trim() == "" || getStrFromList(entry.author).toUpperCase().match(filter_option.value.name.trim().toUpperCase())))
          || filterList(filter_option.value.name.trim(), entry.alias)
      );
      const fileNameMatch = verObj.file_name && verObj.file_name.toUpperCase().includes(filter_option.value.name.trim().toUpperCase());
      if (!nameMatch && !fileNameMatch) return null;
      const typeMatch = (filter_option.value.type_engine && entry.type == "engine")
          || (filter_option.value.type_addon && entry.type == "addon")
          || (filter_option.value.type_effect && entry.type == "effect")
          || (filter_option.value.type_sprite && entry.type == "sprite")
          || (filter_option.value.type_tool && entry.type == "tool")
          || (filter_option.value.type_mwtool && entry.type == "mwtool");
      if (!typeMatch) return null;
      return {
        ...entry,
        currentVer: parseVer(verRaw),
        currentVerStr: verKey,
        _variantName: hasMultipleVariants ? verKey : null,
        _expandedIndex: expandedIndex++
      };
    }).filter(item => item !== null);
  });
  const datedItems = expanded
    .filter(e => e.currentVer && e.currentVer.date)
    .map(e => ({
      originalIdx: e._originalIndex ?? 0,
      expandedIdx: e._expandedIndex,
      date: new Date(e.currentVer.date).getTime()
    }));
  const getRefDate = (item) => {
    const origIdx = item._originalIndex ?? 0;
    const expIdx = item._expandedIndex;
    const sameEntryDated = datedItems.filter(d => d.originalIdx === origIdx);
    if (sameEntryDated.length > 0) {
      const maxDate = Math.max(...sameEntryDated.map(d => d.date));
      return maxDate + (100000 - expIdx);
    }
    const prev = datedItems.filter(d => d.originalIdx < origIdx)
      .sort((a, b) => b.originalIdx - a.originalIdx)[0];
    const next = datedItems.filter(d => d.originalIdx > origIdx)
      .sort((a, b) => a.originalIdx - b.originalIdx)[0];
    if (next) {
      return next.date + (100000 - expIdx);
    }
    if (prev) {
      return prev.date - (100000 - expIdx);
    }
    return expIdx;
  };
  if (sort_option.value.field === "name") {
    expanded.sort((a, b) => {
      const nameA = getName(a, lan.value);
      const nameB = getName(b, lan.value);
      return sort_option.value.asc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  } else {
    expanded.sort((a, b) => {
      const dateA = a.currentVer && a.currentVer.date ? new Date(a.currentVer.date).getTime() : null;
      const dateB = b.currentVer && b.currentVer.date ? new Date(b.currentVer.date).getTime() : null;
      if (dateA !== null && dateB !== null) {
        return sort_option.value.field === "date"
          ? (sort_option.value.asc ? dateA - dateB : dateB - dateA)
          : dateB - dateA;
      }
      const refA = dateA !== null ? dateA : getRefDate(a);
      const refB = dateB !== null ? dateB : getRefDate(b);
      return sort_option.value.field === "date"
        ? (sort_option.value.asc ? refA - refB : refB - refA)
        : refB - refA;
    });
  }
  return expanded;
});

const wideScreen = ref(window.innerWidth > 800);

function updateWideScreen() {
  wideScreen.value = window.innerWidth > 800;
}

onMounted(() => {
  window.addEventListener('resize', updateWideScreen);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateWideScreen);
});

watch([selectedDownload, tiebaDialog, selectedAssetDetail], ([newDownload, newTieba, newAssetDetail]) => {
  if (newDownload || newTieba || newAssetDetail) {
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    disableScroll();
  } else {
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
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

async function fetchFileSizes(download) {
  if (!download) {
    fileSizeMap.value = {};
    return;
  }

  fileSizeLoading.value = true;
  fileSizeMap.value = {};

  const urls = [];

  // Collect resource URLs
  const resourceUrls = getAssetResourceURLs(download);
  if (resourceUrls.length > 0) {
    urls.push(...resourceUrls.map(u => u.url));
  }

  // Collect download entries URLs
  const entries = getDownloadEntries(download, lan.value);
  urls.push(...entries.map(e => e.url));

  const sizes = await batchFetchFileSizes(urls);
  fileSizeMap.value = sizes;
  fileSizeLoading.value = false;
}

function getSingleFileSize(download) {
  const urls = getAssetResourceURLs(download);
  if (urls.length === 0) return null;
  const url = urls[0].url;
  return fileSizeMap.value[url] || null;
}

function getAssetImage(asset) {
  if (asset.image) {
    return `/data/assets/${asset.image}`;
  }
  return null;
}

function getAssetResourceURLs(asset) {
  if (!asset.currentVer || !asset.currentVer.file_name) {
    return [];
  }
  const fileNames = Array.isArray(asset.currentVer.file_name)
    ? asset.currentVer.file_name.filter(fn => fn != null)
    : [asset.currentVer.file_name];

  return fileNames.map(fileName => {
    const encodedFileName = encodeURIComponent(fileName);
    let url;
    if (asset.type === 'effect') {
      url = `https://file.marioforever.net/Mario Forever/引擎/CTF特效/${encodedFileName}`;
    } else if (asset.type === 'addon') {
      url = `https://file.marioforever.net/Mario Forever/引擎/拓展资源包/${encodedFileName}`;
    } else if (asset.type === 'engine') {
      const path = asset.path || '';
      const encodedPath = path ? encodeURIComponent(path) + '/' : '';
      url = `https://file.marioforever.net/Mario Forever/引擎/${encodedPath}${encodedFileName}`;
    } else if (asset.type === 'sprite') {
      url = `https://file.marioforever.net/Mario Forever/游戏素材/${encodedFileName}`;
    } else if (asset.type === 'tool') {
      url = `https://file.marioforever.net/Mario Forever/游戏工具/${encodedFileName}`;
    } else if (asset.type === 'mwtool') {
      url = `https://file.marioforever.net/Mario Worker/辅助工具/${encodedFileName}`;
    }

    let displayFileName = fileName.split('/').pop();
    displayFileName = displayFileName.replace(/\.[^.]*$/, "");
    try {
      displayFileName = decodeURIComponent(displayFileName);
    } catch (error) {
      console.error('Failed to decode URI component:', displayFileName, error);
    }

    return {
      name: fileNames.length > 1 ? `社区资源站 (${displayFileName})` : '社区资源站',
      url: url
    };
  });
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
const { floatingStyles } = useFloating(reference, floating,
  {
    middleware: [flip(), shift(), offset(10)],
    whileElementsMounted: autoUpdate,
  });
</script>

<template>
  <DownloadHeader
    pageId="assets"
    :lan-var="originalLan"
    @change-lan-zh="originalLan = setLanguageZh(); "
    @change-lan-en="originalLan = setLanguageEn(); "
  />

  <div class="container md-container">
    <h1>{{ titleZh }}</h1>
    <introContent />
    <p v-if="lastUpdate" class="last-update">最后更新：{{ lastUpdate }}</p>
  </div>

  <div class="hidden-container">
    <div class="container filter-container expand">
      <div class="icon-container">
        <span class="filter-label">筛选</span>
        <div class="inline-block search-box">
          <input v-model="filter_option.name" class="input">
          <span
            v-if="filter_option.name"
            class="clear-btn"
            @click="clearName"
            title="清除"
          >✕</span>
        </div>&nbsp;
        <div class="inline-block">
          <input v-model="filter_option.type_engine" type="checkbox" id="filterEngine">
          <label for="filterEngine">制作模板 (引擎)</label>
        </div>
        <div class="inline-block">
          <input v-model="filter_option.type_addon" type="checkbox" id="filterAddon">
          <label for="filterAddon">拓展资源</label>
        </div>
        <div class="inline-block">
          <input v-model="filter_option.type_sprite" type="checkbox" id="filterSprite">
          <label for="filterSprite">素材</label>
        </div>
        <div class="inline-block">
          <input v-model="filter_option.type_effect" type="checkbox" id="filterEffect">
          <label for="filterEffect">特效</label>
        </div>
        <div class="inline-block">
          <input v-model="filter_option.type_tool" type="checkbox" id="filterTool">
          <label for="filterTool">工具程序</label>
        </div>
        <div class="inline-block">
          <input v-model="filter_option.type_mwtool" type="checkbox" id="filterMwtool">
          <label for="filterMwtool">MW 工具</label>
        </div>
        <Tooltip :in-card="false" @show-tooltip="(obj)=>tooltipMouseEnter(obj)" @hide-tooltip="(obj) => tooltipMouseLeave(obj)">
          <FilterIcon class="icon button" @click="clearFilter()" />
          <template #popper>重置筛选</template>
        </Tooltip>
        <div class="visible-button" @click="sortByName();">
          {{ lan == "en" ? "Name" : "名称" }}
          <span v-if="sort_option.field == 'name'">
            <SortUpIcon class="icon button-shift" v-if="sort_option.asc"></SortUpIcon>
            <SortDownIcon class="icon button-shift" v-if="!sort_option.asc"></SortDownIcon>
          </span>
          <span v-if="sort_option.field != 'name'">
            <SortUpDownIcon class="icon button-shift"></SortUpDownIcon>
          </span>
        </div>
        <div class="visible-button" @click="sortByDate();">
          {{ lan == "en" ? "Date" : "日期" }}
          <span v-if="sort_option.field == 'date'">
            <SortUpIcon class="icon button-shift" v-if="sort_option.asc"></SortUpIcon>
            <SortDownIcon class="icon button-shift" v-if="!sort_option.asc"></SortDownIcon>
          </span>
          <span v-if="sort_option.field != 'date'">
            <SortUpDownIcon class="icon button-shift"></SortUpDownIcon>
          </span>
        </div>
        <span class="visible-button item-count-badge">{{ lan == "en" ? `${filteredAssets.length} items` : `${filteredAssets.length} 个条目` }}</span>
      </div>
    </div>
  </div>

  <div class="card-container">
    <div v-for="(asset, idx) in filteredAssets" :key="asset.name + '|' + getStrFromList(asset.author) + '|' + idx">
      <AssetCard
        :asset="asset"
        :get-asset-image="getAssetImage"
        @select-download="(entry) => {selectedDownload = entry;}"
        @show-tooltip="(obj)=>tooltipMouseEnter(obj)"
        @hide-tooltip="(obj) => tooltipMouseLeave(obj)"
        @show-tieba-dialog="(data) => {tiebaDialog = data;}"
        @open-modal="(entry) => {selectedAssetDetail = entry;}"
      />
    </div>
  </div>

  <Transition name="modal">
    <div v-if="selectedDownload != null" class="modal-bg" @click="selectedDownload = null;">
      <div class="modal-content" @click.stop="">
        <div>
          下载 {{ getName(selectedDownload, lan) }}{{ selectedDownload._variantName ? ` (${selectedDownload._variantName})` : '' }}{{ selectedDownload.currentVer && selectedDownload.currentVer.ver ? ` ${selectedDownload.currentVer.ver}` : '' }}
        </div>
        <!-- Single file: show file size above buttons -->
        <div v-if="getAssetResourceURLs(selectedDownload).length <= 1" class="file-size-info">
          <span v-if="fileSizeLoading" class="file-size-loading">获取文件大小中...</span>
          <span v-else-if="getSingleFileSize(selectedDownload)" class="file-size-text">文件大小: {{ getSingleFileSize(selectedDownload) }}</span>
        </div>
        <!-- Multiple files: show loading indicator -->
        <div v-if="getAssetResourceURLs(selectedDownload).length > 1 && fileSizeLoading" class="file-size-loading">
          获取文件大小中...
        </div>
        <div class="button-line">
          <span v-if="getAssetResourceURLs(selectedDownload).length > 0">
            <!-- Single file: normal button -->
            <template v-if="getAssetResourceURLs(selectedDownload).length <= 1">
              <a
                class="download"
                v-for="url in getAssetResourceURLs(selectedDownload)"
                :key="url.url"
                :href="url.url"
                target="_blank"
              >{{ url.name }}</a>
            </template>
            <!-- Multiple files: show size in button -->
            <template v-else>
              <a
                class="download"
                v-for="url in getAssetResourceURLs(selectedDownload)"
                :key="url.url"
                :href="url.url"
                target="_blank"
              >{{ url.name }}
                <span v-if="fileSizeMap[url.url]" class="btn-file-size">
                  ({{ fileSizeMap[url.url] }})
                </span>
              </a>
            </template>
          </span>
          <template v-for="entry in getDownloadEntries(selectedDownload, lan)" :key="entry.url">
            <a class="download" :href="entry.url" target="_blank">{{ entry.desc }}</a>
            <ClipboardButton
              v-if="entry.code"
              :code="entry.code"
              :link="entry.url"
              :lan="lan"
            ></ClipboardButton>
          </template>
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
          <a
            class="download"
            :href="tiebaDialog.originalUrl"
            target="_blank"
            @click="tiebaDialog = null;"
          >
            百度贴吧源站
          </a>
          <a
            class="download"
            :href="tiebaDialog.archiveUrl"
            target="_blank"
            @click="tiebaDialog = null;"
          >
            社区备份站
          </a>
        </div>
      </div>
    </div>
  </Transition>

  <FullscreenModal
    :show="selectedAssetDetail != null"
    :game="selectedAssetDetail"
    :lan="lan"
    category="assets"
    @close="selectedAssetDetail = null"
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
    margin-right: .3em;
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

  .btn-file-size {
    font-size: 0.85em;
    opacity: 0.85;
  }

  .file-size-info {
    margin-bottom: 8px;
    font-size: 0.9em;
  }

  .file-size-loading {
    color: #888;
  }

  .file-size-text {
    color: #666;
  }

  body.dark .file-size-loading,
  body.dark .file-size-text {
    color: #aaa;
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
    color: #666;
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

  .italic {
    font-style: italic;
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
