<script setup>
// Design-aware wrapper for the original Mario Forever version table.
//
// The markdown documents (`mf-zh.md` / `mf-en.md`) are the single source of the
// site's written content, so instead of forking them per design they import this
// component, which renders the table in whichever design is active.
import { isNextDesign } from "../util/Design.js";
import OriginalMfTable from "./OriginalMfTable.vue";
import NxMfTable from "./next/NxMfTable.vue";

const props = defineProps({
  lan: {
    type: String,
    required: true
  }
});
</script>

<template>
  <NxMfTable
    v-if="isNextDesign()"
    :lan="props.lan"
  />
  <OriginalMfTable
    v-else
    :lan="props.lan"
  />
</template>
