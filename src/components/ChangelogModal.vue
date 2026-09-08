<script setup>
import { siteVersion } from '../config.js'
import { changelog } from '../data/changelog.js'
import { watch } from 'vue'
import { disableScroll, enableScroll } from '../util/OverlayScrollbarsUtil.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  lan: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close']);

// 分类渲染顺序与标签文案
const categories = [
  { key: 'features', zh: '新功能', en: 'New' },
  { key: 'improvements', zh: '优化', en: 'Improved' },
  { key: 'fixes', zh: '修复', en: 'Fixed' },
  { key: 'misc', zh: '其他', en: 'Other' }
];

const entryItems = (entry, key) => {
  if (props.lan === 'en') {
    const en = entry[key + '_en'];
    if (en && en.length > 0) return en;
  }
  return entry[key];
};

const entryCategories = (entry) => {
  return categories.filter(cat => {
    const items = entryItems(entry, cat.key);
    return items && items.length > 0;
  });
};

const isCurrentVersion = (version) => {
  return siteVersion === `v${version}`;
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    disableScroll();
  } else {
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    enableScroll();
  }
});
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="changelog-modal-bg" @click="emit('close')">
      <div class="changelog-modal-content" :class="{ 'lan-en': lan === 'en' }" @click.stop>
        <div class="modal-header">
          <h3>{{ lan === 'zh' ? '更新履历' : 'Changelog' }}</h3>
          <button class="close-button" @click="emit('close')">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line
                x1="18"
                y1="6"
                x2="6"
                y2="18"
              ></line>
              <line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
              ></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <section v-for="entry in changelog" :key="entry.version" class="version-block">
            <div class="version-header">
              <span class="version-badge">v{{ entry.version }}</span>
              <span v-if="isCurrentVersion(entry.version)" class="current-tag">
                {{ lan === 'zh' ? '当前版本' : 'Current' }}
              </span>
              <span class="version-date">{{ entry.date }}</span>
            </div>
            <div v-for="cat in entryCategories(entry)" :key="cat.key" class="category-block">
              <span class="category-pill" :class="'pill-' + cat.key">{{ lan === 'zh' ? cat.zh : cat.en }}</span>
              <ul class="category-list">
                <li v-for="(item, index) in entryItems(entry, cat.key)" :key="index">{{ item }}</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
  .changelog-modal-bg {
    position: fixed;
    z-index: 1001;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .changelog-modal-content {
    background-color: #fff;
    width: 90vw;
    max-width: 560px;
    max-height: 85vh;
    border-radius: .5em;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    text-align: left;
    font-family: Helvetica, Arial, "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", "tohoma,sans-serif";
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.8em 1.2em;
    border-bottom: 1px solid #eee;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.15em;
    color: #333;
  }

  .close-button {
    color: #666;
    background-color: rgba(0, 0, 0, 0.15);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .close-button:hover {
    color: #000;
    background-color: rgba(0, 0, 0, 0.3);
  }

  .close-button svg {
    width: 18px;
    height: 18px;
  }

  .modal-body {
    padding: 1.2em;
    overflow-y: auto;
    flex: 1;
    font-size: 0.95em;
  }

  .version-block {
    padding: 0.8em 0;
    border-bottom: 1px dashed #e0e0e0;
  }

  .version-block:last-child {
    border-bottom: none;
  }

  .version-header {
    display: flex;
    align-items: center;
    gap: 0.5em;
    margin-bottom: 0.5em;
    flex-wrap: wrap;
  }

  .version-badge {
    display: inline-block;
    padding: 0.1em 0.6em;
    border-radius: 999px;
    background-color: #e6f4ff;
    color: #007cdf;
    font-weight: 600;
    font-size: 0.95em;
  }

  .current-tag {
    display: inline-block;
    padding: 0.1em 0.5em;
    border-radius: 999px;
    border: 1px solid #4caf50;
    color: #388e3c;
    font-size: 0.8em;
    white-space: nowrap;
  }

  .version-date {
    color: #999;
    font-size: 0.85em;
    margin-left: auto;
    white-space: nowrap;
  }

  .category-block {
    display: flex;
    align-items: flex-start;
    gap: 0.6em;
    padding: 0.2em 0;
  }

  .category-pill {
    /* 固定列宽保证各分类列表左缘对齐；英文 "Improved" 较长，英文模式加宽列基准 */
    flex: 0 0 4em;
    min-width: 4em;
    box-sizing: border-box;
    margin-top: 0.4em;
    display: inline-block;
    padding: 0.05em 0.5em;
    border-radius: 999px;
    font-size: 0.8em;
    text-align: center;
    white-space: nowrap;
  }

  .lan-en .category-pill {
    flex-basis: 5.2em;
    min-width: 5.2em;
  }

  .pill-features {
    background-color: #e8f5e9;
    color: #2e7d32;
  }

  .pill-improvements {
    background-color: #e6f4ff;
    color: #007cdf;
  }

  .pill-fixes {
    background-color: #fff3e0;
    color: #e67e22;
  }

  .pill-misc {
    background-color: #eeeeee;
    color: #757575;
  }

  .category-list {
    margin: 0;
    padding-left: 1.2em;
    list-style: disc;
    flex: 1;
  }

  .category-list li {
    padding: 0.15em 0;
    line-height: 1.4;
    color: #444;
  }

  body.dark .changelog-modal-content {
    background-color: #2a2a2a;
  }

  body.dark .modal-header {
    border-bottom-color: #444;
  }

  body.dark .modal-header h3 {
    color: #eee;
  }

  body.dark .close-button {
    color: #aaa;
    background-color: rgba(255, 255, 255, 0.1);
  }

  body.dark .close-button:hover {
    color: #fff;
    background-color: rgba(255, 255, 255, 0.2);
  }

  body.dark .version-block {
    border-bottom-color: #444;
  }

  body.dark .version-badge {
    background-color: #1d3a55;
    color: #4da3ff;
  }

  body.dark .current-tag {
    border-color: #66bb6a;
    color: #81c784;
  }

  body.dark .version-date {
    color: #777;
  }

  body.dark .pill-features {
    background-color: #1e3a24;
    color: #81c784;
  }

  body.dark .pill-improvements {
    background-color: #1d3a55;
    color: #4da3ff;
  }

  body.dark .pill-fixes {
    background-color: #4a3319;
    color: #ffb74d;
  }

  body.dark .pill-misc {
    background-color: #3a3a3a;
    color: #aaa;
  }

  body.dark .category-list li {
    color: #ccc;
  }

  .modal-enter-active, .modal-leave-active {
    transition: opacity 0.3s ease;
  }

  .modal-enter-from, .modal-leave-to {
    opacity: 0;
  }
</style>
