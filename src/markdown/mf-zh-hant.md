<script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import DownloadButton from "../components/ButtonDownload.vue"
  import OriginalMfTable from '../components/DesignMfTable.vue'
  import NxGallery from '../components/next/NxGallery.vue'

  defineProps({
    lastUpdateZh: String
  })

  const imagesOriginal = [
    "/data/mf-index/title.webp",
    "/data/mf-index/World_3-2.webp",
    "/data/mf-index/World_3-4.webp",
    "/data/mf-index/World_4-1.webp",
    "/data/mf-index/6-3.webp",
    "/data/mf-index/8-3.webp",
    "/data/mf-index/8-4.webp",
    "/data/mf-index/Hardcore_2-3.webp",
    "/data/mf-index/World_GRYo2_-1.webp",
    "/data/mf-index/LostMap-4.webp",
  ]

  onMounted(() => {
  })

  onBeforeUnmount(() => {
  })
</script>

<p v-if="lastUpdateZh" class="last-update" style="font-weight: bold;">最後更新：{{ lastUpdateZh }}</p>

## Mario Forever: Community Edition

**推薦版本**。適合較新型的電腦，支援控制器及高 FPS 遊戲體驗。內建多種調整選項，可自訂玩家的遊戲體驗。此外，還提供自訂角色造型，以及扮演 Luigi 進行遊戲的功能。

<MfGamesEntry name="Mario Forever: Community Edition" />

## Mario Forever Remake 及 Mario Forever Advance Remake

適合絕大多數 Windows 電腦。相較於原版 Mario Forever，在部分新型電腦上的執行表現更好。此外，遊戲還加入了數個由玩家自製的世界。這款遊戲有兩種不同版本：歐洲版（PAL）及中國版。

<MfGamesEntry name="Mario Forever Remake" /><MfGamesEntry name="Mario Forever Advance Remake" /><MfGamesEntry name="Mario Forever Remake (PAL)" />

## 原版 Mario Forever

適合追求最原汁原味遊戲體驗的玩家。4.4 及更早版本可能無法在 Windows 7 或更新版本的系統上順暢執行（這是因為它們使用以 50 FPS 運作的 Standard 渲染模式）。5.0 及更新版本的整體表現普遍不盡理想，除非出於好奇，否則不建議嘗試。

各版本的詳細更新日誌，請參閱 <a href="[https://zh.wiki.marioforever.net/wiki/%E6%B0%B8%E8%BF%9C%E7%9A%84%E9%A9%AC%E9%87%8C%E5%A5%A5](https://zh.wiki.marioforever.net/wiki/%E6%B0%B8%E8%BF%9C%E7%9A%84%E9%A9%AC%E9%87%8C%E5%A5%A5)" target="_blank">Wiki 頁面</a>。

<OriginalMfTable lan="zh-hant" />
<div class="foot-note" style="font-size:12px">

1. 在不致造成混淆的情況下，v1.16.1 可簡稱為 v1.16，但這並不代表 v1.16.1 與已失傳的 v1.16.0 相同。
2. v1.16.1 沒有免安裝版，因為其 BGM 資源檔案會被安裝至 Windows 目錄；v7.02_30 則沒有安裝版。
3. v3.50 與 v3.51 均為官方版本。本網站提供的 v3.50 安裝程式為中文二次打包版本，此版本在 World 4-2 中存在一項錯誤，導致玩家無法繼續進行遊戲；該問題已於 v3.51 中修正。
4. v5.011/v5.013 安裝後的檔案與 v5.01 完全相同，v5.08b 安裝後的檔案則與 v5.08 相同；v4.15/v5.9/v5.9s 各自都有兩個建立日期不同的安裝程式，但安裝後的檔案完全相同。
5. v5.9s/v5.9t/v5.9r 這些版本號是為了區分不同版本而指定的。v5.9r 的主程式修改日期為 2013-01-18，而[安裝程式疑似於 2014-06-26 發布](https://archive.marioforever.net/post/3258680750.html)；該版本無法正常執行。
6. v6.0 及後續版本的官方版本編號較為混亂。v6.0、v6.01、v6.1、v6.11 這些版本號是為了明確區分不同版本而指定的。v6.1/v6.11 的檔案來源為 Softendo 發布的 Super Mario Forever 2016 Pack；v6.1 的安裝版則是於 2017 年重新打包的版本。
7. v6.000027 (2018) 又稱為「Mario Forever 6.00 Fixed Version」，目前尚不清楚作者為何在 v7.02 發布後又推出此版本。
8. v7.02e 的遊戲主程式與 v7.02_31 Beta 完全相同，其安裝程式的原始檔名為 `super-mario-forever-v702e.exe`。
9. Advance v4.4 (2011) 的發布日期是以 exe 檔案的修改日期為準。
10. KIDS 版是以 v7.02 為基礎修改而成的版本，大幅降低了遊戲難度，且角色不會死亡。
11. 免安裝版移除了所有圖示檔案、URL 捷徑、解除安裝程式及工具列安裝程式。

</div>

### 截圖預覽

<NxGallery :images="imagesOriginal" alt="Mario Forever" :max-height="480" :autoplay="3000" />

## 原版 Mario Forever 的修改版

目前已知有數個以原版 Mario Forever 為基礎製作的修改版。

<MfGamesEntry name="Mario Forever v1.16.1 Mod" /><MfGamesEntry name="Mario Forever v4.4 Fixed Speedrun Edition" />

## New Super Mario Forever

New Super Mario Forever（通常稱為 New Super Mario Forever 2012）是由 Softendo 開發的 Mario 同人遊戲。它是 Mario Forever 的官方續作，於 2012 年發布。遊戲採用了與原版 Mario Forever 完全不同的美術風格，並加入了新的敵人、強化道具及世界。推薦遊玩的版本為 **2013-03-04** 發布的版本。

此外，還有一個該遊戲的修改版，移除了一些令人感到挫折的遊戲要素，並加入了多項調整。

<SoftendoEntry name="New Super Mario Forever" /><MfGamesEntry name="New Super Mario Forever 2012: Slightly-Fixed Plus Edition" />

## 常見問題

**問：Mario Forever 安全嗎？我聽說它含有病毒。**

**答**：許多人至今仍認為 Mario Forever 是某種「充滿惡意軟體的遊戲」，但實際情況要複雜一些：遊戲本身**並不含有**任何傳統意義上的病毒。部分版本的安裝程式會附帶一款名為「Mario Forever Toolbar」的 Internet Explorer 廣告工具列。這款工具列不受歡迎，而且具有侵入性，但它被歸類為廣告軟體，而非病毒。

不過，研究人員確實提出過值得重視的安全疑慮。根據 [Cyble](https://cyble.com/blog/trojanized-super-mario-game-installer-spreads-supremebot-malware/) 的報告，某個 `super-mario-forever-v702e` 安裝程式曾遭到木馬化，並被植入多種惡意元件，包括 XMR 挖礦程式、SupremeBot 挖礦用戶端，以及開源的 Umbral 資訊竊取工具。這很可能是「MF 含有病毒」這項廣泛流傳的傳聞來源之一。

**重要提醒**：本網站提供的所有版本均不含 Cyble 所指出的任何惡意程式。所有本站託管的安裝程式都經過檢查，確認安全無虞。部分版本的安裝程式確實會附帶「Mario Forever Toolbar」，但你可以在安裝過程中選擇不安裝它。

此外，部分 Mario Forever 版本內含指向 `mariocoins.com` 和 `broshome.com` 的連結。這些網域目前已不再由原始持有人持有，而是被無關的第三方接管。它們可能會將使用者重新導向至不可信或具有潛在危險的內容。在某些版本中，使用者可以透過遊戲內的選項（例如「Get Secrets」或「Get Coins」），或安裝程式建立的 URL 捷徑存取這些連結。**強烈建議不要開啟這些連結。**

為了消除使用者可能仍存有的疑慮，我們也提供了遊戲的免安裝版。此版本不含附加工具列，並已移除 URL 捷徑及其他無關內容。你也可以選擇遊玩由玩家重新製作的版本，例如 Mario Forever Remake 或 Mario Forever: Community Edition；這些版本同樣不含惡意軟體。
