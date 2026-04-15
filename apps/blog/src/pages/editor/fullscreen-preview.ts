import { getMd, wrapCodeBlocks } from "./preview.js";
import { state } from "./state.js";

export function setupFullscreenPreview(
  textarea: HTMLTextAreaElement,
  root: ParentNode,
): void {
  const overlay = root.querySelector("#admin-preview-overlay") as HTMLElement;
  const previewFull = root.querySelector("#admin-preview-full") as HTMLElement;
  const ep = (root as ShadowRoot).host as any;

  const previewBtn = root.querySelector("#admin-preview-btn") as HTMLElement | null;
  if (previewBtn) {
    previewBtn.onclick = () => {
      if (state.activeTabType === "project") {
        const title = ep?.projectTitle ?? "";
        const description = ep?.projectDescription ?? "";
        const tech: string = ep?.projectTech?.join(", ") ?? "";
        const content: string = ep?.postContent ?? "";
        const project = state.allProjects.find((p) => p.slug === state.currentSlug);

        getMd().then((mdShiki) => {
          const highlighted = content ? mdShiki.render(content) : "";
          const techBadges = tech.split(",").map((t) => t.trim()).filter(Boolean)
            .map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("");
          previewFull.innerHTML = `
            <article>
              <a href="/portfolio" class="body-02 text-link" style="text-decoration:none;">← Back to portfolio</a>
              <h1 class="heading-02 mt-3">${title || "Untitled"}</h1>
              <p class="body-01 text-secondary mt-1">${description}</p>
              ${techBadges ? `<div class="tags mt-2">${techBadges}</div>` : ""}
              <div class="row gap-2 mt-2">
                ${project?.url ? `<ui-link size="s" href="${project.url}" external>Live</ui-link>` : ""}
                ${project?.repo ? `<ui-link size="s" href="${project.repo}" external>Source</ui-link>` : ""}
              </div>
              ${project?.image ? `<ui-image src="${project.image}" alt="${title}" style="width:100%;max-height:400px;--ui-image-fit:cover;--ui-image-bg:var(--fd-surface-secondary);border-radius:var(--fd-radius-md);margin-top:var(--fd-space-3);"></ui-image>` : ""}
              ${highlighted ? `<div class="post-content mt-4">${highlighted}</div>` : ""}
            </article>
          `;
          wrapCodeBlocks(previewFull);
          overlay.style.display = "flex";
        });
      } else {
        const title = ep?.postTitle ?? "";
        const date = ep?.postDate ?? "";
        const tags: string = ep?.postTags?.join(", ") ?? "";
        const content: string = ep?.postContent ?? "";
        getMd().then((mdShiki) => {
          const highlighted = mdShiki.render(content);
          const tagBadges = tags.split(",").map((t) => t.trim()).filter(Boolean)
            .map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("");
          const formattedDate = date
            ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
            : "";
          previewFull.innerHTML = `
            <article>
              <a href="/blog" class="body-02 text-link" style="text-decoration:none;">← Back to blog</a>
              <h1 class="heading-02 mt-3">${title || "Untitled"}</h1>
              ${formattedDate ? `<div class="post-meta mt-1">${formattedDate}</div>` : ""}
              ${tagBadges ? `<div class="tags mt-2">${tagBadges}</div>` : ""}
              <div class="post-content mt-4">${highlighted}</div>
            </article>
          `;
          wrapCodeBlocks(previewFull);
          overlay.style.display = "flex";
        });
      }
    };
  }

  const previewCloseBtn = root.querySelector("#admin-preview-close") as HTMLElement | null;
  if (previewCloseBtn) {
    previewCloseBtn.onclick = () => {
      overlay.style.display = "none";
    };
  }

  overlay.addEventListener("keydown", (e) => {
    if (e.key === "Escape") overlay.style.display = "none";
  });
}
