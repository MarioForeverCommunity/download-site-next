<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue"
import { useFloating, flip, shift, offset, autoUpdate } from "@floating-ui/vue"
import { getLanguage } from "../util/Language.js"
import { readList } from "../util/ReadList.js"
import { parseVer } from "../util/Misc.js"
import { getName, getDownloadEntries } from "../util/GemeUtil.js"
import ClipboardButton from "./ButtonClipboard.vue"
import AssetCard from "./AssetCard.vue"
import { disableScroll, enableScroll } from "../util/OverlayScrollbarsUtil.js"

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

let assetsListPromise = null

const ensureAssetsList = async () => {
  if (assetsListPromise) return assetsListPromise
  assetsListPromise = readList("list-assets.yaml").then((list) => {
    return list.map((entry) => normalizeAssetEntry(entry))
  })
  return assetsListPromise
}

const normalizeDate = (value) => {
  if (!value) return null
  if (value instanceof Date) return value
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const normalizeAssetEntry = (raw) => {
  const entry = { ...raw }
  if (entry.variants) {
    entry.variants = entry.variants.map((variant) => {
      const variantKey = Object.keys(variant)[0]
      const variantData = variant[variantKey]
      const date = normalizeDate(variantData?.date)
      return {
        [variantKey]: {
          ...variantData,
          date,
          download_url: entry.download_url,
          download_url_alt: entry.download_url_alt,
          code: entry.code,
          code_alt: entry.code_alt,
          source_url: entry.source_url,
          source_url_alt: entry.source_url_alt
        }
      }
    })
    entry.currentVer = parseVer(entry.variants[0])
    entry.currentVerStr = Object.keys(entry.variants[0])[0]
    entry.ver = entry.variants
    entry._variantName = entry.currentVerStr
  } else {
    const date = normalizeDate(entry.date)
    entry.currentVer = {
      ver: entry.ver,
      date,
      file_name: entry.file_name,
      download_url: entry.download_url,
      download_url_alt: entry.download_url_alt,
      code: entry.code,
      code_alt: entry.code_alt,
      source_url: entry.source_url,
      source_url_alt: entry.source_url_alt
    }
    entry.currentVerStr = entry.ver
    entry.ver = entry.ver ? [{ [entry.ver]: entry.currentVer }] : []
  }
  return entry
}

const normalizeKey = (value) => {
  return String(value || "").trim().toLowerCase()
}

const getCandidateNames = (entry) => {
  const names = []
  if (entry.name) names.push(entry.name)
  if (entry.name_alt) names.push(entry.name_alt)
  const alias = entry.alias
  if (Array.isArray(alias)) {
    for (const a of alias) {
      if (a) names.push(a)
    }
  } else if (typeof alias === "string" && alias) {
    names.push(alias)
  }
  return names
}

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

watch([selectedDownload, tiebaDialog], ([newDownload, newTieba]) => {
  if (newDownload || newTieba) {
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
    const date = entry?.currentVer?.date instanceof Date ? entry.currentVer.date.getTime() : -1
    const variantCount = Array.isArray(entry.ver) ? entry.ver.length : 0
    return { entry, date, variantCount }
  })
  scored.sort((a, b) => {
    if (a.variantCount !== b.variantCount) return b.variantCount - a.variantCount
    return b.date - a.date
  })
  return scored[0]?.entry || null
}

const loadAsset = async () => {
  isLoading.value = true
  notFound.value = false
  const list = await ensureAssetsList()

  const target = normalizeKey(props.name)
  const candidates = list.filter((entry) => {
    return getCandidateNames(entry).some((n) => normalizeKey(n) === target)
  })

  if (candidates.length === 0) {
    asset.value = null
    notFound.value = true
    isLoading.value = false
    return
  }

  asset.value = candidates.length === 1 ? { ...candidates[0] } : { ...selectBestCandidate(candidates) }
  isLoading.value = false
}

onMounted(() => {
  window.addEventListener("custom-language-changed", handleLanguageChanged)
  loadAsset()
})

onBeforeUnmount(() => {
  window.removeEventListener("custom-language-changed", handleLanguageChanged)
})

watch(() => props.name, () => {
  loadAsset()
})

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
      url = `https://file.marioforever.net/Mario Forever/引擎/CTF 特效/${encodedFileName}`
    } else if (assetEntry.type === "addon") {
      url = `https://file.marioforever.net/Mario Forever/引擎/拓展资源包/${encodedFileName}`
    } else if (assetEntry.type === "engine") {
      const path = assetEntry.path || ""
      const encodedPath = path ? encodeURIComponent(path) + "/" : ""
      url = `https://file.marioforever.net/Mario Forever/引擎/${encodedPath}${encodedFileName}`
    } else if (assetEntry.type === "sprite") {
      url = `https://file.marioforever.net/Mario Forever/游戏素材/${encodedFileName}`
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
        :get-asset-image="() => null"
        @select-download="(entry) => { selectedDownload = entry }"
        @show-tooltip="(obj) => tooltipMouseEnter(obj)"
        @hide-tooltip="(obj) => tooltipMouseLeave(obj)"
        @show-tieba-dialog="(data) => { tiebaDialog = data }"
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
</style>
