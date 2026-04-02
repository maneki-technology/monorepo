import { getMd, wrapCodeBlocks } from "./preview.js";

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
      const title = (titleInput as any).value;
      const date = (dateInput as any).value;
      const tags = tagsInput.value;
      const content = textarea.value;
      // Use Shiki for fullscreen preview
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
    };
  }

  const previewCloseBtn = document.getElementById("admin-preview-close");
  if (previewCloseBtn) {
    previewCloseBtn.onclick = () => {
      overlay.style.display = "none";
    };
  }

  // Close preview on Escape
  overlay.addEventListener("keydown", (e) => {
    if (e.key === "Escape") overlay.style.display = "none";
  });
}
