import { OverlayScrollbars, ClickScrollPlugin } from 'overlayscrollbars';

OverlayScrollbars.plugin(ClickScrollPlugin);

let instance = null;

export function initOverlayScrollbars() {
  if (!instance) {
    instance = OverlayScrollbars(document.body, {
      scrollbars: {
        clickScroll: true,
      },
    });
  }
  return instance;
}

export function disableScroll() {
  if (instance) {
    instance.options({
      overflow: {
        x: 'hidden',
        y: 'hidden',
      },
    });
  }
}

export function enableScroll() {
  if (instance) {
    instance.options({
      overflow: {
        x: 'scroll',
        y: 'scroll',
      },
    });
  }
}

export function getOverlayScrollbarsInstance() {
  return instance;
}
