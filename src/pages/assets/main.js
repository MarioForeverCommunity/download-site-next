import { createApp } from 'vue'
import App from './AssetsPage.vue'
import 'overlayscrollbars/styles/overlayscrollbars.css';
import { initOverlayScrollbars } from '../../util/OverlayScrollbarsUtil.js';
import '../../assets/dark-mode.css';

createApp(App).mount('#app')

initOverlayScrollbars();
