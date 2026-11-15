<script setup>
import { ref } from 'vue';

const thisDom = ref(null);
const popperDom = ref(null);

defineEmits(['showTooltip', 'hideTooltip']);

const props = defineProps({
  inCard: {
    type: Boolean,
    default: true
  }
});

// Popper images may ship without a `src` (only `data-src`) so a long list does
// not download every preview up front. Turn them into real images only when the
// tooltip is actually shown, and only in the copy that gets displayed.
const popperHtml = () => {
  const clone = popperDom.value.cloneNode(true);
  clone.querySelectorAll("img[data-src]").forEach((img) => {
    img.src = img.getAttribute("data-src");
    img.removeAttribute("data-src");
  });
  return clone.innerHTML;
};
</script>

<template>
  <div
    style="display: inline;"
    ref="thisDom"
    @mouseenter="props.inCard ? $parent.$emit('showTooltip', [thisDom, popperHtml()]) : $emit('showTooltip', [thisDom, popperHtml()])"
    @mouseleave="props.inCard ? $parent.$emit('hideTooltip', thisDom) : $emit('hideTooltip', thisDom)"
  >
    <slot></slot>
  </div>
  <div v-show="false" ref="popperDom"><slot name="popper"></slot></div>
</template>
