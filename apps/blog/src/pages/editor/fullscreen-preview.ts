import { getMd, wrapCodeBlocks } from "./preview.js";
import { state } from "./state.js";

export function setupFullscreenPreview(
  textarea: HTMLTextAreaElement,
  titleInput: HTMLElement,
  dateInput: HTMLElement,
  tagsInput: HTMLInputElement,
): void {
  const overlay = document.getElementById("admin-preview-overlay")!;
  const previewFull = document.getElementById("admin-preview-full")!;

  const previewBtn = document.getElementById("admin-preview-btn");
  if (previewBtn) {
    previewBtn.onclick = () => {
      if (state.activeTabType === "project") {
        const title = (document.getElementById("admin-project-title") as any)?.value ?? "";
        const description = (document.getElementById("admin-project-description") as any)?.value ?? "";
        const tech = (document.getElementById("admin-project-tech") as HTMLInputElement)?.value ?? "";
        const content = textarea.value;
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
              ${highlighted ? `<div class="post-content mt-4">${highlighted}</div>` : ""}
            </article>
          `;
          wrapCodeBlocks(previewFull);
          overlay.style.display = "flex";
        });
      } else {
        const title = (titleInput as any).value;
        const date = (dateInput as any).value;
        const tags = tagsInput.value;
        const content = textarea.value;
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

  const previewCloseBtn = document.getElementById("admin-preview-close");
  if (previewCloseBtn) {
    previewCloseBtn.onclick = () => {
      overlay.style.display = "none";
    };
  }

  overlay.addEventListener("keydown", (e) => {
    if (e.key === "Escape") overlay.style.display = "none";
  });
}
