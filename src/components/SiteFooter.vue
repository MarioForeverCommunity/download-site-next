<script setup>
import { siteVersion } from '../config.js'
import { getLanguage } from '../util/Language.js'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const lan = ref(getLanguage())

const buildTime = BUILD_TIME
const formatBuildTime = (isoString) => {
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

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
    <template v-if="lan === 'zh'">
      <span><a target="_blank" href="https://status.marioforever.net/">网站状态</a></span>
      <span>网站版本：{{ siteVersion }}</span>
      <span>构建时间：{{ formatBuildTime(buildTime) }}</span>
      <span><a target="_blank" href="https://github.com/MarioForeverCommunity/download-site-next">本站源码</a></span>
    </template>
    <template v-else>
      <div class="copyright-notice">This is NOT a Softendo/Nintendo official site. Mario and its related copyrights belong to Nintendo.</div>
      <div class="footer-links">
        <span>Site version: {{ siteVersion }}</span>
        <span>Build time: {{ formatBuildTime(buildTime) }}</span>
        <span><a target="_blank" href="https://github.com/MarioForeverCommunity/download-site-next">Source code</a></span>
      </div>
    </template>
  </footer>
</template>

<style scoped>
  * {
    font-family: Helvetica, Arial, "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", "tohoma,sans-serif";
  }

  footer {
    margin: 0 auto;
    padding-top: 30px;
    padding-bottom: 30px;
    color: rgb(170, 170, 170);
    box-sizing: border-box;
  }

  .copyright-notice {
    margin-bottom: 0.3em;
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

    .copyright-notice {
      margin-bottom: 0.1em;
    }

    footer span {
      margin-bottom: 0.1em;
    }

    footer {
      padding: 30px;
    }
  }

  a {
    color: rgb(170, 170, 170)
  }
</style>
