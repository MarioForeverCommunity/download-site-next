<script setup>
// Mario Forever resource index — redesigned entry page.
//
// The prose is the same markdown the legacy page renders (mf-zh.md / mf-en.md),
// so wording never forks between designs. Chrome differs: the version table is
// the redesigned ledger, and the hidden blocks the docs link to
// (`#history-content`, `#credits-content`) open in a side panel.
import { ref, computed } from "vue";
import NxShell from "../../../components/next/NxShell.vue";
import NxDocPanels from "../../../components/next/NxDocPanels.vue";
import { getLanguage, setLanguageZh, setLanguageEn } from "../../../util/Language.js";
import { navTop } from "../../../config.js";
import indexZh from "../../../markdown/mf-zh.md";
import indexEn from "../../../markdown/mf-en.md";

const lan = ref(getLanguage());
const pageId = "index";
const pageEntry = navTop.find((item) => item.id === pageId);

const title = computed(() => (lan.value === "zh" ? pageEntry.title : pageEntry.title_alt));
const doc = computed(() => (lan.value === "zh" ? indexZh : indexEn));

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
    <div class="nx-doc">
      <h1 class="nx-masthead">{{ title }}</h1>
      <component :is="doc" />
    </div>
    <NxDocPanels :lan="lan" />
  </NxShell>
</template>
