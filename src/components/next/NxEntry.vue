<script setup>
// Embedded record preview for the documentation pages.
//
// Props match the legacy `<MfGamesEntry>` / `<AssetsEntry>` / `<SoftendoEntry>`
// components so the markdown files stay untouched; only the presentation and the
// lookup differ.
import { ref, onMounted, onBeforeUnmount } from "vue";
import NxEntryPreview from "./NxEntryPreview.vue";
import { getLanguage } from "../../util/Language.js";
import { useNamedRecord } from "../../util/next/useNamedRecord.js";

const props = defineProps({
  kind: {
    type: String,
    default: "mf"
  },
  name: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: null
  },
  ver: {
    type: String,
    default: null
  },
  defaultVer: {
    type: String,
    default: null
  }
});

const lan = ref(getLanguage());

const handleCustom = (event) => {
  lan.value = event?.detail?.language || getLanguage();
};

const handleLanguage = () => {
  lan.value = getLanguage();
};

const { record, loading } = useNamedRecord(props.kind, props, lan);

const NOT_FOUND = {
  mf: "未找到该作品 / Game not found",
  asset: "未找到该资源 / Asset not found",
  softendo: "未找到该游戏 / Game not found",
};

onMounted(() => {
  window.addEventListener("custom-language-changed", handleCustom);
  window.addEventListener("language-changed", handleLanguage);
});

onBeforeUnmount(() => {
  window.removeEventListener("custom-language-changed", handleCustom);
  window.removeEventListener("language-changed", handleLanguage);
});
</script>

<template>
  <NxEntryPreview
    :record="record"
    :lan="lan"
    :loading="loading"
    :not-found-label="NOT_FOUND[kind]"
  />
</template>
