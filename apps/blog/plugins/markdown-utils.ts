/**
 * Shared MarkdownIt renderer rules for Maneki Web Components.
 * Transforms standard HTML output to use design system components:
 *   <a> → <ui-link>  (with external link detection)
 *   <img> → <ui-image>
 */

import type MarkdownIt from "markdown-it";

/** Apply Maneki Web Component renderer rules to a MarkdownIt instance. */
export function applyManekiRenderers(md: MarkdownIt): void {
  // <a> → <ui-link>
  const defaultLinkOpen =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, _env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const href = token.attrGet("href") ?? "";
    const isExternal = /^https?:\/\//.test(href);
    token.tag = "ui-link";
    if (isExternal) {
      token.attrSet("external", "");
      token.attrSet("target", "_blank");
      token.attrSet("rel", "noopener");
    }
    return defaultLinkOpen(tokens, idx, options, env, self);
  };

  md.renderer.rules.link_close = function () {
    return "</ui-link>";
  };

  // <img> → <ui-image>
  md.renderer.rules.image = function (tokens, idx) {
    const token = tokens[idx];
    const src = token.attrGet("src") ?? "";
    const alt = token.content ?? "";
    return `<ui-image src="${src}" alt="${alt}"></ui-image>`;
  };
}
