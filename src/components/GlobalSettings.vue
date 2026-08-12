<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getLanguage, getUseDirectLink } from '../util/Language.js';
import { disableScroll, enableScroll } from '../util/OverlayScrollbarsUtil.js';

const lan = ref(getLanguage());
const showSettings = ref(false);
const useDirectLink = getUseDirectLink();

// 监听语言切换事件
const handleLanguageChanged = (event) => {
  const nextLan = event?.detail?.language || getLanguage();
  lan.value = nextLan;
};

onMounted(() => {
  window.addEventListener('custom-language-changed', handleLanguageChanged);
  window.addEventListener('language-changed', handleLanguageChanged);
});

onBeforeUnmount(() => {
  window.removeEventListener('custom-language-changed', handleLanguageChanged);
  window.removeEventListener('language-changed', handleLanguageChanged);
});

function toggleSettings() {
  showSettings.value = !showSettings.value;
  if (showSettings.value) {
    disableScroll();
  } else {
    enableScroll();
  }
}
</script>

<template>
  <button class="icon-inner settings-btn" @click="toggleSettings" title="设置">
    <span>⚙️</span>
  </button>

  <Transition name="modal">
    <div v-if="showSettings" class="modal-bg" @click="toggleSettings">
      <div class="modal-content" @click.stop="">
        <div class="settings-title">
          {{ lan === 'zh' ? '全局设置' : 'Global Settings' }}
        </div>
        <label class="settings-item">
          <input type="checkbox" v-model="useDirectLink" />
          <span>{{ lan === 'zh' ? '资源站使用直链' : 'Use direct link for Community File Hub' }}</span>
        </label>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
  .icon-inner {
    color: #000;
    display: inline-block;
    vertical-align: middle;
    margin: 2px;
  }

  .settings-btn {
    position: fixed;
    bottom: 20px;
    right: 30px;
    width: 44px;
    height: 44px;
    background-color: #afdcff;
    box-shadow: rgba(0, 0, 0, 0.2) 1px 1px 2px;
    font-size: 22px;
    border-radius: 50%;
    transition: all 250ms;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .settings-btn:hover {
    background-color: #97ccf5;
    box-shadow: rgba(0, 0, 0, 0.2) 1px 1px 2px;
    color: rgba(0, 0, 0, 0.65);
    transform: translateY(-3px);
  }

  body.dark .settings-btn {
    background-color: #555 !important;
  }

  body.dark .settings-btn:hover {
    background-color: #444 !important;
  }

  .modal-bg {
    position: fixed;
    z-index: 1001;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.4);
  }

  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.3s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }

  .modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-right: -50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    max-width: 80vw;
    max-height: 80vh;
    padding: 1em;
    border-radius: .5em;
    overflow-y: auto;
    font-family: Helvetica, Arial, "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", "tohoma,sans-serif";
  }

  .settings-title {
    font-weight: bold;
    font-size: 1.15em;
    margin-bottom: .8em;
  }

  .settings-item {
    display: flex;
    align-items: center;
    gap: .4em;
    cursor: pointer;
    user-select: none;
  }

  .settings-item input {
    cursor: pointer;
  }
</style>
