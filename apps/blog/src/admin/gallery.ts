import { LitElement, html, css, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { thumbHashBase64ToDataURL } from "../lib/thumbhash.js";
import "../components/theme-toggle.js";
import "../components/loading-bounce.js";
import { loadAdminState, saveThemeToBackend, setGalleryTab } from "./theme.js";
import { api } from "../lib/api.js";
import type { Photo, Album, Tag } from "./gallery-types.js";
import { generateThumbnail } from "./gallery-utils.js";
import "./gallery-upload-wizard.js";
import "./gallery-photo-modal.js";
import "./gallery-album-modal.js";
import "@maneki/ui-components/components/ui-button.js";
import "@maneki/ui-components/components/ui-icon.js";
import "@maneki/ui-components/components/ui-badge.js";
import "@maneki/ui-components/components/ui-input.js";
import "@maneki/ui-components/components/ui-modal.js";
import "@maneki/ui-components/components/ui-tab-group.js";
import "@maneki/ui-components/components/ui-tab-item.js";
import "@maneki/ui-components/components/ui-alert.js";
import "@maneki/ui-components/components/ui-image.js";
import "@maneki/ui-components/components/ui-card.js";

@customElement("admin-gallery")
export class AdminGallery extends LitElement {
  @state() private _activeTab: "photos" | "albums" = "photos";
  @state() private _photos: Photo[] = [];
  @state() private _albums: Album[] = [];
  @state() private _tags: Tag[] = [];
  @state() private _searchQuery = "";
  @state() private _showUpload = false;
  @state() private _editingPhoto: Photo | null = null;
  @state() private _viewingPhoto: Photo | null = null;
  @state() private _editingAlbum: Album | null = null;
  @state() private _loading = false;
  @state() private _initializing = true;
  @state() private _saved = false;
  @state() private _viewingAlbum: Album | null = null;
  @state() private _albumPhotos: Photo[] = [];
  @state() private _regeneratingThumbs = false;
  @state() private _reuploadingPhotoId: number | null = null;
  @state() private _reuploadedPhotoId: number | null = null;
  @state() private _toastMessage = "";
  @state() private _toastStatus: "error" | "warning" | "success" = "error";

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

    .photo-card-img {
      width: 100%;
      height: 150px;
      position: relative;
      background-color: var(--fd-surface-secondary, #f4f4f5);
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

    .photo-card-img:hover .photo-card-overlay {
      opacity: 1;
      pointer-events: auto;
    }

    .photo-info {
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
      position: relative;
    }

    .album-card:hover {
      border-color: var(--fd-border-moderate, #a1a1aa);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

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

    .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 9999; transition: opacity 0.3s ease; }
  `;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("theme-change", () => saveThemeToBackend());
    loadAdminState().then((s) => {
      this._activeTab = s.galleryTab;
      this._fetchAll().then(() => { this._initializing = false; });
    });
  }

  private _showToast(message: string, status: "error" | "warning" | "success" = "error") {
    this._toastMessage = message;
    this._toastStatus = status;
    setTimeout(() => { this._toastMessage = ""; }, 5000);
  }

  private async _fetchAll() {
    this._loading = true;
    await Promise.all([this._fetchPhotos(), this._fetchAlbums(), this._fetchTags()]);
    this._loading = false;
  }

  private async _fetchPhotos() {
    try {
      const res = await api.api.photos.$get();
      if (!res.ok) return;
      const data = await res.json();
      this._photos = data.photos as unknown as Photo[];
    } catch { this._showToast("Failed to load photos"); }
  }

  private async _fetchAlbums() {
    try {
      const res = await api.api.albums.$get();
      if (!res.ok) return;
      const data = await res.json();
      this._albums = data.albums as unknown as Album[];
    } catch { this._showToast("Failed to load albums"); }
  }

  private async _fetchTags() {
    try {
      const res = await api.api.tags.$get();
      if (!res.ok) return;
      const data = await res.json();
      this._tags = data.tags as unknown as Tag[];
    } catch { this._showToast("Failed to load tags"); }
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
        } catch { this._showToast(`Failed to regenerate thumbnail for photo #${photo.id}`, "warning"); }
      }
      this._saved = true;
      setTimeout(() => { this._saved = false; }, 2000);
      await this._fetchPhotos();
    } finally {
      this._regeneratingThumbs = false;
    }
  }

  private async _deletePhoto(id: number) {
    try {
      await api.api.photos[":id"].$delete({ param: { id: String(id) } });
      await this._fetchAll();
    } catch {
      this._showToast("Failed to delete photo.");
    }
  }

  private async _setAlbumCover(photoId: number) {
    if (!this._viewingAlbum) return;
    this._loading = true;
    try {
      await api.api.albums[":slug"].$put({
        param: { slug: this._viewingAlbum.slug },
        json: { cover_photo_id: photoId },
      });
      await this._fetchAlbums();
      if (this._viewingAlbum) {
        const updated = this._albums.find((a) => a.slug === this._viewingAlbum!.slug);
        if (updated) this._viewingAlbum = updated;
      }
    } catch { this._showToast("Failed to set album cover"); }
    this._loading = false;
  }

  private async _viewAlbum(a: Album) {
    this._viewingAlbum = a;
    try {
      const res = await api.api.photos.$get({ query: { album: a.slug } });
      if (res.ok) {
        const data = await res.json();
        this._albumPhotos = data.photos as unknown as Photo[];
      }
    } catch { this._showToast("Failed to load album photos"); }
  }

  private async _deleteAlbum(slug: string) {
    try {
      await api.api.albums[":slug"].$delete({ param: { slug } });
      if (this._viewingAlbum?.slug === slug) {
        this._viewingAlbum = null;
        this._albumPhotos = [];
      }
      await this._fetchAlbums();
    } catch { this._showToast("Failed to delete album"); }
  }

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
      <gallery-upload-wizard
        ?open=${this._showUpload}
        .albums=${this._albums}
        .tags=${this._tags}
        @close=${() => { this._showUpload = false; }}
        @upload-complete=${() => { this._showUpload = false; this._fetchAll(); }}
        @tags-changed=${() => this._fetchTags()}
        @show-warning=${(e: CustomEvent) => { this._showToast(e.detail.message, "warning"); }}
      ></gallery-upload-wizard>
      <gallery-photo-modal
        .photo=${this._editingPhoto}
        .viewPhoto=${this._viewingPhoto}
        .albums=${this._albums}
        .tags=${this._tags}
        @close=${() => { this._editingPhoto = null; }}
        @close-detail=${() => { this._viewingPhoto = null; }}
        @edit-from-detail=${(e: CustomEvent) => {
          const p = (e.detail as { photo: Photo }).photo;
          this._viewingPhoto = null;
          this._editingPhoto = { ...p };
        }}
        @photo-saved=${() => { this._saved = true; setTimeout(() => { this._saved = false; }, 2000); this._fetchPhotos(); }}
        @photo-deleted=${() => { this._fetchAll(); }}
        @tags-changed=${() => this._fetchTags()}
      ></gallery-photo-modal>
      <gallery-album-modal
        .album=${this._editingAlbum}
        .albums=${this._albums}
        @close=${() => { this._editingAlbum = null; }}
        @album-saved=${() => { this._editingAlbum = null; this._saved = true; setTimeout(() => { this._saved = false; }, 2000); this._fetchAlbums(); }}
        @album-deleted=${(e: CustomEvent) => {
          const slug = (e.detail as { slug: string }).slug;
          this._editingAlbum = null;
          if (this._viewingAlbum?.slug === slug) {
            this._viewingAlbum = null;
            this._albumPhotos = [];
          }
          this._fetchAlbums();
        }}
      ></gallery-album-modal>
      ${this._toastMessage ? html`<ui-alert class="toast" status=${this._toastStatus} size="s" emphasis="bold" dismissible @dismiss=${() => { this._toastMessage = ""; }}>${this._toastMessage}</ui-alert>` : nothing}
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
      <ui-card size="s" elevation="00" bordered style="cursor:pointer;--ui-card-radius:8px;">
        <div slot="image" class="photo-card-img">
          <ui-image src=${p.thumbnail_url || p.url} alt=${p.title || "Photo"} ${placeholder ? `placeholder="${placeholder}"` : ""} loading="lazy" style="width:100%;--ui-image-height:150px;--ui-image-fit:cover;"></ui-image>
          <div class="photo-card-overlay">
            <ui-button action="contrast" emphasis="bold" size="s" @click=${() => { this._viewingPhoto = { ...p }; }}>
              <ui-icon name="visibility" size="s" slot="icon-start"></ui-icon>
              Preview
            </ui-button>
            <ui-button action="contrast" emphasis="bold" size="s" @click=${() => {
              this._editingPhoto = { ...p };
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
        </div>
        <div class="photo-info">
          <span class="photo-title">${p.title || p.r2_key}</span>
          <span class="photo-meta">
            ${albumName ? albumName : ""}
            ${p.category ? ` · ${p.category}` : ""}
            <ui-badge size="xs" status=${p.status === "published" ? "success" : "warning"}>${p.status}</ui-badge>
          </span>
        </div>
      </ui-card>
      </div>
    `;
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
        const { optimizeImage, generateThumbnail: genThumb } = await import("./gallery-utils.js");
        const optimized = await optimizeImage(file);
        const thumb = await genThumb(file);
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
          ${coverPhoto ? html`<ui-image src=${coverPhoto.thumbnail_url || coverPhoto.url} alt=${a.title} ${coverPhoto.thumbhash ? `placeholder="${thumbHashBase64ToDataURL(coverPhoto.thumbhash)}"` : ""} style="width:100%;height:100%;--ui-image-fit:cover;"></ui-image>` : html`<ui-icon name="photo_album" size="l"></ui-icon>`}
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
}
