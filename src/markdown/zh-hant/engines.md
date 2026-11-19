<script setup>
defineProps({
  lastUpdate: String
})
</script>

<p v-if="lastUpdate" class="last-update" style="font-weight: bold;">最後更新：{{ lastUpdate }}</p>

## Clickteam Fusion 2.5

Clickteam Fusion（舊稱 Multimedia Fusion，簡稱 MMF 或 CTF）是由軟體公司 Clickteam 開發的多媒體軟體製作工具。使用者可以透過自行建立的事件式程式設計方式，製作並測試自己的軟體。許多知名遊戲都是使用 Multimedia Fusion 製作的，其中包括《Five Nights at Freddy's》系列。Michael Gdaniec 使用這套軟體製作了他的遊戲及 Mario Forever，其他 MF 玩家也使用它來製作以 Mario Forever 為基礎的後續同人遊戲。

<a class="md-button" target="_blank" href="https://www.clickteam.com/web-shop">購買 Clickteam Fusion 2.5（Clickteam.com）</a><a class="md-button" target="_blank" href="https://store.steampowered.com/app/248170/Clickteam_Fusion_25/">購買 Clickteam Fusion 2.5（Steam）</a>

### Mario Forever 製作範本（引擎）

#### Mario Forever Editor

MarioForeverEditorV1.cca 是 Mario Worker 1.0 安裝程式中附帶的源檔案。由於這是 Mario Worker 1.0 編輯器的源檔案，因此在 Multimedia Fusion 中開啟後，無法直接作為遊戲範本或引擎使用，必須進行大量手動修改。受 Multimedia Fusion 1.5 的限制，單一場景幀中的所有事件都被放置在主事件列表中，導致專案難以維護及進一步開發。

注意：請勿將其與 Dunami 製作的 Mario Forever Engine 混淆。

#### World 10 Engine / Mario Forever Remake Engine

此遊戲範本是基於 MarioForeverEditorV1.cca 改良而來，也是最早可以直接使用的 Mario Forever 遊戲範本之一。根據範本發布時所包含的關卡不同，通常會被稱為 World 10 Engine 或 Mario Forever Remake Engine。與其他範本相比，此範本的可維護性及進一步開發的便利性較低，且需要具備較扎實的 Multimedia Fusion 使用基礎。

<AssetsEntry name="Mario Forever World 10 Engine" /><AssetsEntry name="Mario Forever Editor (MF Remake Engine)" />

#### Cloud Engine

Cloud Engine 是由 Meteo Dream（原 Team CE）基於 MarioForeverEditorV1.cca 製作的 Mario Forever 遊戲範本。其設計目標是在保留玩家熟悉且喜愛的原版 Mario Forever 特色之餘，進一步提升易用性、實用性及穩定性。它保留了 Mario Forever 的大部分原始內容，同時加入自訂功能，並維持簡潔、輕量的特性。Cloud Engine 也充分運用了 Clickteam Fusion 2.5+ 引入的子事件功能，因此是較容易上手的 Mario Forever 遊戲範本之一。

<AssetsEntry name="Cloud Engine" variant="本體" /><AssetsEntry name="Cloud Engine" variant="Official Plugins" />

#### Feather Engine

Feather Engine 是由 TheMarioVariable 製作的遊戲範本，旨在全面更新原始的 MarioForeverEditorV1.cca 檔案。它包含 v4.0 之前發布的經典 Mario Forever 遊戲中的所有道具、圖像、精靈及物理效果元素。在保留原有大部分程式碼結構的同時，此範本也已更新至 Clickteam Fusion 2.5，讓程式碼更容易理解，並加入使用說明以提升易用性。由於整體大小不到 8 MB，因此被命名為 Feather Engine。

<AssetsEntry name="Mario Forever Feather Engine" />

#### Rainbow Engine

Rainbow Engine 是由虹原翼製作的 Mario Forever 遊戲範本。由於此範本完全從零開始製作，因此在某些細節上與基於 MarioForeverEditorV1.cca 的範本略有不同。

Rainbow Engine 為許多物件建立了 Behavior，允許直接在相關物件中編寫事件。因此，製作新的敵人時，可以透過複製及貼上來省去部分重複工作。不過，由於 Clickteam Fusion 2.5 不支援在 Behavior 中引用 Group，因此涉及 Group 的事件仍必須保留在主事件列表中。

Rainbow Engine 容易上手，而且能夠很好地還原原版 Mario Forever 的效果。

<AssetsEntry name="Rainbow Engine" variant="含開始頁" ver="0.10.7.1" /><AssetsEntry name="Rainbow Engine" variant="含開始頁" ver="0.10.6.1" />

#### Spectrum Engine

Spectrum Engine（原名 Rainbow Engine Mod）以 Rainbow Engine 為基礎，加入了新的敵人、設施及道具，修正了錯誤，並將大部分主要內容翻譯為英文。

<AssetsEntry name="Spectrum Engine" variant="Ful MFA" /><AssetsEntry name="Spectrum Engine" variant="Level only MFA" />

#### Super Mario Ultra Edition

2020 年，Clickteam Fusion 2.5+ 推出，支援子事件以及在 Behavior 中引用 Group。在這樣的背景下，由 dasasdhba 製作的 Super Mario Ultra Edition 隨之發布。此範本同樣是從零開始製作，並充分運用了 Clickteam Fusion 2.5+ 的結構及功能。整個範本具有嚴謹的碰撞判定及井然有序的系統，並提供大量介面供二次開發使用。不過，使用者需要對範本本身有一定程度的了解。此範本並不以還原原版 Mario Forever 為主要目標，而是致力於讓製作、開發及遊玩等各方面都更加舒適。

<AssetsEntry name="Super Mario Ultra Edition" variant="Full" /><AssetsEntry name="Super Mario Ultra Edition" variant="Mod" />

#### Factory Engine

這是同人遊戲 <a href="https://download.marioforever.net/mf-games.html?design=next&id=mf%3A%3AMario+Forever+Irrational+Travel%3A%3ADET+Factory">Mario Forever Irrational Travel</a> 所使用的遊戲範本。該遊戲由 DET Factory 製作，以 Rainbow Engine 為基礎，並進行了許多最佳化。

<AssetsEntry name="Factory Engine" />

#### 其他遊戲範本（引擎）

包括 Dunami 製作的 Mario Forever Engine、dasasdhba 製作的 Super Mario Ultra Engine、MarioX7 製作的 Geography Engine Ultimate 等。這些範本並不常用。

<a class="md-button" target="_blank" href="https://file.marioforever.net/mario-forever/engines">探索更多 MF 遊戲範本</a>

## Godot Engine

Godot 是一款開源遊戲引擎，能夠製作 2D 及 3D 遊戲。遊戲透過以節點為基礎的架構進行設計。Godot 允許遊戲開發者使用多種程式語言製作遊戲，例如 C++、C# 及 GDScript。

<a class="md-button" target="_blank" href="https://godotengine.org/">Godot Engine 官方網站</a>

Godot 是一個功能強大的遊戲開發平台。使用 Godot 可能需要全面了解引擎本身、程式編寫、MF 遊戲及遊戲範本，因此學習門檻相對較高。

隨著 Godot 的興起，部分社群成員開始嘗試在 Godot 上製作 Mario Forever 遊戲範本。目前使用最廣泛的是由 Meteo Dream 製作、適用於 Godot 4 的 Thunder Engine；此外，還有由 ChloePrime 製作的 Mario Forever Mole Editor。

<AssetsEntry name="Thunder Engine" /><AssetsEntry name="Mario Forever Mole Editor" />
