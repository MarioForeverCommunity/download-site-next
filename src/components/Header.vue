<script setup>
  import { navTop, topBar } from "../config.js";

  const BASE_URL = import.meta.env.BASE_URL;

  const props = defineProps({
    pageId: {
      type: String,
      required: true
    },
    lanVar : {
      required: true
    }
  });

  const pageEntry = navTop.find(item => item.id === props.pageId);

  function displayLan() {
    if (pageEntry.show_en == false && props.lanVar == "en") {
      return "zh";
    }
    return props.lanVar;
  }
</script>

<template>
  <div class="topbar">
    <div class="topbar-inner">
      <a v-for="item in topBar.filter(a => displayLan() == 'zh' || a.show_en)" :href="item.link" class="link-item">{{ displayLan() == 'zh' ? item.name : item.name_alt }}</a>
      <div style="float: right; display: inline;" v-if="pageEntry.show_en == true">
        <a class="lan-item" :class="displayLan() == 'zh' ? 'active' : ''" @click="$emit('changeLanZh')">中文</a> |
        <a class="lan-item" :class="displayLan() == 'en' ? 'active' : ''" @click="$emit('changeLanEn')">English</a>
      </div>
    </div>
  </div>
  <header>
    <div class="container header-container">
      <div class="header-row">
        <h1>{{ displayLan() == 'zh' ? pageEntry.title : pageEntry.title_alt }}</h1>
      </div>
      <div class="header-row nav-row">
        <div class="radio-inputs">
          <a v-for="nav in navTop.filter(item => displayLan() == 'zh' || item.show_en == true)" class="radio" :class="nav.id == props.pageId ? 'checked' : ''" :href="nav.link">
            <span class="radio-text" name="radio">
              {{ displayLan() == 'zh' ? nav.option : nav.option_alt }}
            </span>
          </a>
        </div>
      </div>
      <div class="header-row nav-row warning" v-if="props.lanVar == 'en' && pageEntry.show_en == false">
        <strong>Warning:</strong><br>
        You are currently viewing a page that is only available in Chinese. If you have inadvertently accessed this page, please click <a href="/index.html">here</a> to return to the index.
      </div>
    </div>
  </header>
</template>

<style scoped>
  .topbar {
    background-color: #e6e6e6;
    font-size: 13px;
    padding: 4px 0;
    line-height: 30px;
    height: 30px;
  }

  .topbar-inner {
    margin: 0 auto;
    width: 100%;
  }

  .link-item {
    margin-right: 20px;
    color: rgb(85, 85, 85);
  }

  .lan-item {
    color: rgb(85, 85, 85);
    cursor: pointer;
  }

  .lan-item.active {
    font-weight: bold;
  }

  .lan-row .button {
    float: right;
  }

  .header-container {
    display: flex;
    justify-content: center;
    flex-direction: column;
    width: 100vw;
    padding: 10px;
    margin: 20px auto;
    box-sizing: border-box;
  }

  .nav-row {
    width: 100%;
  }

  @media (max-width: 1333px) and (min-width: 800px) {
    .header-container {
      width: 90vw;
      border-radius: 2px;
    }

    .nav-row {
      width: 90%;
    }

    .topbar-inner {
      margin: 0 auto;
      width: 90%;
    }
  }

  @media (min-width: 1333px) {
    .header-container {
      width: 1200px;
      border-radius: 2px;
    }

    .nav-row {
      width: 90%;
    }

    .topbar-inner {
      margin: 0 auto;
      width: 1200px;
    }
  }

  .header-row {
    margin: 5px auto;
  }

  .radio-inputs {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    border-radius: 0.5rem;
    background-color: #EEE;
    box-sizing: border-box;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
    font-size: 14px;
    border: 1px solid #CCC;
  }

  .radio-inputs .radio {
    flex: 1 1 auto;
    text-align: center;
    border-radius: 0.5rem;
    margin: 0.2rem;
  }

  .radio-inputs .radio-text {
    display: flex;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    border: none;
    padding: .5rem;
    color: rgba(51, 65, 85, 1);
    transition: all .15s ease-in-out;
    display: inline-block;
  }

  .radio-inputs .radio.checked {
    background-color: #fff;
    font-weight: 600;
  }

  .radio-inputs .radio:hover {
    background-color: #f7f7f7;
    font-weight: 600;
  }

  .button {
    appearance: none;
    background-color: #fafbfc;
    border: 1px solid rgba(27, 31, 35, 0.15);
    border-radius: 6px;
    box-shadow:
      rgba(27, 31, 35, 0.04) 0 1px 0,
      rgba(255, 255, 255, 0.25) 0 1px 0 inset;
    box-sizing: border-box;
    color: #24292e;
    cursor: pointer;
    display: inline-block;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    list-style: none;
    padding: 6px 16px;
    position: relative;
    transition: background-color 0.2s cubic-bezier(0.3, 0, 0.5, 1);
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    vertical-align: middle;
    white-space: nowrap;
    word-wrap: break-word;
  }

  .button:hover {
    background-color: #f3f4f6;
    text-decoration: none;
    transition-duration: 0.1s;
  }

  .button:disabled {
    background-color: #fafbfc;
    border-color: rgba(27, 31, 35, 0.15);
    color: #959da5;
    cursor: default;
  }

  .button:active {
    background-color: #edeff2;
    box-shadow: rgba(225, 228, 232, 0.2) 0 1px 0 inset;
    transition: none 0s;
  }

  .button:focus {
    outline: 1px transparent;
  }

  .button:before {
    display: none;
  }

  .button:-webkit-details-marker {
    display: none;
  }

  h1 {
    margin-top: 10px;
  }

  .warning {
    border: 1px solid rgb(255, 238, 186);
    border-radius: .5em;
    background-color: rgb(255, 243, 205);
    padding: .5em;
    color: rgb(133, 100, 4)
  }

</style>
<style>
  body {
    background-color: #f2f2f2;
    margin: 0;
    width: 100vw;
    box-sizing: border-box;
  }

  .container {
    background-color: white;
    border: 1px solid #eaeaea;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, .1);
  }
</style>