<script setup>
  import { siteVersion } from '../config.js'
  import { getLanguage } from '../util/Language.js'
  import { ref, onMounted, onBeforeUnmount } from 'vue'

  const lan = ref(getLanguage())
  
  // 监听语言切换事件
  const handleLanguageChange = () => {
    lan.value = getLanguage()
  }
  
  // 监听自定义语言切换事件
  const handleCustomLanguageChange = (event) => {
    lan.value = event.detail.language
  }
  
  onMounted(() => {
    // 监听语言切换事件
    window.addEventListener('language-changed', handleLanguageChange)
    window.addEventListener('custom-language-changed', handleCustomLanguageChange)
    
    // 监听 storage 事件，用于检测 cookie 变化
    window.addEventListener('storage', handleLanguageChange)
  })
  
  onBeforeUnmount(() => {
    window.removeEventListener('language-changed', handleLanguageChange)
    window.removeEventListener('custom-language-changed', handleCustomLanguageChange)
    window.removeEventListener('storage', handleLanguageChange)
  })
</script>

<template>
  <footer>
    <span v-if="lan === 'zh'"><a target="_blank" href="https://status.marioforever.net/">网站状态</a></span>
    <span v-else>This is NOT a Softendo/Nintendo official site. Mario and all relatives belong to Nintendo.</span>
    <span v-if="lan === 'zh'">网站版本：{{ siteVersion }}</span>
    <span v-else>Site version: {{ siteVersion }}</span>
    <span v-if="lan === 'zh'"><a target="_blank" href="https://github.com/MarioForeverCommunity/download-site-next">本站源码</a></span>
    <span v-else><a target="_blank" href="https://github.com/MarioForeverCommunity/download-site-next">Source code</a></span>
  </footer>
</template>

<style scoped>
  footer {
    margin: 0 auto;
    padding-top: 30px;
    padding-bottom: 30px;
    color: rgb(170, 170, 170);
    box-sizing: border-box;
  }

  @media (min-width: 800px) {
    footer {
      text-align: center;
    }

    footer span:not(:first-child) {
      border-left: solid 1px #e0e0e0;
      margin-left: .75em;
      padding-left: .75em;
    }
  }

  @media (max-width: 800px) {
    footer span {
      display: block;
    }

    footer {
      padding: 30px;
    }
  }

  a {
    color: rgb(170, 170, 170)
  }
</style>