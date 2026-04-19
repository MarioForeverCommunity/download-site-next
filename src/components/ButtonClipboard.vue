<script setup>
import { ref, computed } from 'vue';
import { useFloating, flip, shift, offset, autoUpdate } from '@floating-ui/vue';
import ClipboardIcon from './icons/IconClipboard.vue';
import { getCodeLabel } from '../util/GameUtil.js';

const props = defineProps({
  code: {
    type: String,
    required: true
  },
  lan: {
    type: String,
    required: true
  },
  link: {
    type: String,
    default: null
  }
});

function copyCode() {
  navigator.clipboard.writeText(props.code);
  displayCopied.value = true;
  setTimeout(() => {
    displayCopied.value = false;
  }, 3000);
}

const displayCopied = ref(false);

const clipboardCopyText = computed(() => {
  const isEn = props.lan === "en";
  if (displayCopied.value) {
    return isEn ? "Copied!" : "已复制！";
  } else {
    const codeLabel = getCodeLabel(props.link, props.lan);
    return isEn ? `Copy code to Clipboard` : `复制${codeLabel}到剪贴板`;
  }
});

const reference = ref(null);
const floating = ref(null);
const showTooltip = ref(false);

const { floatingStyles } = useFloating(reference, floating, {
  middleware: [flip(), shift(), offset(10)],
  whileElementsMounted: autoUpdate,
});

function onMouseEnter() {
  showTooltip.value = true;
}

function onMouseLeave() {
  showTooltip.value = false;
}
</script>

<template>
  <span style="display: inline-block;">
    <ClipboardIcon
      ref="reference"
      class="icon button"
      @click="copyCode();"
      @mouseenter="onMouseEnter()"
      @mouseleave="onMouseLeave()"
    />
    <Teleport to="body">
      <div
        ref="floating"
        v-if="showTooltip"
        class="floating-obj"
        :style="floatingStyles"
      >{{ clipboardCopyText }}</div>
    </Teleport>
  </span>
</template>

<style scoped>
  @import "../assets/general.css";
</style>

<style scoped>
  .icon {
    color: #000;
    width: 16px;
    height: 16px;
    display: inline-block;
    vertical-align: middle;
    margin: 2px;
  }

  .button {
    border: 1px solid rgba(0, 0, 0, 0);
    padding: 4px;
    border-radius: .25em;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    cursor: pointer;
    display: inline-block;
  }

  .button:hover, .button:focus {
    border: 1px solid rgba(0, 0, 0, 0.15);
    box-shadow: rgba(0, 0, 0, 0.1) 2px 2px 6px;
    color: rgba(0, 0, 0, 0.65);
  }

  .button:active {
    background-color: #F0F0F1;
    border: 1px solid rgba(0, 0, 0, 0.15);
    box-shadow: rgba(0, 0, 0, 0.06) 1px 1px 2px;
    color: rgba(0, 0, 0, 0.65);
  }

  .floating-obj {
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;
    text-align: center;
    border-radius: 6px;
    width: max-content;
    max-width: calc(min(800px, 90vw));
    padding: .25em .75em;
    z-index: 1002;
    font-family: Helvetica, Arial, "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", "tohoma,sans-serif";
  }
</style>
