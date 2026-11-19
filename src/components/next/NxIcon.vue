<script setup>
// One icon component for the redesigned UI, backed by Font Awesome Free.
// Names resolve through the catalogue shared with the legacy design
// (src/components/icons/iconMap.js), while the size stays an explicit pixel
// value because this interface has no global `.icon` sizing rules.
import { computed } from "vue";
import { FontAwesomeIcon } from "../icons/fa.js";
import { ICONS } from "../icons/iconMap.js";

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 16
  }
});

const icon = computed(() => ICONS[props.name] || ICONS.info);
const px = computed(() => `${props.size}px`);
</script>

<template>
  <FontAwesomeIcon
    :icon="icon"
    :style="{ width: px, height: px, overflow: 'visible' }"
    aria-hidden="true"
    focusable="false"
  />
</template>
