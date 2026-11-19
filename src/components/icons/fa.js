// Shared Font Awesome setup for both interfaces.
//
// The SVG core injects its own stylesheet (`1em` sizing, negative baseline) into
// <head> on first render. Both designs size icons with their own CSS, and the
// legacy design must not receive global rules, so injection is disabled and each
// icon is sized explicitly: NxIcon by prop, legacy components by `.icon` rules.
import { config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

config.autoAddCss = false;

export { FontAwesomeIcon };
