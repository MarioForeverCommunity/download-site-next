<script setup>
import { ref, onMounted } from 'vue';
import Icon from './icons/Icon.vue';

const isDark = ref(false);

function updateDark(val) {
  isDark.value = val;
  if (val) {
    document.body.classList.add('dark');
    localStorage.setItem('darkMode', '1');
  } else {
    document.body.classList.remove('dark');
    localStorage.setItem('darkMode', '0');
  }
}

function toggleDarkMode() {
  updateDark(!isDark.value);
}

onMounted(() => {
  const saved = localStorage.getItem('darkMode');
  if (saved === '1') {
    updateDark(true);
  } else if (saved === '0') {
    updateDark(false);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    updateDark(true);
  }
});
</script>

<template>
  <button class="icon-inner dark-mode-btn" @click="toggleDarkMode">
    <Icon v-if="isDark" name="sun" class="dark-mode-glyph" />
    <Icon v-else name="moon" class="dark-mode-glyph is-moon" />
  </button>
</template>

<style scoped>
  .icon-inner {
    color: #000;
    display: inline-block;
    vertical-align: middle;
    margin: 2px;
  }

  .dark-mode-btn {
    position: fixed;
    bottom: 128px;
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
    /* 向下偏移返回顶部按钮高度+间距 */
    transform: translateY(54px);
  }

  .dark-mode-btn:hover {
    background-color: #97ccf5;
    box-shadow: rgba(0, 0, 0, 0.2) 1px 1px 2px;
    color: rgba(0, 0, 0, 0.65);
    transform: translateY(51px);
  }

  body.dark .dark-mode-btn {
    background-color: #555 !important;
    color: #bbb;
  }

  body.dark .dark-mode-btn:hover {
    background-color: #444 !important;
    color: #999;
  }

  .dark-mode-glyph {
    width: 22px;
    height: 22px;
  }

  /* A solid moon fills its box more than the sun's rays do, so it reads larger
     at the same size; counter it slightly. */
  .dark-mode-glyph.is-moon {
    width: 18px;
    height: 18px;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
