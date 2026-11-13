<script setup>
import { computed } from "vue";

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  stats: {
    type: Array,
    default: () => []
  }
});

// Stats are passed in already-formatted; the header only decides where they sit.
const hasStats = computed(() => props.stats.length > 0);
</script>

<template>
  <header class="nx-page nx-page-head-wrap">
    <div class="nx-page-head">
      <div style="min-width: 0;">
        <h1 class="nx-masthead">{{ props.title }}</h1>
        <p
          v-if="props.description"
          class="nx-lede"
        >{{ props.description }}</p>
      </div>
      <dl
        v-if="hasStats"
        class="nx-stats"
      >
        <div
          v-for="stat in props.stats"
          :key="stat.label"
          class="nx-stat"
        >
          <dt>{{ stat.label }}</dt>
          <dd>{{ stat.value }}</dd>
        </div>
      </dl>
    </div>
  </header>
</template>

<style scoped>
  .nx-page-head-wrap {
    padding-bottom: 0;
  }

  .nx-stats {
    display: flex;
    gap: 22px;
    flex: none;
    padding-bottom: 3px;
  }

  .nx-stat dt {
    font-family: var(--nx-mono);
    font-size: 10px;
    letter-spacing: 0.06em;
    color: var(--nx-faint);
  }

  .nx-stat dd {
    margin: 2px 0 0;
    font-size: 17px;
    font-weight: 600;
    letter-spacing: -0.015em;
    font-variant-numeric: tabular-nums;
  }

  @media (max-width: 720px) {
    .nx-stats {
      gap: 16px;
    }

    .nx-stat dd {
      font-size: 15px;
    }
  }
</style>
