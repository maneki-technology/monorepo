import { LitElement, html, css, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import ExifReader from "exifreader";
import { generateThumbHash, thumbHashBase64ToDataURL } from "../lib/thumbhash.js";
import "../components/theme-toggle.js";
import "../components/loading-bounce.js";
import "../components/map-picker.js";
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
import "@maneki/ui-components/components/ui-alert.js";

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
  thumbnail_url: string;
  exif_json: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
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
  location: string;
  latitude: number | null;
  longitude: number | null;
  cover_photo_id: number | null;
  sort_order: number;
  status: string;
  created_at: string;
  photo_count?: number;
}

const MAX_WIDTH = 2400;
const THUMB_WIDTH = 800;
const QUALITY = 0.92;

async function optimizeImage(file: File): Promise<File> {
  // Skip optimization for photography — preserve original quality
  // Only resize if wider than MAX_WIDTH, keep original format
  if (file.type === "image/svg+xml") return file;
  if (file.size < 100 * 1024) return file;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width <= MAX_WIDTH) {
        // No resize needed — return original file as-is
        resolve(file);
        return;
      }
      height = Math.round(height * (MAX_WIDTH / width));
      width = MAX_WIDTH;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: file.type }));
          } else {
            resolve(file);
          }
        },
        file.type,
        QUALITY,
      );
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

async function generateThumbnail(file: File): Promise<File> {
  if (file.type === "image/svg+xml") return file;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width <= THUMB_WIDTH) {
        resolve(file);
        return;
      }
      height = Math.round(height * (THUMB_WIDTH / width));
      width = THUMB_WIDTH;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" }));
          } else {
            resolve(file);
          }
        },
        "image/webp",
        0.8,
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
  @state() private _loading = false;
  @state() private _initializing = true;
  @state() private _uploading = false;
  @state() private _savingAction: "none" | "saving" | "deleting" = "none";
  @state() private _saved = false;
  @state() private _saveError = "";
  @state() private _wizardStep = 1;
  @state() private _uploadFiles: File[] = [];
  @state() private _uploadMeta: Array<{ title: string; caption: string }> = [];
  @state() private _batchAlbumId: number | null = null;
  @state() private _batchCategory = "";
  @state() private _batchStatus = "draft";
  @state() private _batchFeatured = false;
  @state() private _batchLocation = "";
  @state() private _creatingAlbum = false;
  @state() private _batchLatitude: number | null = null;
  @state() private _batchLongitude: number | null = null;
  @state() private _newAlbumTitle = "";
  @state() private _viewingAlbum: Album | null = null;
  @state() private _albumPhotos: Photo[] = [];
  @state() private _viewingPhoto: Photo | null = null;

  @state() private _tags: Array<{ id: number; name: string; slug: string }> = [];
  @state() private _batchTagIds: number[] = [];
  @state() private _editingPhotoTagIds: number[] = [];
  @state() private _creatingTag = false;
  @state() private _newTagName = "";
  @state() private _regeneratingThumbs = false;
  @state() private _reuploadingPhotoId: number | null = null;
  @state() private _reuploadedPhotoId: number | null = null;
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

    .photo-card-img {
      width: 100%;
      height: 150px;
      position: relative;
      background-size: cover;
      background-center: center;
      background-color: var(--fd-surface-secondary, #f4f4f5);
    }

    .photo-card-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .photo-card-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      align-content: center;
      justify-content: center;
      gap: 6px;
      padding: 8px;
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

    .album-card { position: relative; overflow: hidden; }

    .album-card-overlay {
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
      z-index: 1;
    }

    .album-card:hover .album-card-overlay {
      opacity: 1;
      pointer-events: auto;
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
      this._fetchAll().then(() => { this._initializing = false; });
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

      // Extract EXIF from original file (minus GPS — location is manual)
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
        if (tags.file) {
          if (tags.file["Image Width"]) width = Number(tags.file["Image Width"].value);
          if (tags.file["Image Height"]) height = Number(tags.file["Image Height"].value);
        }
      } catch { /* EXIF extraction failed */ }

      let thumbhash = "";
      try { thumbhash = await generateThumbHash(file); } catch { /* thumbhash failed */ }

      const optimized = await optimizeImage(file);

      const formData = new FormData();
      formData.append("file", optimized);
      try {
        const res = await fetch("/api/images?prefix=photos", { method: "POST", body: formData, credentials: "same-origin" });
        if (!res.ok) continue;
        const data = (await res.json()) as { url: string; name: string; r2_key?: string };

        // Generate and upload thumbnail
        let thumbnailUrl = "";
        try {
          const thumb = await generateThumbnail(file);
          const thumbForm = new FormData();
          thumbForm.append("file", thumb);
          const thumbRes = await fetch("/api/images?prefix=thumb", { method: "POST", body: thumbForm, credentials: "same-origin" });
          if (thumbRes.ok) {
            const thumbData = (await thumbRes.json()) as { url: string };
            thumbnailUrl = thumbData.url;
          }
        } catch { /* thumbnail generation failed — continue without */ }

        const meta = this._uploadMeta[i] ?? { title: file.name.replace(/\.[^.]+$/, ""), caption: "" };
        await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            r2_key: data.r2_key || data.name,
            url: data.url,
            thumbnail_url: thumbnailUrl,
            title: meta.title,
            caption: meta.caption,
            album_id: this._batchAlbumId,
            category: this._batchCategory,
            location: this._batchLocation,
            latitude: this._batchLatitude,
            longitude: this._batchLongitude,
            width,
            height,
            exif_json: JSON.stringify(exif),
            status: this._batchStatus,
            featured: this._batchFeatured,
            thumbhash,
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
    this._savingAction = "saving";
    try {
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
          location: p.location,
          latitude: p.latitude ?? null,
          longitude: p.longitude ?? null,
        }),
      });
      (this.shadowRoot!.querySelector('.photo-edit-modal') as HTMLElement & { close(): void })?.close();
      this._saved = true;
      setTimeout(() => { this._saved = false; }, 2000);
      await this._fetchPhotos();
    } finally {
      this._savingAction = "none";
    }
  }

  private async _deletePhoto(id: number) {
    this._savingAction = "deleting";
    try {
      await fetch(`/api/photos/${id}`, { method: "DELETE", credentials: "same-origin" });
      (this.shadowRoot!.querySelector('.photo-edit-modal') as HTMLElement & { close(): void })?.close();
      await this._fetchAll();
    } finally {
      this._savingAction = "none";
    }
  }

  private async _regenerateThumbnails() {
    this._regeneratingThumbs = true;
    try {
      for (const photo of this._photos) {
        try {
          const res = await fetch(photo.url);
          if (!res.ok) continue;
          const blob = await res.blob();
          const file = new File([blob], `photo-${photo.id}.jpg`, { type: blob.type });
          const thumb = await generateThumbnail(file);
          const thumbForm = new FormData();
          thumbForm.append("file", thumb);
          const uploadRes = await fetch("/api/images?prefix=thumb", { method: "POST", body: thumbForm, credentials: "same-origin" });
          if (!uploadRes.ok) continue;
          const uploadData = (await uploadRes.json()) as { url: string };
          await fetch(`/api/photos/${photo.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ thumbnail_url: uploadData.url }),
          });
        } catch { /* skip failed photo */ }
      }
      this._saved = true;
      setTimeout(() => { this._saved = false; }, 2000);
      await this._fetchPhotos();
    } finally {
      this._regeneratingThumbs = false;
    }
  }


  private async _regenerateSingleThumbnail(photo: Photo) {
    this._regeneratingThumbs = true;
    try {
      const res = await fetch(photo.url);
      if (!res.ok) return;
      const blob = await res.blob();
      const file = new File([blob], `photo-${photo.id}.jpg`, { type: blob.type });
      const thumb = await generateThumbnail(file);
      const thumbForm = new FormData();
      thumbForm.append("file", thumb);
      const uploadRes = await fetch("/api/images?prefix=thumb", { method: "POST", body: thumbForm, credentials: "same-origin" });
      if (!uploadRes.ok) return;
      const uploadData = (await uploadRes.json()) as { url: string };
      await fetch(`/api/photos/${photo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ thumbnail_url: uploadData.url }),
      });
      if (this._editingPhoto?.id === photo.id) {
        this._editingPhoto = { ...this._editingPhoto, thumbnail_url: uploadData.url };
      }
      await this._fetchPhotos();
    } finally {
      this._regeneratingThumbs = false;
    }
  }

  private async _reuploadPhoto(photo: Photo) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      this._reuploadingPhotoId = photo.id;
      try {
        const optimized = await optimizeImage(file);
        const thumb = await generateThumbnail(file);

        const dims = await new Promise<{ width: number; height: number }>((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
          img.onerror = () => resolve({ width: 0, height: 0 });
          img.src = URL.createObjectURL(optimized);
        });

        const formData = new FormData();
        formData.append("file", optimized);
        formData.append("thumbnail", thumb);
        formData.append("width", String(dims.width));
        formData.append("height", String(dims.height));

        const res = await fetch(`/api/photos/${photo.id}/reupload`, {
          method: "POST",
          body: formData,
          credentials: "same-origin",
        });
        if (res.ok) {
          const data = (await res.json()) as { url: string; thumbnail_url: string; r2_key: string };
          if (this._editingPhoto?.id === photo.id) {
            this._editingPhoto = { ...this._editingPhoto, url: data.url, thumbnail_url: data.thumbnail_url, r2_key: data.r2_key, width: dims.width, height: dims.height, thumbhash: "" };
          }
          this._reuploadedPhotoId = photo.id;
          setTimeout(() => { this._reuploadedPhotoId = null; }, 2000);
          await this._fetchPhotos();
        }
      } finally {
        this._reuploadingPhotoId = null;
      }
    };
    input.click();
  }

  // ── Album CRUD ──

  private _newAlbum() {
    this._editingAlbum = {
      id: 0,
      slug: "",
      title: "",
      description: "",
      location: "",
      latitude: null,
      longitude: null,
      cover_photo_id: null,
      sort_order: 0,
      status: "draft",
      created_at: "",
    };
  }

  private async _saveAlbum() {
    const a = this._editingAlbum;
    if (!a) return;
    this._savingAction = "saving";
    this._saveError = "";
    try {
      if (a.id === 0) {
        let slug = a.slug || slugify(a.title);
        let res = await fetch("/api/albums", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            title: a.title, slug, description: a.description, status: a.status,
            location: a.location, latitude: a.latitude ?? null, longitude: a.longitude ?? null,
          }),
        });
        // Auto-resolve slug conflict by appending suffix
        if (!res.ok && res.status === 409) {
          for (let i = 2; i <= 10; i++) {
            slug = `${slugify(a.title)}-${i}`;
            res = await fetch("/api/albums", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "same-origin",
              body: JSON.stringify({
                title: a.title, slug, description: a.description, status: a.status,
                location: a.location, latitude: a.latitude ?? null, longitude: a.longitude ?? null,
              }),
            });
            if (res.ok || res.status !== 409) break;
          }
        }
        if (!res.ok) {
          this._saveError = "Could not create album. Please try a different name.";
          return;
        }
      } else {
        const original = this._albums.find((x) => x.id === a.id);
        if (!original) return;
        const res = await fetch(`/api/albums/${original.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            title: a.title,
            slug: a.slug,
            description: a.description,
            status: a.status,
            location: a.location,
            latitude: a.latitude ?? null,
            longitude: a.longitude ?? null,
          }),
        });
        if (!res.ok) {
          this._saveError = "Could not update album. Please try again.";
          return;
        }
      }
      (this.shadowRoot!.querySelector('.album-edit-modal') as HTMLElement & { close(): void })?.close();
      this._saved = true;
      setTimeout(() => { this._saved = false; }, 2000);
      await this._fetchAlbums();
    } finally {
      this._savingAction = "none";
    }
  }

  private async _deleteAlbum(slug: string) {
    this._savingAction = "deleting";
    try {
      await fetch(`/api/albums/${slug}`, { method: "DELETE", credentials: "same-origin" });
      if (this._viewingAlbum?.slug === slug) {
        this._viewingAlbum = null;
        this._albumPhotos = [];
      }
      (this.shadowRoot!.querySelector('.album-edit-modal') as HTMLElement & { close(): void })?.close();
      await this._fetchAlbums();
    } finally {
      this._savingAction = "none";
    }
  }

  private async _setAlbumCover(photoId: number) {
    if (!this._viewingAlbum) return;
    this._loading = true;
    try {
      await fetch(`/api/albums/${this._viewingAlbum.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ cover_photo_id: photoId }),
      });
      await this._fetchAlbums();
      if (this._viewingAlbum) {
        const updated = this._albums.find((a) => a.slug === this._viewingAlbum!.slug);
        if (updated) this._viewingAlbum = updated;
      }
    } catch { /* error */ }
    this._loading = false;
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
      ${this._initializing ? html`<loading-bounce></loading-bounce>` : html`
      <ui-tab-group @tab-change=${this._onTabChange}>
        <ui-tab-item label="Photos" ?selected=${this._activeTab === "photos"} value="photos"></ui-tab-item>
        <ui-tab-item label="Albums" ?selected=${this._activeTab === "albums"} value="albums"></ui-tab-item>
      </ui-tab-group>
      ${this._renderContent()}
      `}
      ${this._renderUploadOverlay()}
      ${this._renderPhotoModal()}
      ${this._renderPhotoDetail()}
      ${this._renderAlbumModal()}
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
        ${this._saved ? html`<ui-badge size="xs" status="success">Saved</ui-badge>` : nothing}
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
        <ui-button action="secondary" emphasis="subtle" size="s" ?disabled=${this._loading || this._regeneratingThumbs} status=${this._regeneratingThumbs ? "loading" : "none"} @click=${this._regenerateThumbnails}>
          <ui-icon name="refresh" size="s" slot="icon-start"></ui-icon>
          Regenerate Thumbnails
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
    const placeholder = p.thumbhash ? thumbHashBase64ToDataURL(p.thumbhash) : "";
    return html`
      <div class="photo-card">
        <div class="photo-card-img" style=${placeholder ? `background-image:url(${placeholder})` : ""}>
          <img src=${p.url} alt=${p.title || "Photo"} loading="lazy" />
        </div>
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
          <ui-button action="contrast" emphasis="bold" size="s" @click=${(e: Event) => { e.stopPropagation(); this._deletePhoto(p.id); }}>
            <ui-icon name="delete" size="s" slot="icon-start"></ui-icon>
            Delete
          </ui-button>
          ${this._viewingAlbum ? html`
            <ui-button action="contrast" emphasis="bold" size="s" @click=${(e: Event) => { e.stopPropagation(); this._setAlbumCover(p.id); }}>
              <ui-icon name="image" size="s" slot="icon-start"></ui-icon>
              Cover
            </ui-button>
          ` : nothing}
          <ui-button action="contrast" emphasis="bold" size="s" ?disabled=${this._reuploadingPhotoId === p.id} status=${this._reuploadingPhotoId === p.id ? "loading" : this._reuploadedPhotoId === p.id ? "success" : "none"} @click=${(e: Event) => { e.stopPropagation(); this._reuploadPhoto(p); }}>
            <ui-icon name="upload" size="s" slot="icon-start"></ui-icon>
            ${this._reuploadingPhotoId === p.id ? "Uploading..." : this._reuploadedPhotoId === p.id ? "Done" : "Reupload"}
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
          ${coverPhoto ? html`<img src=${coverPhoto.url} alt=${a.title} style=${coverPhoto.thumbhash ? `background-image:url(${thumbHashBase64ToDataURL(coverPhoto.thumbhash)});background-size:cover` : ""} />` : html`<ui-icon name="photo_album" size="l"></ui-icon>`}
        </div>
        <div class="album-card-overlay">
          <ui-button action="contrast" emphasis="bold" size="s" @click=${(e: Event) => { e.stopPropagation(); this._viewAlbum(a); }}>
            <ui-icon name="visibility" size="s" slot="icon-start"></ui-icon>
            View
          </ui-button>
          <ui-button action="contrast" emphasis="bold" size="s" @click=${(e: Event) => { e.stopPropagation(); this._editingAlbum = { ...a }; }}>
            <ui-icon name="settings" size="s" slot="icon-start"></ui-icon>
            Edit
          </ui-button>
          <ui-button action="contrast" emphasis="bold" size="s" @click=${(e: Event) => { e.stopPropagation(); this._deleteAlbum(a.slug); }}>
            <ui-icon name="delete" size="s" slot="icon-start"></ui-icon>
            Delete
          </ui-button>
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
            headless
            layout="horizontal"
            current-step=${this._wizardStep}
            status=${this._uploading ? "loading" : "none"}
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
        <div slot="footer-start">
          <ui-button action="secondary" emphasis="subtle" size="s" ?disabled=${this._wizardStep <= 1} @click=${() => { if (this._wizardStep > 1) this._wizardStep--; }}>Previous</ui-button>
        </div>
        <div slot="footer-end" style="display:flex;gap:8px">
          <ui-button action="secondary" emphasis="subtle" size="s" @click=${() => { this._showUpload = false; this._resetUploadWizard(); }}>Cancel</ui-button>
          ${this._wizardStep < 4 ? html`
            <ui-button action="primary" size="s" ?disabled=${this._wizardStep === 1 && this._uploadFiles.length === 0} @click=${() => { this._wizardStep++; }}>Next</ui-button>
          ` : html`
            <ui-button action="primary" size="s" status=${this._uploading ? "loading" : "none"} @click=${() => this._executeUpload()}>Upload</ui-button>
          `}
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
          <div>
            <ui-label size="m">Location</ui-label>
            <map-picker
              .location=${this._batchLocation}
              .latitude=${this._batchLatitude}
              .longitude=${this._batchLongitude}
              @location-picked=${(e: CustomEvent) => {
                const d = e.detail as { location: string; latitude: number | null; longitude: number | null };
                this._batchLocation = d.location;
                this._batchLatitude = d.latitude;
                this._batchLongitude = d.longitude;
              }}
            ></map-picker>
          </div>
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
                emphasis=${this._batchTagIds.includes(t.id) ? "subtle" : "minimal"}
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
          <div class="summary-label">Location</div>
          <div class="summary-value">${this._batchLocation || "None"}${this._batchLatitude != null ? ` (${this._batchLatitude.toFixed(4)}, ${this._batchLongitude!.toFixed(4)})` : ""}</div>
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
          location: "",
          latitude: null,
          longitude: null,
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
    this._batchLocation = "";
    this._batchLatitude = null;
    this._batchLongitude = null;
    this._creatingTag = false;
    this._newTagName = "";
  }

  private _renderPhotoDetail() {
    if (!this._viewingPhoto) return html`<ui-modal size="l" style="--ui-modal-width: 900px" dismissible></ui-modal>`;
    const p = this._viewingPhoto;
    const albumName = this._albums.find((a) => a.id === p.album_id)?.title ?? "None";
    const tags = (p as Photo & { tags?: Array<{ id: number; name: string }> }).tags ?? [];

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
            ${p.location ? html`
              <div class="detail-section">
                <div class="detail-label">Location</div>
                <div class="detail-value">
                  <a href=${p.latitude != null
                    ? `https://www.google.com/maps?q=${p.latitude},${p.longitude}`
                    : `https://www.google.com/maps?q=${encodeURIComponent(p.location)}`}
                    target="_blank" rel="noopener" style="color:var(--fd-text-link);text-decoration:none">${p.location}</a>
                </div>
                </div>
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
            ${(() => {
              const exif = typeof p.exif_json === "string" ? JSON.parse(p.exif_json || "{}") : (p.exif_json || {});
              return Object.keys(exif).length > 0 ? html`
                <div class="detail-section">
                  <div class="detail-label">Camera Info</div>
                  <div class="detail-exif">
                    ${exif.Make ? html`<div class="exif-row"><span class="exif-key">Camera</span><span class="exif-val">${exif.Make}${exif.Model ? ` ${exif.Model}` : ""}</span></div>` : nothing}
                    ${exif.LensModel ? html`<div class="exif-row"><span class="exif-key">Lens</span><span class="exif-val">${exif.LensModel}</span></div>` : nothing}
                    ${exif.FocalLength ? html`<div class="exif-row"><span class="exif-key">Focal Length</span><span class="exif-val">${exif.FocalLength}mm</span></div>` : nothing}
                    ${exif.FNumber ? html`<div class="exif-row"><span class="exif-key">Aperture</span><span class="exif-val">ƒ/${String(exif.FNumber).replace(/^f\//, "")}</span></div>` : nothing}
                    ${exif.ExposureTime ? html`<div class="exif-row"><span class="exif-key">Shutter</span><span class="exif-val">${exif.ExposureTime}s</span></div>` : nothing}
                    ${exif.ISO ? html`<div class="exif-row"><span class="exif-key">ISO</span><span class="exif-val">${exif.ISO}</span></div>` : nothing}
                    ${exif.DateTimeOriginal ? html`<div class="exif-row"><span class="exif-key">Date Taken</span><span class="exif-val">${exif.DateTimeOriginal}</span></div>` : nothing}
                  </div>
                </div>
              ` : nothing;
            })()}
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
    if (!this._editingPhoto) return html`<ui-modal size="m" dismissible></ui-modal>`;
    const p = this._editingPhoto;
    return html`
      <ui-modal class="photo-edit-modal" size="l" open dismissible @close=${() => { this._editingPhoto = null; }}>
        <span>Edit Photo</span>
        <div slot="body" style="display:flex;gap:20px;">
          <img src=${p.url} alt=${p.title || "Photo"} style="width:240px;height:240px;object-fit:contain;border-radius:6px;background:#f0f0f0;flex-shrink:0;" />
          <div class="modal-form" style="flex:1;min-width:0;">
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
          <div>
            <ui-label size="m">Location</ui-label>
            <map-picker
              .location=${p.location || ""}
              .latitude=${p.latitude ?? null}
              .longitude=${p.longitude ?? null}
              @location-picked=${(e: CustomEvent) => {
                const d = e.detail as { location: string; latitude: number | null; longitude: number | null };
                this._editingPhoto = { ...p, location: d.location, latitude: d.latitude, longitude: d.longitude };
              }}
            ></map-picker>
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
          <div class="field-row" style="align-items:center;flex-wrap:wrap;">
            <ui-button action="secondary" emphasis="subtle" size="s" ?disabled=${this._reuploadingPhotoId === p.id} status=${this._reuploadingPhotoId === p.id ? "loading" : this._reuploadedPhotoId === p.id ? "success" : "none"} @click=${() => this._reuploadPhoto(p)}>
              <ui-icon name="upload" size="s" slot="icon-start"></ui-icon>
              ${this._reuploadingPhotoId === p.id ? "Uploading..." : this._reuploadedPhotoId === p.id ? "Done" : "Reupload"}
            </ui-button>
            <ui-button action="secondary" emphasis="subtle" size="s" ?disabled=${this._regeneratingThumbs} status=${this._regeneratingThumbs ? "loading" : "none"} @click=${() => this._regenerateSingleThumbnail(p)}>
              <ui-icon name="photo_size_select_large" size="s" slot="icon-start"></ui-icon>
              Regen Thumbnail
            </ui-button>
            ${p.thumbnail_url ? html`<span style="font-size:11px;color:var(--fd-text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px;">Thumb: ${p.thumbnail_url.split('/').pop()}</span>` : html`<span style="font-size:11px;color:var(--fd-text-tertiary);">No thumbnail</span>`}
          </div>
        <div class="tag-section">
          <ui-label size="m">Tags</ui-label>
          <div class="tag-list">
            ${this._tags.map((t) => html`
              <ui-tag
                size="s"
                emphasis=${this._editingPhotoTagIds.includes(t.id) ? "subtle" : "minimal"}
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
        <ui-button slot="footer-start" action="destructive" emphasis="minimal" size="s" status=${this._savingAction === "deleting" ? "loading" : "none"} ?disabled=${this._savingAction === "saving"} @click=${() => this._deletePhoto(p.id)}>Delete</ui-button>
        <div slot="footer-end" class="modal-actions-right">
          <ui-button action="secondary" emphasis="subtle" size="s" ?disabled=${this._savingAction !== "none"} @click=${() => { (this.shadowRoot!.querySelector('.photo-edit-modal') as HTMLElement & { close(): void })?.close(); }}>Cancel</ui-button>
          <ui-button action="primary" size="s" status=${this._savingAction === "saving" ? "loading" : "none"} ?disabled=${this._savingAction === "deleting"} @click=${this._savePhoto}>Save</ui-button>
        </div>
      </ui-modal>
    `;
  }

  private _renderAlbumModal() {
    if (!this._editingAlbum) return html`<ui-modal size="m" dismissible></ui-modal>`;
    const a = this._editingAlbum;
    const isNew = a.id === 0;
    return html`
      <ui-modal class="album-edit-modal" size="m" open dismissible @close=${() => { this._editingAlbum = null; this._saveError = ""; }}>
        <span>${isNew ? "New Album" : "Edit Album"}</span>
        <div slot="body" class="modal-form">
          ${this._saveError ? html`<ui-alert status="error" size="s" dismissible @dismiss=${() => { this._saveError = ""; }}>${this._saveError}</ui-alert>` : nothing}
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
          <div>
            <ui-label size="m">Location</ui-label>
            <map-picker
              .location=${a.location || ""}
              .latitude=${a.latitude ?? null}
              .longitude=${a.longitude ?? null}
              @location-picked=${(e: CustomEvent) => {
                const d = e.detail as { location: string; latitude: number | null; longitude: number | null };
                this._editingAlbum = { ...a, location: d.location, latitude: d.latitude, longitude: d.longitude };
              }}
            ></map-picker>
          </div>
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
        ${isNew ? html`<div slot="footer-start"></div>` : html`<ui-button slot="footer-start" action="destructive" emphasis="minimal" size="s" status=${this._savingAction === "deleting" ? "loading" : "none"} ?disabled=${this._savingAction === "saving"} @click=${() => this._deleteAlbum(a.slug)}>Delete</ui-button>`}
        <div slot="footer-end" class="modal-actions-right">
          <ui-button action="secondary" emphasis="subtle" size="s" ?disabled=${this._savingAction !== "none"} @click=${() => { (this.shadowRoot!.querySelector('.album-edit-modal') as HTMLElement & { close(): void })?.close(); }}>Cancel</ui-button>
          <ui-button action="primary" size="s" status=${this._savingAction === "saving" ? "loading" : "none"} ?disabled=${this._savingAction === "deleting"} @click=${this._saveAlbum}>${isNew ? "Create" : "Save"}</ui-button>
        </div>
      </ui-modal>
    `;
  }
}
