<script setup>
// Mario Worker resource index — redesigned (the content language is English, so
// the English and Polish write-ups are both available here; `show_zh: false`).
import { ref, computed, watchEffect } from "vue";
import { navTop, setPageTitle } from "../../../config.js";
import { applyLocale, getLocale } from "../../../i18n/index.js";
import { getMwDocLastUpdated } from "../../../util/next/docUpdated.js";
import { publishShell, publishShellHandlers } from "../../../util/next/shellStore.js";
import { localeForLocales, pageTitleFor, pickDoc } from "../../../util/next/pageLocale.js";
import { discoverDocs } from "../../../util/next/docFiles.js";

// `mw-<locale>.md` files define this page's languages. `mw-levels-*.md` does not
// match the `<locale>` shape and is ignored. Adding e.g. mw-zh-hant.md later needs
// no change here — it immediately becomes a document and a language-menu option.
const docs = discoverDocs(import.meta.glob("../../../markdown/*/mw-index.md", {
  eager: true, import: "default",
}));
const locales = Object.keys(docs);

const pageId = "mario-worker";
const pageEntry = navTop.find((item) => item.id === pageId);

const locale = ref(localeForLocales(getLocale(), locales));

const title = computed(() => pageTitleFor(pageEntry, locale.value));

const doc = computed(() => pickDoc(locale.value, docs));

// Each write-up has its own "last updated" stamp; both documents use `lastUpdate`.
// No cross-language fallback: if markdown/pl/mw-index.md has no commit date yet, the Polish page
// simply hides the line instead of showing markdown/en/mw-index.md's date under a Polish heading.
const lastUpdate = ref({ en: null, pl: null, "zh-Hant": null });
getMwDocLastUpdated().then((value) => { lastUpdate.value = value; });
const lastUpdateValue = computed(() => lastUpdate.value[locale.value] || null);

// The language menu is visible here now (English / Polski); wire it up so a click
// actually switches the write-up instead of just closing the menu.
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
    pageId: "mario-worker",
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
