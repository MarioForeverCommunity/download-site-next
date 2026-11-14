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
const pos = ref(2);
const noTransition = ref(false);

let snapTimer = null;
let autoplayTimer = null;
let observer = null;

const count = computed(() => props.images.length);
const isSingle = computed(() => count.value <= 1);

// Fallback aspect ratio for slides whose picture has not decoded yet.
const fallbackRatio = computed(() => {
  const match = String(props.aspectRatio || "").match(/([\d.]+)\s*\/\s*([\d.]+)/);
  if (!match) return 4 / 3;
  const w = Number(match[1]);
  const h = Number(match[2]);
  return w && h ? w / h : 4 / 3;
});

// Each picture's own aspect ratio, keyed by URL. Screenshot sets are often
// mixed — a 4:3 game frame next to a 16:10 window shot — so sizing every slide
// from one shared ratio letterboxed the odd ones out. Every slide is now sized
// from its own picture, which keeps the row gapless at any ratio.
const naturalRatios = ref({});

function onImgLoad(event) {
  const img = event.target;
  if (!img.naturalWidth || !img.naturalHeight) return;
  // The raw prop value is carried on the element: `img.src` is already resolved
  // to an absolute URL and would not match the key used by ratioFor().
  const key = img.dataset.srcKey || img.getAttribute("src");
  if (!key) return;
  const next = img.naturalWidth / img.naturalHeight;
  if (naturalRatios.value[key] === next) return;
  naturalRatios.value = { ...naturalRatios.value, [key]: next };
}

function ratioFor(src) {
  return naturalRatios.value[src] || fallbackRatio.value;
}

// On a phone the active slide takes the whole width: peeking neighbours would
// leave too little room to read the screenshot.
const peekFraction = computed(() => (containerW.value < 640 ? 1 : props.peek));

// Height of the slide band. With a maxHeight every slide is exactly that tall
// and its width follows its own ratio, so no picture is ever letterboxed.
const slideH = computed(() => {
  if (!containerW.value) return 0;
  if (props.maxHeight) return props.maxHeight;
  const active = props.images[activeIndex.value];
  const w = containerW.value * peekFraction.value;
  return w / ratioFor(active);
});

// A slide's box always matches its picture's ratio, so the picture fills it
// exactly. The band height is fixed; the width follows the ratio and may exceed
// the viewport (the overflow is clipped by the viewport, which is intended — the
// neighbours are supposed to extend past the edges).
function widthFor(src) {
  if (!slideH.value) return 0;
  return slideH.value * ratioFor(src);
}

// Slides rendered: [2nd-last clone, last clone, ...images, first clone, 2nd
// clone] — two clones on each end. The wrap positions (1 and count+2) then have
// neighbours on both sides: a single-clone track left a grey gap where the next
// picture should be for the whole wrap animation, until the snap brought the
// real slides in.
const slides = computed(() => {
  const n = count.value;
  if (n <= 1) return props.images.map((src, index) => ({ src, real: index }));
  const cloneOf = (i) => ({ src: props.images[i], real: i, clone: true });
  const list = [cloneOf((n - 2) % n), cloneOf(n - 1)];
  props.images.forEach((src, index) => list.push({ src, real: index }));
  list.push(cloneOf(0), cloneOf(1 % n));
  return list;
});

// The active real index, tolerating the transient clone positions.
const activeIndex = computed(() => {
  if (count.value === 0) return 0;
  return ((pos.value - 2) % count.value + count.value) % count.value;
});

// Cumulative x offsets, since slides differ in width.
const slideOffsets = computed(() => {
  const list = slides.value;
  const offsets = [];
  let x = 0;
  for (let i = 0; i < list.length; i++) {
    offsets.push(x);
    x += widthFor(list[i].src);
  }
  return offsets;
});

const trackWidth = computed(() => {
  const list = slides.value;
  if (!list.length) return 0;
  return slideOffsets.value[list.length - 1] + widthFor(list[list.length - 1].src);
});

const trackStyle = computed(() => {
  if (!slideH.value) return { opacity: 0 };
  const current = slides.value[pos.value];
  const activeW = widthFor(current ? current.src : props.images[0]);
  // Centre the active slide in the viewport; neighbours continue on both sides.
  const offset = containerW.value / 2 - activeW / 2 - (slideOffsets.value[pos.value] || 0);
  return {
    width: `${Math.round(trackWidth.value)}px`,
    transform: `translate3d(${offset}px, 0, 0)`,
    transition: noTransition.value ? "none" : `transform ${TRANSITION_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`
  };
});

const singleStyle = computed(() => {
  const r = ratioFor(props.images[0]);
  const base = { aspectRatio: String(r) };
  if (!props.maxHeight) return base;
  return {
    ...base,
    maxHeight: `${props.maxHeight}px`,
    maxWidth: `${Math.round(props.maxHeight * r)}px`,
    marginInline: "auto"
  };
});

const text = computed(() => (props.lan === "zh"
  ? { prev: "上一张", next: "下一张" }
  : { prev: "Previous", next: "Next" }));

// Move to a track position. Wrapping is handled on transitionend: after
// sliding onto a clone the track is snapped (without animation) onto the real
// slide, so the loop is seamless in both directions.
//
// Positions outside [1, count+2] are refused. The wrap clones are only ever
// reached deliberately (that is the wrap); a burst of clicks used to walk the
// track past them, where the offset lookup failed and the strip slid into
// blank space with no state left able to bring it back.
function goTo(nextPos) {
  if (isSingle.value || count.value < 2) return;
  // Real slides occupy [2, count+1]; 1 and count+2 are the wrap positions.
  // Anything beyond is refused — the extra clones at 0 and count+3 exist only
  // as neighbours, never as targets.
  if (nextPos < 1 || nextPos > count.value + 2) return;
  clearSnap();
  // Make sure transitions are enabled *before* the position changes, otherwise
  // the browser coalesces both style writes into one frame and the slide jumps.
  noTransition.value = false;
  pos.value = nextPos;
  // transitionend can be lost (a retargeted transition never reports its end,
  // background tabs throttle): resolve any pending wrap the same way once the
  // slide time is up, so the carousel cannot get stranded on a clone.
  snapTimer = setTimeout(resolveWrap, TRANSITION_MS + 40);
}

function clearSnap() {
  if (snapTimer) {
    clearTimeout(snapTimer);
    snapTimer = null;
  }
}

// Parked on a wrap clone? Land on the identical real slide without animating:
// the picture and its position are the same, only the track offset differs.
function resolveWrap() {
  if (pos.value === count.value + 2) {
    snapTo(2);
  } else if (pos.value === 1) {
    snapTo(count.value + 1);
  }
}

function onTransitionEnd(event) {
  // transitionend bubbles from the slides' children; only the track's own
  // transform matters here.
  if (event.target !== event.currentTarget) return;
  if (event.propertyName !== "transform") return;
  resolveWrap();
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
  snapTo(realIndex + 2);
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
  snapTo(2);
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
        :data-src-key="images[0]"
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
            :style="{ width: widthFor(slide.src) ? `${widthFor(slide.src)}px` : '100%', height: slideH ? `${slideH}px` : undefined }"
          >
            <img
              :src="slide.src"
              :data-src-key="slide.src"
              :alt="`${alt} ${slide.real + 1}`"
              :loading="slide.clone ? 'eager' : 'lazy'"
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
  /* The picture scales to the frame while preserving its aspect ratio. A small
     screenshot is enlarged only until one dimension reaches the frame, so it
     never sits as a tiny thumbnail in a 480px band, and a large one is reduced
     to fit. `contain` on a 100% box achieves this without cropping. */
  .nx-gallery-img.is-contain {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    object-position: center;
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
