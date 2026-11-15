<script setup>
// Mario Forever resource index — redesigned.
//
// Prose is the same markdown the legacy page renders (mf-zh.md / mf-en.md), so
// wording never forks between designs. The container is full-width; only the
// text measure is capped, which lets the embedded record cards and carousels use
// the whole canvas.
import { ref, computed, watchEffect } from "vue";
import NxDocPanels from "../../../components/next/NxDocPanels.vue";
import { getLanguage, setLanguageZh, setLanguageEn } from "../../../util/Language.js";
import { getMfDocLastUpdated } from "../../../util/next/docUpdated.js";
import { navTop } from "../../../config.js";
import indexZh from "../../../markdown/mf-zh.md";
import indexEn from "../../../markdown/mf-en.md";
import { publishShell, publishShellHandlers } from "../../../util/next/shellStore.js";

const lan = ref(getLanguage());
const pageId = "index";
const pageEntry = navTop.find((item) => item.id === pageId);

const title = computed(() => (lan.value === "zh" ? pageEntry.title : pageEntry.title_alt));
const doc = computed(() => (lan.value === "zh" ? indexZh : indexEn));

// The markdown prints a "Last updated" line when the page supplies the date;
// it is derived from the newest commit touching the data and the document.
const lastUpdate = ref({ zh: null, en: null });
getMfDocLastUpdated().then((value) => { lastUpdate.value = value; });

function pageSetLanguageZh() {
  lan.value = setLanguageZh();
  document.title = pageEntry.title;
}

function pageSetLanguageEn() {
  lan.value = setLanguageEn();
  document.title = pageEntry.title_alt;
}

document.title = title.value;

// The app shell is rendered once by the SPA root; this page only publishes
// the parts that differ (title, write-up, search model) plus its own controls.
// A watchEffect keeps the shell in sync when the language changes or the
// write-up's date arrives after the first render.
watchEffect(() => {
  publishShell({
    pageId: "index",
    title: title.value,
    lan: lan.value,
  });
});
publishShellHandlers({
  changeLanZh: pageSetLanguageZh,
  changeLanEn: pageSetLanguageEn,
});
</script>

<template>

  <div class="nx-doc-wrap">
    <div class="nx-doc">
      <component
        :is="doc"
        :last-update-zh="lastUpdate.zh"
        :last-update-en="lastUpdate.en"
      />
    </div>
  </div>
  <NxDocPanels :lan="lan" />
</template>
