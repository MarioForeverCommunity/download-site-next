import { createApp } from 'vue'
import App from './MfMain.vue'
import 'overlayscrollbars/styles/overlayscrollbars.css';
import { OverlayScrollbars, ClickScrollPlugin } from 'overlayscrollbars';

createApp(App).mount('#app')

OverlayScrollbars.plugin(ClickScrollPlugin);

OverlayScrollbars(document.body, {
  scrollbars: {
    clickScroll: true,
  },
});