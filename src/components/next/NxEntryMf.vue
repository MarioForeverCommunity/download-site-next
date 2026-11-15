<script setup>
// Thin wrappers that pin the record kind, so the documentation markdown can keep
// using `<MfGamesEntry>`, `<AssetsEntry>` and `<SoftendoEntry>` unchanged while the
// new design renders the redesigned preview.
import NxEntry from "./NxEntry.vue";

const props = defineProps({
  name: { type: String, required: true },
  variant: { type: String, default: null },
  ver: { type: String, default: null },
  defaultVer: { type: String, default: null },
});
</script>

<template>
  <NxEntry
    kind="mf"
    :name="props.name"
    :variant="props.variant"
    :ver="props.ver"
    :default-ver="props.defaultVer"
  />
</template>
