/**
 * Vite plugin that injects foundation + HeroUI theme tokens into HTML at build time.
 *
 * Eliminates FOUC by making CSS custom properties available before any JS executes.
 * The runtime `injectAllTokens()` and `injectHerouiTheme()` calls become no-ops
 * because they check for existing style elements by ID before injecting.
 */

import { type Plugin } from "vite";
import {
  colorsToCssProperties,
  semanticToCssProperties,
  elevationToCssProperties,
  typographyToCssProperties,
  spacingToCssProperties,
  radiusToCssProperties,
  borderWidthToCssProperties,
  shadowToCssProperties,
  darkSemanticToCssProperties,
  darkElevationToCssProperties,
  darkShadowToCssProperties,
} from "@maneki/foundation";
import { generateHerouiCss } from "@maneki/foundation/heroui-theme.js";

export function injectTokensPlugin(): Plugin {
  return {
    name: "inject-tokens",
    enforce: "post",
    transformIndexHtml(html) {
      // Foundation base tokens (same as injectAllTokens())
      const tokenCss = [
        colorsToCssProperties(),
        semanticToCssProperties(),
        elevationToCssProperties(),
        typographyToCssProperties(),
        spacingToCssProperties(),
        radiusToCssProperties(),
        borderWidthToCssProperties(),
        shadowToCssProperties(),
      ].join("\n");
      const darkTokenCss = [
        darkSemanticToCssProperties(),
        darkElevationToCssProperties(),
        darkShadowToCssProperties(),
      ].join("\n");

      const foundationStyle = `<style id="maneki-foundation-all">:root {\n${tokenCss}\n}\n\n[data-theme="dark"] {\n${darkTokenCss}\n}</style>`;

      // HeroUI theme tokens
      const herouiStyle = `<style id="maneki-heroui-theme">${generateHerouiCss()}</style>`;

      // Inject before </head> so tokens are available before any JS
      return html.replace("</head>", `${foundationStyle}\n${herouiStyle}\n</head>`);
    },
  };
}
