import { LitElement, html, css, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { thumbHashBase64ToDataURL } from "../lib/thumbhash.js";
import "../components/theme-toggle.js";
import "../components/loading-bounce.js";
import "../components/map-picker.js";
import { loadAdminState, saveThemeToBackend, getGalleryTab, setGalleryTab } from "./theme.js";
import "@maneki/ui-components/components/ui-button.js";
import "@maneki/ui-components/components/ui-icon.js";
import "@maneki/ui-components/components/ui-badge.js";
import "@maneki/ui-components/components/ui-input.js";
import "@maneki/ui-components/components/ui-tab-group.js";
import "@maneki/ui-components/components/ui-tab-item.js";
import "./gallery-upload-wizard.js";
import "./gallery-photo-modal.js";
import "./gallery-album-modal.js";
import type { Photo, Album, Tag } from "./gallery-types.js";

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
      const data = (await res.json()) as { tags: Tag[] };
      this._tags = data.tags;
    } catch { /* network error */ }
  }

  private _navigateBack() {
    window.dispatchEvent(new CustomEvent("admin-navigate", {
      detail: { path: "/admin" },
    }));
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
        @upload-complete=${() => { this._showUpload = false; this._fetchAll(); }}
        @albums-changed=${() => this._fetchAlbums()}
        @tags-changed=${() => this._fetchTags()}
        @close=${() => { this._showUpload = false; }}
      ></gallery-upload-wizard>
      <gallery-photo-modal
        .photo=${this._editingPhoto}
        .viewPhoto=${this._viewingPhoto}
        .albums=${this._albums}
        .tags=${this._tags}
        @photo-saved=${() => { this._editingPhoto = null; this._showSaved(); this._fetchPhotos(); }}
        @photo-deleted=${() => { this._editingPhoto = null; this._fetchAll(); }}
        @close=${() => { this._editingPhoto = null; }}
        @close-detail=${() => { this._viewingPhoto = null; }}
        @edit-from-detail=${(e: CustomEvent) => {
          const p = e.detail.photo as Photo;
          this._viewingPhoto = null;
          this._editingPhoto = { ...p };
        }}
        @tags-changed=${() => this._fetchTags()}
      ></gallery-photo-modal>
      <gallery-album-modal
        .album=${this._editingAlbum}
        .albums=${this._albums}
        @album-saved=${() => { this._editingAlbum = null; this._showSaved(); this._fetchAlbums(); }}
        @album-deleted=${(e: CustomEvent) => {
          const slug = e.detail?.slug;
          if (this._viewingAlbum?.slug === slug) {
            this._viewingAlbum = null;
            this._albumPhotos = [];
          }
          this._editingAlbum = null;
          this._fetchAlbums();
        }}
        @close=${() => { this._editingAlbum = null; }}
      ></gallery-album-modal>
    `;
  }

  private _showSaved() {
    this._saved = true;
    setTimeout(() => { this._saved = false; }, 2000);
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
          }}>
            <ui-icon name="settings" size="s" slot="icon-start"></ui-icon>
            Edit
          </ui-button>
          <ui-button action="contrast" emphasis="bold" size="s" @click=${(e: Event) => { e.stopPropagation(); this._deletePhotoInline(p.id); }}>
            <ui-icon name="delete" size="s" slot="icon-start"></ui-icon>
            Delete
          </ui-button>
          ${this._viewingAlbum ? html`
            <ui-button action="contrast" emphasis="bold" size="s" @click=${(e: Event) => { e.stopPropagation(); this._setAlbumCover(p.id); }}>
              <ui-icon name="image" size="s" slot="icon-start"></ui-icon>
              Cover
            </ui-button>
          ` : nothing}
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

  private async _deletePhotoInline(id: number) {
    try {
      await fetch(`/api/photos/${id}`, { method: "DELETE", credentials: "same-origin" });
      await this._fetchAll();
    } catch { /* network error */ }
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
          <ui-button action="contrast" emphasis="bold" size="s" @click=${(e: Event) => { e.stopPropagation(); this._deleteAlbumInline(a.slug); }}>
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

  private async _deleteAlbumInline(slug: string) {
    try {
      await fetch(`/api/albums/${slug}`, { method: "DELETE", credentials: "same-origin" });
      if (this._viewingAlbum?.slug === slug) {
        this._viewingAlbum = null;
        this._albumPhotos = [];
      }
      await this._fetchAlbums();
    } catch { /* network error */ }
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
        <ui-button action="destructive" emphasis="minimal" size="s" @click=${() => this._deleteAlbumInline(a.slug)}>Delete</ui-button>
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
}
