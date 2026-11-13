<script setup>
// Reusable screenshot gallery.
//
// One implementation for all three places a slider appears — the documentation
// pages (index / mario-worker), the embedded entry cards and the record detail
// drawer — so pagination, arrows and image fitting cannot drift apart.
//
// Pagination is rendered *outside* the carousel in normal flow: vue3-carousel
// absolutely positions its own <Pagination> inside the viewport, where the dots
// sit on top of the artwork.
import { ref, computed, watch } from "vue";
import { Carousel, Slide, Navigation } from "vue3-carousel";
import "vue3-carousel/dist/carousel.css";
import NxIcon from "./NxIcon.vue";

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  alt: {
    type: String,
    default: ""
  },
  lan: {
    type: String,
    default: "zh"
  },
  // Height cap in px. The docs pages use 480; cards and the drawer leave it
  // unset and rely on the slide's aspect ratio.
  maxHeight: {
    type: Number,
    default: 0
  },
  // "contain" shows the whole picture (documentation screenshots, detail view);
  // "cover" fills the frame (entry cards).
  fit: {
    type: String,
    default: "contain"
  },
  aspectRatio: {
    type: String,
    default: "16 / 9"
  },
  autoplay: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(["update:index"]);

const index = ref(0);
const carouselRef = ref(null);

const count = computed(() => props.images.length);
const isSingle = computed(() => count.value <= 1);

const text = computed(() => (props.lan === "zh"
  ? { prev: "上一张", next: "下一张" }
  : { prev: "Previous", next: "Next" }));

watch(() => props.images, () => { index.value = 0; });

function onUpdate(value) {
  index.value = value;
  emit("update:index", value);
}

function goTo(value) {
  index.value = value;
}

function prev() {
  if (carouselRef.value) carouselRef.value.prev();
}

function next() {
  if (carouselRef.value) carouselRef.value.next();
}

// The height cap belongs on the frame, not the outer wrapper: the frame uses an
// aspect ratio derived from its width, so a wrapper-level max-height would be
// overflowed by the frame rather than constraining it.
const frameStyle = computed(() => {
  if (!props.maxHeight) return { aspectRatio: props.aspectRatio };
  return {
    aspectRatio: props.aspectRatio,
    maxHeight: `${props.maxHeight}px`,
    // with a capped height the aspect ratio must yield: keep the width and let
    // the image letterbox inside the capped box
    height: `${props.maxHeight}px`,
  };
});
</script>

<template>
  <div
    v-if="count > 0"
    class="nx-gallery"
  >
    <!-- single image: no controls at all -->
    <div
      v-if="isSingle"
      class="nx-gallery-frame is-single"
      :style="frameStyle"
    >
      <img
        :src="images[0]"
        :alt="alt"
        loading="lazy"
        decoding="async"
        :class="['nx-gallery-img', `is-${fit}`]"
      />
    </div>

    <template v-else>
      <Carousel
        ref="carouselRef"
        :items-to-show="1"
        :wrap-around="true"
        :autoplay="autoplay || undefined"
        :model-value="index"
        @update:model-value="onUpdate"
      >
        <Slide
          v-for="(img, i) in images"
          :key="img + i"
        >
          <div
            class="nx-gallery-frame"
            :style="frameStyle"
          >
            <img
              :src="img"
              :alt="`${alt} ${i + 1}`"
              loading="lazy"
              decoding="async"
              :class="['nx-gallery-img', `is-${fit}`]"
            />
          </div>
        </Slide>
        <template #addons>
          <Navigation />
        </template>
      </Carousel>

      <!-- pagination in normal flow, below the track -->
      <div class="nx-gallery-nav">
        <div class="nx-gallery-dots">
          <button
            v-for="(img, i) in images"
            :key="`dot-${img}-${i}`"
            type="button"
            class="nx-gallery-dot"
            :class="{ on: i === index }"
            :aria-label="`${i + 1}`"
            :aria-current="i === index ? 'true' : undefined"
            @click="goTo(i)"
          />
        </div>
        <span class="nx-gallery-count nx-num">{{ index + 1 }} / {{ count }}</span>
        <div class="nx-gallery-arrows">
          <button
            type="button"
            :aria-label="text.prev"
            @click="prev"
          >
            <NxIcon
              name="chevronLeft"
              :size="13"
            />
          </button>
          <button
            type="button"
            :aria-label="text.next"
            @click="next"
          >
            <NxIcon
              name="chevronRight"
              :size="13"
            />
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
  .nx-gallery {
    width: 100%;
    min-width: 0;
  }

  /* Frame: fixed aspect box; the image is fitted inside it and centred. */
  .nx-gallery-frame {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 4px;
    background: var(--nx-fill);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nx-gallery-img {
    display: block;
    object-position: center;
  }

  /* Whole picture, never enlarged past its natural size. */
  .nx-gallery-img.is-contain {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  /* Fills the frame (entry cards). */
  .nx-gallery-img.is-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .nx-gallery :deep(.carousel) {
    --vc-nav-background: var(--nx-canvas);
    --vc-nav-color: var(--nx-ink-2);
    --vc-nav-border-radius: 4px;
  }

  .nx-gallery :deep(.carousel__viewport) {
    border-radius: 4px;
    overflow: hidden;
  }

  .nx-gallery :deep(.carousel__track) {
    gap: 0;
    margin: 0;
    padding: 0;
  }

  .nx-gallery :deep(.carousel__slide) {
    padding: 0;
    border: 0;
    border-radius: 0;
    overflow: hidden;
    background: var(--nx-fill);
  }

  .nx-gallery :deep(.carousel__prev),
  .nx-gallery :deep(.carousel__next) {
    width: 26px;
    height: 26px;
    border: 1px solid var(--nx-line);
    box-shadow: var(--nx-shadow-1);
    background: var(--nx-canvas);
    color: var(--nx-ink-2);
  }

  .nx-gallery :deep(.carousel__prev) {
    left: 8px;
  }

  .nx-gallery :deep(.carousel__next) {
    right: 8px;
  }

  /* ── pagination (same shape as the drawer / entry card) ──── */
  .nx-gallery-nav {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
  }

  .nx-gallery-dots {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
    flex-wrap: wrap;
  }

  .nx-gallery-dot {
    width: 16px;
    height: 3px;
    border: 0;
    padding: 0;
    border-radius: 2px;
    background: var(--nx-line-2);
    cursor: pointer;
  }

  .nx-gallery-dot.on {
    background: var(--nx-accent);
  }

  .nx-gallery-count {
    font-size: 10.5px;
    color: var(--nx-faint);
    flex: none;
  }

  .nx-gallery-arrows {
    display: flex;
    gap: 4px;
    flex: none;
  }

  .nx-gallery-arrows button {
    width: 24px;
    height: 24px;
    border: 1px solid var(--nx-line);
    border-radius: 4px;
    background: var(--nx-canvas);
    color: var(--nx-ink-2);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .nx-gallery-arrows button:hover {
    border-color: var(--nx-line-2);
    color: var(--nx-ink);
  }
</style>
