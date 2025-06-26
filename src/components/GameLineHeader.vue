<script setup>
  import { SortUpIcon, SortDownIcon, SortUpDownIcon } from "./icons/Icons.js";

  const props = defineProps({
    lan : {
      required: true
    },
    category : {
      required: true
    },
    sort_option : {
      required: true
    }
  });

  function getSortOption() {
    return props.sort_option;
  }

</script>

<template>
  <div class="container game-container header">
    <div class="game-name header">
      {{ lan == "en" ? "Game" : "作品名" }}
      <div class="button button-shift" @click="$emit('sortByName')">
        <span v-if="getSortOption().field == 'game'">
          <SortUpIcon class="icon" v-if="getSortOption().asc"></SortUpIcon>
          <SortDownIcon class="icon" v-if="!getSortOption().asc"></SortDownIcon>
        </span>
        <span v-if="getSortOption().field != 'game'">
          <SortUpDownIcon class="icon"></SortUpDownIcon>
        </span>
      </div>
    </div>
    <div class="game-author header">
      {{ lan == "en" ? "Author" : "作者" }}
      <div class="button button-shift" @click="$emit('sortByAuthor')">
        <span v-if="getSortOption().field == 'author'">
          <SortUpIcon class="icon" v-if="getSortOption().asc"></SortUpIcon>
          <SortDownIcon class="icon" v-if="!getSortOption().asc"></SortDownIcon>
        </span>
        <span v-if="getSortOption().field != 'author'">
          <SortUpDownIcon class="icon"></SortUpDownIcon>
        </span>
      </div>
    </div>
    <div class="game-version header" v-if="category == 'mf'">
      {{ lan == "en" ? "Version" : "版本" }}
    </div>
    <div class="game-version header" v-if="category == 'mw'">
      SMWP 版本
    </div>
    <div class="game-date header">
      {{ lan == "en" ? "Date" : "发布日期" }}
      <div class="button button-shift" @click="$emit('sortByDate')">
        <span v-if="getSortOption().field == 'date'">
          <SortUpIcon class="icon" v-if="getSortOption().asc"></SortUpIcon>
          <SortDownIcon class="icon" v-if="!getSortOption().asc"></SortDownIcon>
        </span>
        <span v-if="getSortOption().field != 'date'">
          <SortUpDownIcon class="icon"></SortUpDownIcon>
        </span>
      </div>
    </div>
    <div class="game-buttons header"></div>
  </div>
</template>

<style scoped>
  @import "../assets/download-style-table.css";
</style>

<style scoped>
  .game-container.header {
    padding: 10px 10px;
    margin-top: .5em;
    font-weight: bold;
  }

  .button {
    display: inline-block;
    cursor: pointer;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
    width: 1em;
    transition: all 250ms;
  }

  .button:hover {
    transform: translateY(-2px);
  }

  .button-shift {
    transform: translateY(-1px);
  }

  .icon {
    color: #000;
    width: 16px;
    height: 16px;
    display: inline-block;
    vertical-align: middle;
    margin: 2px;
  }
</style>