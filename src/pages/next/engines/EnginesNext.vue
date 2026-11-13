<script setup>
// Mario Forever engines documentation — redesigned (English only, as before).
import { ref, computed } from "vue";
import NxShell from "../../../components/next/NxShell.vue";
import { getLanguage } from "../../../util/Language.js";
import { navTop } from "../../../config.js";
import introEn from "../../../markdown/engines-en.md";

const lan = ref(getLanguage());
const pageId = "engines";
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
    <div class="nx-doc-wrap">
      <div class="nx-doc">
        <h1>{{ title }}</h1>
        <introEn />
      </div>
    </div>
  </NxShell>
</template>
