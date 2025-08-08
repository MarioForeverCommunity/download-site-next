<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5sb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg=='
  }
});

const emit = defineEmits(['error']);

const imgRef = ref(null);
const isLoaded = ref(false);
const isInView = ref(false);
const actualSrc = ref(props.placeholder);

let observer = null;

const handleImageLoad = () => {
  isLoaded.value = true;
};

const handleImageError = (event) => {
  emit('error', event);
};

const loadImage = () => {
  if (isInView.value && !isLoaded.value) {
    actualSrc.value = props.src;
  }
};

onMounted(() => {
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isInView.value = true;
            loadImage();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px'
      }
    );
    
    if (imgRef.value) {
      observer.observe(imgRef.value);
    }
  } else {
    // 如果不支持 IntersectionObserver，直接加载图片
    actualSrc.value = props.src;
  }
});

onUnmounted(() => {
  if (observer && imgRef.value) {
    observer.unobserve(imgRef.value);
  }
});
</script>

<template>
  <img 
    ref="imgRef"
    :src="actualSrc" 
    :alt="alt" 
    @load="handleImageLoad"
    @error="handleImageError"
    :class="{ 'lazy-loaded': isLoaded }"
  />
</template>

<style scoped>
img {
  transition: opacity 0.3s ease;
  opacity: 0;
}

img.lazy-loaded {
  opacity: 1;
}
</style>