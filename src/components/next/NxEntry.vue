<script setup>
// Embedded record preview for the documentation pages.
//
// Props match the legacy `<MfGamesEntry>` / `<AssetsEntry>` / `<SoftendoEntry>`
// components so the markdown files stay untouched; only the presentation and the
// lookup differ.
import { computed } from "vue";
import NxEntryPreview from "./NxEntryPreview.vue";
import { useNamedRecord } from "../../util/next/useNamedRecord.js";
import { getLocale, useI18n } from "../../i18n/index.js";
import { shellConfig } from "../../util/next/shellStore.js";

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

// Documents are rendered inside the app shell, so the locale the page published
// is the one the records must be built in. Both sources are reactive: the shell's
// field changes when the visitor picks another language, and the global locale is
// the fallback for a document rendered outside a shell.
const locale = computed(() => shellConfig.locale || getLocale());

const { t } = useI18n(() => locale.value);

const { record, loading } = useNamedRecord(props.kind, props, locale);

const notFoundLabel = computed(() => {
  const key = { mf: "entry.notFoundMf", asset: "entry.notFoundAsset", softendo: "entry.notFoundSoftendo" };
  return t(key[props.kind] || "entry.notFoundMf");
});
</script>

<template>
  <NxEntryPreview
    :record="record"
    :locale="locale"
    :loading="loading"
    :not-found-label="notFoundLabel"
  />
</template>
