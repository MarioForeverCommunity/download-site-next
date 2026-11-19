<script setup>
// Single icon renderer for the legacy design. Size and colour come from the
// scoped `.icon` rules at each call site, so this component only resolves a
// name to its Font Awesome definition and inherits class/style through attrs.
import { computed } from "vue";
import { FontAwesomeIcon } from "./fa.js";
import { ICONS } from "./iconMap.js";

const props = defineProps({
  name: {
    type: String,
    required: true
  }
});

const icon = computed(() => ICONS[props.name] || ICONS.info);
</script>

<template>
  <FontAwesomeIcon
    :icon="icon"
    style="overflow: visible;"
  />
</template>
