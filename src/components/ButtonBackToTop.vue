<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import UpArrowIcon from './icons/IconUpArrow.vue';

  const showBackToTop = ref(false);
  
  function handleScroll() {
    showBackToTop.value = window.scrollY > 300;
  }
  
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  
  onMounted(() => {
    window.addEventListener('scroll', handleScroll);
  });
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });
</script>

<template>
    <Transition name="fade">
        <UpArrowIcon v-show="showBackToTop" class="icon-inner back-to-top" @click="scrollToTop"></UpArrowIcon>
    </Transition>
</template>

<style scoped>
  @import "../assets/general.css";
</style>

<style scoped>
  .icon-inner {
    color: #000;
    display: inline-block;
    vertical-align: middle;
    margin: 2px;
  }

  .back-to-top {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 20px;
    height: 20px;
    background-color: #afdcff;
    border: 1px solid rgba(0, 0, 0, 0);
    padding: 10px;
    border-radius: 50%;
    transition: all 250ms;
    cursor: pointer;
    display: inline-block;
  }

  .back-to-top:hover {
    background-color: #97ccf5;
    border: 1px solid rgba(0, 0, 0, 0.15);
    box-shadow: rgba(0, 0, 0, 0.06) 1px 1px 2px;
    color: rgba(0, 0, 0, 0.65);
    transform: translateY(-3px);
  }
  
  .back-to-top span {
    font-size: 20px;
    font-weight: bold;
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>