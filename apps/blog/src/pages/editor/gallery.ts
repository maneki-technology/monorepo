/**
 * Image gallery — browse uploaded images, click to insert into editor.
 * Uses <ui-side-panel> component for the slide-in panel.
 */

import { insertAtCursor } from "./toolbar.js";
import "@maneki/ui-components/components/ui-side-panel.js";

interface GalleryImage {
  name: string;
  url: string;
  size: number;
  uploaded: string;
  contentType: string;
}

let panel: HTMLElement | null = null;
let galleryGrid: HTMLElement | null = null;
let textareaRef: HTMLTextAreaElement | null = null;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function fetchImages(): Promise<GalleryImage[]> {
  try {
    const res = await fetch("/api/images");
    if (!res.ok) return [];
    const data = (await res.json()) as { images: GalleryImage[] };
    return data.images;
  } catch {
    return [];
  }
}

async function renderGallery(): Promise<void> {
  if (!galleryGrid) return;
  galleryGrid.innerHTML = '<div class="gallery-loading">Loading...</div>';

  const images = await fetchImages();

  if (images.length === 0) {
    galleryGrid.innerHTML = '<div class="gallery-empty">No images uploaded yet</div>';
    return;
  }

  galleryGrid.innerHTML = "";
  for (const img of images) {
    const item = document.createElement("div");
    item.className = "gallery-item";

    const thumb = document.createElement("img");
    thumb.src = img.url;
    thumb.alt = img.name;
    thumb.loading = "lazy";

    const info = document.createElement("div");
    info.className = "gallery-item-info";
    info.innerHTML = `
      <span class="gallery-item-name">${img.name}</span>
      <span class="gallery-item-size">${formatSize(img.size)}</span>
    `;

    const actions = document.createElement("div");
    actions.className = "gallery-item-actions";

    const insertBtn = document.createElement("ui-button");
    insertBtn.setAttribute("action", "primary");
    insertBtn.setAttribute("emphasis", "minimal");
    insertBtn.setAttribute("size", "s");
    insertBtn.textContent = "Insert";
    insertBtn.onclick = () => {
      if (textareaRef) {
        insertAtCursor(textareaRef, `![${img.name}](${img.url})`);
      }
      closeGallery();
    };

    const deleteBtn = document.createElement("ui-button");
    deleteBtn.setAttribute("action", "destructive");
    deleteBtn.setAttribute("emphasis", "minimal");
    deleteBtn.setAttribute("size", "s");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = async () => {
      deleteBtn.setAttribute("status", "loading");
      try {
        await fetch(`/api/images/${img.name}`, { method: "DELETE" });
        item.remove();
        if (galleryGrid && galleryGrid.children.length === 0) {
          galleryGrid.innerHTML = '<div class="gallery-empty">No images uploaded yet</div>';
        }
      } catch {
        deleteBtn.setAttribute("status", "error");
        setTimeout(() => deleteBtn.setAttribute("status", "none"), 2000);
      }
    };

    actions.appendChild(insertBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(thumb);
    item.appendChild(info);
    item.appendChild(actions);
    galleryGrid.appendChild(item);
  }
}

function createPanel(): HTMLElement {
  const sidePanel = document.createElement("ui-side-panel");
  sidePanel.id = "admin-gallery";
  sidePanel.setAttribute("position", "right");
  sidePanel.setAttribute("no-collapse", "");
  sidePanel.setAttribute("dismissible", "");

  const header = document.createElement("span");
  header.setAttribute("slot", "header");
  header.textContent = "Images";

  const grid = document.createElement("div");
  grid.className = "admin-gallery-grid";
  galleryGrid = grid;

  sidePanel.appendChild(header);
  sidePanel.appendChild(grid);

  return sidePanel;
}

export function openGallery(): void {
  if (!panel) {
    panel = createPanel();
    document.querySelector(".admin-main")?.appendChild(panel);
    panel.offsetHeight;
  }
  (panel as unknown as { show(): void }).show();
  renderGallery();
}

export function closeGallery(): void {
  (panel as unknown as { hide(): void })?.hide();
}

export function toggleGallery(): void {
  if (panel?.hasAttribute("open")) {
    closeGallery();
  } else {
    openGallery();
  }
}

export function initGallery(ta: HTMLTextAreaElement): void {
  textareaRef = ta;
}
