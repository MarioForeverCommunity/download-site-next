<script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
  import 'vue3-carousel/dist/carousel.css'

  defineProps({
    lastUpdate: String
  })

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

There are several official and unofficial Mario Forever editors, commonly referred to as Mario Worker.

<p v-if="lastUpdate" class="last-update" style="font-weight: bold;">Last updated: {{ lastUpdate }}</p>

## Download Classic Mario Worker
The classic Mario Worker developed by Buziol Games (Softendo) has two different variants: 1.0 and 1.1.

<a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/original-mw/Mario%20Worker%201.0.exe">Download Mario Worker 1.0</a><a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/original-mw/Mario%20Worker%204.4%20(2009).exe">Download Mario Worker 1.1 (2009)</a><a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/original-mw/Mario%20Worker%204.4%20(2011).exe">Download Mario Worker 1.1 (2011)</a>

Mario Worker 1.0 was released in 2004 and was built with Multimedia Fusion 1.5. The author unintentionally leaked the source code, which became the origin of most Mario Forever fangames today. MW 1.0 isn't very polished and has several bugs. The later Mario Worker Remake is based on this source code and is currently one of the most popular Mario Worker variants.

Mario Worker 1.1 was first released in 2006 as the level editor bundled with Mario Forever 4.0, and was built with Game Maker 6. This version has many bugs and can't run on Windows Vista or later without modifications. In 2008, Buziol updated MW 1.1 by upgrading the engine to Game Maker 7 and fixing some bugs; this build was bundled with Mario Forever 4.1. Since these two builds were shipped with corresponding versions of Mario Forever, they are also referred to as Mario Worker 4.0/4.1. In 2009, Buziol (then renamed to Softendo) released a standalone installer for MW 1.1. Because this happened around the same time as the release of Mario Forever 4.4, it's often referred to as Mario Worker 4.4. This is the final version of MW 1.1. It's worth mentioning that its physics is quite different from those of Mario Forever.

## Download Mario Worker Remake
Mario Worker Remake is a complete revamp of the Mario Worker 1.0 level editor, developed by TheMarioVariable.

<a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/mario-worker-remake/MWRemake%20v3.03.rar">Download Mario Worker Remake v3.03</a><a class="md-button" target="_blank" href="https://www.themariovariable.org/mario-forever/mario-worker-remake/">Mario Worker Remake website</a>

Mario Worker Remake contains a bunch of new features compared to MW 1.0, such as objects, enemies, backgrounds, music, and preferences like autoscroll and editable background gradient color.

The editor was originally distributed alongside Mario Forever Remake, but starting from v3.0, it has been released as a standalone editor.

## Download Super Mario Worker Project
Super Mario Worker Project (SMWP) is a Mario level editor based on Mario Worker 1.1, developed by INNOVATION LEAP, built with Game Maker 8.0.

<a class="md-button" target="_blank" href="https://file.marioforever.net/smwp">Download Super Mario Worker Project</a><a class="md-button" target="_blank" href="https://inleap.marioforever.net/en/super-mario-worker-project/">Super Mario Worker Project website</a>

SMWP enhances and expands upon MW 1.1 by introducing new elements and fixing various bugs, while preserving its original physics behavior and level format structure.

SMWP saves levels in the .smwl format by default and is backward compatible with levels made with older SMWP versions, as well as MW 1.1 (.mfl) levels. It would not save levels in the .mfl format.

## Download Mario Worker: Community Edition
Mario Worker: Community Edition is a Mario Forever level editor based on Godot 4's Thunder Engine, developed by Meteo Dream. It's currently in prototype stage.

<a class="md-button" target="_blank" href="https://rnx.su/s/MarioWorkerCommunityEdition">Download Mario Worker: Community Edition</a><a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/mario-worker-ce">Download Mario Worker: Community Edition (Mirror)</a><a class="md-button" target="_blank" href="https://github.com/meteo-dream/mario-worker-ce">MW: CE source repository</a>

## Other Mario Worker variants
### Mario Worker 2
Mario Worker 2 is an MW 1.1-like level editor developed by Rubis et Cie, built using GameMaker Studio 1. It's incompatible with MW 1.1 or any other MW variants.

<a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/other-mw-programs/Mario%20Worker%202.2.exe">Download Mario Worker 2.2</a>

### Mario Constructor Master
Mario Constructor Master is the successor of Mario Worker 2, developed by Rubis et Cie and TheMarioVariable. It's open-source and developed in C++.

<a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/mario-constructor-master/Mario.Constructor.Master.2.3.zip">Download Mario Constructor Master 2.3</a><a class="md-button" target="_blank" href="https://github.com/RubisetCie/mario-constructor-master">Mario Constructor Master source repository</a>

### Mario Worker Android
Mario Worker Android is a Mario Forever level editor based on Mario Worker 1.0, developed by Alexandro Games. It's incompatible with other MW 1.0-based editors.

<a class="md-button" target="_blank" href="https://www.mediafire.com/file/peppr8pao5sxfxd/Mario_Worker_Android_v1.3.1.apk/file">Download Mario Worker Android v1.3.1</a><a class="md-button" target="_blank" href="https://alexandrogames.altervista.org/mario-worker-android/">Mario Worker Android website</a>

## Frequently Asked Questions

**Q: How can I download levels for Mario Worker?**
**A:** We currently don't host levels for variants such as Mario Worker Remake. There is a [Mario Worker Database](https://marioworkerdatabase.altervista.org/) with a large number of MWR levels, but that site has since been archived. This site does provide a [levels catalog](https://download.marioforever.net/mw-levels.html) for Super Mario Worker Project, although it is currently only available in Chinese. You can also search for levels on the Internet, such as YouTube, Discord servers, and MF forums.

**Q: Is Mario Worker Remake backward compatible with MW 1.0 levels?**
**A:** Different variants of Mario Worker are generally not compatible with one another, even if some are based on the original MW. The only notable exception is Super Mario Worker Project, which is backward compatible with MW 1.1. As a general rule, it is recommended to play levels using the same version they were created with.

## Screenshots
<Carousel :autoplay="3000" :wrap-around="true" :items-to-show="itemsToShow">
  <Slide v-for="image in imagesSmwp" :key="image" :style="isMobile ? '' : 'width: 50%; aspect-ratio: 4/3;'">
    <img :src="image" style="width: 100%; height: 100%;">
  </Slide>
  <template #addons>
    <Navigation />
    <Pagination />
  </template>
</Carousel>
