<script setup>
import { ref, onMounted, onBeforeUnmount, watch, defineAsyncComponent } from "vue"
import { useFloating, flip, shift, offset, autoUpdate } from "@floating-ui/vue"
import { getLanguage } from "../util/Language.js"
import { parseVer } from "../util/Misc.js"
import { getName, getDownloadEntries } from "../util/GemeUtil.js"
import { ensureAssetsList, findAssetsByName, resolveVariantRaw } from "../util/useAssetsList.js"
import ClipboardButton from "./ButtonClipboard.vue"
import AssetCard from "./AssetCard.vue"
import { disableScroll, enableScroll } from "../util/OverlayScrollbarsUtil.js"

const FullscreenModal = defineAsyncComponent(() => import("./FullscreenModal.vue"))

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: null
  },
  ver: {
    type: String,
    default: null
  }
})

const lan = ref(getLanguage())

const handleLanguageChanged = (event) => {
  const nextLan = event?.detail?.language || getLanguage()
  lan.value = nextLan
}

const asset = ref(null)
const isLoading = ref(true)
const notFound = ref(false)
const selectedDownload = ref(null)
const tiebaDialog = ref(null)
const selectedAssetDetail = ref(null)

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

watch([selectedDownload, tiebaDialog, selectedAssetDetail], ([newDownload, newTieba, newAssetDetail]) => {
  if (newDownload || newTieba || newAssetDetail) {
    document.documentElement.classList.add("modal-open")
    document.body.classList.add("modal-open")
    disableScroll()
  } else {
    document.documentElement.classList.remove("modal-open")
    document.body.classList.remove("modal-open")
    enableScroll()
  }
})

const applyVariant = (entry, desiredVariant, desiredVer) => {
  const exact = resolveVariantRaw(entry, desiredVariant, desiredVer)
  if (exact) {
    const key = Object.keys(exact)[0]
    return {
      ...entry,
      currentVer: parseVer(exact),
      currentVerStr: key,
      _variantName: desiredVariant ? key : null
    }
  }

  if (desiredVariant) {
    const byVariant = resolveVariantRaw(entry, desiredVariant, null)
    if (byVariant) {
      const key = Object.keys(byVariant)[0]
      return {
        ...entry,
        currentVer: parseVer(byVariant),
        currentVerStr: key,
        _variantName: key
      }
    }
  }

  if (desiredVer) {
    const byVer = resolveVariantRaw(entry, null, desiredVer)
    if (byVer) {
      const key = Object.keys(byVer)[0]
      return {
        ...entry,
        currentVer: parseVer(byVer),
        currentVerStr: key,
        _variantName: null
      }
    }
  }

  return entry
}

const selectBestCandidate = (candidates) => {
  const scored = candidates.map((entry) => {
    const date = entry?.currentVer?.date instanceof Date ? entry.currentVer.date.getTime() : -1
    const variantCount = Array.isArray(entry.ver) ? entry.ver.length : 0
    const hasExact = !!resolveVariantRaw(entry, props.variant, props.ver)
    const hasVariant = props.variant ? !!resolveVariantRaw(entry, props.variant, null) : false
    const hasVer = props.ver ? !!resolveVariantRaw(entry, null, props.ver) : false
    return { entry, date, variantCount, hasExact, hasVariant, hasVer }
  })
  scored.sort((a, b) => {
    if (a.hasExact !== b.hasExact) return a.hasExact ? -1 : 1
    if (a.hasVariant !== b.hasVariant) return a.hasVariant ? -1 : 1
    if (a.hasVer !== b.hasVer) return a.hasVer ? -1 : 1
    if (a.variantCount !== b.variantCount) return b.variantCount - a.variantCount
    return b.date - a.date
  })
  return scored[0]?.entry || null
}

const loadAsset = async () => {
  isLoading.value = true
  notFound.value = false
  await ensureAssetsList()

  const candidates = findAssetsByName(props.name)

  if (candidates.length === 0) {
    asset.value = null
    notFound.value = true
    isLoading.value = false
    return
  }

  const selected = candidates.length === 1 ? { ...candidates[0] } : { ...selectBestCandidate(candidates) }
  const resolved = applyVariant(selected, props.variant, props.ver)
  asset.value = props.variant ? resolved : { ...resolved, _variantName: null }
  isLoading.value = false
}

onMounted(() => {
  window.addEventListener("custom-language-changed", handleLanguageChanged)
  loadAsset()
})

onBeforeUnmount(() => {
  window.removeEventListener("custom-language-changed", handleLanguageChanged)
})

watch([() => props.name, () => props.variant, () => props.ver], () => {
  loadAsset()
})

function getAssetImage(assetEntry) {
  const img = assetEntry?.currentVer?.image || assetEntry?.image
  if (!img) return null
  return `/data/assets/${img}`
}

function getAssetResourceURLs(assetEntry) {
  if (!assetEntry?.currentVer || !assetEntry.currentVer.file_name) {
    return []
  }
  const fileNames = Array.isArray(assetEntry.currentVer.file_name)
    ? assetEntry.currentVer.file_name.filter(fn => fn != null)
    : [assetEntry.currentVer.file_name]

  return fileNames.map((fileName) => {
    const encodedFileName = encodeURIComponent(fileName)
    let url
    if (assetEntry.type === "effect") {
      url = `https://file.marioforever.net/Mario Forever/引擎/CTF特效/${encodedFileName}`
    } else if (assetEntry.type === "addon") {
      url = `https://file.marioforever.net/Mario Forever/引擎/拓展资源包/${encodedFileName}`
    } else if (assetEntry.type === "engine") {
      const path = assetEntry.path || ""
      const encodedPath = path ? encodeURIComponent(path) + "/" : ""
      url = `https://file.marioforever.net/Mario Forever/引擎/${encodedPath}${encodedFileName}`
    } else if (assetEntry.type === "sprite") {
      url = `https://file.marioforever.net/Mario Forever/游戏素材/${encodedFileName}`
    } else if (assetEntry.type === "tool") {
      url = `https://file.marioforever.net/Mario Forever/游戏工具/${encodedFileName}`
    } else if (assetEntry.type === "mwtool") {
      url = `https://file.marioforever.net/Mario Worker/辅助工具/${encodedFileName}`
    }

    let displayFileName = fileName.split("/").pop()
    displayFileName = displayFileName.replace(/\.[^.]*$/, "")
    try {
      displayFileName = decodeURIComponent(displayFileName)
    } catch (error) {
      console.error("Failed to decode URI component:", displayFileName, error)
    }

    return {
      name: fileNames.length > 1 ? `社区资源站（${displayFileName}）` : "社区资源站",
      url
    }
  })
}
</script>

<template>
  <div class="assets-entry">
    <div v-if="isLoading" class="placeholder">
      {{ lan === "zh" ? "加载中…" : "Loading…" }}
    </div>
    <div v-else-if="notFound" class="placeholder">
      {{ lan === "zh" ? `未找到资源：${name}` : `Not found: ${name}` }}
    </div>
    <template v-else>
      <AssetCard
        :asset="asset"
        :get-asset-image="getAssetImage"
        @select-download="(entry) => { selectedDownload = entry }"
        @show-tooltip="(obj) => tooltipMouseEnter(obj)"
        @hide-tooltip="(obj) => tooltipMouseLeave(obj)"
        @show-tieba-dialog="(data) => { tiebaDialog = data }"
        @open-modal="(entry) => { selectedAssetDetail = entry }"
      />
    </template>

    <Transition name="modal">
      <div v-if="selectedDownload != null" class="modal-bg" @click="selectedDownload = null;">
        <div class="modal-content" @click.stop="">
          <div>
            下载 {{ getName(selectedDownload, lan) }}{{ selectedDownload._variantName ? ` (${selectedDownload._variantName})` : '' }}{{ selectedDownload.currentVer && selectedDownload.currentVer.ver ? ` ${selectedDownload.currentVer.ver}` : '' }}
          </div>
          <div class="button-line">
            <span v-if="getAssetResourceURLs(selectedDownload).length > 0">
              <a
                class="download"
                v-for="url in getAssetResourceURLs(selectedDownload)"
                :key="url.url"
                :href="url.url"
                target="_blank"
              >{{ url.name }}</a>
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
            <a class="download" :href="tiebaDialog.originalUrl" target="_blank">百度贴吧源站</a>
            <a class="download" :href="tiebaDialog.archiveUrl" target="_blank">社区备份站</a>
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
  </div>
</template>

<style scoped>
@import "../assets/general.css";
</style>

<style scoped>
.assets-entry {
  display: inline-block;
  width: 100%;
  vertical-align: top;
  box-sizing: border-box;
}

@media (min-width: 900px) {
  .assets-entry:has(+ .assets-entry),
  .assets-entry + .assets-entry {
    width: calc((100% - 0.5em) / 2);
  }

  .assets-entry:has(+ .assets-entry) {
    margin-right: 0.5em;
  }

  .assets-entry + .assets-entry {
    margin-right: 0;
  }
}

@media (min-width: 900px) and (max-width: 1199px) {
  .assets-entry + .assets-entry + .assets-entry:not(:has(+ .assets-entry)) {
    margin-top: 0.5em;
    width: 100%;
  }
}

@media (min-width: 1200px) {
  .assets-entry:has(+ .assets-entry + .assets-entry),
  .assets-entry:has(+ .assets-entry + .assets-entry) + .assets-entry,
  .assets-entry:has(+ .assets-entry + .assets-entry) + .assets-entry + .assets-entry {
    width: calc((100% - 1em) / 3);
  }

  .assets-entry:has(+ .assets-entry + .assets-entry),
  .assets-entry:has(+ .assets-entry + .assets-entry) + .assets-entry {
    margin-right: 0.5em;
  }

  .assets-entry:has(+ .assets-entry + .assets-entry) + .assets-entry + .assets-entry {
    margin-right: 0;
  }
}

@media (max-width: 899px) {
  .assets-entry + .assets-entry {
    margin-top: 0.5em;
  }
}

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

.assets-entry :deep(.asset-image img) {
  max-height: 400px;
  object-fit: contain;
}

.modal-bg {
  position: fixed;
  z-index: 1001;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
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
  border-radius: 0.5em;
  overflow-y: auto;
  font-family: Helvetica, Arial, "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", "tohoma,sans-serif";
}

.button-line {
  margin-top: 0.5em;
}

.download {
  color: white;
  cursor: pointer;
  background-color: #008cff;
  padding: 0.5em;
  border-radius: 0.5em;
  margin: 0.25em;
  display: inline-block;
  line-height: 1.5em;
  text-decoration: none;
}

.download:hover,
.download:focus {
  background-color: #30acff;
  text-decoration: none;
}

.download:active {
  background-color: #007cdf;
}
</style>
