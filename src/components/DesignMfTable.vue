<script setup>
// Design-aware wrapper for the original Mario Forever version table.
//
// The markdown documents (`mf-zh.md` / `mf-en.md`) are the single source of the
// site's written content, so instead of forking them per design they import this
// component, which renders the table in whichever design is active.
//
// The markdown still passes the legacy `lan="zh" | "en"`: the legacy table needs
// exactly that, while the redesigned table takes an i18n locale (`zh` is accepted
// as an alias of `zh-Hans` and resolved by the i18n core).
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
    :locale="props.lan"
  />
  <OriginalMfTable
    v-else
    :lan="props.lan"
  />
</template>
