import { isNextDesign } from "../../util/Design.js";
import { startPage } from "../../boot/entry.js";
import LegacyPage from "./MfGames.vue";

if (isNextDesign()) {
  // Imported lazily so visitors who keep the legacy design never download the
  // new UI bundle.
  const module = await import("../next/mf-games/MfGamesNext.vue");
  await startPage({ legacy: LegacyPage, next: module.default });
} else {
  await startPage({ legacy: LegacyPage });
}
