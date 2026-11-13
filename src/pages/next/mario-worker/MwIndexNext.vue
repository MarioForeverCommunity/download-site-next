<script setup>
// Mario Worker resource index — redesigned (English only, like the legacy page).
import { ref, computed } from "vue";
import NxShell from "../../../components/next/NxShell.vue";
import { getLanguage } from "../../../util/Language.js";
import { navTop } from "../../../config.js";
import introEn from "../../../markdown/mw-en.md";

const lan = ref(getLanguage());
const pageId = "mario-worker";
const pageEntry = navTop.find((item) => item.id === pageId);

const title = computed(() => pageEntry.title_alt);

document.title = title.value;
</script>

<template>
  <NxShell
    :page-id="pageId"
    :lan="lan"
    :title="title"
  >
    <div class="nx-doc">
      <h1 class="nx-masthead">{{ title }}</h1>
      <introEn />
    </div>
  </NxShell>
</template>
