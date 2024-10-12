<script setup>
  import {getLanguage, setLanguageZh, setLanguageEn} from "../util/Language.js";
  import {ref} from 'vue';
  import { navTop } from "../config.js";

  const BASE_URL = import.meta.env.BASE_URL;

  const props = defineProps({
    pageId: {
      type: String,
      required: true
    }
  });

  const pageEntry = navTop.find(item => item.id === props.pageId);

  function displayLan(lan) {
    if (pageEntry.show_en == false && this.gblLan == "en") {
      return "zh";
    }
    return this.gblLan;
  }

  const gblLan = ref(getLanguage());
</script>

<template>
  <header>
    <div class="header-container">
      <div class="lan-row">
        <div class="button" v-if="displayLan() == 'zh' && pageEntry.show_en == true" @click="gblLan = setLanguageEn();">English</div>
        <div class="button" v-if="displayLan() == 'en' && pageEntry.show_en == true" @click="gblLan = setLanguageZh();">中文</div>
      </div>
      <div class="header-row">
        <h1>{{ displayLan() == 'zh' ? pageEntry.name : pageEntry.alter }}</h1>
      </div>
      <div class="header-row nav-row">
        <div class="radio-inputs">
          <a v-for="nav in navTop.filter(item => displayLan() == 'zh' || item.show_en == true)" class="radio" :class="nav.id == props.pageId ? 'checked' : ''" :href="nav.link">
            <span class="radio-text" name="radio">
              {{ displayLan() == 'zh' ? nav.name : nav.alter }}
            </span>
          </a>
        </div>
      </div>
      <div class="header-row nav-row warning" v-if="gblLan == 'en' && pageEntry.show_en == false">
        <strong>Warning:</strong><br>
        You are currently viewing a page that is only available in Chinese. If you have inadvertently accessed this page, please click <a href="/index.html">here</a> to return to the index.
      </div>
    </div>
  </header>
</template>

<style scoped>
  .lan-row .button {
    float: right;
  }

  .header-container {
    display: flex;
    justify-content: center;
    flex-direction: column;
    width: 100vw;
    background-color: white;
    padding: 10px;
    margin: 20px auto;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
  }

  .nav-row {
    width: 100%;
  }

  @media (max-width: 1333px) and (min-width: 800px) {
    .header-container {
      width: 90vw;
      border-radius: 10px;
    }

    .nav-row {
      width: 90%;
    }
  }

  @media (min-width: 1333px) {
    .header-container {
      width: 1200px;
      border-radius: 10px;
    }

    .nav-row {
      width: 90%;
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
    margin-top: 0;
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
    background-color: #d0d0d0;
    margin: 0;
    width: 100vw;
    box-sizing: border-box;
  }
</style>