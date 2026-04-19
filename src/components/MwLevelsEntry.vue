<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, defineAsyncComponent } from "vue"
import { useFloating, flip, shift, offset, autoUpdate } from "@floating-ui/vue"
import { getLanguage } from "../util/Language.js"
import { getDownloadCode, getDownloadDesc, getDownloadInfo, getDownloadLink, getName, getVideoDesc, getCodeLabel } from "../util/GameUtil.js"
import { getGameImageSync, getShowcaseImagesSync, loadImageIndex } from "../util/ImageUtil.js"
import { ensureMwList, findMwByName } from "../util/useMwList.js"
import { Carousel, Slide, Navigation } from "vue3-carousel"
import "vue3-carousel/dist/carousel.css"
import ClipboardButton from "./ButtonClipboard.vue"
import GameCard from "./GameCard.vue"
import { disableScroll, enableScroll } from "../util/OverlayScrollbarsUtil.js"

const FullscreenModal = defineAsyncComponent(() => import("./FullscreenModal.vue"))
const props = defineProps({
  name: {
    type: String,
    required: true
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

const level = ref(null)
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

const selectBestCandidate = (candidates) => {
  const scored = candidates.map((entry) => {
    const titleImage = getGameImageSync(entry, "mw-levels")
    const showcases = getShowcaseImagesSync(entry, "mw-levels")
    const imageCount = (titleImage ? 1 : 0) + (showcases ? showcases.length : 0)
    const date = entry?.date instanceof Date ? entry.date.getTime() : -1
    return {
      entry,
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

  return scored[0]?.entry || null
}

const loadLevel = async () => {
  isLoading.value = true
  notFound.value = false
  await ensureMwList()

  const candidates = findMwByName(props.name)

  if (candidates.length === 0) {
    level.value = null
    notFound.value = true
    isLoading.value = false
    return
  }

  const imageIndexTask = ensureImageIndex()
  const shouldAwaitImageIndex = candidates.length > 1
  if (shouldAwaitImageIndex) {
    await imageIndexTask
  }

  level.value = candidates.length === 1 ? { ...candidates[0] } : { ...selectBestCandidate(candidates) }
  isLoading.value = false
}

let resizeObserver = null

onMounted(() => {
  window.addEventListener("custom-language-changed", handleLanguageChanged)
  window.addEventListener("resize", updateIsMobile)
  updateIsMobile()
  loadLevel()

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
  level.value = null
  notFound.value = false
  isLoading.value = true
  loadLevel()
})

const gallery = computed(() => {
  imageIndexLoaded.value
  if (!level.value) return []
  const images = []
  const title = getGameImageSync(level.value, "mw-levels")
  if (title) images.push(title)

  const showcases = getShowcaseImagesSync(level.value, "mw-levels")
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
</script>

<template>
  <div ref="entryRef" class="mw-entry">
    <div v-if="isLoading" class="placeholder">
      {{ lan === "zh" ? "加载中…" : "Loading…" }}
    </div>
    <div v-else-if="notFound" class="placeholder">
      {{ lan === "zh" ? `未找到作品：${name}` : `Not found: ${name}` }}
    </div>
    <template v-else>
      <GameCard
        :game="level"
        :lan="lan"
        :get-game-image="getGameImage"
        @select-game="(entry) => { selectedDownload = entry }"
        @select-videos="(entry) => { selectedVideo = entry }"
        @select-version="(entry) => { level = entry }"
        @show-tooltip="(obj) => tooltipMouseEnter(obj)"
        @hide-tooltip="(obj) => tooltipMouseLeave(obj)"
        @show-tieba-dialog="(data) => { tiebaDialog = data }"
        @show-game-detail="(entry) => { selectedGameDetail = entry }"
      >
        <template v-if="gallery.length === 1" #gallery>
          <div class="entry-gallery single-image">
            <img
              :src="gallery[0]"
              :alt="getName(level, lan)"
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
                  :alt="getName(level, lan)"
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
            {{ lan == 'en' ? 'Download' : '下载' }} {{ getName(selectedDownload, lan) }}
          </div>
          <div class="button-line">
            <span v-if="selectedDownload.file_urls">
              <a
                class="download"
                v-for="url in selectedDownload.file_urls"
                :key="url.url"
                :href="url.url"
                target="_blank"
              >{{ url.name }}</a>
            </span>
            <a
              class="download"
              v-if="getDownloadLink(selectedDownload, lan)"
              :href="getDownloadLink(selectedDownload, lan)"
              target="_blank"
            >{{ getDownloadDesc(selectedDownload, lan) }}</a>
            <ClipboardButton
              v-if="getDownloadCode(selectedDownload, lan)"
              :code="getDownloadCode(selectedDownload, lan)"
              :link="getDownloadLink(selectedDownload, lan)"
              :lan="lan"
            ></ClipboardButton>
          </div>
          <div v-if="selectedDownload.currentVer && (selectedDownload.currentVer.data_download_url || (selectedDownload.currentVer.data_file_urls && selectedDownload.currentVer.data_file_urls.length > 0))" class="button-line" style="margin-top: 8px;">
            <span>{{ lan == 'en' ? `Download ${getName(selectedDownload, lan)} Data` : `下载 ${getName(selectedDownload, lan)} 数据包` }}</span>
          </div>
          <div v-if="selectedDownload.currentVer && (selectedDownload.currentVer.data_download_url || (selectedDownload.currentVer.data_file_urls && selectedDownload.currentVer.data_file_urls.length > 0))" class="button-line">
            <span v-if="selectedDownload.currentVer.data_file_urls">
              <a
                class="download"
                v-for="url in selectedDownload.currentVer.data_file_urls"
                :key="url.url"
                :href="url.url"
                target="_blank"
              >{{ url.name }}</a>
            </span>
            <template v-if="selectedDownload.currentVer.data_download_url">
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
            <ul>
              <li v-for="video in (selectedVideo.video || [])" :key="Object.keys(video)[0]">
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
            <a class="download" :href="tiebaDialog.originalUrl" target="_blank">{{ lan == 'en' ? 'Baidu Tieba (tieba.baidu.com)' : '百度贴吧源站' }}</a>
            <a class="download" :href="tiebaDialog.archiveUrl" target="_blank">{{ lan == 'en' ? 'Tieba Archive (archive.marioforever.net)' : '社区备份站' }}</a>
          </div>
        </div>
      </div>
    </Transition>

    <FullscreenModal
      :show="selectedGameDetail != null"
      :game="selectedGameDetail"
      :lan="lan"
      category="mw-levels"
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
.mw-entry {
  display: inline-block;
  width: 100%;
  vertical-align: top;
  box-sizing: border-box;
}

@media (max-width: 600px) {
  .mw-entry {
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
  }
}

@media (min-width: 900px) {
  .mw-entry:has(+ .mw-entry),
  .mw-entry + .mw-entry {
    width: calc((100% - 0.5em) / 2);
  }

  .mw-entry:has(+ .mw-entry) {
    margin-right: 0.5em;
  }

  .mw-entry + .mw-entry {
    margin-right: 0;
  }
}

@media (min-width: 900px) and (max-width: 1199px) {
  .mw-entry + .mw-entry + .mw-entry:not(:has(+ .mw-entry)) {
    margin-top: 0.5em;
    width: 100%;
  }
}

@media (min-width: 1200px) {
  .mw-entry:has(+ .mw-entry + .mw-entry),
  .mw-entry:has(+ .mw-entry + .mw-entry) + .mw-entry,
  .mw-entry:has(+ .mw-entry + .mw-entry) + .mw-entry + .mw-entry {
    width: calc((100% - 1em) / 3);
  }

  .mw-entry:has(+ .mw-entry + .mw-entry),
  .mw-entry:has(+ .mw-entry + .mw-entry) + .mw-entry {
    margin-right: 0.5em;
  }

  .mw-entry:has(+ .mw-entry + .mw-entry) + .mw-entry + .mw-entry {
    margin-right: 0;
  }
}

@media (max-width: 899px) {
  .mw-entry + .mw-entry {
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
</style>
