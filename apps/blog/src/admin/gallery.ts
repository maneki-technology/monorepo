import { LitElement, html, css, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import ExifReader from "exifreader";
import "../components/theme-toggle.js";
import "../components/loading-bounce.js";
import { loadAdminState, saveThemeToBackend, getGalleryTab, setGalleryTab } from "./theme.js";
import "@maneki/ui-components/components/ui-button.js";
import "@maneki/ui-components/components/ui-icon.js";
import "@maneki/ui-components/components/ui-badge.js";
import "@maneki/ui-components/components/ui-input.js";
import "@maneki/ui-components/components/ui-label.js";
import "@maneki/ui-components/components/ui-textarea.js";
import "@maneki/ui-components/components/ui-select.js";
import "@maneki/ui-components/components/ui-dropdown-item.js";
import "@maneki/ui-components/components/ui-modal.js";
import "@maneki/ui-components/components/ui-tab-group.js";
import "@maneki/ui-components/components/ui-tab-item.js";
import "@maneki/ui-components/components/ui-checkbox-item.js";
import "@maneki/ui-components/components/ui-dropzone.js";
import "@maneki/ui-components/components/ui-tag.js";
import "@maneki/ui-components/components/ui-wizard.js";
import "@maneki/ui-components/components/ui-step-group.js";
import "@maneki/ui-components/components/ui-step-item.js";

interface Photo {
  id: number;
  r2_key: string;
  url: string;
  title: string;
  caption: string;
  album_id: number | null;
  category: string;
  width: number;
  height: number;
  thumbhash: string;
  exif_json: string;
  sort_order: number;
  featured: number;
  status: string;
  created_at: string;
}

interface Album {
  id: number;
  slug: string;
  title: string;
  description: string;
  cover_photo_id: number | null;
  sort_order: number;
  status: string;
  created_at: string;
  photo_count?: number;
}

const MAX_WIDTH = 1200;
const QUALITY = 0.85;

async function optimizeImage(file: File): Promise<File> {
  if (file.type === "image/svg+xml") return file;
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
            resolve(file);
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

@customElement("admin-gallery")
export class AdminGallery extends LitElement {
  @state() private _activeTab: "photos" | "albums" = "photos";
  @state() private _photos: Photo[] = [];
  @state() private _albums: Album[] = [];
  @state() private _searchQuery = "";
  @state() private _showUpload = false;
  @state() private _editingPhoto: Photo | null = null;
  @state() private _editingAlbum: Album | null = null;
  @state() private _loading = true;
  @state() private _uploading = false;
  @state() private _wizardStep = 1;
  @state() private _uploadFiles: File[] = [];
  @state() private _uploadMeta: Array<{ title: string; caption: string }> = [];
  @state() private _batchAlbumId: number | null = null;
  @state() private _batchCategory = "";
  @state() private _batchStatus = "draft";
  @state() private _batchFeatured = false;
  @state() private _creatingAlbum = false;
  @state() private _newAlbumTitle = "";
  @state() private _viewingAlbum: Album | null = null;
  @state() private _albumPhotos: Photo[] = [];
  @state() private _viewingPhoto: Photo | null = null;

  @state() private _tags: Array<{ id: number; name: string; slug: string }> = [];
  @state() private _batchTagIds: number[] = [];
  @state() private _editingPhotoTagIds: number[] = [];
  @state() private _creatingTag = false;
  @state() private _newTagName = "";
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      font-family: Geist, sans-serif;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 24px;
      border-bottom: 1px solid var(--fd-border-minimal, #e4e4e7);
      flex-shrink: 0;
    }

    .header-title {
      font-size: 16px;
      font-weight: 600;
      flex: 1;
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      flex-shrink: 0;
    }

    .spacer {
      flex: 1;
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 0 24px 24px;
    }

    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
      padding-top: 4px;
    }

    .photo-card {
      position: relative;
      border: 1px solid var(--fd-border-minimal, #e4e4e7);
      border-radius: 8px;
      overflow: hidden;
      background: var(--fd-surface-primary, #fff);
      cursor: pointer;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .photo-card:hover {
      border-color: var(--fd-border-moderate, #a1a1aa);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .photo-card img {
      width: 100%;
      height: 150px;
      object-fit: cover;
      display: block;
      background: var(--fd-surface-secondary, #f4f4f5);
    }

    .photo-card-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity 0.15s ease;
      pointer-events: none;
    }

    .photo-card:hover .photo-card-overlay {
      opacity: 1;
      pointer-events: auto;
    }

    .photo-info {
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .photo-title {
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .photo-meta {
      font-size: 11px;
      color: var(--fd-text-secondary, #71717a);
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
    }

    .album-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      padding-top: 8px;
    }

    .album-card {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--fd-border-minimal, #e4e4e7);
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      background: var(--fd-surface-primary, #fff);
    }

    .album-card:hover {
      border-color: var(--fd-border-moderate, #a1a1aa);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .album-card-cover {
      width: 100%;
      aspect-ratio: 16/9;
      object-fit: cover;
      background: var(--fd-surface-secondary, #f4f4f5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--fd-text-secondary, #71717a);
    }

    .album-card-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .album-card-body {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .album-card-title {
      font-size: 14px;
      font-weight: 600;
    }

    .album-card-meta {
      font-size: 12px;
      color: var(--fd-text-secondary, #71717a);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .album-detail-title {
      font-size: 16px;
      font-weight: 600;
      margin-left: 8px;
    }


    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .field-row {
      display: flex;
      gap: 12px;
    }

    .field-row > * {
      flex: 1;
      min-width: 0;
    }

    .toggle-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .modal-actions {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      margin-top: 16px;
    }

    .modal-actions-right {
      display: flex;
      gap: 8px;
    }

    .empty {
      text-align: center;
      padding: 48px 24px;
      color: var(--fd-text-secondary, #71717a);
      font-size: 13px;
    }


    ui-tab-group {
      padding: 0 24px;
      flex-shrink: 0;
    }

    ui-tab-item {
      min-width: 120px;
    }
    .wizard-step { padding: 16px; min-height: 200px; }
    .wizard-step-scroll { max-height: 400px; overflow-y: auto; }
    .batch-fields { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
    .file-list-edit { display: flex; flex-direction: column; gap: 12px; }
    .file-edit-row { display: flex; gap: 12px; align-items: start; }
    .file-edit-row .file-thumb { width: 64px; height: 64px; object-fit: cover; border-radius: 6px; flex-shrink: 0; background: var(--fd-surface-secondary, #f4f4f5); }
    .file-edit-row .file-fields { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .summary-section { margin-bottom: 16px; }
    .summary-label { font-size: 12px; color: var(--fd-text-secondary); margin-bottom: 4px; }
    .summary-value { font-size: 14px; }
    .summary-files { display: flex; flex-direction: column; gap: 4px; }
    .summary-file { font-size: 13px; padding: 6px 8px; background: var(--fd-surface-secondary); border-radius: 4px; }
    .file-count { font-size: 13px; color: var(--fd-text-secondary); margin-top: 8px; }
    .selected-files-preview { margin-top: 12px; }
    .selected-files-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: var(--fd-text-secondary); }
    .selected-files-thumbs { display: flex; flex-wrap: wrap; gap: 8px; }
    .selected-file-chip { display: flex; align-items: center; gap: 6px; padding: 4px 8px; background: var(--fd-surface-secondary, #f4f4f5); border-radius: 6px; font-size: 12px; }
    .selected-file-img { width: 32px; height: 32px; object-fit: cover; border-radius: 4px; }
    .selected-file-name { max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .selected-file-chip ui-icon { cursor: pointer; opacity: 0.5; }
    .selected-file-chip ui-icon:hover { opacity: 1; }
    .album-grid-step { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; padding: 16px; }
    .album-grid-step .album-card { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px; border: 2px solid var(--fd-border-minimal, #e4e4e7); border-radius: 8px; cursor: pointer; text-align: center; transition: border-color 0.15s ease, background 0.15s ease; min-height: 100px; overflow: visible; box-shadow: none; }
    .album-grid-step .album-card:hover { border-color: var(--fd-border-moderate, #a1a1aa); background: var(--fd-surface-secondary, #f4f4f5); box-shadow: none; }
    .album-grid-step .album-card.selected { border-color: var(--fd-border-focus, #186ade); background: var(--fd-surface-secondary, #f4f4f5); }
    .album-grid-step .album-card-title { font-size: 14px; font-weight: 500; margin-top: 8px; }
    .album-grid-step .album-card-count { font-size: 12px; color: var(--fd-text-secondary, #71717a); }
    .album-grid-step .album-card-new { border-style: dashed; color: var(--fd-text-secondary, #71717a); }
    .album-grid-step .album-card-new:hover { color: var(--fd-text-primary, #27272a); }
    .album-grid-step .album-card-editing { cursor: default; gap: 8px; padding: 12px; }
    .album-grid-step .album-card-editing:hover { background: transparent; }
    .album-grid-step .album-card-actions { display: flex; gap: 6px; }

    .tag-section { margin-top: 12px; }
    .tag-section ui-label { display: block; margin-bottom: 6px; }
    .tag-list { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .new-tag-inline { display: inline-flex; }
    .new-tag-inline ui-input { width: 120px; }
    .photo-detail { display: flex; gap: 24px; }
    .photo-detail-preview { flex: 1; min-width: 0; }
    .photo-detail-preview img { width: 100%; border-radius: 8px; display: block; }
    .photo-detail-info { width: 280px; flex-shrink: 0; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
    .detail-label { font-size: 11px; font-weight: 500; color: var(--fd-text-secondary, #71717a); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
    .detail-value { font-size: 14px; }
    .detail-row { display: flex; gap: 16px; }
    .detail-row .detail-section { flex: 1; }
    .detail-tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .detail-exif { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
    .exif-row { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid var(--fd-border-minimal, #e4e4e7); }
    .exif-key { color: var(--fd-text-secondary, #71717a); }
    .exif-val { font-weight: 500; }
  `;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("theme-change", () => saveThemeToBackend());
    loadAdminState().then((s) => {
      this._activeTab = s.galleryTab;
      this._fetchAll();
    });
  }

  private async _fetchAll() {
    this._loading = true;
    await Promise.all([this._fetchPhotos(), this._fetchAlbums(), this._fetchTags()]);
    this._loading = false;
  }

  private async _fetchPhotos() {
    try {
      const res = await fetch("/api/photos", { credentials: "same-origin" });
      if (!res.ok) return;
      const data = (await res.json()) as { photos: Photo[] };
      this._photos = data.photos;
    } catch { /* network error */ }
  }

  private async _fetchAlbums() {
    try {
      const res = await fetch("/api/albums", { credentials: "same-origin" });
      if (!res.ok) return;
      const data = (await res.json()) as { albums: Album[] };
      this._albums = data.albums;
    } catch { /* network error */ }
  }

  private async _fetchTags() {
    try {
      const res = await fetch("/api/tags", { credentials: "same-origin" });
      if (!res.ok) return;
      const data = (await res.json()) as { tags: Array<{ id: number; name: string; slug: string }> };
      this._tags = data.tags;
    } catch { /* network error */ }
  }

  private _navigateBack() {
    window.dispatchEvent(new CustomEvent("admin-navigate", {
      detail: { path: "/admin" },
    }));
  }

  // ── Photo CRUD ──

  private async _executeUpload() {
    this._uploading = true;
    for (let i = 0; i < this._uploadFiles.length; i++) {
      const file = this._uploadFiles[i];
      if (!file.type.startsWith("image/")) continue;

      // Extract EXIF from original file before optimization strips it
      let exif: Record<string, unknown> = {};
      let width = 0;
      let height = 0;
      try {
        const buffer = await file.arrayBuffer();
        const tags = ExifReader.load(buffer, { expanded: true });
        if (tags.exif) {
          if (tags.exif.Make) exif.Make = tags.exif.Make.description;
          if (tags.exif.Model) exif.Model = tags.exif.Model.description;
          if (tags.exif.LensModel) exif.LensModel = tags.exif.LensModel.description;
          if (tags.exif.FocalLength) exif.FocalLength = tags.exif.FocalLength.description;
          if (tags.exif.FNumber) exif.FNumber = tags.exif.FNumber.description;
          if (tags.exif.ExposureTime) exif.ExposureTime = tags.exif.ExposureTime.description;
          if (tags.exif.ISOSpeedRatings) exif.ISO = tags.exif.ISOSpeedRatings.description;
          if (tags.exif.DateTimeOriginal) exif.DateTimeOriginal = tags.exif.DateTimeOriginal.description;
        }
        if (tags.gps) {
          if (tags.gps.Latitude !== undefined) exif.GPSLatitude = tags.gps.Latitude;
          if (tags.gps.Longitude !== undefined) exif.GPSLongitude = tags.gps.Longitude;
        }
        if (tags.file) {
          if (tags.file["Image Width"]) width = Number(tags.file["Image Width"].value);
          if (tags.file["Image Height"]) height = Number(tags.file["Image Height"].value);
        }
      } catch { /* EXIF extraction failed */ }

      const optimized = await optimizeImage(file);
      const formData = new FormData();
      formData.append("file", optimized);
      try {
        const res = await fetch("/api/images", { method: "POST", body: formData, credentials: "same-origin" });
        if (!res.ok) continue;
        const data = (await res.json()) as { url: string; name: string; r2_key?: string };
        const meta = this._uploadMeta[i] ?? { title: file.name.replace(/\.[^.]+$/, ""), caption: "" };
        await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            r2_key: data.r2_key || data.name,
            url: data.url,
            title: meta.title,
            caption: meta.caption,
            album_id: this._batchAlbumId,
            category: this._batchCategory,
            status: this._batchStatus,
            width,
            height,
            exif_json: JSON.stringify(exif),
            featured: this._batchFeatured,
            tag_ids: this._batchTagIds,
          }),
        });
      } catch { /* upload error */ }
    }
    this._uploading = false;
    this._showUpload = false;
    this._resetUploadWizard();
    await this._fetchAll();
  }

  private async _savePhoto() {
    const p = this._editingPhoto;
    if (!p) return;
    await fetch(`/api/photos/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        title: p.title,
        caption: p.caption,
        album_id: p.album_id,
        category: p.category,
        featured: !!p.featured,
        status: p.status,
        tag_ids: this._editingPhotoTagIds,
      }),
    });
    this._editingPhoto = null;
    await this._fetchPhotos();
  }

  private async _deletePhoto(id: number) {
    await fetch(`/api/photos/${id}`, { method: "DELETE", credentials: "same-origin" });
    this._editingPhoto = null;
    await this._fetchAll();
  }

  // ── Album CRUD ──

  private _newAlbum() {
    this._editingAlbum = {
      id: 0,
      slug: "",
      title: "",
      description: "",
      cover_photo_id: null,
      sort_order: 0,
      status: "draft",
      created_at: "",
    };
  }

  private async _saveAlbum() {
    const a = this._editingAlbum;
    if (!a) return;
    if (a.id === 0) {
      await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          title: a.title,
          slug: a.slug || slugify(a.title),
          description: a.description,
          status: a.status,
        }),
      });
    } else {
      const original = this._albums.find((x) => x.id === a.id);
      if (!original) return;
      await fetch(`/api/albums/${original.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          title: a.title,
          slug: a.slug,
          description: a.description,
          status: a.status,
        }),
      });
    }
    this._editingAlbum = null;
    await this._fetchAlbums();
  }

  private async _deleteAlbum(slug: string) {
    await fetch(`/api/albums/${slug}`, { method: "DELETE", credentials: "same-origin" });
    if (this._viewingAlbum?.slug === slug) {
      this._viewingAlbum = null;
      this._albumPhotos = [];
    }
    this._editingAlbum = null;
    await this._fetchAlbums();
  }


  // ── Filtered data ──

  private get _filteredPhotos(): Photo[] {
    if (!this._searchQuery) return this._photos;
    const q = this._searchQuery.toLowerCase();
    return this._photos.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.url.toLowerCase().includes(q),
    );
  }

  // ── Render ──

  render() {
    return html`
      ${this._renderHeader()}
      ${this._loading ? html`<loading-bounce></loading-bounce>` : html`
      <ui-tab-group @tab-change=${this._onTabChange}>
        <ui-tab-item label="Photos" ?selected=${this._activeTab === "photos"} value="photos"></ui-tab-item>
        <ui-tab-item label="Albums" ?selected=${this._activeTab === "albums"} value="albums"></ui-tab-item>
      </ui-tab-group>
      ${this._renderContent()}
      `}
      ${this._renderUploadOverlay()}
      ${this._editingPhoto ? this._renderPhotoModal() : nothing}
      ${this._renderPhotoDetail()}
      ${this._editingAlbum ? this._renderAlbumModal() : nothing}
    `;
  }

  private _onTabChange(e: Event) {
    const tab = (e as CustomEvent).detail?.value ?? (e.target as HTMLElement).querySelector("ui-tab-item[selected]")?.getAttribute("value");
    if (tab === "photos" || tab === "albums") {
      this._activeTab = tab;
      setGalleryTab(tab);
    }
  }

  private _renderHeader() {
    return html`
      <div class="header">
        <a href="/admin" style="text-decoration:none;">
          <ui-button action="secondary" emphasis="minimal" size="s">
            <ui-icon name="chevron_left" size="s" slot="icon-start"></ui-icon>
            Admin
          </ui-button>
        </a>
        <span class="header-title">Gallery</span>
        <theme-toggle></theme-toggle>
      </div>
    `;
  }

  private _renderContent() {
    return this._activeTab === "photos" ? this._renderPhotosTab() : this._renderAlbumsTab();
  }

  private _renderPhotosTab() {
    const photos = this._filteredPhotos;
    return html`
      <div class="toolbar">
        <ui-button action="primary" size="s" ?disabled=${this._loading} @click=${() => { this._showUpload = true; }}>
          <ui-icon name="upload" size="s" slot="icon-start"></ui-icon>
          Upload
        </ui-button>
        <ui-input
          placeholder="Search photos…"
          size="s"
          style="max-width:300px;flex:1;"
          .value=${this._searchQuery}
          @input=${(e: Event) => { this._searchQuery = (e.target as HTMLInputElement).value; }}
        ></ui-input>
        <span class="spacer"></span>
        <span class="photo-meta">${this._photos.length} photos</span>
      </div>
      <div class="content">
        ${photos.length === 0
          ? html`<div class="empty">No photos yet. Upload some!</div>`
          : html`
              <div class="photo-grid">
                ${photos.map((p) => this._renderPhotoCard(p))}
              </div>
            `}
      </div>
    `;
  }

  private _renderPhotoCard(p: Photo) {
    const albumName = this._albums.find((a) => a.id === p.album_id)?.title;
    return html`
      <div class="photo-card">
        <img src=${p.url} alt=${p.title || "Photo"} loading="lazy" />
        <div class="photo-card-overlay">
          <ui-button action="contrast" emphasis="bold" size="s" @click=${() => { this._viewingPhoto = { ...p }; }}>
            <ui-icon name="visibility" size="s" slot="icon-start"></ui-icon>
            Preview
          </ui-button>
          <ui-button action="contrast" emphasis="bold" size="s" @click=${() => {
            this._editingPhoto = { ...p };
            this._editingPhotoTagIds = (p as Photo & { tags?: Array<{ id: number }> }).tags?.map((t) => t.id) ?? [];
          }}>
            <ui-icon name="settings" size="s" slot="icon-start"></ui-icon>
            Edit
          </ui-button>
        </div>
        <div class="photo-info">
          <span class="photo-title">${p.title || p.r2_key}</span>
          <span class="photo-meta">
            ${albumName ? albumName : ""}
            ${p.category ? ` · ${p.category}` : ""}
            <ui-badge size="xs" status=${p.status === "published" ? "success" : "warning"}>${p.status}</ui-badge>
          </span>
        </div>
      </div>
    `;
  }

  private _renderAlbumsTab() {
    if (this._viewingAlbum) return this._renderAlbumDetail();
    return html`
      <div class="toolbar">
        <ui-button action="primary" size="s" ?disabled=${this._loading} @click=${this._newAlbum}>
          <ui-icon name="add" size="s" slot="icon-start"></ui-icon>
          New Album
        </ui-button>
        <span class="spacer"></span>
        <span class="photo-meta">${this._albums.length} albums</span>
      </div>
      <div class="content">
        ${this._albums.length === 0
          ? html`<div class="empty">No albums yet. Create one!</div>`
          : html`<div class="album-list">${this._albums.map((a) => this._renderAlbumCard(a))}</div>`}
      </div>
    `;
  }

  private _renderAlbumCard(a: Album) {
    const coverPhoto = a.cover_photo_id ? this._photos.find((p) => p.id === a.cover_photo_id) : null;
    return html`
      <div class="album-card" @click=${() => this._viewAlbum(a)}>
        <div class="album-card-cover">
          ${coverPhoto ? html`<img src=${coverPhoto.url} alt=${a.title} />` : html`<ui-icon name="photo_album" size="l"></ui-icon>`}
        </div>
        <div class="album-card-body">
          <div class="album-card-title">${a.title}</div>
          <div class="album-card-meta">
            <span>${a.photo_count ?? 0} photos</span>
            <ui-badge size="xs" status=${a.status === "published" ? "success" : "warning"}>${a.status}</ui-badge>
          </div>
        </div>
      </div>
    `;
  }

  private async _viewAlbum(a: Album) {
    this._viewingAlbum = a;
    try {
      const res = await fetch(`/api/photos?album=${a.slug}`, { credentials: "same-origin" });
      if (res.ok) {
        const data = (await res.json()) as { photos: Photo[] };
        this._albumPhotos = data.photos;
      }
    } catch { /* network error */ }
  }

  private _renderAlbumDetail() {
    const a = this._viewingAlbum!;
    return html`
      <div class="toolbar">
        <ui-button action="secondary" emphasis="subtle" size="s" @click=${() => { this._viewingAlbum = null; this._albumPhotos = []; }}>
          <ui-icon name="arrow_back_ios" size="s" slot="icon-start"></ui-icon>
          Back
        </ui-button>
        <span class="album-detail-title">${a.title}</span>
        <span class="spacer"></span>
        <ui-button action="secondary" emphasis="subtle" size="s" @click=${() => { this._editingAlbum = { ...a }; }}>Edit</ui-button>
        <ui-button action="destructive" emphasis="minimal" size="s" @click=${() => this._deleteAlbum(a.slug)}>Delete</ui-button>
      </div>
      <div class="content">
        ${this._albumPhotos.length === 0
          ? html`<div class="empty">No photos in this album yet.</div>`
          : html`
            <div class="photo-grid">
              ${this._albumPhotos.map((p) => this._renderPhotoCard(p))}
            </div>
          `}
      </div>
    `;
  }

  private _renderUploadOverlay() {
    return html`
      <ui-modal size="l" style="--ui-modal-width: 800px" ?open=${this._showUpload} dismissible @close=${() => { this._showUpload = false; this._resetUploadWizard(); }}>
        <span>Upload Photos</span>
        <div slot="body">
          <ui-wizard
            layout="horizontal"
            current-step=${this._wizardStep}
            ?loading=${this._uploading}
            @wizard-next=${(e: Event) => {
              if (this._wizardStep === 1 && this._uploadFiles.length === 0) {
                e.preventDefault();
                return;
              }
              this._wizardStep = this._wizardStep + 1;
            }}
            @wizard-previous=${() => { this._wizardStep = this._wizardStep - 1; }}
            @wizard-finish=${() => { this._executeUpload(); }}
            @wizard-step-change=${(e: CustomEvent) => { this._wizardStep = (e as CustomEvent<{ step: number }>).detail.step; }}
          >
            <ui-step-group slot="steps">
              <ui-step-item label="Select Files"></ui-step-item>
              <ui-step-item label="Choose Album"></ui-step-item>
              <ui-step-item label="Edit Details"></ui-step-item>
              <ui-step-item label="Confirm"></ui-step-item>
            </ui-step-group>
            ${this._wizardStep === 1 ? this._renderStep1() : nothing}
            ${this._wizardStep === 2 ? this._renderStep2() : nothing}
            ${this._wizardStep === 3 ? this._renderStep3() : nothing}
            ${this._wizardStep === 4 ? this._renderStep4() : nothing}
          </ui-wizard>
        </div>
      </ui-modal>
    `;
  }

  private _renderStep1() {
    return html`
      <div class="wizard-step">
        <ui-dropzone
          accept="image/*"
          multiple
          size="m"
          hint="PNG, JPG, WebP — optimized to WebP on upload"
          @change=${(e: CustomEvent) => {
            const files = (e as CustomEvent<{ files: FileList }>).detail.files;
            if (files?.length) this._onFilesSelected([...this._uploadFiles, ...Array.from(files)]);
          }}
          @drop-files=${(e: CustomEvent) => {
            const files = (e as CustomEvent<{ files: File[] }>).detail.files;
            if (files?.length) this._onFilesSelected([...this._uploadFiles, ...files]);
          }}
        >
          <ui-label slot="label" size="m">Photos</ui-label>
        </ui-dropzone>
        ${this._uploadFiles.length > 0 ? html`
          <div class="selected-files-preview">
            <div class="selected-files-header">
              <span>${this._uploadFiles.length} file(s) selected</span>
              <ui-button action="secondary" emphasis="minimal" size="s" @click=${() => { this._uploadFiles = []; this._uploadMeta = []; }}>Clear all</ui-button>
            </div>
            <div class="selected-files-thumbs">
              ${this._uploadFiles.map((f, i) => html`
                <div class="selected-file-chip">
                  <img class="selected-file-img" src=${URL.createObjectURL(f)} alt=${f.name} />
                  <span class="selected-file-name">${f.name}</span>
                  <ui-icon name="close" size="xs" @click=${() => {
                    this._uploadFiles = this._uploadFiles.filter((_, idx) => idx !== i);
                    this._uploadMeta = this._uploadMeta.filter((_, idx) => idx !== i);
                  }}></ui-icon>
                </div>
              `)}
            </div>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _renderStep2() {
    return html`
      <div class="wizard-step wizard-step-scroll">
        <div class="album-grid-step">
          ${this._albums.map((a) => html`
            <div
              class="album-card ${this._batchAlbumId === a.id ? "selected" : ""}"
              @click=${() => { this._batchAlbumId = this._batchAlbumId === a.id ? null : a.id; }}
            >
              <ui-icon name="photo_album" size="m"></ui-icon>
              <span class="album-card-title">${a.title}</span>
              <span class="album-card-count">${a.photo_count ?? 0} photos</span>
            </div>
          `)}
          ${this._creatingAlbum ? html`
            <div class="album-card album-card-new album-card-editing">
              <ui-input
                size="s"
                .value=${this._newAlbumTitle}
                placeholder="Album name"
                @input=${(e: Event) => { this._newAlbumTitle = (e.target as HTMLInputElement).value; }}
                @keydown=${(e: KeyboardEvent) => { if (e.key === "Enter") this._createQuickAlbum(); if (e.key === "Escape") { this._creatingAlbum = false; this._newAlbumTitle = ""; } }}
              ></ui-input>
              <div class="album-card-actions">
                <ui-button action="primary" size="s" @click=${this._createQuickAlbum}>Create</ui-button>
                <ui-button action="secondary" emphasis="subtle" size="s" @click=${() => { this._creatingAlbum = false; this._newAlbumTitle = ""; }}>Cancel</ui-button>
              </div>
            </div>
          ` : html`
            <div class="album-card album-card-new" @click=${() => { this._creatingAlbum = true; }}>
              <ui-icon name="add" size="m"></ui-icon>
              <span class="album-card-title">New Album</span>
            </div>
          `}
      </div>
    `;
  }

  private _renderStep3() {
    return html`
      <div class="wizard-step wizard-step-scroll">
        <div class="batch-fields">
          <ui-input
            size="m"
            .value=${this._batchCategory}
            @input=${(e: Event) => { this._batchCategory = (e.target as HTMLInputElement).value; }}
          ><ui-label slot="label" size="m">Category</ui-label></ui-input>
          <div class="field-row">
            <ui-select
              size="m"
              .value=${this._batchStatus}
              @change=${(e: Event) => { this._batchStatus = (e.target as HTMLElement & { value: string }).value; }}
            >
              <ui-label slot="label" size="m">Status</ui-label>
              <ui-dropdown-item value="draft">Draft</ui-dropdown-item>
              <ui-dropdown-item value="published">Published</ui-dropdown-item>
            </ui-select>
          </div>
          <div class="toggle-row">
            <ui-checkbox-item
              size="m"
              label-position="right"
              ?checked=${this._batchFeatured}
              @change=${(e: Event) => { this._batchFeatured = (e.target as HTMLInputElement).checked; }}
            ><ui-label slot="label" size="m">Featured</ui-label></ui-checkbox-item>
          </div>
        <div class="tag-section">
          <ui-label size="m">Tags</ui-label>
          <div class="tag-list">
            ${this._tags.map((t) => html`
              <ui-tag
                size="s"
                type="selectable"
                emphasis="subtle"
                ?selected=${this._batchTagIds.includes(t.id)}
                @click=${() => {
                  this._batchTagIds = this._batchTagIds.includes(t.id)
                    ? this._batchTagIds.filter((id) => id !== t.id)
                    : [...this._batchTagIds, t.id];
                }}
              >${t.name}</ui-tag>
            `)}
            ${this._creatingTag ? html`
              <div class="new-tag-inline">
                <ui-input
                  size="s"
                  .value=${this._newTagName}
                  placeholder="Tag name"
                  @input=${(e: Event) => { this._newTagName = (e.target as HTMLInputElement).value; }}
                  @keydown=${(e: KeyboardEvent) => {
                    if (e.key === "Enter") this._createQuickTag();
                    if (e.key === "Escape") { this._creatingTag = false; this._newTagName = ""; }
                  }}
                ></ui-input>
              </div>
            ` : html`
              <ui-tag
                size="s"
                type="basic"
                emphasis="minimal"
                @click=${() => { this._creatingTag = true; }}
              >+ New</ui-tag>
            `}
          </div>
        </div>
        </div>
        <div class="file-list-edit">
          ${this._uploadMeta.map((m, i) => html`
            <div class="file-edit-row">
              <img class="file-thumb" src=${URL.createObjectURL(this._uploadFiles[i])} alt=${m.title} />
              <div class="file-fields">
                <ui-input
                  size="s"
                  .value=${m.title}
                  @input=${(e: Event) => {
                    const updated = [...this._uploadMeta];
                    updated[i] = { ...updated[i], title: (e.target as HTMLInputElement).value };
                    this._uploadMeta = updated;
                  }}
                ><ui-label slot="label" size="s">Title</ui-label></ui-input>
                <ui-input
                  size="s"
                  .value=${m.caption}
                  @input=${(e: Event) => {
                    const updated = [...this._uploadMeta];
                    updated[i] = { ...updated[i], caption: (e.target as HTMLInputElement).value };
                    this._uploadMeta = updated;
                  }}
                ><ui-label slot="label" size="s">Caption</ui-label></ui-input>
              </div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  private _renderStep4() {
    const albumName = this._batchAlbumId ? this._albums.find((a) => a.id === this._batchAlbumId)?.title ?? "—" : "None";
    return html`
      <div class="wizard-step wizard-step-scroll">
        <div class="summary-section">
          <div class="summary-label">Files</div>
          <div class="summary-value">${this._uploadFiles.length} photo(s)</div>
        </div>
        <div class="summary-section">
          <div class="summary-label">Album</div>
          <div class="summary-value">${albumName}</div>
        </div>
        <div class="summary-section">
          <div class="summary-label">Category</div>
          <div class="summary-value">${this._batchCategory || "—"}</div>
        </div>
        <div class="summary-section">
          <div class="summary-label">Status</div>
          <div class="summary-value">${this._batchStatus}</div>
        </div>
        <div class="summary-section">
          <div class="summary-label">Featured</div>
          <div class="summary-value">${this._batchFeatured ? "Yes" : "No"}</div>
        </div>
        <div class="summary-section">
          <div class="summary-label">Tags</div>
          <div class="summary-value">${this._batchTagIds.length > 0 ? this._tags.filter((t) => this._batchTagIds.includes(t.id)).map((t) => t.name).join(", ") : "None"}</div>
        </div>
        <div class="summary-section">
          <div class="summary-label">Files</div>
          <div class="summary-files">
            ${this._uploadMeta.map((m, i) => html`
              <div class="summary-file">${m.title}${m.caption ? ` — ${m.caption}` : ""}${this._uploadFiles[i] ? ` (${(this._uploadFiles[i].size / 1024).toFixed(0)} KB)` : ""}</div>
            `)}
          </div>
        </div>
        ${this._uploading ? html`<div class="file-count">Uploading…</div>` : nothing}
      </div>
    `;
  }

  private _onFilesSelected(files: File[]) {
    this._uploadFiles = files;
    this._uploadMeta = files.map((f) => ({
      title: f.name.replace(/\.[^.]+$/, ""),
      caption: "",
    }));
  }

  private async _createQuickAlbum() {
    if (!this._newAlbumTitle.trim()) return;
    try {
      const res = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          title: this._newAlbumTitle.trim(),
          slug: slugify(this._newAlbumTitle.trim()),
          description: "",
          status: "draft",
        }),
      });
      if (res.ok) {
        await this._fetchAlbums();
        const newAlbum = this._albums.find((a) => a.slug === slugify(this._newAlbumTitle.trim()));
        if (newAlbum) this._batchAlbumId = newAlbum.id;
        this._creatingAlbum = false;
        this._newAlbumTitle = "";
      }
    } catch { /* network error */ }
  }

  private async _createQuickTag() {
    if (!this._newTagName.trim()) return;
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name: this._newTagName.trim() }),
      });
      if (res.ok) {
        const data = (await res.json()) as { ok: boolean; id: number };
        await this._fetchTags();
        this._batchTagIds = [...this._batchTagIds, data.id];
        this._creatingTag = false;
        this._newTagName = "";
      }
    } catch { /* network error */ }
  }

  private _resetUploadWizard() {
    this._wizardStep = 1;
    this._uploadFiles = [];
    this._uploadMeta = [];
    this._batchAlbumId = null;
    this._batchCategory = "";
    this._batchStatus = "draft";
    this._batchFeatured = false;
    this._creatingAlbum = false;
    this._newAlbumTitle = "";
    this._batchTagIds = [];
    this._creatingTag = false;
    this._newTagName = "";
  }

  private _renderPhotoDetail() {
    if (!this._viewingPhoto) return nothing;
    const p = this._viewingPhoto;
    const albumName = this._albums.find((a) => a.id === p.album_id)?.title ?? "None";
    const tags = (p as Photo & { tags?: Array<{ id: number; name: string }> }).tags ?? [];
    const exif = typeof p.exif_json === "string" ? JSON.parse(p.exif_json || "{}") : (p.exif_json || {});

    return html`
      <ui-modal size="l" style="--ui-modal-width: 900px" open dismissible @close=${() => { this._viewingPhoto = null; }}>
        <span>${p.title || "Photo Details"}</span>
        <div slot="body" class="photo-detail">
          <div class="photo-detail-preview">
            <img src=${p.url} alt=${p.title || "Photo"} />
          </div>
          <div class="photo-detail-info">
            <div class="detail-section">
              <div class="detail-label">Title</div>
              <div class="detail-value">${p.title || "—"}</div>
            </div>
            <div class="detail-section">
              <div class="detail-label">Caption</div>
              <div class="detail-value">${p.caption || "—"}</div>
            </div>
            <div class="detail-row">
              <div class="detail-section">
                <div class="detail-label">Album</div>
                <div class="detail-value">${albumName}</div>
              </div>
              <div class="detail-section">
                <div class="detail-label">Category</div>
                <div class="detail-value">${p.category || "—"}</div>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-section">
                <div class="detail-label">Status</div>
                <div class="detail-value"><ui-badge size="xs" status=${p.status === "published" ? "success" : "warning"}>${p.status}</ui-badge></div>
              </div>
              <div class="detail-section">
                <div class="detail-label">Featured</div>
                <div class="detail-value">${p.featured ? "Yes" : "No"}</div>
              </div>
            </div>
            ${tags.length > 0 ? html`
              <div class="detail-section">
                <div class="detail-label">Tags</div>
                <div class="detail-value detail-tags">${tags.map((t) => html`<ui-tag size="xs" emphasis="subtle">${t.name}</ui-tag>`)}</div>
              </div>
            ` : nothing}
            <div class="detail-row">
              <div class="detail-section">
                <div class="detail-label">Dimensions</div>
                <div class="detail-value">${p.width && p.height ? `${p.width} × ${p.height}` : "—"}</div>
              </div>
              <div class="detail-section">
                <div class="detail-label">Created</div>
                <div class="detail-value">${p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</div>
              </div>
            </div>
            ${Object.keys(exif).length > 0 ? html`
              <div class="detail-section">
                <div class="detail-label">EXIF / Metadata</div>
                <div class="detail-exif">
                  ${exif.Make || exif.make ? html`<div class="exif-row"><span class="exif-key">Camera</span><span class="exif-val">${exif.Make || exif.make}${exif.Model || exif.model ? ` ${exif.Model || exif.model}` : ""}</span></div>` : nothing}
                  ${exif.LensModel || exif.lensModel ? html`<div class="exif-row"><span class="exif-key">Lens</span><span class="exif-val">${exif.LensModel || exif.lensModel}</span></div>` : nothing}
                  ${exif.FocalLength || exif.focalLength ? html`<div class="exif-row"><span class="exif-key">Focal Length</span><span class="exif-val">${exif.FocalLength || exif.focalLength}mm</span></div>` : nothing}
                  ${exif.FNumber || exif.fNumber ? html`<div class="exif-row"><span class="exif-key">Aperture</span><span class="exif-val">f/${exif.FNumber || exif.fNumber}</span></div>` : nothing}
                  ${exif.ExposureTime || exif.exposureTime ? html`<div class="exif-row"><span class="exif-key">Shutter</span><span class="exif-val">${exif.ExposureTime || exif.exposureTime}s</span></div>` : nothing}
                  ${exif.ISO || exif.iso ? html`<div class="exif-row"><span class="exif-key">ISO</span><span class="exif-val">${exif.ISO || exif.iso}</span></div>` : nothing}
                  ${exif.DateTimeOriginal || exif.dateTimeOriginal ? html`<div class="exif-row"><span class="exif-key">Date Taken</span><span class="exif-val">${exif.DateTimeOriginal || exif.dateTimeOriginal}</span></div>` : nothing}
                  ${exif.GPSLatitude || exif.gpsLatitude ? html`<div class="exif-row"><span class="exif-key">GPS</span><span class="exif-val">${exif.GPSLatitude || exif.gpsLatitude}, ${exif.GPSLongitude || exif.gpsLongitude}</span></div>` : nothing}
                </div>
              </div>
            ` : nothing}
          </div>
        </div>
        <div slot="footer-end">
          <ui-button action="primary" size="s" @click=${() => {
            const p2 = this._viewingPhoto!;
            this._viewingPhoto = null;
            this._editingPhoto = { ...p2 };
            this._editingPhotoTagIds = (p2 as Photo & { tags?: Array<{ id: number }> }).tags?.map((t) => t.id) ?? [];
          }}>Edit</ui-button>
        </div>
      </ui-modal>
    `;
  }

  private _renderPhotoModal() {
    const p = this._editingPhoto!;
    return html`
      <ui-modal size="m" open dismissible @close=${() => { this._editingPhoto = null; }}>
        <span>Edit Photo</span>
        <div slot="body" class="modal-form">
          <ui-input
            size="m"
            .value=${p.title}
            @input=${(e: Event) => { this._editingPhoto = { ...p, title: (e.target as HTMLInputElement).value }; }}
          ><ui-label slot="label" size="m">Title</ui-label></ui-input>
          <ui-textarea
            size="m"
            rows="2"
            .value=${p.caption}
            @input=${(e: Event) => { this._editingPhoto = { ...p, caption: (e.target as HTMLTextAreaElement).value }; }}
          ><ui-label slot="label" size="m">Caption</ui-label></ui-textarea>
          <div class="field-row">
            <ui-select
              size="m"
              .value=${String(p.album_id ?? "")}
              @change=${(e: Event) => {
                const v = (e.target as HTMLElement & { value: string }).value;
                this._editingPhoto = { ...p, album_id: v ? Number(v) : null };
              }}
            >
              <ui-label slot="label" size="m">Album</ui-label>
              <ui-dropdown-item value="">None</ui-dropdown-item>
              ${this._albums.map((a) => html`<ui-dropdown-item value=${String(a.id)} ?selected=${p.album_id === a.id}>${a.title}</ui-dropdown-item>`)}
            </ui-select>
            <ui-input
              size="m"
              .value=${p.category}
              @input=${(e: Event) => { this._editingPhoto = { ...p, category: (e.target as HTMLInputElement).value }; }}
            ><ui-label slot="label" size="m">Category</ui-label></ui-input>
          </div>
          <div class="field-row">
            <ui-select
              size="m"
              .value=${p.status}
              @change=${(e: Event) => { this._editingPhoto = { ...p, status: (e.target as HTMLElement & { value: string }).value }; }}
            >
              <ui-label slot="label" size="m">Status</ui-label>
              <ui-dropdown-item value="draft">Draft</ui-dropdown-item>
              <ui-dropdown-item value="published">Published</ui-dropdown-item>
            </ui-select>
          </div>
          <div class="toggle-row">
            <ui-checkbox-item
              size="m"
              label-position="right"
              ?checked=${!!p.featured}
              @change=${(e: Event) => { this._editingPhoto = { ...p, featured: (e.target as HTMLInputElement).checked ? 1 : 0 }; }}
            ><ui-label slot="label" size="m">Featured</ui-label></ui-checkbox-item>
        </div>
        <div class="tag-section">
          <ui-label size="m">Tags</ui-label>
          <div class="tag-list">
            ${this._tags.map((t) => html`
              <ui-tag
                size="s"
                type="selectable"
                emphasis="subtle"
                ?selected=${this._editingPhotoTagIds.includes(t.id)}
                @click=${() => {
                  this._editingPhotoTagIds = this._editingPhotoTagIds.includes(t.id)
                    ? this._editingPhotoTagIds.filter((id) => id !== t.id)
                    : [...this._editingPhotoTagIds, t.id];
                }}
              >${t.name}</ui-tag>
            `)}
            ${this._creatingTag ? html`
              <div class="new-tag-inline">
                <ui-input
                  size="s"
                  .value=${this._newTagName}
                  placeholder="Tag name"
                  @input=${(e: Event) => { this._newTagName = (e.target as HTMLInputElement).value; }}
                  @keydown=${(e: KeyboardEvent) => {
                    if (e.key === "Enter") this._createQuickTag();
                    if (e.key === "Escape") { this._creatingTag = false; this._newTagName = ""; }
                  }}
                ></ui-input>
              </div>
            ` : html`
              <ui-tag
                size="s"
                type="basic"
                emphasis="minimal"
                @click=${() => { this._creatingTag = true; }}
              >+ New</ui-tag>
            `}
          </div>
        </div>
        </div>
        <ui-button slot="footer-start" action="destructive" emphasis="minimal" size="s" @click=${() => this._deletePhoto(p.id)}>Delete</ui-button>
        <div slot="footer-end" class="modal-actions-right">
          <ui-button action="secondary" emphasis="subtle" size="s" @click=${() => { this._editingPhoto = null; }}>Cancel</ui-button>
          <ui-button action="primary" size="s" @click=${this._savePhoto}>Save</ui-button>
        </div>
      </ui-modal>
    `;
  }

  private _renderAlbumModal() {
    const a = this._editingAlbum!;
    const isNew = a.id === 0;
    return html`
      <ui-modal size="m" open dismissible @close=${() => { this._editingAlbum = null; }}>
        <span>${isNew ? "New Album" : "Edit Album"}</span>
        <div slot="body" class="modal-form">
          <ui-input
            size="m"
            .value=${a.title}
            @input=${(e: Event) => {
              const title = (e.target as HTMLInputElement).value;
              const updates: Partial<Album> = { title };
              if (isNew) updates.slug = slugify(title);
              this._editingAlbum = { ...a, ...updates };
            }}
          ><ui-label slot="label" size="m">Title</ui-label></ui-input>
          <ui-input
            size="m"
            .value=${a.slug}
            @input=${(e: Event) => { this._editingAlbum = { ...a, slug: (e.target as HTMLInputElement).value }; }}
          ><ui-label slot="label" size="m">Slug</ui-label></ui-input>
          <ui-textarea
            size="m"
            rows="2"
            .value=${a.description}
            @input=${(e: Event) => { this._editingAlbum = { ...a, description: (e.target as HTMLTextAreaElement).value }; }}
          ><ui-label slot="label" size="m">Description</ui-label></ui-textarea>
          <ui-select
            size="m"
            .value=${a.status}
            @change=${(e: Event) => { this._editingAlbum = { ...a, status: (e.target as HTMLElement & { value: string }).value }; }}
          >
            <ui-label slot="label" size="m">Status</ui-label>
            <ui-dropdown-item value="draft">Draft</ui-dropdown-item>
            <ui-dropdown-item value="published">Published</ui-dropdown-item>
          </ui-select>
        </div>
        ${isNew ? html`<div slot="footer-start"></div>` : html`<ui-button slot="footer-start" action="destructive" emphasis="minimal" size="s" @click=${() => this._deleteAlbum(a.slug)}>Delete</ui-button>`}
        <div slot="footer-end" class="modal-actions-right">
          <ui-button action="secondary" emphasis="subtle" size="s" @click=${() => { this._editingAlbum = null; }}>Cancel</ui-button>
          <ui-button action="primary" size="s" @click=${this._saveAlbum}>${isNew ? "Create" : "Save"}</ui-button>
        </div>
      </ui-modal>
    `;
  }
}
