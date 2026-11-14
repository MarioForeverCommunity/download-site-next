<script setup>
// Mario Forever resource index — redesigned.
//
// Prose is the same markdown the legacy page renders (mf-zh.md / mf-en.md), so
// wording never forks between designs. The container is full-width; only the
// text measure is capped, which lets the embedded record cards and carousels use
// the whole canvas.
import { ref, computed } from "vue";
import NxShell from "../../../components/next/NxShell.vue";
import NxDocPanels from "../../../components/next/NxDocPanels.vue";
import { getLanguage, setLanguageZh, setLanguageEn } from "../../../util/Language.js";
import { getMfDocLastUpdated } from "../../../util/next/docUpdated.js";
import { navTop } from "../../../config.js";
import indexZh from "../../../markdown/mf-zh.md";
import indexEn from "../../../markdown/mf-en.md";

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
</script>

<template>
  <NxShell
    :page-id="pageId"
    :lan="lan"
    :title="title"
    @change-lan-zh="pageSetLanguageZh"
    @change-lan-en="pageSetLanguageEn"
  >
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
  </NxShell>
</template>
