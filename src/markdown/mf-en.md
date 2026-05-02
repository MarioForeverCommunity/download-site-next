<script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import DownloadButton from "../components/ButtonDownload.vue"
  import OriginalMfTable from '../components/OriginalMfTable.vue'
  import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
  import 'vue3-carousel/dist/carousel.css'

  defineProps({
    lastUpdateEn: String
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

<p v-if="lastUpdateEn" class="last-update" style="font-weight: bold;">Last updated: {{ lastUpdateEn }}</p>

## Download Mario Forever: Community Edition
**Recommended.** Suitable for relatively modern PCs, with controller support and high FPS support. Tweaks are integrated for customizing the player's gameplay experience. It also features custom character skins and the ability to play as Luigi.

<MfGamesEntry name="Mario Forever - Community Edition" />

## Download Mario Forever Remake
Suitable for the vast majority of Windows PCs. Runs better on some modern computers, compared to the original Mario Forever. It also adds several fan-made worlds. The game has two different iterations: European version (PAL) and Chinese version.

<MfGamesEntry name="Mario Forever Remake (PAL)" /><MfGamesEntry name="Mario Forever Remake" /><MfGamesEntry name="Mario Forever Advance Remake" />

## Download original Mario Forever
For those seeking the most authentic and original experience. Versions 4.4 and earlier may not run smoothly on Windows 7 or newer (due to their usage of the Standard render mode running at 50 FPS). Versions 5.0 and later are generally unsatisfactory; try them only if you're curious.

Changelogs are available on the [Wiki page](https://en.wiki.marioforever.net/wiki/Mario_Forever).
<OriginalMfTable lan="en" />
<div class="foot-note" style="font-size:12px">

1. There is no portable archive for v1.16.1, as this version installs its assets in the Windows directory. There is no installer for v7.02_30.
2. The version numbers v3.50/v3.51 were designated for clarity; they are different builds of v3.5. The installer for v3.50 is a Chinese repackage. This version contains a bug in World 4-2 that prevents from progressing through the game, which was fixed in v3.51.
3. v5.011/v5.013 are identical to v5.01, and v5.08b is identical to v5.08. There are two installers for each of v4.15/v5.9/v5.9s, with different timestamps; the installed files are identical. 
4. The version numbers v5.9s/v5.9t/v5.9r were designated for clarity; they are different builds of v5.9. The v5.9r (r refers to ridiculous, as this version is known to be non-functional) executable has a timestamp of 2013-01-18, while the installer [appears to have been released on 2014-06-26](https://archive.marioforever.net/post/3258680750.html).
5. Since v6.0, the official version numbering has been somewhat confusing. The numbers v6.0, v6.01, v6.1, and v6.11 were designated for clarity; they are different builds of "v6.0 Beta".
6. The files for v6.1/v6.11 originate from the Super Mario Forever 2016 Pack released by Softendo. v6.1 also has an installer repackaged in 2017.
7. v6.000027 (2018), also known as "Mario Forever 6.00 Fixed Version", is unclear as to why Softendo released this version after v7.02.
8. The installer of v7.02e is originally named `super-mario-forever-v702e.exe`. The installed v7.02e includes a file called `MarioForever 7.02 Beta.exe`, last modified on 2019-01-28. This file is not the actual game executable, as it's only a launcher that opens a window titled "Softendo Games Steam." The v7.02e game executable is identical to that of v7.02_31 Beta. 
9. The release date of Advance v4.4 (2011) refers to the modification date of the game executable.
10. Portable version removes all icons, URL shortcuts, uninstallers and adware. 
</div>

### Screenshots
<Carousel :autoplay="3000" :wrap-around="true" :items-to-show="itemsToShow">
  <Slide v-for="image in imagesOriginal" :key="image" :style="isMobile ? '' : 'width: 50%; aspect-ratio: 4/3;'">
    <img :src="image" style="width: 100%; height: 100%;">
  </Slide>
  <template #addons>
    <Navigation />
    <Pagination />
  </template>
</Carousel>

## Download mods of original Mario Forever
There are several known mods based on the original Mario Forever.

<MfGamesEntry name="Mario Forever v1.16.1 Mod" /><MfGamesEntry name="Mario Forever v4.4 Fixed Speedrun Edition" />

## Download New Super Mario Forever
New Super Mario Forever (commonly named as New Super Mario Forever 2012) is a Mario fangame developed by Softendo. It serves as the official sequel to Mario Forever and was released in 2012. The game features graphics completely different from the original Mario Forever, along with new enemies, power-ups, and worlds. The recommended version of the game is the **2013-03-04** release.

<a class="md-button" target="_blank" href="https://file.marioforever.net/mario-forever/games/softendo/portable">Download New Super Mario Forever</a>

There is a mod of the game available, which removes some of the frustrating elements and introduces several tweaks.

<MfGamesEntry name="New Super Mario Forever 2012: Slightly-Fixed Edition" />

## Frequently Asked Questions
**Q: Is Mario Forever safe? I've heard it contains a virus.**  
**A:** Many people still believe that Mario Forever is some kind of "malware-infested game," but the truth is more nuanced: the game itself does **not** include any traditional virus. In certain versions, the installer comes with an Internet Explorer advertising add-on called "Mario Forever Toolbar." This add-on is unpopular and intrusive, but it is classified as adware rather than a virus.  
That said, there is a legitimate security concern raised by researchers. According to [Cyble](https://cyble.com/blog/trojanized-super-mario-game-installer-spreads-supremebot-malware/), a particular installer for *super-mario-forever-v702e* was trojanized, bundling malicious components: an XMR miner, a SupremeBot mining client, and an open-source Umbral stealer. This is likely one of the origins of the widespread "MF contains a virus" rumor.  
**Important note:** None of the versions offered on this site contains any of those malicious payloads identified by Cyble. All hosted installers have been reviewed and are considered safe. Some versions' installers do bundle the "Mario Forever Toolbar," but you can opt not to install it during setup.  
Additionally, some versions of Mario Forever contain links to `mariocoins.com` and `broshome.com`. These domains are no longer owned by their original owners and have been taken over by unrelated parties. They may redirect to untrusted or potentially unsafe content. In certain versions, these links can be accessed via in-game options (such as "Get Secrets" or "Get Coins") or through URL shortcuts created by the installer. **It is strongly recommended not to open these links.**   
To ease any remaining concerns, we provide a portable version of the game. This version has no bundled toolbar and has removed URL shortcuts and other irrelevant content. You may alternatively choose to play one of the fan-made recreated versions, such as Mario Forever Remake or Mario Forever: Community Edition, which are also malware-free.
