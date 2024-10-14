<script setup>
  import { ref, computed } from 'vue';
  import ClipboardIcon from './icons/IconClipboard.vue';

  const props = defineProps({
    code: {
      type: String,
      required: true
    }, 
    lan : {
      type: String,
      required: true
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
    if (displayCopied.value) {
      return props.lan.value == "en" ? "Copied!" : "已复制！";
    } else {
      return props.lan.value == "en" ? "Copy code to Clipboard" : "复制提取码到剪贴板";
    }
  })
</script>

<template>
  <a class="tooltip">
    <ClipboardIcon class="icon button" @click="copyCode();"></ClipboardIcon>
    <span class="tooltiptext tooltip-bottom">{{ clipboardCopyText }}</span><i></i>
  </a>
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
    transition: all 250ms;
    cursor: pointer;
    display: inline-block;
  }

  .button:hover, .button:focus {
    border: 1px solid rgba(0, 0, 0, 0.15);
    box-shadow: rgba(0, 0, 0, 0.1) 2px 2px 6px;
    color: rgba(0, 0, 0, 0.65);
  }

  .button:hover {
    transform: translateY(-1px);
  }

  .button:active {
    background-color: #F0F0F1;
    border: 1px solid rgba(0, 0, 0, 0.15);
    box-shadow: rgba(0, 0, 0, 0.06) 1px 1px 2px;
    color: rgba(0, 0, 0, 0.65);
    transform: translateY(0);
  }
</style>