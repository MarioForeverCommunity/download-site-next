<script setup>
  import {siteVersion} from '../config.js'
</script>

<template>
  <footer>
    <span><a target="_blank" href="https://status.marioforever.net/">网站状态</a></span>
    <span>网站版本：{{ siteVersion }}</span>
    <span><a target="_blank" href="https://github.com/MarioForeverCommunity/download-site-next">本站源码</a></span>
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