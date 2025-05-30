<script setup>
import { ref, onMounted } from 'vue';

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
    <span v-if="isDark">☀️</span>
    <span v-else>🌙</span>
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
    bottom: 90px;
    right: 30px;
    z-index: 1000;
    width: 44px;
    height: 44px;
    background-color: #afdcff;
    border: 1px solid rgba(0, 0, 0, 0);
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
    border: 1px solid rgba(0, 0, 0, 0.15);
    box-shadow: rgba(0, 0, 0, 0.06) 1px 1px 2px;
    color: rgba(0, 0, 0, 0.65);
    transform: translateY(51px);
  }

  body.dark .dark-mode-btn {
      background-color: #555 !important;
  }

  body.dark .dark-mode-btn:hover {
      background-color: #444 !important;
  }

  .dark-mode-btn span {
    font-size: 20px;
    font-weight: bold;
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