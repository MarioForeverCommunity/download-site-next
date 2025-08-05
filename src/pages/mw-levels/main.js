import { createApp } from 'vue'
import App from './MwLevels.vue'
import 'overlayscrollbars/styles/overlayscrollbars.css';
import { OverlayScrollbars, ClickScrollPlugin } from 'overlayscrollbars';
import '../../assets/dark-mode.css';

createApp(App).mount('#app')

OverlayScrollbars.plugin(ClickScrollPlugin);

OverlayScrollbars(document.body, {
  scrollbars: {
    clickScroll: true,
  },
});