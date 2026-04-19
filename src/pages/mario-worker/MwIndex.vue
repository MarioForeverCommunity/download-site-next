<script setup>
import { ref, getCurrentInstance } from 'vue'
import axios from 'axios'
import DownloadHeader from '../../components/HeaderNav.vue'
import { getLanguage, setLanguageZh, setLanguageEn } from "../../util/Language.js"
import introEn from '../../markdown/mw-en.md'
import { navTop } from "../../config.js"
import ButtonBackToTop from '../../components/ButtonBackToTop.vue'
import ButtonDarkMode from '../../components/ButtonDarkMode.vue'
import SiteFooter from '../../components/SiteFooter.vue'
import MwLevelsEntry from '../../components/MwLevelsEntry.vue'

const instance = getCurrentInstance()
if (instance) {
  instance.appContext.components.MwLevelsEntry = MwLevelsEntry
}

const originalLan = ref(getLanguage())

const pageId = "mario-worker"

const titleEn = navTop.find(item => item.id === pageId).title_alt

document.title = titleEn

const lastUpdate = ref(null)
const mdUpdateDate = ref(null)
const allDatesLoaded = ref(false)

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const getLatestDate = () => {
  const dates = []
  if (mdUpdateDate.value) dates.push(new Date(mdUpdateDate.value))
  if (dates.length === 0) return null
  const maxDate = new Date(Math.max(...dates))
  return formatDate(maxDate)
}

const updateLastUpdate = () => {
  lastUpdate.value = getLatestDate()
}

const fetchMdUpdate = () => {
  return axios.get("https://api.github.com/repos/MarioForeverCommunity/download-site-next/commits?path=src%2Fmarkdown%2Fmw-en.md&page=1&per_page=1").then((response) => {
    mdUpdateDate.value = response.data[0].commit.committer.date
  })
}

fetchMdUpdate().then(() => {
  allDatesLoaded.value = true
  updateLastUpdate()
})
</script>

<template>
  <DownloadHeader
    :pageId="pageId"
    :lan-var="originalLan"
    @change-lan-zh="originalLan = setLanguageZh()"
    @change-lan-en="originalLan = setLanguageEn()"
  />

  <div class="md-container">
    <h1>{{ titleEn }}</h1>
    <introEn :lastUpdate="lastUpdate" />
  </div>

  <ButtonBackToTop />
  <ButtonDarkMode />

  <SiteFooter />
</template>

<style>
  .md-container {
    width: 100vw;
    box-sizing: border-box;
    background-color: white;
    padding: 10px 20px;
    margin: 20px auto;
    border: 1px solid #eaeaea;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, .1);
    font-family: Helvetica, Arial, "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", "tohoma,sans-serif";
    font-feature-settings: normal;
    font-kerning: auto;
    font-optical-sizing: auto;
    font-size-adjust: none;
    font-stretch: 100%;
    font-style: normal;
    font-variant-alternates: normal;
    font-variant-caps: normal;
    font-variant-east-asian: normal;
    font-variant-ligatures: normal;
    font-variant-numeric: normal;
    font-variant-position: normal;
    font-variation-settings: normal;
    margin-bottom: 0;
  }

  @media (max-width: 800px) {
    .md-container {
      padding: 10px 1em;
    }
  }

  @media (max-width: 1333px) and (min-width: 800px) {
    .md-container {
      width: 90vw;
      border-radius: 2px;
    }
  }

  @media (min-width: 1333px) {
    .md-container {
      width: 1200px;
      border-radius: 2px;
    }
  }

  a {
    color: #008cff;
    text-decoration: none;
    font-weight: normal;
  }

  a:hover {
    color: #006eff;
    text-decoration: underline;
  }

  table {
    width: 100%;
    max-width: 100vw;
    white-space: nowrap;
  }

  .table-container {
    overflow-x: auto;
    width: 100%;
  }

  p {
    margin: .5em 0;
  }

  ul {
    margin: .5em 0;
    padding-left: 30px;
  }

  h1 {
    font-size: 30px;
    margin-top: 12px;
  }

  p, ol, ul, h5, h6, table, button {
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
    line-height: 1.5em;
  }

  h4 {
    font-size: 17px;
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-weight: bold;
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  table thead {
    text-align: left;
  }

  table thead tr:first-child {
    border-top: 0 !important;
  }

  table tr {
    border-top: solid 1px #eee;
  }

  table td {
    padding: 0.5em 1em 0.5em 1em;
  }

  table th {
    padding: 0.5em 1em 0.5em 1em;
  }

  .md-button {
    color: white;
    cursor: pointer;
    background-color: #008cff;
    padding: .5em;
    border-radius: .5em;
    margin-right: .5em;
    margin: .25em;
    display: inline-block;
  }

  .md-button:hover, .md-button:focus {
    background-color: #30acff;
    text-decoration: none;
  }

  .md-button:active {
    background-color: #007cdf;
  }

  .md-button:hover {
    color: white;
  }

  .foot-note ol {
    padding-left: 30px;
  }
</style>
