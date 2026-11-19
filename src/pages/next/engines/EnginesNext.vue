<script setup>
// Mario Forever engines documentation — redesigned. The content language is
// English (`show_zh: false`), so English and Polish write-ups are both available.
import { ref, computed, watchEffect } from "vue";
import { navTop, setPageTitle } from "../../../config.js";
import { applyLocale, getLocale } from "../../../i18n/index.js";
import { getEngineDocLastUpdated } from "../../../util/next/docUpdated.js";
import { publishShell, publishShellHandlers } from "../../../util/next/shellStore.js";
import { localeForLocales, pageTitleFor, pickDoc } from "../../../util/next/pageLocale.js";
import { discoverDocs } from "../../../util/next/docFiles.js";

// Any `engines-<locale>.md` file is picked up: no locale list lives in this page.
const docs = discoverDocs(import.meta.glob("../../../markdown/engines-*.md", {
  eager: true, import: "default",
}), "engines");
const locales = Object.keys(docs);

const pageId = "engines";
const pageEntry = navTop.find((item) => item.id === pageId);

const locale = ref(localeForLocales(getLocale(), locales));

const title = computed(() => pageTitleFor(pageEntry, locale.value));

const doc = computed(() => pickDoc(locale.value, docs));

// Each write-up gets its own commit-based stamp; both documents use `lastUpdate`.
const lastUpdate = ref({ en: null, pl: null, "zh-Hant": null });
getEngineDocLastUpdated().then((value) => { lastUpdate.value = value; });
const lastUpdateValue = computed(() => lastUpdate.value[locale.value] || null);

// The language menu is visible on this page too; without a handler its clicks
// would only close the menu and leave the page in the old language.
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
    pageId: "engines",
    title: title.value,
    locale: locale.value,
    locales,
  });
});
publishShellHandlers({ changeLocale });
</script>

<template>

  <div class="nx-doc-wrap">
    <div class="nx-doc">
      <component
        :is="doc"
        :last-update="lastUpdateValue"
      />
    </div>
  </div>
</template>
