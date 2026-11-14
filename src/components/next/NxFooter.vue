<script setup>
// Footer for the redesigned pages: the site's provenance lines only. The
// changelog entry that used to live here moved into the shell's global
// settings menu and opens in a side drawer.
import { siteVersion } from "../../config.js";

const props = defineProps({
  lan: {
    type: String,
    default: "zh"
  }
});

const emit = defineEmits(["openChangelog"]);

const buildTime = BUILD_TIME;

function formatBuildTime(isoString) {
  const date = new Date(isoString);
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
</script>

<template>
  <footer class="nx-foot">
    <template v-if="props.lan === 'zh'">
      <span>网站版本：{{ siteVersion }}</span>
      <span class="nx-num">构建时间：{{ formatBuildTime(buildTime) }}</span>
      <a
        class="external-link"
        target="_blank"
        rel="noopener"
        href="https://status.marioforever.net/"
      >网站状态</a>
      <a
        class="external-link"
        target="_blank"
        rel="noopener"
        href="https://github.com/MarioForeverCommunity/download-site-next"
      >本站源码</a>
      <button
        type="button"
        @click="emit('openChangelog')"
      >更新履历</button>
      <span style="flex:1;" />
      <span>本站非 Softendo / 任天堂官方网站，马里奥相关版权归任天堂所有。</span>
    </template>
    <template v-else>
      <span>Site version: {{ siteVersion }}</span>
      <span class="nx-num">Build: {{ formatBuildTime(buildTime) }}</span>
      <a
        class="external-link"
        target="_blank"
        rel="noopener"
        href="https://status.marioforever.net/"
      >Status</a>
      <a
        class="external-link"
        target="_blank"
        rel="noopener"
        href="https://github.com/MarioForeverCommunity/download-site-next"
      >Source code</a>
      <button
        type="button"
        @click="emit('openChangelog')"
      >Changelog</button>
      <span style="flex:1;" />
      <span>This is NOT a Softendo/Nintendo official site. Mario and its related copyrights belong to Nintendo.</span>
    </template>
  </footer>
</template>
