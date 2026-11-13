import { isNextDesign } from "../../util/Design.js";
import { startPage } from "../../boot/entry.js";
import LegacyPage from "./SoftendoGames.vue";

if (isNextDesign()) {
  const module = await import("../next/softendo/SoftendoNext.vue");
  await startPage({ legacy: LegacyPage, next: module.default });
} else {
  await startPage({ legacy: LegacyPage });
}
