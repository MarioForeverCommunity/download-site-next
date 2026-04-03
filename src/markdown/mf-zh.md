<script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import ClipboardButton from "../components/ButtonClipboard.vue"
  import DownloadButton from "../components/ButtonDownload.vue"
  import OriginalMfTable from '../components/OriginalMfTable.vue'
  import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
  import 'vue3-carousel/dist/carousel.css'

  defineProps({
    lastUpdateZh: String
  })

  const imagesOriginal = [
    "/data/mf-index/title.webp",
    "/data/mf-index/3-2.webp",
    "/data/mf-index/3-4.webp",
    "/data/mf-index/4-1.webp",
    "/data/mf-index/6-3.webp",
    "/data/mf-index/8-3.webp",
    "/data/mf-index/8-4.webp",
    "/data/mf-index/HC2-3.webp",
    "/data/mf-index/HL-1.webp",
    "/data/mf-index/LM-4.webp",
  ]

  const isMobile = ref(false)

  function updateIsMobile() {
    isMobile.value = window.innerWidth <= 800
  }

  const itemsToShow = computed(() => isMobile.value ? 1 : 2)

  onMounted(() => {
    window.addEventListener("resize", updateIsMobile)
    updateIsMobile()
  })

  onBeforeUnmount(() => {
    window.removeEventListener("resize", updateIsMobile)
  })
</script>

本页面汇集了 Mario Forever 原版、重制版、优秀原创作品和关卡创作资源的链接。如有链接失效，请到 [社区反馈专帖](https://www.marioforever.net/thread-1635-1-1.html) 进行反馈。

<a class="md-button" href="#mario-forever-全版本下载">原版 Mario Forever</a><a class="md-button" href="#mario-forever-remake">Mario Forever Remake</a><a class="md-button" href="#mario-forever-community-edition">Mario Forever: Community Edition</a><a class="md-button" href="#mario-forever-android">手机版</a><a class="md-button" href="#mario-forever-fangames">Mario Forever 优秀原创作品</a><a class="md-button" href="#mario-forever-assets">Mario Forever 关卡创作资源</a>

本页面所有资源均免费提供，不得倒卖或用于营利，违者必究！

欢迎加入 Mario Forever 玩家交流 · 游戏资源群，群号：832497462

<p v-if="lastUpdateZh" class="last-update" style="font-weight: bold;">最后更新：{{ lastUpdateZh }}</p>

## 原版 Mario Forever

Mario Forever 是一款由波兰人 Michael Gdaniec 制作的马里奥同人游戏，关卡创作风格类似于马里奥初代（《Super Mario Bros.》，1985），在国内和国际均有一定的知名度。

### Mario Forever 发展史介绍

最早版本的 Mario Forever 在 2004 年发布，至今已有二十余年的历史。在这段或许有点漫长的时间里，Mario Forever 也经历着翻天覆地的变化。

Mario Forever 从最初可考版本（1.16.1）到现在（7.02）共计 30 多个版本。从游戏内容和游戏质量来看，Mario Forever 的发展过程大致可分为以下阶段：

①<span style="color:red">（Mario Forever 1.16.1～3.0，2003～2005）</span>作者最初制作的游戏版本，所有普通关都已大致定型，同时开始引入附加关（或隐藏关，如 Human Laboratory）；但由于技术经验不足，故游戏内容较少，且存在部分问题。

②<span style="color:red">（Mario Forever 3.50～4.1，2006～2008）</span>作者设计游戏的技术逐渐成熟后，开始着手将一些新关卡（如 Hardcore、Lost Map 等）加入到游戏中。这一阶段游戏质量较高。根据 CNET 的下载数据，该时段的 Mario Forever 人气值曾一度达到 PC 游戏的顶峰。

③<span style="color:red">（Mario Forever 4.15～4.4 & Mario Forever Advance，2009～2010）</span>2008 年左右，其他游戏制作人员因种种原因而离开作者，作者本人也因资金不足等原因而关闭了游戏官方网站，Mario Forever 也因此长期未更新。2009 年，作者将官方网站 Buziol Games 更名为 Softendo，发布了 Mario Forever 4.15、4.4 和 Mario Forever Advance Edition（简称 MFAE）等。其中，MFAE 是 Mario Forever 4.4 的加难版，难度较 Mario Forever 4.4 有所提高。Mario Forever 4.4 和 MFAE 也是多数人所认为的 Mario Forever 巅峰之作。

④<span style="color:red">（Mario Forever 5.0～7.x，2011～2017）</span>4.4 之后，作者开发游戏的方向逐渐从可玩性转为所谓的“视觉特效”和“手感、流畅度”等方向。因为游戏制作平台从 Multimedia Fusion 1.5 迁移至 Multimedia Fusion 2，许多 Bug 莫名其妙地开始出现，但作者不再像以前对待游戏的更新那样用心，原版 Mario Forever 正一步一步地毁在作者的手上。

⑤<span style="color:red">（Mario Forever Remake，2014～）</span>在原创关卡技术日臻成熟后，国内以 syzxchulun 为代表，国外以 TheMarioVariable 为代表的一些人成立了 Mario Forever Remake Group 并发布了 Mario Forever Remake v1.0。后来 Mario Forever Remake Group 逐渐分为了以 syzxchulun 为组长的中国团队和以 TheMarioVariable 为首的欧洲团队。中国版本的 Mario Forever Remake 将重心放在更加完美地复现原版，在内容上更忠实于原作，关卡内容处理也更精细；欧洲版本则在复刻和新增关卡内容处理上很随意，倾向于收集、整合其他关卡。此外，中国团队也承担了 MFAE 的复刻工程，即 Mario Forever Advance Remake。

⑥<span style="color:red">（Mario Forever: Community Edition，2024～）</span>2023 年，Godot Engine 开始在国内外 Mario Forever 社区流行，国内外社群已经制作出 Godot 上的 Mario Forever 游戏引擎。2024 年，国外 Meteo Dream 制作组发布了 Mario Forever: Community Edition（简称 MF:CE），这是基于 Godot 4 的 Thunder Engine 制作的全新的 Mario Forever 复刻版本。由于 Godot 的 Mario Forever 完全从零开始，MF:CE 实现了在 Multimedia Fusion 平台不可能实现的诸多特性，包括但不限于可以将关卡设定为 2.16/4.4/6.0 等不同版本风格、自定义玩家皮肤、高帧率等。虽然因为引擎不同导致游戏手感不可避免的与原版有些小差别，但作为 Mario Forever 二十年的集大成者，MF:CE 值得新老玩家尝试。

各个版本的详细更新日志，请参见 [Wiki 页面](https://zh.wiki.marioforever.net/wiki/%E6%B0%B8%E8%BF%9C%E7%9A%84%E9%A9%AC%E9%87%8C%E5%A5%A5)。

### Mario Forever 全版本下载<a id="mario-forever-全版本下载"></a>
为方便玩家下载，特提供第三方网盘备用地址（**备用地址下载需登录 123 云盘账号**）。

<a class="md-button" target="_blank" href="https://www.123684.com/s/U3vrVv-VD0f">原版 Mario Forever 备用下载地址 (提取码: MAat)</a><ClipboardButton lan="zh" code="MAat" />
<OriginalMfTable lan="zh" />
<div class="foot-note" style="font-size:12px">

1. v1.16.1 在不引起歧义情况下可简称 v1.16，但这并不代表 v1.16.1 与已失传的 v1.16.0 相同。  
2. v1.16.1 无绿色版，因为 BGM 资源文件被安装在 Windows 目录下；v7.02_30 暂无安装版。
3. v3.50 与 v3.51 均为官方版本。本站提供的 v3.50 安装包为国内二次打包版，故常被误称 v3.5 山寨版；对应地，v3.51 常被称为 v3.5 官方版。
4. v5.011/v5.013 安装后的文件与 v5.01 完全相同，v5.08b 安装后的文件与 v5.08 相同；v4.15/v5.9/v5.9s 各分别有两个不同创建日期的安装包，安装后的文件相同。
5. v5.9s/v5.9t/v5.9r 的版本号系为区分之用；v5.9r 的主程序修改日期为 2013-01-18，而[安装程序放出的日期疑似为 2014-06-26](https://archive.marioforever.net/post/3258680750.html)；该版本无法运行。
6. v6.0 及以后的版本官方的版本号比较混乱，v6.0，v6.01，v6.1，v6.11 是为了明确区分而指定的版本号。v6.1/v6.11 的文件来源于 Softendo 的 Super Mario Forever 2016 Pack；v6.1 的安装版为 2017 重打包版。
7. v6.000027 (2018) 又名“Mario Forever 6.00 Fixed Version”，尚不清楚作者为何在 v7.02 发布后又发布此版本。
8. v7.02e 的游戏主程序与 v7.02_31 Beta 完全相同，其安装程序的原始文件名为 `super-mario-forever-v702e.exe`。
9. Advance v4.4 (2011) 的发布日期指 exe 文件的修改日期。
10. KIDS 版基于 v7.02 版本进行魔改，该版本难度大幅降低，角色无法死亡。
11. 绿色版移除了全部图标文件、url 快捷方式、卸载程序和广告插件安装包。
</div>

### 截图预览
<Carousel :autoplay="3000" :wrap-around="true" :items-to-show="itemsToShow">
  <Slide v-for="image in imagesOriginal" :key="image" :style="isMobile ? '' : 'width: 50%; aspect-ratio: 4/3;'">
    <img :src="image" style="width: 100%; height: 100%;">
  </Slide>
  <template #addons>
    <Navigation />
    <Pagination />
  </template>
</Carousel>

## Mario Forever Remake 及 Mario Forever Advance Remake<a id="mario-forever-remake"></a>

Mario Forever Remake 和 Mario Forever Advance Remake 是分别基于 Mario Forever 公认最好的版本 Mario Forever 4.4 和 Mario Forever Advance Edition 而创作的重制版，旨在为 Windows 7 以上系统的玩家提供一个流畅的游戏环境（原版 Mario Forever 4.4 在 Windows 7 以上系统一般会出现运行不流畅等问题），并修复原版中的 bug 和设计问题。Mario Forever Remake 和 Mario Forever Advance Remake 基本复现了 Mario Forever 和 Mario Forever Advance 的内容，是目前体验原版内容的最佳选择。其中，Mario Forever Remake 3.5 版已经由 Mario Forever 作者上传至 Softendo 官网。另外，作品中包含了 Syzxchulun's World 9, 10 及其 Advance 版本，以及 nmnmoooh 的 World U 的 Easy 和 Normal 难度。

该项工程由 syzxchulun 发起，日渐形成一个强大的工作室来完成关卡的制作、修改和测试工作，代表着原版 Mario Forever 研究的最高水平。向他们精益求精、追求至善的精神致敬！

<MfGamesEntry name="Mario Forever Remake" ver="v3.5" /><MfGamesEntry name="Mario Forever Advance Remake" ver="v1.5" />

## Mario Forever: Community Edition<a id="mario-forever-community-edition"></a>

Mario Forever: Community Edition（简称 MF:CE）是最新的基于原版 Mario Forever 的全复刻作品。MF:CE 摒弃了原版的制作软件 Clickteam Fusion，而采用更加现代的 Godot 游戏引擎。MF:CE 不仅复刻了原版游戏的绝大部分内容，还增添了一些自定义功能与新的挑战，以及一些面向玩家的特性，并对游戏的美术表现进行了略微调整。MF:CE 还允许路易吉成为可玩角色。虽然因为引擎不同导致游戏手感不可避免的与原版有些小差别，但作为 Mario Forever 二十年的集大成者，MF:CE 值得新老玩家尝试。

<MfGamesEntry name="Mario Forever - Community Edition" />

## Mario Forever 手机版<a id="mario-forever-android"></a>

目前，可供手机等移动设备游玩的 Mario Forever 游戏数量仍然较少。已知存在两个不同的原版 Mario Forever 的 Android 移植版：

- **Super Mario Forever Android**：由 Alexandro Games 制作，不仅包含新旧两种不同画面风格（4.4 版之前 / 4.4 版之后），还移植了部分玩家创作的同人关卡内容。
- **Mario Forever for Android**：由 Sanyario 移植的版本，基本保持原版内容，没有“夹带私货”，更适合希望体验原汁原味 Mario Forever 的玩家。

<MfGamesEntry name="Super Mario Forever Android" /><MfGamesEntry name="Mario Forever for Android" />

绝大多数 Mario Forever 同人作品目前仍仅提供电脑版本。尽管如今已经出现了一些 Android 端的 Windows 模拟器（如 Winlator、盖世游戏），但由于许多作品基于 Clickteam Fusion 开发，部分作品可能出现画面显示故障，甚至无法运行。即使游戏能够顺利启动，其中的绝大多数也并未原生支持游戏手柄，玩家往往需要手动配置屏幕虚拟按键，操作过程较为繁琐。

## 常见问题
**Q: Mario Forever 是任天堂官方作品吗？**
**A:** 不是。Mario Forever 是一款马里奥同人游戏，是非官方的二次创作产物。其作者的工作室 Softendo 除了名字模仿任天堂（Nintendo）外，与任天堂没有其他任何关联。

**Q: Mario Forever Remake 是原作者 Softendo 的官方更新吗？**
**A:** 不是。Mario Forever Remake 是由 Mario Forever Remake Group 制作的以还原原版 Mario Forever 为目的的非官方重制作品。

**Q: 我应该下载哪个版本？**
**A:** 原作者制作的版本中，4.4 版最受欢迎，通常推荐下载这个版本；2.16、4.0 等也可以尝试。但 5.0 之后的版本就不推荐下载了。重制版本推荐下载 Mario Forever Remake v3.5，也可以试试最新的 Mario Forever: Community Edition。

**Q: 刚才说 Mario Forever Remake v3.5 是最新版本，那网络上 v3.7 v4.0 这些是怎么来的？**
**A:** Mario Forever Remake v1.0 发布后，Mario Forever Remake Group 逐渐分为了以 syzxchulun 为组长的中国团队和以 TheMarioVariable 为首的欧洲团队。一般称中国团队制作的 MFR 为中国版本（俗称 a 版），欧洲团队的版本为欧洲版本（俗称 b 版）。v3.5 是中国团队制作的最新版本，而 v3.7、v4.0 等都是欧洲版本。

**Q: 中国版本与欧洲版本的 Mario Forever Remake 有什么区别？**
**A:** 中国版本将重心放在更加完美的复现原版，在内容上更忠实于原作，关卡内容处理也更精细；欧洲版本相对追求关卡的数量和游戏的特效等方面，在复刻和新增关卡内容处理上很随意，倾向于收集、整合其他关卡，从而出现了备受诟病的体积膨胀和卡顿等问题。

**Q: 1-4 的悬崖跳不过去，怎么办？**
**A:** 你需要按住加速键（默认是 X 键，可以在设置中修改）。

**Q: 游戏中有弹簧，这种东西怎么用？**
**A:** 弹簧是可以让玩家跳得很高的道具，要想跳得高，需要踩在弹簧上，碰到弹簧的瞬间按一下跳跃键即可。新手可以在上面原地跳几下找找感觉。

**Q: 6-2、6-4 如何过关？**
**A:** 这两关都是本游戏著名的迷宫关卡，建议玩家自行探索，走错了回去可以再次尝试，直到探索出正确道路。

**Q: 开口向下的水管如何进入？**
**A:** 按住上方向键，在水管下方跳跃即可进入。如果还是无法进入，请检查按键设置。

**Q: 我能不能自己制作一部 Mario Forever 作品？**
**A:** 制作 Mario Forever 作品需要使用游戏开发软件（目前使用最为广泛的是 Clickteam Fusion 2.5，简称 CTF 或 MMF，也包括但不限于其他游戏开发软件，如 GameMaker、Godot 等）和游戏制作模板（Rainbow Engine，Ultra Edition 等）。使用以上开发软件制作作品的方法不在本页讨论范围内。

## Mario Forever 优秀原创作品<a id="mario-forever-fangames"></a>

自 Clickteam Fusion 和相关 Mario Forever 引擎的大规模应用以来，诞生了许多高质量的 Mario Forever 同人作品。

<a class="md-button" href="mf-games.html">获取更多作品</a>

### Mario Forever World 9 / World 10 及其 Advance 版本
- **难度**：中（World 10），中偏难（World 9），难（World 9 adv、World 10 adv）
- **推荐理由**：百度永远的玛丽吧原吧主亲笔之作，开创了 Mario Forever 自制关卡的先河；经典 Mario Forever 风格，原创敌人和设计，制作精良；**推荐在最新版 Mario Forever Remake 或者 Mario Forever Advance Remake 中游玩普通版和加难版**。

<MfGamesEntry name="Mario Forever World 9" /><MfGamesEntry name="Mario Forever World 10" />

### Underground World
- **难度**：中偏难
- **推荐理由**：最早将 Mario Worker 关卡复刻至 Multimedia Fusion 平台的作品；可选三种难度，适合不同水平的玩家。

<MfGamesEntry name="Mario Forever World U" />

### Super Mario Forever 2014
- **难度**：中偏易
- **推荐理由**：百度永远的玛丽吧首个原创大型作品，第一个使用 Rainbow Engine 创作的正式作品，仿原版 Mario Forever 风格作品的代表之作，难度适中；推荐游玩 Deluxe 版。

<MfGamesEntry name="Super Mario Forever 2014 Deluxe" />

### Mysterious Island 系列
- **难度**：中偏难（MRI、MRI2 v1.5），难（MRI2）
- **推荐理由**：创新向作品；选关式大地图，有不同支线（MRI2）；解密关较多；难度较高，适合有一定水平的玩家挑战。

<MfGamesEntry name="Mysterious Island" /><MfGamesEntry name="Mysterious Island 2 - Great Journey" /><MfGamesEntry name="MRI2 Chapter5: Rainbow Treasure" />

### Mario Forever A Fabulous Space
- **难度**：难（v1.2 及以前），中偏难（v2.0），中（v3.0 及以后）
- **推荐理由**：完成度很高，关卡相当丰富，类原版 Mario Forever 风格，适合不同水平的玩家。

<MfGamesEntry name="Mario Forever - A Fabulous Space" />

### Legend World Remake
- **难度**：中偏难（通关）、难（全收集）
- **作品简介**：首个复刻 Mario Worker 全作的 Mario Forever 作品；率先采用一世界多关卡制；诸多设计创新，既保留了原作的地形风格，又针对性地进行适合 Mario Forever 的修改；引入了丰富多样的附加挑战；难度覆盖面广，适合从新手到硬核玩家的不同水平玩家游玩。

<MfGamesEntry name="Legend World Remake" />

### Mario Forever Minus Worlds
- **难度**：中偏难
- **推荐理由**：国外知名大型作品，大量新敌人和新设计，视觉效果精美。

<MfGamesEntry name="Mario Forever: Minus Worlds" ver="v1.8 bugfix" />

### Mario Forever Magic Land
- **难度**：中偏难
- **作品简介**：吧友大爷的代表作，最初定位为同名 Mario Worker 作品复刻。作品共八个世界，采用一世界多关设计。作品有一定的 Mario Worker 风格，制作相当精良，关卡丰富多样，存在各种有趣设计，也有一定创新。此外也有比较多的额外世界和关卡以及挑战要素。

<MfGamesEntry name="Mario Forever Magic Land" />

### Mario Forever Decasamsara Worlds
- **难度**：中偏难
- **作品简介**：马里奥X7 代表作之一，共十四个世界和一定量的额外关卡。风格仿照国外作品，但也加入了自己的众多创新元素。新敌人较多，关卡创意较丰富多样。

<MfGamesEntry name="Mario Forever - Decasamsara Worlds" />

### Mario Forever Project Zeta
- **难度**：难
- **推荐理由**：素材独特，风格混搭多样，血量制；难度跨度很大，有完整剧情。

<MfGamesEntry name="Mario Forever Project Zeta" />

### Mario Forever xfx World
- **难度**：中偏难
- **作品简介**：吧友 s小s飞s侠s 的 XFX Planet 工作室代表作，共八个世界，采用一世界多关制。关卡由工作室不同成员完成，作品设计相对多样有趣，制作精良。前期难度不高，后期难度较 Mario Forever Magic Land 略高。同时本作有较多的隐藏要素和额外世界。

<MfGamesEntry name="xfx's world" />

### Mario Forever: Mario In The FOREST
- **难度**：中
- **推荐理由**：自由选关大地图，一世界多关卡，剧情可推进，注重欣赏性与创新性，关卡各具特色。

<MfGamesEntry name="Mario Forever: Mario In The FOREST" />

### Mario Forever Irrational Travel
- **难度**：中
- **作品简介**：DET Factory 代表作，关卡由工作室不同成员完成。一世界四关作品。创新要素较多，素材多样，具有自由选关和收集要素。

<MfGamesEntry name="Mario Forever Irrational Travel" />

### Mario Forever Dream Escape
- **难度**：中
- **作品简介**：吧友 zqh——123 的第一部 Mario Forever 大型作品，讲述了马里奥逃离梦境的故事。情节和关卡设计多样，部分机制与原版不同。解谜特色显著，加入了不少作者特色的谜题设计。

<MfGamesEntry name="Mario Forever Dream Escape" />
 
### Mario Forever Save Zqh
- **难度**：难
- **作品简介**：Mario Forever Save Zqh 剧情上续接了 Mario Forever Dream Escape，引入了等级机制，采用自由选择的地图形式，单关存档。

<MfGamesEntry name="Mario Forever Save Zqh" />

### Super Mario Milky Way Wishes
- **难度**：中偏难
- **作品简介**：吧友 dasasdhba 的代表作，使用自行从零编写的 Super Mario Ultra Engine 制作，手感和很多特性上与传统的作品不同。机制和元素非常多样，地图风格也非常具有特色。

<MfGamesEntry name="Super Mario Milky Way Wishes" />

### Mario Forever Rainbow Land
- **难度**：中偏难
- **推荐理由**：一世界多关，后期关卡有挑战性。

<MfGamesEntry name="Mario Forever Rainbow Land" />

### Mario Forever: An Unprecedented Expedition
- **难度**：中偏易（通关）~ 中（全收集）
- **作品简介**：Mario Forever: An Unprecedented Expedition（简称 MF: AUE 或 AUE）是 无视我233 制作的一个 Mario Forever 改版。作品预计制作 8 个世界，目前完成并发布了前 4 世界。作品采用了 Super Mario World 式的大地图选关，有星币收集系统和不同于常规的分数机制。

<MfGamesEntry name="Mario Forever: An Unprecedented Expedition" />

### Mario Forever Adventure Island
- **难度**：中（通关 8-4）~ 难（通关 10-16）
- **作品简介**：Mario Forever Adventure Island 是 数字1528君 主导制作的一个大型 Mario Forever 作品。作品主线通关（8-4）较为简单，但通关隐藏世界（World 9）与附加世界（World 10）较为困难。本作也采用了 Super Mario World 式地图选关。

<MfGamesEntry name="Mario Forever Adventure Island" />

### Mario Forever Colourful Trip
- **难度**：中偏难
- **推荐理由**：传统八世界、一世界四关制作品，单关存档，美术风格极具特色，关卡背景华丽精致，地形设计美观，玩起来赏心悦目。

<MfGamesEntry name="Mario Forever Colourful Trip" />

### Mario Forever Odyssey
- **难度**：难
- **作品简介**：Mario Forever Odyssey（永远的马里奥：奥德赛）是一部 Mario Forever Save Zqh 式结构的中型作品，难度很大，关卡实行单关存档制。这部作品划分为主线世界和支线世界，主线和支线世界总计 48 关。这部作品的关卡关关具有特色，也同时追求“新面貌”，进行了大量形式和内容上的创新。

<MfGamesEntry name="Mario Forever Odyssey" />

### Mario Forever Easy Adventure 2
- **难度**：难
- **作品简介**：Mario Forever Easy Adventure 2 是吧友 JJ带我飞 制作的一部大型 Mario Forever 作品，该作品引入了一些新机制，关卡设计非常有意思，同时难度也略大，比较有挑战性。

<MfGamesEntry name="Mario Forever Easy Adventure 2" />

### Mario Forever - Not Epic Adventure
- **难度**：难
- **作品简介**：Mario Forever - Not Epic Adventure 是吧友 TNT与爬行者 制作的一部中型 Mario Forever 作品，该作品引入了一些新机制，世界主题丰富，单世界关卡少，但单关长度较长。

<MfGamesEntry name="Mario Forever - Not Epic Adventure" />

### Super Mario Forever 2021
- **难度**：中偏易
- **作品简介**：本作基于作者 2020 年 Mario Worker 杯决赛参赛关卡的复刻扩充制作而成，结构基本与 Mario Forever 保持一致，难度定位为中偏易，且引入了少量的附加关和隐藏要素。

<MfGamesEntry name="Super Mario Forever 2021" />

### Mario Forever Flashing Revolution
- **难度**：中
- **推荐理由**：Mario Forever Flash 美术及设计风格，4 世界 16 关，体量适中。

<MfGamesEntry name="Mario Forever Flashing Revolution" />

### Mario Forever Season Collab
- **作品简介**：Mario Forever Season Collab （二十四节气系列作品公募大会）是 2023 年 2 月 ~ 2024 年 1 月由 Ultra Team 发起和组织的关卡公募活动关卡合集。这一活动以中国传统二十四节气为主题，每个节气（间隔约 14 ~ 18 天）对投稿关卡进行整合发布，每个季节最后一个节气后的周末整合该季节所有关卡发布，在最后一个节气后整合所有关卡发布。作品的关卡形式多样，不同关卡难度区别也较大。

<MfGamesEntry name="Mario Forever Season Collab" />

### Mario Worker: Letter Worlds Series
- **作品简介**：本作是知名国外大型作品，也是历史最悠久的 Mario Forever 自制作品之一，有 World A~Z 共 26 个世界。

<MfGamesEntry name="Mario Worker: Letter Worlds Series" />

### Mario Forever Ridiculous Journey
- **难度**：中偏难
- **作品简介**：本作包含多个风格大不相同的章节，独特的关卡设计，舒适的观感，以及精彩多样的 Boss 战。

<MfGamesEntry name="Mario Forever Ridiculous Journey" />

### Mario Forever Wonderful Worlds
- **难度**：中偏难
- **作品简介**：本作与其他作品最大的不同在于游戏画面特别精美，8 大世界拥有各种不同主题风格，BOSS 战也比较多样。

<MfGamesEntry name="Mario Forever Wonderful Worlds" />

## Mario Forever 关卡创作资源<a id="mario-forever-assets"></a>
### Clickteam Fusion
Clickteam Fusion，原称 Multimedia Fusion，简称 MMF、CTF，是一款功能强大的 2D 游戏开发软件，使用者不需要撰写任何计算机编程语言代码，就可以建立复杂的单人/多人游戏、屏幕保护程序和网页程序等。这款软件是 Mario Forever 关卡的主流创作平台，在各款 Mario Forever 游戏引擎（游戏模板）的帮助下，学会简单的代码编辑后便可灵活使用它创作原创关卡。用户既可以设计出动作参数、风格与原版 Mario Forever 几乎完全一致的关卡，又可以开发出各种新颖的设计。

**⚠️如有条件，请支持正版！**

<a class="md-button" target="_blank" href="https://store.steampowered.com/app/248170/Clickteam_Fusion_25/">购买 Clickteam Fusion 2.5 (Steam)</a>

### 游戏模板（引擎）
#### Mario Forever Editor
MarioForeverEditorV1.cca，是 Mario Worker 1.0 安装程序中自带的源文件。由于这是 Mario Worker 1.0 编辑器的源文件，因此用 Multimedia Fusion 打开后不能直接当作游戏模板使用，需要手动大面积修改。因为 Multimedia Fusion 的限制，单个场景帧内的所有事件全在主事件列表中，不易维护和二次开发。

注意：请勿将该引擎与国外玩家 Dunami 的 Mario Forever Engine（手感存在严重问题，基本无人使用）混淆。 

#### World 10 Engine / Mario Forever Remake Engine
该游戏模板是基于 MarioForeverEditorV1.cca 改良而来，下载后打开可以直接使用，是最早的可直接使用的 Mario Forever 游戏模板之一。依据引擎公开时自带关卡的不同，常称作 World 10 Engine 或 Mario Forever Remake Engine。该引擎在可维护性和二次开发性上不如其他引擎，需要有较高的 Clickteam Fusion 使用基础。 

<AssetsEntry name="Mario Forever World 10 Engine" /><AssetsEntry name="Mario Forever Editor (MF Remake Engine)" />

#### Rainbow Engine
Rainbow Engine 是由虹原翼、Rainbow Engine Project Team 制作的游戏模板，在 Multimedia Fusion 和 Clickteam Fusion 上均可使用。该游戏模板为从零开始制作，因此在细节方面与基于 MarioForeverEditorV1.cca 的游戏模板有些许区别。

在 Rainbow Engine 中，有很多物件创建了 behavior，可以将事件编写到相关的对象中，因此制作新的敌人可以通过复制粘贴省去一些重复工作，也允许通过开启 Global Object 等手段进行全局性的维护、无需单一修改物件。但是，由于 Clickteam Fusion 2.5 不支持在 behavior 中引用 Group，因此涉及 Group 的事件依然在主事件列表，若需批量修改则只能逐一修改。

Rainbow Engine 易于上手，能够较好地还原原版 Mario Forever 的效果，大多数国内作品均为该引擎或该引擎的二次开发版本制作。

<AssetsEntry name="Rainbow Engine" variant="含开始页" ver="0.10.7.1"/><AssetsEntry name="Rainbow Engine" variant="含开始页" ver="0.10.6.1"/>

#### Super Mario Ultra Edition
2020 年，Clickteam Fusion 2.5+ 更新，允许**子事件**和 **behavior 中引用 Group**，大大省去了重复的条件判断、有更好的可拓展性和维护性。在这个背景下，由 dasasdhba 制作的 Super Mario Ultra Edition 诞生了。该游戏模板同样是从零开始编写的，并且很好地利用了 Clickteam Fusion 2.5+ 游戏引擎的结构和特性，整个游戏模板判定严密、体系严谨，为二次开发提供了足够多的接口，极大提高了开发其他物件、物件与物件之间交互的上限，但是使用时对游戏引擎本身以及游戏模板的体系的理解有一定需求。该制作引擎不太注重还原 Mario Forever 原版，而是旨在让制作、开发、游玩等各方面更加舒适。 

<AssetsEntry name="Super Mario Ultra Edition" variant="Full" /><AssetsEntry name="Super Mario Ultra Edition" variant="Mod" />

#### Rainbow Engine Mod / Spectrum Engine
Rainbow Engine Mod 在 Rainbow Engine 的基础上添加了新的敌人、设施和道具，并将主要部分翻译为英文，是国外常用的 Mario Forever 引擎之一。

<AssetsEntry name="Spectrum Engine" variant="Ful MFA" /><AssetsEntry name="Spectrum Engine" variant="Level only MFA" />

#### Factory Engine
这是 DET 关卡工房作品 Mario Forever Irrational Travel 使用的引擎，基于 Rainbow Engine 作了诸多优化。
<AssetsEntry name="Factory Engine" />

#### Cloud Engine
Cloud Engine 是由 Meteo Dream（原 Team CE）基于 MarioForeverEditorV1.cca 制作的模板，其利用了 Clickteam Fusion 2.5+ 的子事件特性，并且有完善的注释和使用说明、长期的维护与更新，因此是较易使用的原版系引擎。

<AssetsEntry name="Cloud Engine" variant="本体" />

#### Feather Engine
Feather Engine 是由国外玩家 TheMarioVariable 基于 MarioForeverEditorV1.cca 改良的引擎，一些国外作品使用了该引擎。

<AssetsEntry name="Mario Forever Feather Engine" />

#### 其他游戏模板（引擎）
包含 Radel999 制作的 Dunami Mario Forever Engine、dasasdhba 制作的 Super Mario Ultra Engine、马里奥X7 制作的 Geography Engine Ultimate 等，这些引擎不太常用。

<AssetsEntry name="Super Mario Ultra Engine" variant="本体" /><AssetsEntry name="Geography Engine Ultimate" />

### Godot Engine
Godot Engine 是一款开源的游戏制作软件，可以制作 2D 和 3D 游戏。通过基于节点的架构来设计游戏，3D 渲染器设计可以增强 3D 游戏的画面。具有内置工具的 2D 游戏功能以像素坐标工作，可以掌控 2D 游戏效果。

<a class="md-button" target="_blank" href="https://godotengine.org/">Godot Engine 官网</a>

Godot 是一个功能强大、接口完善的游戏开发平台，使用 Godot 可能需要对游戏引擎本身、代码编写、MF 游戏本身、游戏模板本身全方位的理解，有较高门槛。

随着 Godot 的崛起，部分圈友尝试在 Godot 上制作 Mario Forever 游戏模板。目前使用较多的有 Godot 4 的 Thunder Engine，由 Meteo Dream 制作；此外还有由 克洛伊Prime 制作的 Mario Forever Mole Editor。

<AssetsEntry name="Thunder Engine" /><AssetsEntry name="Mario Forever Mole Editor" />

### 注意事项
- 关卡设计需要一定的技术功底。请先熟悉 Mario Forever 关卡制作流程，领会基本设计理论，认真学习原版 Mario Forever 和吧友的优秀作品，再尝试自己创作关卡。
- 请尊重他人的劳动成果，不要抄袭。
- 请在设计自己的关卡之外，多花些时间下载、尝试、学习并讨论他人的关卡，因为你的关卡同样需要观众。我们欢迎对已有原创作品的讨论。
