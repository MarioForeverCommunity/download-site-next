import { bootNext } from "../../boot/next.js";

// About & Contact only exists in the redesigned UI: the rail is its entry point
// and the legacy design has no equivalent page, so this entry always boots the
// new design instead of going through startPage.
await bootNext({ pageId: "about" });
