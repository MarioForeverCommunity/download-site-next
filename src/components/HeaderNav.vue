<script setup>
  import { navTop, topBar } from "../config.js";
  import { ref, onMounted, onBeforeUnmount } from 'vue';

  // const BASE_URL = import.meta.env.BASE_URL;

  const props = defineProps({
    pageId: {
      type: String,
      required: true
    },
    lanVar : {
      required: true
    }
  });

  defineEmits(['changeLanZh', 'changeLanEn']);

  const pageEntry = navTop.find(item => item.id === props.pageId);

  function displayLan() {
    if (pageEntry.show_en == false && props.lanVar == "en") {
      return "zh";
    }
    return props.lanVar;
  }

  // Mobile menu for top-left links
  const isMenuOpen = ref(false);
  const isNavOpen = ref(false);
  const menuRef = ref(null);
  const navRef = ref(null);
  function handleClickOutside(e) {
    if (menuRef.value && !menuRef.value.contains(e.target)) {
      isMenuOpen.value = false;
    }
    if (navRef.value && !navRef.value.contains(e.target)) {
      isNavOpen.value = false;
    }
  }
  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<template>
  <div class="warning" v-if="props.lanVar == 'en' && pageEntry.show_en == false">
    <strong>Warning: </strong>You are currently viewing a page that is only available in Chinese. If you have inadvertently accessed this page, please click <a href="./">here</a> to return to the index.
  </div>
  <div class="topbar">
    <div class="topbar-inner">
      <!-- Desktop: show all left links -->
      <div class="left-links desktop-only">
        <a v-for="item in topBar.filter(a => (displayLan() == 'zh' && a.show_zh !== false) || (displayLan() == 'en' && a.show_en))" :key="item.link" :href="item.link" target="_blank" class="link-item">{{ displayLan() == 'zh' ? item.name : item.name_alt }}</a>
      </div>
      <!-- Mobile: collapse into a dropdown toggle at top-left -->
      <div class="left-links mobile-only" ref="menuRef">
        <button class="menu-toggle" @click.stop="isMenuOpen = !isMenuOpen" :aria-expanded="isMenuOpen" aria-haspopup="true" :aria-label="displayLan() == 'zh' ? '打开菜单' : 'Open menu'">
          <span class="menu-label">{{ displayLan() == 'zh' ? '社区站点' : 'External Links' }}</span>
          <svg class="chevron" :class="{ open: isMenuOpen }" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="mobile-menu" v-if="isMenuOpen">
          <a v-for="item in topBar.filter(a => (displayLan() == 'zh' && a.show_zh !== false) || (displayLan() == 'en' && a.show_en))"
             :key="item.link"
             :href="item.link"
             target="_blank"
             class="mobile-menu-item"
             @click="isMenuOpen = false">
            {{ displayLan() == 'zh' ? item.name : item.name_alt }}
          </a>
        </div>
      </div>

      <!-- Right: language switch (unchanged) -->
      <div style="float: right; display: inline;" v-if="pageEntry.show_en == true">
        <a class="lan-item" :class="displayLan() == 'zh' ? 'active' : ''" @click="$emit('changeLanZh')">中文</a> |
        <a class="lan-item" :class="displayLan() == 'en' ? 'active' : ''" @click="$emit('changeLanEn')">English</a>
      </div>
    </div>
  </div>
  <header>
    <div class="header-container">
      <!-- <div class="header-row">
        <h1>{{ displayLan() == 'zh' ? pageEntry.title : pageEntry.title_alt }}</h1>
      </div> -->
      <div class="header-row nav-row">
        <div class="logo"><a href="."><img :src="displayLan() == 'zh' ? './images/logo_hd.png' : './images/logo2_hd.png'"></a></div>
        <!-- Desktop nav -->
        <div class="nav desktop-only">
          <div class="radio-inputs">
            <a v-for="nav in navTop.filter(item => displayLan() == 'zh' || item.show_en == true)" :key="nav.id" class="radio" :class="nav.id == props.pageId ? 'checked' : ''" :href="nav.link">
              <span class="radio-text" name="radio">
                {{ displayLan() == 'zh' ? nav.option : nav.option_alt }}
              </span>
            </a>
          </div>
        </div>
        <!-- Mobile nav dropdown -->
        <div class="nav-mobile mobile-only" ref="navRef">
          <button class="nav-toggle" @click.stop="isNavOpen = !isNavOpen" :aria-expanded="isNavOpen" aria-haspopup="true" :aria-label="displayLan() == 'zh' ? '打开导航' : 'Open navigation'">
            <span class="nav-toggle-text">{{ displayLan() == 'zh' ? pageEntry.option : pageEntry.option_alt }}</span>
            <svg class="chevron" :class="{ open: isNavOpen }" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="nav-dropdown" v-if="isNavOpen">
            <a v-for="nav in navTop.filter(item => displayLan() == 'zh' || item.show_en == true)" :key="nav.id" class="nav-dropdown-item" :class="nav.id == props.pageId ? 'active' : ''" :href="nav.link">
              {{ displayLan() == 'zh' ? nav.option : nav.option_alt }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* 深色模式适配 */
body.dark header {
  background-color: #3a3a3a !important;
}
body.dark .menu-toggle {
  color: #999 !important;
}
body.dark .menu-toggle:hover,
body.dark .menu-toggle[aria-expanded='true'] {
  color: #bbb !important;
}
body.dark .mobile-menu {
  background-color: #333 !important;
  border-color: #333 !important;
  box-shadow: 0 4px 12px rgba(0,0,0,.3);
}
body.dark .mobile-menu-item {
  color: #999 !important;
}
body.dark .mobile-menu-item:hover {
  background-color: #444 !important;
  color: #bbb !important;
}

body.dark .nav-toggle {
  color: #e0e0e0 !important;
}
body.dark .nav-toggle:hover,
body.dark .nav-toggle[aria-expanded='true'] {
  color: #e0e0e0 !important;
}
body.dark .nav-dropdown {
  background-color: #333 !important;
  border-color: #333 !important;
  box-shadow: 0 4px 12px rgba(0,0,0,.3);
}
body.dark .nav-dropdown-item {
  color: #999 !important;
  border-color: #444 !important;
}
body.dark .nav-dropdown-item:hover {
  background-color: #444 !important;
  color: #bbb !important;
}
body.dark .nav-dropdown-item.active {
  background-color: #3a4a5a !important;
  color: #6abaff !important;
}

.logo a img {
  width: auto;
  height: 60px;
  display: block;
}

/* mobile-first visibility */
.desktop-only { display: none; }
.mobile-only { display: inline-block; }

/* top-left container for mobile dropdown */
.left-links.mobile-only { position: relative; }
.menu-toggle {
  background: transparent;
  border: none;
  color: rgb(85, 85, 85);
  cursor: pointer;
  padding: 4px 6px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color .2s ease;
}
.menu-toggle:hover {
  color: #008CFF;
}
.menu-toggle[aria-expanded='true'] {
  color: #008CFF;
}
.menu-toggle .chevron { transition: transform .2s ease; }
.menu-toggle .chevron.open { transform: rotate(180deg); }

.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 4px 12px rgba(0,0,0,.08);
  border-radius: 8px;
  padding: 0;
  z-index: 1000;
  min-width: 120px;
}
.mobile-menu-item {
  display: block;
  padding: 8px 12px;
  color: rgb(85, 85, 85);
}
.mobile-menu-item:hover {
  background: #f3f4f6;
  color: #008CFF;
}

/* Mobile nav dropdown */
.nav-mobile {
  position: relative;
  display: inline-block;
}
.nav-toggle {
  background: transparent;
  border: none;
  color: #24292e;
  cursor: pointer;
  padding: 6px 12px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all .15s ease-in-out;
  font-size: 14px;
  font-weight: 600;
}
.nav-toggle:hover {
  color: black;
}
.nav-toggle[aria-expanded='true'] {
  color: black;
}
.nav-toggle .chevron { transition: transform .2s ease; }
.nav-toggle .chevron.open { transform: rotate(180deg); }
.nav-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 4px 12px rgba(0,0,0,.08);
  border-radius: 8px;
  padding: 0;
  z-index: 1000;
  min-width: 140px;
  font-size: 14px;
}
.nav-dropdown-item {
  display: block;
  padding: 10px 16px;
  color: rgb(85, 85, 85);
}
.nav-dropdown-item:last-child {
  border-bottom: none;
}
.nav-dropdown-item:hover {
  background: #f3f4f6;
  color: #008CFF;
}
.nav-dropdown-item.active {
  font-weight: 600;
  color: #008CFF;
  background: #f0f7ff;
}

@media (min-width: 800px) {
  .logo {
    width: auto;
    height: 60px;
    display: inline-block;
    vertical-align: middle;
  }

  .nav-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav .radio-inputs .radio {
    margin: 0 8px;
  }

  /* desktop visibility */
  .desktop-only { display: inline; }
  .mobile-only { display: none; }
}

  .topbar {
    background-color: #f5f5f5;
    font-size: 13px;
    line-height: 30px;
    height: 35px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
  }

  .topbar-inner {
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }

  .link-item {
    margin-right: 20px;
    color: rgb(85, 85, 85);
  }

  .lan-item {
    color: rgb(85, 85, 85);
    cursor: pointer;
  }

  .lan-item.active {
    font-weight: bold;
  }

  .lan-row .button {
    float: right;
  }

  header {
    background-color: white;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, .1);
    height: 90px;
  }

  .header-container {
    width: 100vw;
    margin: 0 auto;
    box-sizing: border-box;
    background-color: transparent;
    border: none;
    box-shadow: none;
  }

  .nav-row {
    width: 100%;
    align-content: center;
    vertical-align: middle;
  }

  @media (max-width: 799px) {
    .logo {
      margin: 0;
      margin-left: 12px;
      display: inline-block;
      vertical-align: middle;
      height: 60px;
    }
    .logo a img {
      height: 64px;
    }
    .header-container {
      padding: 0px 12px;
    }
    .nav-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
    }

    .topbar-inner {
      margin: 0 auto;
      width: 90%;
    }
  }

  @media (max-width: 1333px) and (min-width: 800px) {
    .header-container {
      width: 90vw;
      border-radius: 2px;
    }

    .topbar-inner {
      margin: 0 auto;
      width: 90%;
    }
  }

  @media (min-width: 1333px) {
    .header-container {
      width: 1200px;
      border-radius: 2px;
    }

    .topbar-inner {
      margin: 0 auto;
      width: 1200px;
    }
  }

  .header-row {
    height: 90px;
  }

  .radio-inputs {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    box-sizing: border-box;
    font-size: 14px;
  }

  .radio-inputs .radio {
    flex: 1 1 auto;
    text-align: center;
    border-radius: 0.5rem;
    margin: 0.2rem;
  }

  .radio-inputs .radio-text {
    display: flex;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    border: none;
    padding: .5rem;
    color: rgb(105, 105, 105);
    transition: all .15s ease-in-out;
    display: inline-block;
  }

  .radio-inputs .radio.checked .radio-text {
    font-weight: 600;
    color: black;
  }

  .radio-inputs .radio:hover .radio-text {
    color: black;
  }

  .button {
    appearance: none;
    background-color: #fafbfc;
    border: 1px solid rgba(27, 31, 35, 0.15);
    border-radius: 6px;
    box-shadow:
      rgba(27, 31, 35, 0.04) 0 1px 0,
      rgba(255, 255, 255, 0.25) 0 1px 0 inset;
    box-sizing: border-box;
    color: #24292e;
    cursor: pointer;
    display: inline-block;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    list-style: none;
    padding: 6px 16px;
    position: relative;
    transition: background-color 0.2s cubic-bezier(0.3, 0, 0.5, 1);
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    vertical-align: middle;
    white-space: nowrap;
    word-wrap: break-word;
  }

  .button:hover {
    background-color: #f3f4f6;
    text-decoration: none;
    transition-duration: 0.1s;
  }

  .button:disabled {
    background-color: #fafbfc;
    border-color: rgba(27, 31, 35, 0.15);
    color: #959da5;
    cursor: default;
  }

  .button:active {
    background-color: #edeff2;
    box-shadow: rgba(225, 228, 232, 0.2) 0 1px 0 inset;
    transition: none 0s;
  }

  .button:focus {
    outline: 1px transparent;
  }

  .button:before {
    display: none;
  }

  .button:-webkit-details-marker {
    display: none;
  }

  h1 {
    margin-top: 10px;
  }

  .warning {
    border: 1px solid rgb(255, 238, 186);
    border-radius: .5em;
    background-color: rgb(255, 243, 205);
    padding: .5em;
    color: rgb(133, 100, 4);
    text-align: center;
    font-size: 14px;
  }

  a:hover {
    text-decoration: none;
    color: #008CFF;
  }

</style>
<style>
  body {
    background-color: #f2f2f2;
    margin: 0;
    width: 100vw;
    box-sizing: border-box;
    overflow-x: hidden;
    min-height: 100vh;
  }

  .container {
    background-color: white;
    border: 1px solid #eaeaea;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, .1);
  }

  .v-popper__inner {
    max-width: 90vw !important;
  }
</style>