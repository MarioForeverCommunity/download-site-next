// Component registry for the redesigned documentation pages.
//
// The markdown files reference `<MfGamesEntry>` / `<AssetsEntry>` /
// `<SoftendoEntry>` and expect them to be globally available (the legacy pages
// inject them into `appContext.components`). For the redesigned pages the same
// names are registered here, mapped to the quieter preview components, so the
// markdown stays untouched and remains the single source of written content.
import MfGamesEntry from "../../components/next/NxEntryMf.vue";
import AssetsEntry from "../../components/next/NxEntryAsset.vue";
import SoftendoEntry from "../../components/next/NxEntrySoftendo.vue";

export const docComponents = {
  MfGamesEntry,
  AssetsEntry,
  SoftendoEntry,
};
