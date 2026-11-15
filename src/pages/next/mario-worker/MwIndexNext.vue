<script setup>
// Mario Worker resource index — redesigned (English only, like the legacy page).
import { ref, computed, watchEffect } from "vue";
import { getLanguage } from "../../../util/Language.js";
import { navTop } from "../../../config.js";
import introEn from "../../../markdown/mw-en.md";
import { getMwDocLastUpdated } from "../../../util/next/docUpdated.js";
import { publishShell } from "../../../util/next/shellStore.js";

const lan = ref(getLanguage());
const pageId = "mario-worker";
const pageEntry = navTop.find((item) => item.id === pageId);

const title = computed(() => pageEntry.title_alt);

const lastUpdate = ref(null);
getMwDocLastUpdated().then((value) => { lastUpdate.value = value; });

document.title = title.value;

// The app shell is rendered once by the SPA root; this page only publishes
// the parts that differ (title, write-up, search model) plus its own controls.
// A watchEffect keeps the shell in sync when the language changes or the
// write-up's date arrives after the first render.
watchEffect(() => {
  publishShell({
    pageId: "mario-worker",
    title: title.value,
    lan: lan.value,
  });
});
</script>

<template>

  <div class="nx-doc-wrap">
    <div class="nx-doc">
      <introEn :last-update="lastUpdate" />
    </div>
  </div>
</template>
