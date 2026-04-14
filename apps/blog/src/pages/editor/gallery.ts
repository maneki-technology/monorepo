/**
 * Image gallery — browse uploaded images, click to insert into editor.
 * Uses <ui-side-panel> component for the slide-in panel.
 */

import "@maneki/ui-components/components/ui-side-panel.js";
import "@maneki/ui-components/components/ui-card.js";

interface GalleryImage {
  name: string;
  url: string;
  size: number;
  uploaded: string;
  contentType: string;
}

let panel: HTMLElement | null = null;
let galleryGrid: HTMLElement | null = null;
let onSelect: ((url: string, name: string) => void) | null = null;
let defaultOnSelect: ((url: string, name: string) => void) | null = null;
let _galleryRoot: ParentNode | null = null;

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
    const card = document.createElement("ui-card");
    card.setAttribute("size", "s");
    card.setAttribute("bordered", "");
    card.style.cssText = "min-width:0;";
    card.setAttribute("bordered", "");

    const thumb = document.createElement("img");
    thumb.src = img.url;
    thumb.alt = img.name;
    thumb.loading = "lazy";
    thumb.setAttribute("slot", "image");
    thumb.style.cssText = "width:100%;height:80px;object-fit:cover;";

    const info = document.createElement("div");
    info.innerHTML = `
      <span class="gallery-item-name">${img.name}</span>
      <span class="gallery-item-size">${formatSize(img.size)}</span>
    `;

    const actions = document.createElement("div");
    actions.setAttribute("slot", "footer");
    actions.style.cssText = "display:flex;gap:4px;padding:var(--fd-space-0-75);";

    const insertBtn = document.createElement("ui-button");
    insertBtn.setAttribute("action", "primary");
    insertBtn.setAttribute("emphasis", "minimal");
    insertBtn.setAttribute("size", "s");
    insertBtn.textContent = "Select";
    insertBtn.onclick = () => {
      if (onSelect) onSelect(img.url, img.name);
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
        card.remove();
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

    card.appendChild(thumb);
    card.appendChild(info);
    card.appendChild(actions);
    galleryGrid.appendChild(card);
  }
}

function createPanel(): HTMLElement {
  const sidePanel = document.createElement("ui-side-panel");
  sidePanel.id = "admin-gallery";
  sidePanel.setAttribute("position", "right");
  sidePanel.setAttribute("no-collapse", "");
  sidePanel.setAttribute("dismissible", "");

  const header = document.createElement("div");
  header.setAttribute("slot", "header");
  header.style.cssText = "display:flex;align-items:center;justify-content:space-between;width:100%;";

  const title = document.createElement("span");
  title.textContent = "Images";

  const uploadBtn = document.createElement("ui-button");
  uploadBtn.setAttribute("action", "primary");
  uploadBtn.setAttribute("emphasis", "minimal");
  uploadBtn.setAttribute("size", "s");
  uploadBtn.setAttribute("icon", "icon-only");
  uploadBtn.setAttribute("aria-label", "Upload image");
  const uploadIcon = document.createElement("ui-icon");
  uploadIcon.setAttribute("name", "upload");
  uploadIcon.setAttribute("size", "s");
  uploadIcon.setAttribute("slot", "icon-start");
  uploadBtn.appendChild(uploadIcon);
  uploadBtn.onclick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async () => {
      if (!input.files) return;
      uploadBtn.setAttribute("status", "loading");
      try {
        for (const file of input.files) {
          const formData = new FormData();
          formData.append("file", file);
          await fetch("/api/images", { method: "POST", body: formData });
        }
        renderGallery();
      } finally {
        uploadBtn.setAttribute("status", "none");
      }
    };
    input.click();
  };

  header.appendChild(title);
  header.appendChild(uploadBtn);

  const grid = document.createElement("div");
  grid.className = "admin-gallery-grid";
  galleryGrid = grid;

  sidePanel.appendChild(header);
  sidePanel.appendChild(grid);

  return sidePanel;
}

export function openGallery(): void {
  onSelect = defaultOnSelect;
  if (!panel) {
    panel = createPanel();
    _galleryRoot?.querySelector(".admin-main")?.appendChild(panel);
    panel.offsetHeight;
  }
  (panel as unknown as { show(): void }).show();
  renderGallery();
}

export function openGalleryForPick(callback: (url: string, name: string) => void): void {
  onSelect = callback;
  if (!panel) {
    panel = createPanel();
    _galleryRoot?.querySelector(".admin-main")?.appendChild(panel);
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

export function initGallery(insertFn: (url: string, name: string) => void, root: ParentNode): void {
  defaultOnSelect = insertFn;
  onSelect = defaultOnSelect;
  _galleryRoot = root;
}
