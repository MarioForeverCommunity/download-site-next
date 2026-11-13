<script setup>
// Mario Forever engines documentation — redesigned.
//
// Content is the existing engines markdown (English only, matching the legacy
// page). The markdown's `<AssetsEntry>` calls resolve to the redesigned preview.
import { ref, computed } from "vue";
import NxShell from "../../../components/next/NxShell.vue";
import { getLanguage } from "../../../util/Language.js";
import { navTop } from "../../../config.js";
import introEn from "../../../markdown/engines-en.md";

const lan = ref(getLanguage());
const pageId = "engines";
const pageEntry = navTop.find((item) => item.id === pageId);

// The engines page is English-only in both designs.
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
