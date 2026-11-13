<script setup>
// Card density: the same record with its screenshot as the primary signal.
// This is the browsing mode; the list is the scanning mode.
import { computed } from "vue";
import { formatIsoDate } from "../../util/next/records.js";
import { getTagColor } from "../../util/TagUtil.js";
import { getTheme } from "../../util/Theme.js";

const props = defineProps({
  record: {
    type: Object,
    required: true
  },
  lan: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["open"]);

const theme = getTheme();

const metaDate = computed(() => formatIsoDate(props.record.date));

const firstTag = computed(() => {
  if (!props.record.tags.length) return null;
  const tag = props.record.tags[0];
  const colors = getTagColor(tag.key, theme.value === "dark");
  return { ...tag, style: { color: colors.text, borderColor: colors.border, background: colors.bg } };
});
</script>

<template>
  <div
    class="nx-card"
    :class="{ 'is-active': active }"
    role="button"
    tabindex="0"
    @click="emit('open', record)"
    @keydown.enter.prevent="emit('open', record)"
    @keydown.space.prevent="emit('open', record)"
  >
    <div class="nx-card-shot">
      <img
        v-if="record.image"
        :src="record.image"
        :alt="record.name"
        loading="lazy"
        decoding="async"
      />
    </div>
    <div class="nx-card-body">
      <div class="nx-card-name">{{ record.name }}</div>
      <div
        v-if="record.author"
        class="nx-card-author"
      >{{ record.author }}</div>
      <div class="nx-card-meta">
        <span v-if="metaDate">{{ metaDate }}</span>
        <span v-else-if="record.yearLabel">{{ record.yearLabel }}</span>
        <span
          v-if="firstTag"
          class="nx-tag"
          :style="firstTag.style"
        >{{ firstTag.label }}</span>
      </div>
    </div>
  </div>
</template>
