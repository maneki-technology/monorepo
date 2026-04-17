/**
 * Vite plugin that injects foundation + HeroUI theme tokens into HTML at build time.
 *
 * Eliminates FOUC by making CSS custom properties available before any JS executes.
 * The runtime `injectAllTokens()` and `injectHerouiTheme()` calls become no-ops
 * because they check for existing style elements by ID before injecting.
 *
 * In dev mode, foundation modules are loaded via Vite's ssrLoadModule on each
 * HTML transform so token changes are picked up without restarting the dev server.
 */

import { type Plugin, type ViteDevServer } from "vite";

// Static imports for production build (tree-shakeable)
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

function generateTokenHtml(): string {
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
  const herouiStyle = `<style id="maneki-heroui-theme">${generateHerouiCss()}</style>`;

  return `${foundationStyle}\n${herouiStyle}`;
}

async function generateTokenHtmlDev(server: ViteDevServer): Promise<string> {
  // Use ssrLoadModule for fresh imports — Vite handles HMR invalidation
  const f = await server.ssrLoadModule("@maneki/foundation") as any;
  const h = await server.ssrLoadModule("@maneki/foundation/heroui-theme.js") as any;

  const tokenCss = [
    f.colorsToCssProperties(),
    f.semanticToCssProperties(),
    f.elevationToCssProperties(),
    f.typographyToCssProperties(),
    f.spacingToCssProperties(),
    f.radiusToCssProperties(),
    f.borderWidthToCssProperties(),
    f.shadowToCssProperties(),
  ].join("\n");

  const foundationStyle = `<style id="maneki-foundation-all">:root {\n${tokenCss}\n}</style>`;
  const herouiStyle = `<style id="maneki-heroui-theme">${h.generateHerouiCss()}</style>`;

  return `${foundationStyle}\n${herouiStyle}`;
}

export function injectTokensPlugin(): Plugin {
  let server: ViteDevServer | undefined;

  return {
    name: "inject-tokens",
    enforce: "post",
    configureServer(s) {
      server = s;
    },
    async transformIndexHtml(html) {
      const tokenHtml = server ? await generateTokenHtmlDev(server) : generateTokenHtml();
      return html.replace("</head>", `${tokenHtml}\n</head>`);
    },
  };
}
