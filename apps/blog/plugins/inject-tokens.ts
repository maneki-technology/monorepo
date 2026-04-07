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
} from "@maneki/foundation";
import { generateHerouiCss } from "@maneki/foundation/heroui-theme.js";

export function injectTokensPlugin(): Plugin {
  return {
    name: "inject-tokens",
    enforce: "post",
    transformIndexHtml(html) {
      // Foundation base tokens — only :root (light), skip default dark theme
      // Blog uses HeroUI theme exclusively, so [data-theme="dark"] is unused
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

      const foundationStyle = `<style id="maneki-foundation-all">:root {\n${tokenCss}\n}</style>`;

      // HeroUI theme tokens (light + dark)
      const herouiStyle = `<style id="maneki-heroui-theme">${generateHerouiCss()}</style>`;

      // Inject before </head> so tokens are available before any JS
      return html.replace("</head>", `${foundationStyle}\n${herouiStyle}\n</head>`);
    },
  };
}
