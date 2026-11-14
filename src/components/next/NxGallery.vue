<script setup>
// Centred screenshot gallery.
//
// One implementation for the documentation pages, the embedded entry cards and
// the record drawer, so they cannot drift apart.
//
// The active slide is *centred* with its neighbours filling the sides — that is
// how the legacy design's slider looked. vue3-carousel always left-aligns the
// active slide and shows a fixed number of whole slides, which is what produced
// the empty bands on both sides. This component therefore drives the track
// itself: a flex row translated so the active slide sits at the midpoint, with
// the previous and next slides adjacent and visible.
//
// Infinite scrolling is done by rendering a clone of the last image before the
// list and a clone of the first after it; reaching a clone snaps back to the
// real slide without a transition, so the loop is seamless in both directions.
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
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
  // Caps the slide height; the slide width follows from the aspect ratio, and
  // the neighbours still fill the remaining space.
  maxHeight: {
    type: Number,
    default: 0
  },
  // "contain" shows the whole picture, "cover" fills the slide.
  fit: {
    type: String,
    default: "contain"
  },
  aspectRatio: {
    type: String,
    default: "4 / 3"
  },
  autoplay: {
    type: Number,
    default: 0
  },
  // Fraction of the viewport the active slide occupies on wide screens; the
  // rest is shared by the two neighbours. Only used by the "peek" layout.
  peek: {
    type: Number,
    default: 0.58
  },
  // "peek" centres the active slide with neighbours visible (entry cards);
  // "fill" shows one slide across the whole viewport (documentation pages).
  layout: {
    type: String,
    default: "peek"
  }
});

const emit = defineEmits(["select"]);

const TRANSITION_MS = 320;

const containerRef = ref(null);
const containerW = ref(0);
const pos = ref(1);
const noTransition = ref(false);

let snapTimer = null;
let autoplayTimer = null;
let observer = null;

const count = computed(() => props.images.length);
const isSingle = computed(() => count.value <= 1);

// Aspect ratio of the frame. The real screenshots in a set usually share one
// ratio (often 4:3), so once an image has decoded its natural size is used;
// the `aspectRatio` prop is only the initial guess before the first decode.
const measuredRatio = ref(0);

const ratio = computed(() => {
  if (measuredRatio.value) return measuredRatio.value;
  const match = String(props.aspectRatio || "").match(/([\d.]+)\s*\/\s*([\d.]+)/);
  if (!match) return 16 / 9;
  const w = Number(match[1]);
  const h = Number(match[2]);
  return w && h ? w / h : 16 / 9;
});

// Adopt the ratio of the first decoded picture.
function onImgLoad(event) {
  const img = event.target;
  if (measuredRatio.value || !img.naturalWidth || !img.naturalHeight) return;
  measuredRatio.value = img.naturalWidth / img.naturalHeight;
}

// Two layouts:
//   "peek"  – the active slide is centred with its neighbours peeking in on both
//             sides. Used by the entry cards, which sit in a narrow column.
// On a phone the active slide takes the whole width: peeking neighbours would
// leave too little room to read the screenshot.
const peekFraction = computed(() => (containerW.value < 640 ? 1 : props.peek));

// Slide width.
//   With a maxHeight the slide is sized from that cap (width = height × ratio),
//   so the active picture is exactly maxHeight tall and its neighbours peek in
//   on both sides. Never wider than the viewport itself.
//   Without a cap the slide takes `peek` of the viewport.
const slideW = computed(() => {
  if (!containerW.value) return 0;
  if (props.maxHeight) {
    return Math.min(props.maxHeight * ratio.value, containerW.value);
  }
  return containerW.value * peekFraction.value;
});

const slideH = computed(() => (slideW.value ? slideW.value / ratio.value : 0));

// Slides rendered: [last clone, ...images, first clone] so both directions wrap.
const slides = computed(() => {
  if (isSingle.value) return props.images.map((src, index) => ({ src, real: index }));
  const last = props.images[count.value - 1];
  const first = props.images[0];
  const list = [{ src: last, real: count.value - 1, clone: true }];
  props.images.forEach((src, index) => list.push({ src, real: index }));
  list.push({ src: first, real: 0, clone: true });
  return list;
});

// The active real index, tolerating the transient clone positions.
const activeIndex = computed(() => {
  if (count.value === 0) return 0;
  return ((pos.value - 1) % count.value + count.value) % count.value;
});

const trackStyle = computed(() => {
  if (!slideW.value) return { opacity: 0 };
  // Centre the active slide in the viewport; neighbours continue on both sides.
  const offset = containerW.value / 2 - slideW.value / 2 - pos.value * slideW.value;
  return {
    transform: `translate3d(${offset}px, 0, 0)`,
    transition: noTransition.value ? "none" : `transform ${TRANSITION_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`
  };
});

const singleStyle = computed(() => {
  const base = { aspectRatio: String(ratio.value) };
  if (!props.maxHeight) return base;
  return {
    ...base,
    maxHeight: `${props.maxHeight}px`,
    maxWidth: `${Math.round(props.maxHeight * ratio.value)}px`,
    marginInline: "auto"
  };
});

const text = computed(() => (props.lan === "zh"
  ? { prev: "上一张", next: "下一张" }
  : { prev: "Previous", next: "Next" }));

// Move to a track position. Wrapping is handled on transitionend: after
// sliding onto a clone the track is snapped (without animation) onto the real
// slide, so the loop is seamless in both directions.
function goTo(nextPos) {
  if (isSingle.value) return;
  clearSnap();
  // Make sure transitions are enabled *before* the position changes, otherwise
  // the browser coalesces both style writes into one frame and the slide jumps.
  noTransition.value = false;
  pos.value = nextPos;
}

function clearSnap() {
  if (snapTimer) {
    clearTimeout(snapTimer);
    snapTimer = null;
  }
}

function onTransitionEnd(event) {
  if (event.propertyName !== "transform") return;
  if (pos.value === count.value + 1) {
    snapTo(1);
  } else if (pos.value === 0) {
    snapTo(count.value);
  }
}

// Jump without animating (used for wrapping and for dot clicks).
function snapTo(nextPos) {
  clearSnap();
  noTransition.value = true;
  pos.value = nextPos;
  // Re-enable transitions on a later frame so the snap itself is not animated.
  nextTick(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { noTransition.value = false; });
    });
  });
}

function next() {
  goTo(pos.value + 1);
  restartAutoplay();
}

function prev() {
  goTo(pos.value - 1);
  restartAutoplay();
}

function jumpTo(realIndex) {
  if (realIndex === activeIndex.value) return;
  snapTo(realIndex + 1);
  restartAutoplay();
}

function restartAutoplay() {
  if (!props.autoplay || isSingle.value) return;
  if (autoplayTimer) clearInterval(autoplayTimer);
  autoplayTimer = setInterval(() => goTo(pos.value + 1), props.autoplay);
}

function onResize() {
  if (!containerRef.value) return;
  containerW.value = containerRef.value.clientWidth;
}

watch(() => props.images, () => {
  snapTo(1);
  restartAutoplay();
});

watch(() => props.autoplay, restartAutoplay);

onMounted(() => {
  onResize();
  if (typeof ResizeObserver !== "undefined" && containerRef.value) {
    observer = new ResizeObserver(onResize);
    observer.observe(containerRef.value);
  }
  restartAutoplay();
});

onBeforeUnmount(() => {
  clearSnap();
  if (autoplayTimer) clearInterval(autoplayTimer);
  if (observer) observer.disconnect();
});
</script>

<template>
  <div
    ref="containerRef"
    class="nx-gallery"
  >
    <div
      v-if="isSingle && count > 0"
      class="nx-gallery-single"
      :style="singleStyle"
    >
      <img
        :src="images[0]"
        :alt="alt"
        loading="lazy"
        decoding="async"
        :class="['nx-gallery-img', `is-${fit}`]"
        @load="onImgLoad"
        @click="emit('select', images[0])"
      />
    </div>

    <template v-else-if="count > 1">
      <div
        class="nx-gallery-viewport"
        :style="{ height: slideH ? `${slideH}px` : undefined }"
      >
        <div
          class="nx-gallery-track"
          :style="trackStyle"
          @transitionend="onTransitionEnd"
        >
          <div
            v-for="(slide, index) in slides"
            :key="`${slide.src}-${index}`"
            class="nx-gallery-slide"
            :class="{ 'is-active': index === pos }"
            :style="{ width: slideW ? `${slideW}px` : '100%', height: slideH ? `${slideH}px` : undefined }"
          >
            <img
              :src="slide.src"
              :alt="`${alt} ${slide.real + 1}`"
              loading="lazy"
              decoding="async"
              :class="['nx-gallery-img', `is-${fit}`]"
              @load="onImgLoad"
              @click="emit('select', slide.src)"
            />
          </div>
        </div>

        <button
          type="button"
          class="nx-gallery-arrow is-prev"
          :aria-label="text.prev"
          @click="prev"
        >
          <NxIcon
            name="chevronLeft"
            :size="16"
          />
        </button>
        <button
          type="button"
          class="nx-gallery-arrow is-next"
          :aria-label="text.next"
          @click="next"
        >
          <NxIcon
            name="chevronRight"
            :size="16"
          />
        </button>
      </div>

      <div class="nx-gallery-nav">
        <div class="nx-gallery-dots">
          <button
            v-for="(img, index) in images"
            :key="`dot-${img}-${index}`"
            type="button"
            class="nx-gallery-dot"
            :class="{ on: index === activeIndex }"
            :aria-label="`${index + 1}`"
            :aria-current="index === activeIndex ? 'true' : undefined"
            @click="jumpTo(index)"
          />
        </div>
        <span class="nx-gallery-count nx-num">{{ activeIndex + 1 }} / {{ count }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
  .nx-gallery {
    width: 100%;
    min-width: 0;
  }

  /* ── single image ─────────────────────────────────────────── */
  .nx-gallery-single {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 4px;
    background: var(--nx-fill);
  }

  /* ── track ────────────────────────────────────────────────── */
  .nx-gallery-viewport {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 4px;
    background: var(--nx-fill);
  }

  .nx-gallery-track {
    display: flex;
    align-items: stretch;
    will-change: transform;
  }

  .nx-gallery-slide {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: var(--nx-fill);
    position: relative;
  }

  .nx-gallery-img {
    display: block;
    object-position: center;
    cursor: zoom-in;
  }

  /* Whole picture, scaled to fill the frame without cropping: small screenshots
     are enlarged so they do not leave grey bands around the artwork. */
  .nx-gallery-img.is-contain {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  /* Fills the slide. */
  .nx-gallery-img.is-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* ── arrows ───────────────────────────────────────────────── */
  .nx-gallery-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--nx-line);
    border-radius: 4px;
    background: var(--nx-canvas);
    color: var(--nx-ink-2);
    box-shadow: var(--nx-shadow-1);
    cursor: pointer;
    z-index: 2;
  }

  .nx-gallery-arrow:hover {
    border-color: var(--nx-line-2);
    color: var(--nx-ink);
  }

  .nx-gallery-arrow.is-prev {
    left: 8px;
  }

  .nx-gallery-arrow.is-next {
    right: 8px;
  }

  /* ── pagination ───────────────────────────────────────────── */
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
</style>
