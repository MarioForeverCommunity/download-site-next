import { startPage } from "../../boot/entry.js";
import LegacyPage from "./SoftendoGames.vue";

// The redesigned UI is a single-page app: its router loads the page
// component lazily and can navigate between catalogs without a reload, so
// only `pageId` is passed here. The legacy design keeps its own page.
await startPage({ legacy: LegacyPage, pageId: "softendo" });
