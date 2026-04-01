/**
 * Image upload helpers — drag & drop, paste, toolbar button.
 * Uploads to POST /api/images, inserts markdown at cursor.
 */

import { api } from "../../lib/api.js";
import { insertAtCursor } from "./toolbar.js";

const MAX_WIDTH = 1200;
const QUALITY = 0.85;

/** Resize + compress image client-side before upload. */
async function optimizeImage(file: File): Promise<File> {
  // Skip SVGs — they're already optimal
  if (file.type === "image/svg+xml") return file;
  // Skip small images (< 100KB)
  if (file.size < 100 * 1024) return file;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_WIDTH) {
        height = Math.round(height * (MAX_WIDTH / width));
        width = MAX_WIDTH;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const name = file.name.replace(/\.[^.]+$/, ".webp");
            resolve(new File([blob], name, { type: "image/webp" }));
          } else {
            resolve(file); // original is smaller, keep it
          }
        },
        "image/webp",
        QUALITY,
      );
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadFile(file: File, textarea: HTMLTextAreaElement): Promise<void> {
  // Optimize before upload
  const optimized = await optimizeImage(file);

  // Show uploading placeholder
  const placeholder = `![Uploading ${file.name}...]()`;
  insertAtCursor(textarea, placeholder);

  try {
    const formData = new FormData();
    formData.append("file", optimized);

    const res = await fetch("/api/images", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "upload failed" }));
      textarea.value = textarea.value.replace(placeholder, `![Upload failed: ${(err as { error: string }).error}]()`);
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    const data = (await res.json()) as { url: string; name: string };
    const markdown = `![${file.name}](${data.url})`;
    textarea.value = textarea.value.replace(placeholder, markdown);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  } catch {
    textarea.value = textarea.value.replace(placeholder, "![Upload failed]()");
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

export function setupImageUpload(textarea: HTMLTextAreaElement): void {
  // Drag & drop
  textarea.addEventListener("dragover", (e) => {
    e.preventDefault();
    textarea.classList.add("drag-over");
  });

  textarea.addEventListener("dragleave", () => {
    textarea.classList.remove("drag-over");
  });

  textarea.addEventListener("drop", (e) => {
    e.preventDefault();
    textarea.classList.remove("drag-over");
    const files = e.dataTransfer?.files;
    if (!files) return;
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        uploadFile(file, textarea);
      }
    }
  });

  // Paste from clipboard
  textarea.addEventListener("paste", (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) uploadFile(file, textarea);
        return;
      }
    }
  });

  // Toolbar image button — open file picker
  const imageBtn = document.querySelector("[data-action='image']") as HTMLElement;
  if (imageBtn) {
    imageBtn.onclick = (e) => {
      e.stopImmediatePropagation(); // prevent toolbar handler
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.multiple = true;
      input.addEventListener("change", () => {
        if (!input.files) return;
        for (const file of input.files) {
          uploadFile(file, textarea);
        }
      });
      input.click();
    };
  }
}
