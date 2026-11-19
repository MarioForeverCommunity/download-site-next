<script setup>
import { ref, computed, onBeforeUnmount } from 'vue';
import { useFloating, flip, shift, offset, autoUpdate } from '@floating-ui/vue';
import Icon from './icons/Icon.vue';
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

const displayCopied = ref(false);
const displayFailed = ref(false);
let copyTimer = null;

// The async Clipboard API is unavailable on insecure origins (e.g. a phone
// opening the dev server over a LAN IP) and in some in-app WebViews, and it can
// reject on iOS when the page is not focused. Fall back to the deprecated
// execCommand path, which must run synchronously inside the click handler, and
// only report success once a write actually went through.
function legacyCopy(text) {
  let area = null;
  try {
    area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, area.value.length);
    return document.execCommand("copy");
  } catch (_e) {
    return false;
  } finally {
    if (area && area.parentNode) area.parentNode.removeChild(area);
  }
}

function markCopyResult(ok) {
  displayCopied.value = ok;
  displayFailed.value = !ok;
  // Touch devices do not hover, so the result tooltip would never appear
  // without being opened explicitly.
  showTooltip.value = true;
  if (copyTimer) clearTimeout(copyTimer);
  copyTimer = setTimeout(() => {
    displayCopied.value = false;
    displayFailed.value = false;
  }, 3000);
}

function copyCode() {
  const text = props.code;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(
      () => markCopyResult(true),
      () => markCopyResult(legacyCopy(text))
    );
  } else {
    markCopyResult(legacyCopy(text));
  }
}

onBeforeUnmount(() => {
  if (copyTimer) clearTimeout(copyTimer);
});

const clipboardCopyText = computed(() => {
  const isEn = props.lan === "en";
  if (displayFailed.value) {
    return isEn ? "Copy failed, please select the code manually" : "复制失败，请手动选择提取码";
  }
  if (displayCopied.value) {
    return isEn ? "Copied!" : "已复制！";
  }
  const codeLabel = getCodeLabel(props.link, props.lan);
  return isEn ? `Copy code to Clipboard` : `复制${codeLabel}到剪贴板`;
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
    <Icon
      name="clipboard"
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
    font-family: Inter, Helvetica, Arial, "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", Tahoma, sans-serif;
  }
</style>
