import { triggerPreview } from "./preview.js";

export function setupTags(tagInput: HTMLInputElement, tagList: HTMLElement, tagsInput: HTMLInputElement): void {
  function syncTags(): void {
    const tags = Array.from(tagList.querySelectorAll("ui-tag")).map((t) => t.textContent?.trim() ?? "");
    tagsInput.value = tags.join(", ");
    triggerPreview();
  }

  function addTag(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) return;
    const existing = Array.from(tagList.querySelectorAll("ui-tag")).map((t) => t.textContent?.trim().toLowerCase());
    if (existing.includes(trimmed.toLowerCase())) return;
    const tag = document.createElement("ui-tag");
    tag.setAttribute("size", "s");
    tag.setAttribute("emphasis", "subtle");
    tag.setAttribute("dismissible", "");
    tag.textContent = trimmed;
    tag.addEventListener("dismiss", () => { tag.remove(); syncTags(); });
    tagList.appendChild(tag);
    syncTags();
  }

  tagInput.addEventListener("keydown", (e: Event) => {
    const ke = e as KeyboardEvent;
    if (ke.key === "Enter") {
      ke.preventDefault();
      addTag((tagInput as any).value);
      (tagInput as any).value = "";
      tagInput.focus();
    }
  });
}
