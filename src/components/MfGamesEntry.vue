<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, defineAsyncComponent } from "vue"
import { useFloating, flip, shift, offset, autoUpdate } from "@floating-ui/vue"
import { getLanguage } from "../util/Language.js"
import { parseVer } from "../util/Misc.js"
import { getDataResourceURL, getDownloadEntries, getDownloadInfo, getName, getResourceURL, getVideoDesc, getCodeLabel } from "../util/GemeUtil.js"
import { getGameImageSync, getShowcaseImagesSync, loadImageIndex } from "../util/ImageUtil.js"
import { ensureMfList, findMfByName, resolveVerRaw } from "../util/useMfList.js"
import { Carousel, Slide, Navigation } from "vue3-carousel"
import "vue3-carousel/dist/carousel.css"
import ClipboardButton from "./ButtonClipboard.vue"
import Tooltip from "./ToolTip.vue"
import { QuestionIcon } from "./icons/Icons.js"
import GameCard from "./GameCard.vue"
import { disableScroll, enableScroll } from "../util/OverlayScrollbarsUtil.js"

const FullscreenModal = defineAsyncComponent(() => import("./FullscreenModal.vue"))

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  ver: {
    type: String,
    default: null
  }
})

let imageIndexPromise = null
const imageIndexLoaded = ref(false)

const ensureImageIndex = async () => {
  if (imageIndexPromise) return imageIndexPromise
  imageIndexPromise = loadImageIndex().then((index) => {
    imageIndexLoaded.value = true
    return index
  })
  return imageIndexPromise
}

const lan = ref(getLanguage())

const handleLanguageChanged = (event) => {
  const nextLan = event?.detail?.language || getLanguage()
  lan.value = nextLan
}

const game = ref(null)
const isLoading = ref(true)
const notFound = ref(false)
const selectedDownload = ref(null)
const selectedVideo = ref(null)
const tiebaDialog = ref(null)
const selectedGameDetail = ref(null)
const isMobile = ref(false)
const entryRef = ref(null)
const entryWidth = ref(0)

function updateIsMobile() {
  isMobile.value = window.innerWidth <= 800
}

const itemsToShow = computed(() => entryWidth.value > 0 && entryWidth.value < 600 ? 1 : 2)

const shouldUseCompactSlide = computed(() => entryWidth.value > 0 && entryWidth.value < 600)

const reference = ref(null)
const floating = ref(null)
const floatingText = ref(null)
const { floatingStyles } = useFloating(reference, floating,
  {
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

watch([selectedDownload, selectedVideo, tiebaDialog, selectedGameDetail], ([newDownload, newVideo, newTieba, newDetail]) => {
  if (newDownload || newVideo || newTieba || newDetail) {
    document.documentElement.classList.add("modal-open")
    document.body.classList.add("modal-open")
    disableScroll()
  } else {
    document.documentElement.classList.remove("modal-open")
    document.body.classList.remove("modal-open")
    enableScroll()
  }
})

const selectBestCandidate = (candidates, desiredVerStr) => {
  const scored = candidates.map((entry) => {
    const verRaw = resolveVerRaw(entry, desiredVerStr)
    const verKey = verRaw ? Object.keys(verRaw)[0] : entry.currentVerStr
    const verObj = verRaw ? parseVer(verRaw) : entry.currentVer
    const probe = {
      ...entry,
      currentVerStr: verKey,
      currentVerStrAlt: verObj ? verObj.ver_alt : null,
      currentVer: verObj
    }

    const titleImage = getGameImageSync(probe, "mf-games")
    const showcases = getShowcaseImagesSync(probe, "mf-games")
    const imageCount = (titleImage ? 1 : 0) + (showcases ? showcases.length : 0)
    const date = verObj?.date instanceof Date ? verObj.date.getTime() : -1

    return {
      entry,
      verRaw,
      verKey,
      verObj,
      hasImage: imageCount > 0,
      imageCount,
      date
    }
  })

  scored.sort((a, b) => {
    if (a.hasImage !== b.hasImage) return a.hasImage ? -1 : 1
    if (a.imageCount !== b.imageCount) return b.imageCount - a.imageCount
    return b.date - a.date
  })

  return scored[0] || null
}

const applyVersion = (entry, verRaw) => {
  const verKey = Object.keys(verRaw)[0]
  const verObj = parseVer(verRaw)
  return {
    ...entry,
    currentVerStr: verKey,
    currentVerStrAlt: verObj ? verObj.ver_alt : null,
    currentVer: verObj
  }
}

const loadGame = async () => {
  isLoading.value = true
  notFound.value = false
  await ensureMfList()

  const candidates = findMfByName(props.name)

  if (candidates.length === 0) {
    game.value = null
    notFound.value = true
    isLoading.value = false
    return
  }

  const imageIndexTask = ensureImageIndex()
  const shouldAwaitImageIndex = candidates.length > 1
  if (shouldAwaitImageIndex) {
    await imageIndexTask
  }

  const selected = candidates.length === 1
    ? { entry: candidates[0], verRaw: resolveVerRaw(candidates[0], props.ver) }
    : selectBestCandidate(candidates, props.ver)

  const base = selected?.entry || candidates[0]
  const verRaw = selected?.verRaw || resolveVerRaw(base, props.ver)
  let next = verRaw ? applyVersion(base, verRaw) : { ...base }
  if (props.ver && verRaw) {
    next = {
      ...next,
      ver: [verRaw]
    }
  }
  game.value = next
  isLoading.value = false
}

let resizeObserver = null

onMounted(() => {
  window.addEventListener("custom-language-changed", handleLanguageChanged)
  window.addEventListener("resize", updateIsMobile)
  updateIsMobile()
  loadGame()

  if (entryRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        entryWidth.value = entry.contentRect.width
      }
    })
    resizeObserver.observe(entryRef.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener("custom-language-changed", handleLanguageChanged)
  window.removeEventListener("resize", updateIsMobile)
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})

watch(() => props.name, () => {
  game.value = null
  notFound.value = false
  isLoading.value = true
  loadGame()
})

const gallery = computed(() => {
  imageIndexLoaded.value
  if (!game.value) return []
  const images = []
  const title = getGameImageSync(game.value, "mf-games")
  if (title) images.push(title)

  const showcases = getShowcaseImagesSync(game.value, "mf-games")
  if (Array.isArray(showcases)) {
    for (const img of showcases) {
      if (img?.url) images.push(img.url)
    }
  }

  const uniq = []
  const seen = new Set()
  for (const url of images) {
    if (!url || seen.has(url)) continue
    seen.add(url)
    uniq.push(url)
  }
  return uniq
})

const currentImageIndex = ref(0)

watch(gallery, (next) => {
  if (!next || next.length === 0) {
    currentImageIndex.value = 0
    return
  }
  if (currentImageIndex.value >= next.length) {
    currentImageIndex.value = 0
  }
})

const getGameImage = () => {
  return null
}

const handleSelectVersion = (entry) => {
  game.value = entry
}

function getTooltipType(download) {
  if (!download || !download.currentVer || !download.currentVer.file_name) {
    return "archive"
  }

  const fileName = download.currentVer.file_name.toLowerCase()
  if (fileName.includes("install") || fileName.includes("setup") || fileName.includes("安装")) {
    return "installer"
  }
  if (fileName.endsWith(".exe")) {
    return "exe"
  }
  if (fileName.endsWith(".apk")) {
    return "apk"
  }
  return "archive"
}

function shouldShowResourceLink(download) {
  return !!getResourceURL(download, lan.value)
}

function getDownloadEntriesForView(download) {
  return getDownloadEntries(download, lan.value)
}

function hasDataDownload(download) {
  if (!download?.currentVer) return false
  return !!download.currentVer.data_download_url || !!getDataResourceURL(download, lan.value)
}
</script>

<template>
  <div ref="entryRef" class="mf-entry">
    <div v-if="isLoading" class="placeholder">
      {{ lan === "zh" ? "加载中…" : "Loading…" }}
    </div>
    <div v-else-if="notFound" class="placeholder">
      {{ lan === "zh" ? `未找到作品：${name}` : `Not found: ${name}` }}
    </div>
    <template v-else>
      <GameCard
        :game="game"
        :lan="lan"
        :get-game-image="getGameImage"
        @select-game="(entry) => { selectedDownload = entry }"
        @select-videos="(entry) => { selectedVideo = entry }"
        @select-version="handleSelectVersion"
        @show-tooltip="(obj) => tooltipMouseEnter(obj)"
        @hide-tooltip="(obj) => tooltipMouseLeave(obj)"
        @show-tieba-dialog="(data) => { tiebaDialog = data }"
        @show-game-detail="(entry) => { selectedGameDetail = entry }"
      >
        <template v-if="gallery.length === 1" #gallery>
          <div class="entry-gallery single-image">
            <img
              :src="gallery[0]"
              :alt="getName(game, lan)"
              class="entry-image"
              decoding="async"
            />
          </div>
        </template>
        <template v-else-if="gallery.length > 1" #gallery>
          <div class="entry-gallery">
            <Carousel
              :autoplay="3000"
              v-model="currentImageIndex"
              :items-to-show="itemsToShow"
              :wrap-around="true"
            >
              <Slide v-for="img in gallery" :key="img" :style="shouldUseCompactSlide ? '' : 'width: 50%; aspect-ratio: 4/3;'">
                <img
                  :src="img"
                  :alt="getName(game, lan)"
                  class="entry-image"
                  decoding="async"
                />
              </Slide>
              <template #addons>
                <Navigation />
              </template>
            </Carousel>
          </div>
        </template>
      </GameCard>
    </template>

    <Transition name="modal">
      <div v-if="selectedDownload != null" class="modal-bg" @click="selectedDownload = null;">
        <div class="modal-content" @click.stop="">
          <div>
            {{ lan == 'en' ? "Download" : "下载" }} {{ getName(selectedDownload, lan) }} {{ lan == 'en' && selectedDownload.currentVerStrAlt ? selectedDownload.currentVerStrAlt : selectedDownload.currentVerStr }}
            <Tooltip
              v-if="lan == 'zh'"
              :in-card="false"
              @show-tooltip="(obj)=>tooltipMouseEnter(obj)"
              @hide-tooltip="(obj) => tooltipMouseLeave(obj)"
            >
              <QuestionIcon class="icon button-shift" style="vertical-align: middle; cursor: help;" />
              <template #popper>
                <span v-if="isMobile && getTooltipType(selectedDownload) === 'apk'" style="text-align: left; display: block;">
                  本作品为 .apk 文件，可在安卓手机上直接安装运行。<br>
                  安装前请确保设备允许安装“未知来源”的应用。
                </span>
                <span v-else-if="isMobile" style="text-align: left; display: block;">
                  您当前正在使用手机浏览本页面。本作品为电脑平台设计，通常无法在手机上直接运行。<br>
                  如需游玩，请将下载的文件传输至电脑并在电脑上操作。
                </span>
                <template v-else>
                  <span v-if="getTooltipType(selectedDownload) === 'installer'" style="text-align: left; display: block;">
                    本作品以安装程序形式提供，需运行安装程序完成安装，建议选择非系统盘作为安装路径。<br>
                    安装完成后，打开桌面快捷方式即可启动游戏。
                  </span>
                  <span v-else-if="getTooltipType(selectedDownload) === 'exe'" style="text-align: left; display: block;">
                    本作品为可执行文件（.exe），可以直接打开运行。<br>
                    建议将其放在一个独立文件夹中，避免与其他作品的文件混合存放，不要将文件放在桌面。
                  </span>
                  <span v-else-if="getTooltipType(selectedDownload) === 'apk'" style="text-align: left; display: block;">
                    本作品为 .apk 文件，为安卓设备专用，电脑无法直接运行。<br>
                    请在安卓设备上安装后游玩。
                  </span>
                  <span v-else style="text-align: left; display: block;">
                    本作品以压缩包形式提供，需使用解压软件（如 7-Zip）解压。<br>
                    请将所有文件解压至一个单独文件夹，避免与其他作品的文件混合存放，不要将文件放在桌面。<br>
                    解压完成后，打开生成的 .exe 文件即可启动游戏。
                  </span>
                </template>
              </template>
            </Tooltip>
          </div>
          <div v-if="selectedDownload.currentVer && selectedDownload.currentVer.repacker" class="italic">
            {{ lan == "en" ? `Repackaged by ${selectedDownload.currentVer.repacker_alt ? selectedDownload.currentVer.repacker_alt : selectedDownload.currentVer.repacker}.` : `该版本由 ${selectedDownload.currentVer.repacker} 重打包。` }}
            <Tooltip
              v-if="lan == 'zh'"
              :in-card="false"
              @show-tooltip="(obj)=>tooltipMouseEnter(obj)"
              @hide-tooltip="(obj) => tooltipMouseLeave(obj)"
            >
              <QuestionIcon class="icon button-shift" style="vertical-align: middle; cursor: help;" />
              <template #popper>
                <span style="text-align: left; display: block;">
                  重打包作品即由非原作者打包的 Mario Forever 作品。由于一些老作品的原下载链接已失效，作者提供的压缩包已经失传，而部分吧友的电脑中可能仍有存留，经考虑后，决定开放收录此类作品。<br>
                  <br>
                  重打包作品收录的原则是：<br>
                  1. 只收录原压缩包已失传的作品；<br>
                  2. 作品内容（包括游戏本体、自带文档、BGM 等）不得被篡改；<br>
                  3. 不影响游戏游玩的文件（BGM 除外）在保证不破坏游戏本体完整性的前提下可以缺失，但不得随意增删文件；<br>
                  4. 重打包的作品不应包含游玩过的存档文件。
                </span>
              </template>
            </Tooltip>
          </div>
          <div class="button-line">
            <a
              class="download"
              v-if="shouldShowResourceLink(selectedDownload)"
              :href="getResourceURL(selectedDownload, lan)"
              target="_blank"
            >{{ lan == "en" ? "file.marioforever.net" : "社区资源站" }}</a>
            <template v-for="entry in getDownloadEntriesForView(selectedDownload)" :key="entry.url">
              <a class="download" :href="entry.url" target="_blank">{{ entry.desc }}</a>
              <ClipboardButton
                v-if="entry.code"
                :code="entry.code"
                :link="entry.url"
                :lan="lan"
              ></ClipboardButton>
            </template>
          </div>
          <div v-if="hasDataDownload(selectedDownload)" class="button-line" style="margin-top: 8px;">
            <span>{{ lan == 'en' ? `Download ${getName(selectedDownload, lan)} ${selectedDownload.currentVerStrAlt || selectedDownload.currentVerStr || ''} Data` : `下载 ${getName(selectedDownload, lan)} ${selectedDownload.currentVerStr || ''} 数据包` }}</span>
          </div>
          <div v-if="hasDataDownload(selectedDownload)" class="button-line">
            <template v-if="selectedDownload.currentVer.data_download_url">
              <a
                class="download"
                v-if="getDataResourceURL(selectedDownload, lan)"
                :href="getDataResourceURL(selectedDownload, lan)"
                target="_blank"
              >{{ lan == "en" ? "file.marioforever.net" : "社区资源站" }}</a>
              <a class="download" :href="selectedDownload.currentVer.data_download_url" target="_blank">
                {{ getDownloadInfo(null, selectedDownload.currentVer.data_download_url, lan).desc }}
                <template v-if="selectedDownload.currentVer.data_code">
                  ({{ getCodeLabel(selectedDownload.currentVer.data_download_url, lan) }}: {{ selectedDownload.currentVer.data_code }})
                </template>
              </a>
              <ClipboardButton
                v-if="selectedDownload.currentVer.data_code"
                :code="selectedDownload.currentVer.data_code"
                :link="selectedDownload.currentVer.data_download_url"
                :lan="lan"
                style="margin-left:2px;"
              />
            </template>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="selectedVideo != null" class="modal-bg" @click="selectedVideo = null;">
        <div class="modal-content" @click.stop="">
          <div>
            {{ lan == 'en' ? "Related videos of " : "相关视频：" }}{{ getName(selectedVideo, lan) }}
            <ul v-if="lan == 'zh'">
              <li v-for="video in (selectedVideo.video_zh || selectedVideo.video || [])" :key="Object.keys(video)[0] + (Object.values(video)[0] || '')">
                <a :href="Object.values(video)[0]" target="_blank">{{ Object.keys(video)[0] }} ({{ getVideoDesc(Object.values(video)[0], lan) }})</a>
              </li>
            </ul>
            <ul v-if="lan == 'en'">
              <li v-for="video in (selectedVideo.video_en || selectedVideo.video || [])" :key="Object.keys(video)[0] + (Object.values(video)[0] || '')">
                <a :href="Object.values(video)[0]" target="_blank">{{ Object.keys(video)[0] }} ({{ getVideoDesc(Object.values(video)[0], lan) }})</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="tiebaDialog != null" class="modal-bg" @click="tiebaDialog = null;">
        <div class="modal-content" @click.stop="">
          <div>
            {{ lan == 'en' ? 'Choose Link to Visit' : '选择要访问的链接' }}
          </div>
          <div class="button-line">
            <a
              class="download"
              :href="tiebaDialog.originalUrl"
              target="_blank"
              @click="tiebaDialog = null;"
            >
              {{ lan == 'en' ? 'Baidu Tieba (tieba.baidu.com)' : '百度贴吧源站' }}
            </a>
            <a
              class="download"
              :href="tiebaDialog.archiveUrl"
              target="_blank"
              @click="tiebaDialog = null;"
            >
              {{ lan == 'en' ? 'Tieba Archive (archive.marioforever.net)' : '社区备份站' }}
            </a>
          </div>
        </div>
      </div>
    </Transition>

    <FullscreenModal
      :show="selectedGameDetail != null"
      :game="selectedGameDetail"
      :lan="lan"
      category="mf-games"
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
.mf-entry {
  display: inline-block;
  width: 100%;
  vertical-align: top;
  box-sizing: border-box;
}

@media (min-width: 900px) {
  .mf-entry:has(+ .mf-entry),
  .mf-entry + .mf-entry {
    width: calc((100% - 0.5em) / 2);
  }

  .mf-entry:has(+ .mf-entry) {
    margin-right: 0.5em;
  }

  .mf-entry + .mf-entry {
    margin-right: 0;
  }
}

@media (min-width: 900px) and (max-width: 1199px) {
  .mf-entry + .mf-entry + .mf-entry:not(:has(+ .mf-entry)) {
    margin-top: 0.5em;
    width: 100%;
  }
}

@media (min-width: 1200px) {
  .mf-entry:has(+ .mf-entry + .mf-entry),
  .mf-entry:has(+ .mf-entry + .mf-entry) + .mf-entry,
  .mf-entry:has(+ .mf-entry + .mf-entry) + .mf-entry + .mf-entry {
    width: calc((100% - 1em) / 3);
  }

  .mf-entry:has(+ .mf-entry + .mf-entry),
  .mf-entry:has(+ .mf-entry + .mf-entry) + .mf-entry {
    margin-right: 0.5em;
  }

  .mf-entry:has(+ .mf-entry + .mf-entry) + .mf-entry + .mf-entry {
    margin-right: 0;
  }
}

@media (max-width: 899px) {
  .mf-entry + .mf-entry {
    margin-top: 0.5em;
  }
}

.placeholder {
  padding: 0.5em 0;
  color: #666;
}

.entry-gallery {
  margin-top: 0.6em;
  background-color: #f5f5f5;
  overflow: hidden;
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

.entry-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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

.button-line {
  margin-top: .5em;
}

.italic {
  font-style: italic;
}

.button-shift {
  transform: translateY(-1px);
}

.icon {
  fill: #000;
  width: 16px;
  height: 16px;
  display: inline-block;
  vertical-align: middle;
}
</style>
