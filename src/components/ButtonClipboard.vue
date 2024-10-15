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
    <ClipboardIcon class="icon button" @click="copyCode();" />
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
  .tooltip {
    position: relative;
    display: inline-block;
  }

  .tooltip .tooltiptext {
    top:40px;
    left:50%;
    transform:translate(-50%, -10px);
    display:none;
    background-color: rgba(0, 0, 0, 1);
    color: #fff;
    text-align: center;
    border-radius: 6px;
    position: absolute;
    z-index: 1;
    padding: .25em .75em;
    width: max-content;
    max-width: 70vw;
  }

  .tooltip .tooltiptext.tooltip-left-align {
  text-align: left;
  }

  .tooltip .tooltiptext::after {
    content: "";
    position: absolute;
    bottom: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent black transparent;
  }

  .tooltiptext i {
    position:absolute;
    bottom:100%;
    left:50%;
    margin-left:-12px;
    width:24px;
    height:12px;
    overflow:hidden;
  }

  .tooltiptext i::after {
    content:'';
    position:absolute;
    width:12px;
    height:12px;
    left:50%;
    transform:translate(-50%,50%) rotate(45deg);
    background-color: rgba(0, 0, 0, 0.7);
  }

  .tooltip:hover .tooltiptext {
    display:block;
  }
</style>