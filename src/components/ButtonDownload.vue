<script setup>
  import DownloadIcon from './icons/IconDownload.vue';

  const props = defineProps({
    href: {
      type: String,
      required: true
    }, 
    lan: {
      type: String,
      required: true
    },
    hasToolbar: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: ''
    }
  });

  const handleDownloadClick = (event, href, hasToolbar, type) => {
    if (hasToolbar && type === 'installer') {
      const messageZh = '该版本的安装程序包含 Mario Forever Toolbar（广告插件），请在安装过程中取消勾选“Install the Mario Forever Toolbar”选项；建议优先下载绿色版。';
      const messageEn = 'Warning: This version\'s installer includes the "Mario Forever Toolbar". Please make sure to uncheck the "Install the Mario Forever Toolbar" option to avoid installing it.';
      const message = props.lan === 'zh' ? messageZh : messageEn;
      
      if (confirm(message)) {
        window.open(href, '_blank');
      }
      event.preventDefault();
    }
  };
</script>

<template>
  <span class="tooltip">
    <a :href="href" class="button" target="_blank" @click="handleDownloadClick($event, href, hasToolbar, type)"><DownloadIcon class="icon"></DownloadIcon>
      {{ lan == "en" ? "Download" : "下载" }}
    </a>
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
    transition: all 250ms;
    cursor: pointer;
    display: inline-block;
    color: #000;
    text-decoration: none;
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
    transform: translateY(0);
  }
</style>