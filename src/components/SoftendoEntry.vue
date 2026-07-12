<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, defineAsyncComponent } from "vue"
import { useFloating, flip, shift, offset, autoUpdate } from "@floating-ui/vue"
import { getLanguage } from "../util/Language.js"
import { normalizeSoftendoList, getSoftendoGameName } from "../util/SoftendoUtil.js"
import { readList } from "../util/ReadList.js"
import { getGameImageSync, loadImageIndex } from "../util/ImageUtil.js"
import SoftendoGameCard from "./SoftendoGameCard.vue"
import { disableScroll, enableScroll } from "../util/OverlayScrollbarsUtil.js"
import { batchFetchFileSizes } from "../util/OpenListApi.js"

const FullscreenModal = defineAsyncComponent(() => import("./FullscreenModal.vue"))

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  ver: {
    type: String,
    default: null
  },
  defaultVer: {
    type: String,
    default: null
  }
})

const lan = ref(getLanguage())
const imageIndexLoaded = ref(false)

const handleLanguageChanged = (event) => {
  const nextLan = event?.detail?.language || getLanguage()
  lan.value = nextLan
}

const game = ref(null)
const isLoading = ref(true)
const notFound = ref(false)
const selectedDownload = ref(null)
const fileSizeMap = ref({})
const fileSizeLoading = ref(false)
const selectedGameDetail = ref(null)

const reference = ref(null)
const floating = ref(null)
const floatingText = ref(null)
const { floatingStyles } = useFloating(reference, floating, {
  middleware: [flip(), shift(), offset(10)],
  whileElementsMounted: autoUpdate,
})

function tooltipMouseEnter(obj) {
  if (obj[0] != reference.value) {
    reference.value = obj[0]
    floatingText.value = obj[1]
  }
}

function tooltipMouseLeave(obj) {
  if (obj == reference.value) {
    reference.value = null
    floatingText.value = null
  }
}

watch([selectedDownload, selectedGameDetail], ([newDownload, newDetail]) => {
  if (newDownload || newDetail) {
    document.documentElement.classList.add("modal-open")
    document.body.classList.add("modal-open")
    disableScroll()
  } else {
    document.documentElement.classList.remove("modal-open")
    document.body.classList.remove("modal-open")
    enableScroll()
  }
})

watch(selectedDownload, (newDownload) => {
  if (newDownload) {
    fetchFileSizes(newDownload)
  } else {
    fileSizeMap.value = {}
    fileSizeLoading.value = false
  }
})

async function fetchFileSizes(download) {
  if (!download || !download.currentVer) {
    fileSizeMap.value = {}
    fileSizeLoading.value = false
    return
  }

  fileSizeLoading.value = true
  fileSizeMap.value = {}

  const urls = []
  if (download.currentVer.installer_url) {
    urls.push(download.currentVer.installer_url)
  }
  if (download.currentVer.portable_urls) {
    for (const p of download.currentVer.portable_urls) {
      urls.push(p.url)
    }
  }

  if (urls.length > 0) {
    const sizes = await batchFetchFileSizes(urls)
    fileSizeMap.value = sizes
  }

  fileSizeLoading.value = false
}

let softendoRawListCache = null
let softendoNormalizedCacheZh = null
let softendoNormalizedCacheEn = null

const loadGame = async () => {
  isLoading.value = true
  notFound.value = false

  if (!softendoRawListCache) {
    try {
      const list = await readList("list-softendo.yaml")
      softendoRawListCache = list
    } catch (_e) {
      game.value = null
      notFound.value = true
      isLoading.value = false
      return
    }
  }

  // Get cached normalized list or create new one for current language
  const cache = lan.value === "zh" ? softendoNormalizedCacheZh : softendoNormalizedCacheEn
  let softendoListCache = cache
  if (!softendoListCache) {
    softendoListCache = normalizeSoftendoList(softendoRawListCache, lan.value)
    if (lan.value === "zh") {
      softendoNormalizedCacheZh = softendoListCache
    } else {
      softendoNormalizedCacheEn = softendoListCache
    }
  }

  const candidates = softendoListCache.filter((entry) => {
    const gameName = getSoftendoGameName(entry)
    return gameName === props.name || (entry.alias && entry.alias.includes(props.name))
  })

  if (candidates.length === 0) {
    game.value = null
    notFound.value = true
    isLoading.value = false
    return
  }

  let selected = candidates[0]

  // If a specific version is requested (ver), lock to that version only
  if (props.ver && selected.ver) {
    const verRaw = selected.ver.find((v) => Object.keys(v)[0] === props.ver)
    if (verRaw) {
      const verKey = Object.keys(verRaw)[0]
      const verObj = verRaw[verKey]
      selected = {
        ...selected,
        currentVer: verObj,
        currentVerStr: verKey,
        ver: [verRaw]
      }
    }
  }
  // If a default version is requested (defaultVer), set it but keep all versions available
  else if (props.defaultVer && selected.ver) {
    const verRaw = selected.ver.find((v) => Object.keys(v)[0] === props.defaultVer)
    if (verRaw) {
      const verKey = Object.keys(verRaw)[0]
      const verObj = verRaw[verKey]
      selected = {
        ...selected,
        currentVer: verObj,
        currentVerStr: verKey
      }
    }
  }

  game.value = selected
  isLoading.value = false
}

onMounted(async () => {
  window.addEventListener("custom-language-changed", handleLanguageChanged)
  await loadImageIndex()
  imageIndexLoaded.value = true
  loadGame()
})

onBeforeUnmount(() => {
  window.removeEventListener("custom-language-changed", handleLanguageChanged)
})

watch(() => props.name, () => {
  game.value = null
  notFound.value = false
  isLoading.value = true
  loadGame()
})

const handleSelectVersion = (entry) => {
  game.value = entry
}

const gallery = computed(() => {
  imageIndexLoaded.value
  if (!game.value) return []
  const images = []
  const title = getGameImageSync(game.value, "softendo")
  if (title) images.push(title)

  const uniq = []
  const seen = new Set()
  for (const url of images) {
    if (!url || seen.has(url)) continue
    seen.add(url)
    uniq.push(url)
  }
  return uniq
})

const getGameImage = () => {
  return null
}

// Toolbar detection for installer
const hasToolbar = (installerUrl) => {
  if (!installerUrl) return false
  const lowerUrl = installerUrl.toLowerCase()
  return lowerUrl.includes("toolbar")
}

const handleInstallerClick = (event, installerUrl) => {
  if (!hasToolbar(installerUrl)) return

  const messageZh = '该安装程序包含 Mario Forever Toolbar（广告插件），请在安装过程中取消勾选"Install the Mario Forever Toolbar"选项；建议优先下载绿色版。'
  const messageEn = 'Warning: This installer includes the "Mario Forever Toolbar". Please make sure to uncheck the "Install the Mario Forever Toolbar" option to avoid installing it.'
  const message = lan.value === "zh" ? messageZh : messageEn

  if (!confirm(message)) {
    event.preventDefault()
  }
}
</script>

<template>
  <div class="softendo-entry entry-card">
    <div v-if="isLoading" class="placeholder">
      {{ lan === "zh" ? "加载中…" : "Loading…" }}
    </div>
    <div v-else-if="notFound" class="placeholder">
      {{ lan === "zh" ? `未找到作品：${name}` : `Not found: ${name}` }}
    </div>
    <template v-else>
      <SoftendoGameCard
        :game="game"
        :lan="lan"
        :get-game-image="getGameImage"
        :hide-dot="true"
        @select-game="(entry) => { selectedDownload = entry }"
        @select-version="handleSelectVersion"
        @show-tooltip="(obj) => tooltipMouseEnter(obj)"
        @hide-tooltip="(obj) => tooltipMouseLeave(obj)"
        @show-game-detail="(entry) => { selectedGameDetail = entry }"
      >
        <template v-if="gallery.length === 1" #gallery>
          <div class="entry-gallery single-image">
            <img
              :src="gallery[0]"
              :alt="getSoftendoGameName(game)"
              class="entry-image"
              decoding="async"
            />
          </div>
        </template>
      </SoftendoGameCard>
    </template>

    <!-- Download modal -->
    <Transition name="modal">
      <div v-if="selectedDownload != null" class="modal-bg" @click="selectedDownload = null;">
        <div class="modal-content" @click.stop="">
          <div>
            {{ lan == "zh" ? "下载" : "Download" }} {{ getSoftendoGameName(selectedDownload) }}<template v-if="selectedDownload.currentVerStr"> ({{ selectedDownload.currentVerStr }})</template>
          </div>
          <div v-if="fileSizeLoading" class="file-size-info">
            <span class="file-size-loading">{{ lan == "zh" ? "获取文件大小中..." : "Fetching file size..." }}</span>
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
              {{ lan == "zh" ? "下载安装版" : "Download Installer" }}<template v-if="hasToolbar(selectedDownload.currentVer.installer_url)"> ({{ lan == "zh" ? "含广告插件" : "with toolbar" }})</template>
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
                {{ lan == "zh" ? "下载绿色版" : "Download Portable" }}<template v-if="selectedDownload.type === 'flash' || selectedDownload.type === 'mff'"> ({{ p.label }})</template>
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
  </div>
</template>

<style scoped>
@import "../assets/general.css";
</style>

<style scoped>
.placeholder {
  padding: 0.5em 0;
  color: #666;
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
  text-decoration: none;
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

.icon {
  fill: #000;
  width: 16px;
  height: 16px;
  display: inline-block;
  vertical-align: middle;
}

.entry-gallery {
  width: 100%;
  margin-top: 0.4em;
  overflow: hidden;
  background-color: #f5f5f5;
}

.entry-gallery.single-image {
  max-height: 400px;
}

.entry-gallery.single-image .entry-image {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
}

body.dark .entry-gallery {
  background-color: #2a2a2a;
}
</style>
