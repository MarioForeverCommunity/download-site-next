<script setup>
// Mario Forever resource index — redesigned.
//
// Prose is the same markdown the legacy page renders (mf-zh.md / mf-en.md), so
// wording never forks between designs. The container is full-width; only the
// text measure is capped, which lets the embedded record cards and carousels use
// the whole canvas.
import { ref, computed, watchEffect } from "vue";
import NxDocPanels from "../../../components/next/NxDocPanels.vue";
import { applyLocale, getLocale } from "../../../i18n/index.js";
import { getMfDocLastUpdated } from "../../../util/next/docUpdated.js";
import { navTop, setPageTitle } from "../../../config.js";
import { publishShell, publishShellHandlers } from "../../../util/next/shellStore.js";
import { localeForLocales, pageTitleFor, pickDoc } from "../../../util/next/pageLocale.js";
import { discoverDocs } from "../../../util/next/docFiles.js";

// Any `mf-<locale>.md` file is picked up automatically; adding a language needs
// no page or shell change.
const docs = discoverDocs(import.meta.glob("../../../markdown/mf-*.md", {
  eager: true, import: "default",
}), "mf");
const locales = Object.keys(docs);

const pageId = "index";
const pageEntry = navTop.find((item) => item.id === pageId);

const locale = ref(localeForLocales(getLocale(), locales));

const title = computed(() => pageTitleFor(pageEntry, locale.value));

// `pickDoc` prefers the exact locale (mf-zh-hant.md / mf-pl.md) and falls back to
// the written language for locales without their own document.
const doc = computed(() => pickDoc(locale.value, docs));

// Each home-page document is tracked independently: the newest commit touching
// its own .md (or the shared original-MF data) is what its "Last updated" shows.
const lastUpdate = ref({ zh: null, "zh-Hant": null, en: null, pl: null });
getMfDocLastUpdated().then((value) => { lastUpdate.value = value; });

// Feed each document its own independently tracked date under the prop name it
// actually declares: the Polish write-up uses `lastUpdateEn`, the Traditional one
// uses `lastUpdateZh`, so both receive the stamp of *their own* .md file.
const docProps = computed(() => {
  switch (locale.value) {
    case "zh-Hant": return { lastUpdateZh: lastUpdate.value["zh-Hant"] };
    case "pl": return { lastUpdateEn: lastUpdate.value.pl };
    case "en": return { lastUpdateEn: lastUpdate.value.en };
    default: return { lastUpdateZh: lastUpdate.value.zh };
  }
});

function changeLocale(code) {
  locale.value = applyLocale(code);
}

// The app shell is rendered once by the SPA root; this page only publishes
// the parts that differ (title, write-up, search model) plus its own controls.
// A watchEffect keeps the shell in sync when the language changes or the
// write-up's date arrives after the first render.
watchEffect(() => {
  setPageTitle(title.value, locale.value);
  publishShell({
    pageId: "index",
    title: title.value,
    locale: locale.value,
    locales,
  });
});
publishShellHandlers({
  changeLocale,
});
</script>

<template>

  <div class="nx-doc-wrap">
    <div class="nx-doc">
      <component
        :is="doc"
        v-bind="docProps"
      />
    </div>
  </div>
  <NxDocPanels :locale="locale" />
</template>
