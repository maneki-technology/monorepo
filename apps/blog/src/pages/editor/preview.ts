import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { fromHighlighter } from "@shikijs/markdown-it";
import { state } from "./state.js";

// ─── Markdown renderer (client-side, lazy Shiki for syntax highlighting) ─────

let mdReady: Promise<MarkdownIt> | null = null;

export function getMd(): Promise<MarkdownIt> {
  if (mdReady) return mdReady;
  mdReady = (async () => {
    const highlighter = await createHighlighterCore({
      themes: [
        import("@shikijs/themes/github-light"),
        import("@shikijs/themes/github-dark"),
      ],
      langs: [
        import("@shikijs/langs/typescript"),
        import("@shikijs/langs/javascript"),
        import("@shikijs/langs/html"),
        import("@shikijs/langs/css"),
        import("@shikijs/langs/json"),
        import("@shikijs/langs/bash"),
        import("@shikijs/langs/markdown"),
        import("@shikijs/langs/yaml"),
        import("@shikijs/langs/rust"),
        import("@shikijs/langs/sql"),
      ],
      engine: createJavaScriptRegexEngine(),
    });
    const instance = new MarkdownIt({ html: true, linkify: true, typographer: true });
    type HighlighterParam = Parameters<typeof fromHighlighter>[0];
    instance.use(fromHighlighter(highlighter as unknown as HighlighterParam, {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    }));
    instance.use(anchor, {
      slugify: (s: string) => s.toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, ""),
      permalink: false,
    });
    addImageRenderer(instance);
    return instance;
  })();
  return mdReady;
}

// Override <img> → <ui-image> for both sync and async renderers
function addImageRenderer(md: MarkdownIt): void {
  md.renderer.rules.image = function (tokens, idx) {
    const token = tokens[idx];
    const src = token.attrGet("src") ?? "";
    const alt = token.content ?? "";
    return `<ui-image src="${src}" alt="${alt}" style="--ui-image-bg:transparent;--ui-image-fit:contain;display:block;max-width:100%;"></ui-image>`;
  };
}

// Fallback sync md for initial render before Shiki loads
export const mdSync = new MarkdownIt({ html: true, linkify: true, typographer: true });
mdSync.use(anchor, {
  slugify: (s: string) => s.toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, ""),
  permalink: false,
});
addImageRenderer(mdSync);

// Wrap <pre> code blocks in <ui-scrollbar> for horizontal scroll
export function wrapCodeBlocks(container: HTMLElement): void {
  container.querySelectorAll("pre").forEach((pre) => {
    if (pre.parentElement?.tagName === "UI-SCROLLBAR") return;
    const wrapper = document.createElement("ui-scrollbar");
    wrapper.setAttribute("orientation", "horizontal");
    wrapper.setAttribute("emphasis", "minimal");
    pre.parentNode!.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);
  });
}

// ─── Render ──────────────────────────────────────────────────────────────────

let previewDebounceTimer: ReturnType<typeof setTimeout> | null = null;

export function triggerPreview(): void {
  if (previewDebounceTimer) clearTimeout(previewDebounceTimer);
  previewDebounceTimer = setTimeout(renderPreview, 150);
}

export function renderPreview(): void {
  const isProject = state.activeTabType === "project";
  const title = isProject
    ? (document.getElementById("admin-project-title") as any)?.value ?? ""
    : (document.getElementById("admin-title") as any)?.value ?? "";
  const date = isProject ? "" : (document.getElementById("admin-date") as any)?.value ?? "";
  const tags = isProject
    ? (document.getElementById("admin-project-tech") as HTMLInputElement)?.value ?? ""
    : (document.getElementById("admin-tags") as HTMLInputElement)?.value ?? "";
  const content = (document.getElementById("admin-content") as HTMLTextAreaElement)?.value ?? "";
  const preview = document.getElementById("admin-preview");
  if (!preview) return;

  const tagBadges = tags.split(",").map((t) => t.trim()).filter(Boolean)
    .map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("");
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";

  // Render with sync md first, then upgrade with Shiki when ready
  const html = mdSync.render(content);
  preview.innerHTML = `
    <article>
      <h1 class="heading-02">${title || "Untitled"}</h1>
      ${formattedDate ? `<div class="post-meta mt-1">${formattedDate}</div>` : ""}
      ${tagBadges ? `<div class="tags mt-2">${tagBadges}</div>` : ""}
      <div class="post-content mt-4">${html}</div>
    </article>
  `;

  // Re-render with Shiki highlighting (async)
  getMd().then((mdShiki) => {
    const highlighted = mdShiki.render(content);
    if (highlighted !== html) {
      preview.innerHTML = `
        <article>
          <h1 class="heading-02">${title || "Untitled"}</h1>
          ${formattedDate ? `<div class="post-meta mt-1">${formattedDate}</div>` : ""}
          ${tagBadges ? `<div class="tags mt-2">${tagBadges}</div>` : ""}
          <div class="post-content mt-4">${highlighted}</div>
        </article>
      `;
    }
    wrapCodeBlocks(preview);
  });
}
