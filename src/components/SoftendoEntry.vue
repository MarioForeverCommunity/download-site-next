<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, defineAsyncComponent } from "vue"
import { useFloating, flip, shift, offset, autoUpdate } from "@floating-ui/vue"
import { getLanguage } from "../util/Language.js"
import { normalizeSoftendoList, getSoftendoGameName } from "../util/SoftendoUtil.js"
import { readList } from "../util/ReadList.js"
import { getGameImageSync, loadImageIndex } from "../util/ImageUtil.js"
import SoftendoGameCard from "./SoftendoGameCard.vue"
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

watch(selectedGameDetail, (newDetail) => {
  if (newDetail) {
    document.documentElement.classList.add("modal-open")
    document.body.classList.add("modal-open")
    disableScroll()
  } else {
    document.documentElement.classList.remove("modal-open")
    document.body.classList.remove("modal-open")
    enableScroll()
  }
})

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
