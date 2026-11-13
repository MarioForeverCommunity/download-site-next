import { isNextDesign } from "../../util/Design.js";
import { startPage } from "../../boot/entry.js";
import LegacyPage from "./AssetsPage.vue";

if (isNextDesign()) {
  const module = await import("../next/assets/AssetsNext.vue");
  await startPage({ legacy: LegacyPage, next: module.default });
} else {
  await startPage({ legacy: LegacyPage });
}
