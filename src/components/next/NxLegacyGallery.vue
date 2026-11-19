<script setup>
// The screenshots block on the legacy index / mario-worker pages used to be a
// vue3-carousel instance declared inside the markdown documents. Those documents
// are now shared by both designs, so the original component lives here and is
// loaded lazily: only the legacy design pulls in vue3-carousel and its CSS.
//
// The `:deep` rules below keep the look of the markdown it replaced: dots 12px
// wide, 24px under the picture, arrows inset by 8px. The pagination row is taken
// out of the carousel's layout box so the arrows centre on the picture itself.
import { ref, onMounted, onBeforeUnmount } from "vue";
import { Carousel, Slide, Pagination, Navigation } from "vue3-carousel";
import "vue3-carousel/dist/carousel.css";

// The original markdown showed two 4:3 slides side by side from 800px up and a
// single full-width slide on phones; keep that switch.
const isMobile = ref(false);

function updateIsMobile() {
  isMobile.value = window.innerWidth <= 800;
}

onMounted(() => {
  window.addEventListener("resize", updateIsMobile);
  updateIsMobile();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateIsMobile);
});

defineProps({
  images: {
    type: Array,
    default: () => []
  },
  alt: {
    type: String,
    default: ""
  },
  autoplay: {
    type: Number,
    default: 0
  }
});
</script>

<template>
  <div class="nx-legacy-gallery">
    <Carousel
      :autoplay="autoplay || 0"
      :wrap-around="true"
      :items-to-show="isMobile ? 1 : 2"
    >
      <Slide
        v-for="image in images"
        :key="image"
        :style="isMobile ? '' : 'width: 50%; aspect-ratio: 4 / 3;'"
      >
        <img
          :src="image"
          :alt="alt"
          loading="lazy"
          decoding="async"
        />
      </Slide>
      <template #addons>
        <Navigation />
        <Pagination />
      </template>
    </Carousel>
  </div>
</template>

<style scoped>
  .nx-legacy-gallery img {
    display: block;
    width: 100%;
    height: 100%;
  }

  .nx-legacy-gallery {
    /* Reserves the 24px gap plus the 4px pagination row that now sits below the
       carousel box, so the dots never overlap the text that follows. */
    padding-bottom: 28px;
  }

  /* The dots stay under the picture, but out of the carousel's layout box. The
     old markdown overrode them to `position: relative`, which made `.carousel`
     taller by the pagination row; the prev/next arrows are positioned at 50% of
     `.carousel`, so they ended up centred on picture + dots instead of the
     picture alone. */
  :deep(.carousel__pagination) {
    top: 100%;
    bottom: auto;
    margin-top: 16px;
  }

  :deep(.carousel__pagination-button) {
    width: 12px;
  }

  :deep(.carousel__prev) {
    margin-left: 8px;
  }

  :deep(.carousel__next) {
    margin-right: 8px;
  }
</style>
