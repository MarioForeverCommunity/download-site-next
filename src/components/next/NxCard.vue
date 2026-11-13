<script setup>
// Card density: the same record with its screenshot as the primary signal.
// This is the browsing mode; the list is the scanning mode.
import { computed } from "vue";
import { formatIsoDate } from "../../util/next/records.js";
import { getTagColor } from "../../util/TagUtil.js";
import { getTheme } from "../../util/Theme.js";
import NxLogoPlaceholder from "./NxLogoPlaceholder.vue";

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

const tagPills = computed(() => props.record.tags.map((tag) => {
  const colors = getTagColor(tag.key, theme.value === "dark");
  return { ...tag, style: { color: colors.text, borderColor: colors.border, background: colors.bg } };
}));

const regionLabel = computed(() => {
  const region = props.record.region;
  if (region === "chinese") return props.lan === "zh" ? "国内" : "CN";
  if (region === "international") return props.lan === "zh" ? "国外" : "INT";
  return null;
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
      <NxLogoPlaceholder
        v-else
        :lan="lan"
        variant="cover"
      />
    </div>
    <div class="nx-card-body">
      <div class="nx-card-name">{{ record.name }}</div>
      <div class="nx-card-author-row">
        <span
          v-if="record.author"
          class="nx-card-author"
        >{{ record.author }}</span>
        <!-- region tag sits beside the author in card view, per review -->
        <span
          v-if="regionLabel"
          class="nx-dot"
          :class="record.region === 'chinese' ? 'nx-dot-cn' : 'nx-dot-intl'"
        >{{ regionLabel }}</span>
      </div>
      <div class="nx-card-meta">
        <span v-if="metaDate">{{ metaDate }}</span>
        <span v-else-if="record.yearLabel">{{ record.yearLabel }}</span>
        <span
          v-for="tag in tagPills"
          :key="tag.key"
          class="nx-tag"
          :style="tag.style"
        >{{ tag.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .nx-card-author-row {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
  }

  .nx-card-author-row .nx-card-author {
    flex: 0 1 auto;
  }

  .nx-card-author-row .nx-dot {
    flex: none;
  }
</style>
