<script setup>
// Root component for the redesigned UI.
//
// Every entry HTML mounts this once. It renders the app shell (rail + topbar)
// permanently and swaps only the page body inside it, so a navigation animates
// the content area while the sidebar and title bar stay perfectly still.
//
// Pages publish what the shell needs (title, write-up, search model) through
// util/next/shellStore.js from their setup.
import { currentComponent, currentPageId } from "../util/next/router.js";
import { shellConfig, shellHandlers } from "../util/next/shellStore.js";
import NxShell from "../components/next/NxShell.vue";

const handlers = shellHandlers();

function onRandom() {
  if (typeof handlers.random === "function") handlers.random();
}

function onLanZh() {
  if (typeof handlers.changeLanZh === "function") handlers.changeLanZh();
}

function onLanEn() {
  if (typeof handlers.changeLanEn === "function") handlers.changeLanEn();
}
</script>

<template>
  <NxShell
    :page-id="shellConfig.pageId"
    :lan="shellConfig.lan"
    :title="shellConfig.title"
    :doc="shellConfig.doc"
    :doc-title="shellConfig.docTitle"
    :doc-updated="shellConfig.docUpdated"
    :search="shellConfig.search"
    :show-random="shellConfig.showRandom"
    @change-lan-zh="onLanZh"
    @change-lan-en="onLanEn"
    @random="onRandom"
  >
    <!-- Only this block animates. `:key` gives each page a fresh instance so
         filter state, scroll position and open drawers never leak across. -->
    <Transition
      name="nx-content"
      mode="out-in"
    >
      <div
        :key="currentPageId"
        class="nx-page-body"
      >
        <component
          :is="currentComponent"
          v-if="currentComponent"
        />
      </div>
    </Transition>
  </NxShell>
</template>
