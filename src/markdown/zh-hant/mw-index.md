<script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import NxGallery from '../../components/next/NxGallery.vue'

  defineProps({
      lastUpdate: String
  })

  const currentTab = ref("remake")

  const imagesRemake = [
    "/data/mw-index/MWR1.webp",
    "/data/mw-index/MWR2.webp",
    "/data/mw-index/MWR3.webp",
    "/data/mw-index/MWR4.webp",
    "/data/mw-index/MWR5.webp",
    "/data/mw-index/MWR6.webp",
    "/data/mw-index/MWR7.webp",
    "/data/mw-index/MWR8.webp",
    "/data/mw-index/MWR9.webp",
    "/data/mw-index/MWR10.webp",
  ]

  const imagesSmwp = [
    "/data/mw-index/smwp-title.webp",
    "/data/mw-index/smwp-editor.webp",
    "/data/mw-index/smwp-blocks.webp",
    "/data/mw-index/smwp-musicselector.webp",
    "/data/mw-index/smwp-additional.webp",
    "/data/mw-index/smwp-decade.webp",
    "/data/mw-index/smwp-nightsand.webp",
    "/data/mw-index/smwp-classicepic.webp",
    "/data/mw-index/smwp-muitfaceted.webp",
  ]

  const currentImages = computed(() => {
    if (currentTab.value === "remake") {
      return imagesRemake
    } else if (currentTab.value === "smwp") {
      return imagesSmwp
    }
    return imagesRemake
  })

  const tabs = [
    { id: "remake", label: "Mario Worker Remake" },
    { id: "smwp", label: "Super Mario Worker Project" }
  ]

  onMounted(() => {
  })

  onBeforeUnmount(() => {
  })
</script>

這裡有數款 Mario Forever 的官方及非官方關卡編輯器，通常統稱為 Mario Worker。

<p v-if="lastUpdate" class="last-update" style="font-weight: bold;">最後更新：{{ lastUpdate }}</p>

## 下載原版 Mario Worker

原版 Mario Worker 原名為 Mario Forever Editor，是由 Buziol Games（Softendo）開發的 Mario Forever 關卡編輯器。使用者可以透過它建立、編輯、上傳、下載及遊玩自訂的 Mario Forever 關卡。目前已知此編輯器存在兩個本質上不同的開發分支：Mario Worker 1.0 和 Mario Worker 1.1；後者在中文 Mario Forever 社群中通常統稱為 Mario Worker 4.x。

<a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/original-mw/Mario%20Worker%201.0.exe">下載 Mario Worker 1.0</a><a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/original-mw/Mario%20Worker%204.4%20(2009).exe">下載 Mario Worker 1.1（2009 年版）</a><a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/original-mw/Mario%20Worker%204.4%20(2011).exe">下載 Mario Worker 1.1（2011 年版）</a>

Mario Worker 1.0 於 2004 年發布，使用 Multimedia Fusion 1.5 製作。作者無意間洩漏了其原始碼，而這份原始碼也成為現今大多數 Mario Forever 同人遊戲的起源。雖然具備基本功能，但 MW 1.0 的完成度相對較低，且存在一些錯誤。後來推出的 Mario Worker Remake 便是以這份原始碼為基礎開發，目前也是最受歡迎的 Mario Worker 變體之一。直到約 2012 年，MW 1.0 的存在才逐漸為社群所知。

Mario Worker 1.1 則代表了另一個獨立重新開發的編輯器分支。其第一個版本於 2006 年隨 Mario Forever 4.0 一同推出，是使用 Game Maker 6 製作的關卡編輯器。與 MW 1.0 不同，MW 1.1 在物理特性、遊戲機制及圖像方面，都與 Mario Forever 和 Mario Worker 1.0 存在顯著差異，因此玩家往往會感到陌生，新手也較難適應。最初的 MW 1.1 版本包含大量錯誤，若不經修改，便無法在 Windows Vista 或更新版本的 Windows 上正常執行。2008 年，Buziol 將引擎升級至 Game Maker 7，並修正了多項問題，更新後的版本隨 Mario Forever 4.1 一同推出。由於這些版本分別隨特定版本的 Mario Forever 發布，中文社群便將它們分別稱為 Mario Worker 4.0 和 Mario Worker 4.1。2009 年，Buziol（當時已更名為 Softendo）發布了 MW 1.1 的獨立安裝程式。由於發布時間與 Mario Forever 4.4 相近，中文社群便非正式地將其稱為 Mario Worker 4.4。除了品牌標誌從 Broshome 更改為 Softendo 之外，這個獨立版本幾乎與 4.1 版完全相同，也是 MW 1.1 的最終版本。

## 下載 Mario Worker Remake

Mario Worker Remake 是由 TheMarioVariable 開發、對 Mario Worker 1.0 關卡編輯器進行全面改造的版本。

<a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/mario-worker-remake/MWRemake%20v3.03.rar">下載 Mario Worker Remake v3.03</a><a class="md-button" target="_blank" href="https://www.themariovariable.org/mario-forever/mario-worker-remake/">Mario Worker Remake 官方網站</a><a class="md-button" target="_blank" href="https://marioworkerdatabase.altervista.org/">Mario Worker Remake Database</a>

與 MW 1.0 相比，Mario Worker Remake 增加了許多新功能，例如新的物件、敵人、背景、音樂，以及自動捲動畫面、可編輯背景漸層色彩等設定。

此編輯器最初與 Mario Forever Remake 一同發布，但從 v3.0 開始改為獨立發布。

## 下載 Super Mario Worker Project

Super Mario Worker Project（SMWP）是由 INNOVATION LEAP 開發、以 Mario Worker 1.1 為基礎，並使用 Game Maker 8 製作的 Mario 關卡編輯器。

<a class="md-button" target="_blank" href="https://file.marioforever.net/smwp">下載 Super Mario Worker Project</a><a class="md-button" target="_blank" href="https://smwp.marioforever.net/">Super Mario Worker Project 官方網站</a><a class="md-button" target="_blank" href="https://github.com/InnovationLeap/Super-Mario-Worker-Project-GM82">SMWP 原始碼儲存庫</a>

SMWP 在保留原有物理特性及關卡格式結構的同時，透過加入新元素和修正各種錯誤，進一步改良並擴充了 MW 1.1。

SMWP 預設使用 `.smwl` 格式儲存關卡，並向下相容舊版 SMWP 製作的關卡，以及 MW 1.1 的 `.mfl` 關卡。但它不會以 `.mfl` 格式儲存關卡。

自 v1.7.13-beta1 起，SMWP 改用升級版的 [Game Maker 8.2](https://gm82.cherry-treehouse.com/) 引擎，並已開放原始碼。

## 下載 Mario Worker: Community Edition

Mario Worker: Community Edition 是由 Meteo Dream 開發、以 Godot 4 的 Thunder Engine 為基礎製作的 Mario Forever 關卡編輯器。目前仍處於原型開發階段。

<a class="md-button" target="_blank" href="https://nx.wtf/s/aVtZ?path=Games%2FMario%20Worker%20-%20Community%20Edition">下載 Mario Worker: Community Edition</a><a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/mario-worker-ce">下載 Mario Worker: Community Edition（社群資源網站）</a><a class="md-button" target="_blank" href="https://github.com/meteo-dream/mario-worker-ce">MW:CE 原始碼儲存庫</a>

## 截圖預覽

<div class="radio-inputs">
  <a
    v-for="tab in tabs"
    :key="tab.id"
    class="radio"
    :class="{ 'checked': currentTab === tab.id }"
    @click="currentTab = tab.id"
  >
    <span class="radio-text">
      {{ tab.label }}
    </span>
  </a>
</div>
<NxGallery :key="currentTab" :images="currentImages" alt="Mario Worker" :max-height="480" :autoplay="3000" />

## 其他 Mario Worker 變體

### Mario Worker 2

Mario Worker 2 是由 Rubis et Cie 開發、類似 MW 1.1 的關卡編輯器，使用 GameMaker Studio 1 製作。它與 MW 1.1 及其他任何 MW 變體均不相容。

<a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/other-mw-programs/Mario%20Worker%202.2.exe">下載 Mario Worker 2.2</a>

### Mario Constructor Master

Mario Constructor Master 是 Mario Worker 2 的後繼作品，由 Rubis et Cie 和 TheMarioVariable 共同開發。此專案採用 C++ 開發，並已開放原始碼。

<a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/mario-constructor-master/Mario.Constructor.Master.2.3.zip">下載 Mario Constructor Master 2.3</a><a class="md-button" target="_blank" href="https://github.com/RubisetCie/mario-constructor-master">Mario Constructor Master 原始碼儲存庫</a>

### Mario Worker Android

Mario Worker Android 是由 Alexandro Games 開發、以 Mario Worker 1.0 為基礎製作的 Mario Forever 關卡編輯器。它與其他以 MW 1.0 為基礎的編輯器均不相容。

<a class="md-button" target="_blank" href="https://www.mediafire.com/file/peppr8pao5sxfxd/Mario_Worker_Android_v1.3.1.apk/file">下載 Mario Worker Android v1.3.1</a><a class="md-button" target="_blank" href="https://alexandrogames.altervista.org/mario-worker-android/">Mario Worker Android 官方網站</a>

### Mario Constructor Forever

Mario Constructor Forever 是由 glider521al 開發、使用 GameMaker 7 製作的 Mario Forever 風格關卡編輯器，其物理特性與原版 Mario Forever 及 Mario Worker 4.x 不同。

<a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/other-mw-programs/MarioConstructor1.7.zip">下載 Mario Constructor Forever</a>

## 常見問題

**問：如何下載 Mario Worker 的關卡？**

**答**：目前我們沒有託管 Mario Worker Remake 等變體的關卡。不過，[Mario Worker Database](https://marioworkerdatabase.altervista.org/) 收錄了大量 MWR 關卡。本網站提供 [Mario Worker 1.1 和 Super Mario Worker Project 的關卡目錄](https://download.marioforever.net/mw-levels.html)，但目前僅提供簡體中文版本。你也可以透過網路尋找關卡，例如 YouTube、Discord 伺服器及 Mario Forever 論壇。

**問：Mario Worker Remake 是否向下相容 MW 1.0 的關卡？**

**答**：Mario Worker 的不同變體通常彼此不相容，即使其中一些是以原版 MW 為基礎開發的也一樣。唯一值得注意的例外是 Super Mario Worker Project，它向下相容 MW 1.1。一般而言，建議使用製作關卡時所使用的相同版本來遊玩該關卡。

## Mario Worker 關卡格式索引

- `mfs` - Mario Worker 1.0, Mario Worker 1.1 (Scenario), Super Mario Worker Project v0.x (Scenario), Mario Worker Remake v1.2~v2.1.0.5
- `mfl` - Mario Worker 1.1 (Level), Super Mario Worker Project v0.x (Level)
- `mfes` - Mario Worker Remake v2.5
- `mfel` - Mario Worker Remake v3.0
- `mfsc` - Mario Worker Remake (Scenario)
- `mfem` - Mario Worker Remake (Map) 
- `smwl` - Super Mario Worker Project v1.x (Level)
- `smws` - Super Mario Worker Project v1.x (Scenario)
- `smwp` - Super Mario Worker Project v1.4+ (Protected Scenario)
- `scn` / `tscn` - Mario Worker: Community Edition (Level)
- `mwl` - Mario Worker 2 (Level)
- `mws` - Mario Worker 2 (Scenario)
- `mlws` - Mario Worker Android (Level)
- `mwws` - Mario Worker Android (Scenario)
- `cml` - Mario Constructor Master (Level)
- `cms` - Mario Constructor Master (Scenario/Suite)
- `cmw` - Mario Constructor Master (Map/World)

<style scoped>
  .radio-inputs {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    border-radius: 0.5rem;
    background-color: #EEE;
    box-sizing: border-box;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
    font-size: 14px;
    border: 1px solid #ddd;
    margin-bottom: 20px;
    line-height: 1.2em;
  }

  .radio-inputs .radio {
    flex: 1 1 auto;
    text-align: center;
    border-radius: 0.35rem;
    margin: 0.2rem;
  }

  .radio-inputs .radio-text {
    display: flex;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    border: none;
    padding: .5rem;
    color: rgba(51, 65, 85, 1);
    display: inline-block;
  }

  @media (min-width: 864px) {
    .radio-inputs .radio {
      flex: 1 1 0;
    }
  }

  .radio-inputs .radio.checked {
    background-color: #fff;
    font-weight: 600;
  }

  .radio-inputs .radio:hover {
    background-color: #f7f7f7;
  }

  body.dark .radio-inputs {
    background-color: #3a3a3a;
    border-color: #444;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.3);
  }

  body.dark .radio-inputs .radio-text {
    color: rgba(220, 220, 220, 1);
  }

  body.dark .radio-inputs .radio.checked {
    background-color: #4a4a4a;
  }

  body.dark .radio-inputs .radio:hover {
    background-color: #555;
  }

</style>
