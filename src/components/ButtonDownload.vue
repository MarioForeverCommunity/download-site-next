<script setup>
  import DownloadIcon from './icons/IconDownload.vue';

  defineProps({
    href: {
      type: String,
      required: true
    }, 
    lan: {
      type: String,
      required: true
    }, 
  });
</script>

<template>
  <span class="tooltip">
    <a :href="href" class="button" target="_blank"><DownloadIcon class="icon"></DownloadIcon>
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