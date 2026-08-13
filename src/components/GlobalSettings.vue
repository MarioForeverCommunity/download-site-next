<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getLanguage, getUseDirectLink, getDefaultSort, setDefaultSort } from '../util/Language.js';
import { disableScroll, enableScroll } from '../util/OverlayScrollbarsUtil.js';

const lan = ref(getLanguage());
const showSettings = ref(false);
const useDirectLink = getUseDirectLink();
const defaultSort = getDefaultSort();

// 临时值：弹框内编辑，确定后提交，取消则丢弃
const tempUseDirectLink = ref(false);
const tempDefaultSort = ref('date_desc');

const sortOptions = [
  { value: "name_asc", labelZh: "名称正序", labelEn: "Name (A to Z)" },
  { value: "name_desc", labelZh: "名称倒序", labelEn: "Name (Z to A)" },
  { value: "author_asc", labelZh: "作者正序", labelEn: "Author (A to Z)" },
  { value: "author_desc", labelZh: "作者倒序", labelEn: "Author (Z to A)" },
  { value: "date_asc", labelZh: "日期正序", labelEn: "Date (oldest first)" },
  { value: "date_desc", labelZh: "日期倒序", labelEn: "Date (newest first)" },
];

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
    tempUseDirectLink.value = useDirectLink.value;
    tempDefaultSort.value = defaultSort.value;
    disableScroll();
  } else {
    enableScroll();
  }
}

function confirmSettings() {
  useDirectLink.value = tempUseDirectLink.value;
  setDefaultSort(tempDefaultSort.value);
  showSettings.value = false;
  enableScroll();
}

function cancelSettings() {
  showSettings.value = false;
  enableScroll();
}
</script>

<template>
  <button class="icon-inner settings-btn" @click="toggleSettings" title="设置">
    <span>⚙️</span>
  </button>

  <Transition name="modal">
    <div v-if="showSettings" class="modal-bg">
      <div class="modal-content">
        <div class="settings-header">
          <h3>{{ lan === 'zh' ? '全局设置' : 'Global Settings' }}</h3>
        </div>
        <div class="settings-body">
          <div class="settings-item">
            <span>{{ lan === 'zh' ? '默认排序' : 'Default Sort' }}</span>
            <select v-model="tempDefaultSort" class="settings-sort-select">
              <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
                {{ lan === 'zh' ? opt.labelZh : opt.labelEn }}
              </option>
            </select>
          </div>
          <label class="settings-item">
            <input type="checkbox" v-model="tempUseDirectLink" />
            <span>{{ lan === 'zh' ? '资源站使用直链' : 'Use direct link for Community File Hub' }}</span>
          </label>
        </div>
        <div class="settings-footer">
          <button class="md-button md-button-secondary" @click="cancelSettings">{{ lan === 'zh' ? '取消' : 'Cancel' }}</button>
          <button class="md-button" @click="confirmSettings">{{ lan === 'zh' ? '确定' : 'OK' }}</button>
        </div>
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
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    width: 90vw;
    max-width: 340px;
    max-height: 80vh;
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: Helvetica, Arial, "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", "tohoma,sans-serif";
  }

  .settings-header {
    padding: 1em 1.2em 0.6em;
    border-bottom: 1px solid #eee;
  }

  .settings-header h3 {
    margin: 0;
    font-size: 1.15em;
  }

  .settings-body {
    padding: 1em 1.2em;
    overflow-y: auto;
    flex: 1;
  }

  .settings-item {
    display: flex;
    align-items: center;
    gap: .5em;
    cursor: pointer;
    user-select: none;
    font-size: 0.95em;
  }

  .settings-item input {
    cursor: pointer;
  }

  .settings-item + .settings-item {
    margin-top: .9em;
  }

  .settings-sort-select {
    margin-left: auto;
    cursor: pointer;
    color: #4e6e8e;
    display: inline-block;
    border: 1px solid #cfd4db;
    border-radius: 5px;
    outline: none;
    padding: .3em .4em;
  }

  .settings-sort-select:hover,
  .settings-sort-select:focus {
    cursor: pointer;
    border-color: #008cff;
  }

  .settings-footer {
    display: flex;
    justify-content: flex-end;
    padding: .8em 1.2em;
    border-top: 1px solid #eee;
  }

  .settings-footer .md-button {
    font-size: 0.9em;
    padding: 0.4em 1em;
  }

  .md-button {
    color: white;
    cursor: pointer;
    background-color: #008cff;
    padding: .5em;
    border-radius: .5em;
    margin-right: .5em;
    margin: .25em;
    display: inline-block;
  }

  .md-button:hover,
  .md-button:focus {
    background-color: #30acff;
    text-decoration: none;
    color: white;
  }

  .md-button:active {
    background-color: #007cdf;
  }

  .md-button-secondary {
    background-color: #eee;
    color: #555;
    border-color: #ccc;
  }

  .md-button-secondary:hover,
  .md-button-secondary:focus {
    background-color: #ddd;
    color: #555;
  }

  /* Dark mode（对齐 MfGames 标签筛选弹框） */
  body.dark .modal-content {
    background-color: #2a2a2a !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  }

  body.dark .settings-header {
    border-bottom-color: #444;
  }

  body.dark .settings-footer {
    border-top-color: #444;
  }

  body.dark .md-button-secondary {
    background-color: #3a3a3a !important;
    color: #bbb !important;
    border-color: #555 !important;
  }

  body.dark .md-button-secondary:hover {
    background-color: #444 !important;
    color: #bbb !important;
  }
</style>
