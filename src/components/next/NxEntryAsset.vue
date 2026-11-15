<script setup>
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
    kind="asset"
    :name="props.name"
    :variant="props.variant"
    :ver="props.ver"
    :default-ver="props.defaultVer"
  />
</template>
