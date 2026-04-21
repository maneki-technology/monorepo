import { LitElement, html, css, nothing } from "lit";
import { customElement, state, property } from "lit/decorators.js";
import "../components/map-picker.js";
import { api } from "../lib/api.js";
import type { Photo, Album, Tag } from "./gallery-types.js";
import { optimizeImage, generateThumbnail } from "./gallery-utils.js";
import "@maneki/ui-components/components/ui-button.js";
import "@maneki/ui-components/components/ui-icon.js";
import "@maneki/ui-components/components/ui-badge.js";
import "@maneki/ui-components/components/ui-input.js";
import "@maneki/ui-components/components/ui-label.js";
import "@maneki/ui-components/components/ui-textarea.js";
import "@maneki/ui-components/components/ui-select.js";
import "@maneki/ui-components/components/ui-dropdown-item.js";
import "@maneki/ui-components/components/ui-modal.js";
import "@maneki/ui-components/components/ui-checkbox-item.js";
import "@maneki/ui-components/components/ui-tag.js";
import "@maneki/ui-components/components/ui-alert.js";
import "@maneki/ui-components/components/ui-image.js";

@customElement("gallery-photo-modal")
export class GalleryPhotoModal extends LitElement {
  @property({ type: Object }) photo: Photo | null = null;
  @property({ type: Object }) viewPhoto: Photo | null = null;
  @property({ type: Array }) albums: Album[] = [];
  @property({ type: Array }) tags: Tag[] = [];

  @state() private _editingPhoto: Photo | null = null;
  @state() private _editingPhotoTagIds: number[] = [];
  @state() private _savingAction: "none" | "saving" | "deleting" = "none";
  @state() private _saveError = "";
  @state() private _reuploadingPhotoId: number | null = null;
  @state() private _reuploadedPhotoId: number | null = null;
  @state() private _regeneratingThumbs = false;
  @state() private _creatingTag = false;
  @state() private _newTagName = "";

  static styles = css`
    .photo-detail { display: flex; gap: 24px; }
    .photo-detail-preview { flex: 1; min-width: 0; }
    .photo-detail-preview ui-image { width: 100%; border-radius: 8px; display: block; }
    .photo-detail-info { width: 280px; flex-shrink: 0; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
    .modal-form { display: flex; flex-direction: column; gap: 12px; }
    .field-row { display: flex; gap: 12px; }
    .field-row > * { flex: 1; min-width: 0; }
    .toggle-row { display: flex; align-items: center; gap: 8px; }
    .modal-actions-right { display: flex; gap: 8px; }
    .tag-section { margin-top: 12px; }
    .tag-section ui-label { display: block; margin-bottom: 6px; }
    .tag-list { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .new-tag-inline { display: inline-flex; }
    .new-tag-inline ui-input { width: 120px; }
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

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("photo") && this.photo) {
      this._editingPhoto = { ...this.photo };
      this._editingPhotoTagIds = (this.photo as Photo & { tags?: Array<{ id: number }> }).tags?.map((t) => t.id) ?? [];
      this._saveError = "";
      this._savingAction = "none";
    }
    if (changed.has("photo") && !this.photo) {
      this._editingPhoto = null;
    }
  }

  render() {
    return html`
      ${this._renderEditModal()}
      ${this._renderDetailModal()}
    `;
  }

  private _renderDetailModal() {
    if (!this.viewPhoto) return html`<ui-modal size="l" style="--ui-modal-width: 900px" dismissible></ui-modal>`;
    const p = this.viewPhoto;
    const albumName = this.albums.find((a) => a.id === p.album_id)?.title ?? "None";
    const tags = (p as Photo & { tags?: Array<{ id: number; name: string }> }).tags ?? [];

    return html`
      <ui-modal size="l" style="--ui-modal-width: 900px" open dismissible @close=${() => { this.dispatchEvent(new CustomEvent("close-detail")); }}>
        <span>${p.title || "Photo Details"}</span>
        <div slot="body" class="photo-detail">
          <div class="photo-detail-preview">
            <ui-image src=${p.url} alt=${p.title || "Photo"} style="width:100%;border-radius:8px;"></ui-image>
          </div>
          <div class="photo-detail-info">
            <div class="detail-section">
              <div class="detail-label">Title</div>
              <div class="detail-value">${p.title || "\u2014"}</div>
            </div>
            <div class="detail-section">
              <div class="detail-label">Caption</div>
              <div class="detail-value">${p.caption || "\u2014"}</div>
            </div>
            <div class="detail-row">
              <div class="detail-section">
                <div class="detail-label">Album</div>
                <div class="detail-value">${albumName}</div>
              </div>
              <div class="detail-section">
                <div class="detail-label">Category</div>
                <div class="detail-value">${p.category || "\u2014"}</div>
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
                <div class="detail-value">${p.width && p.height ? `${p.width} \u00d7 ${p.height}` : "\u2014"}</div>
              </div>
              <div class="detail-section">
                <div class="detail-label">Created</div>
                <div class="detail-value">${p.created_at ? new Date(p.created_at).toLocaleDateString() : "\u2014"}</div>
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
                    ${exif.FNumber ? html`<div class="exif-row"><span class="exif-key">Aperture</span><span class="exif-val">\u0192/${String(exif.FNumber).replace(/^f\//, "")}</span></div>` : nothing}
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
            this.dispatchEvent(new CustomEvent("edit-from-detail", { detail: { photo: this.viewPhoto } }));
          }}>Edit</ui-button>
        </div>
      </ui-modal>
    `;
  }

  private _renderEditModal() {
    const p = this._editingPhoto;
    if (!p) return html`<ui-modal size="m" dismissible></ui-modal>`;
    return html`
      <ui-modal class="photo-edit-modal" size="l" style="--ui-modal-width: 900px" open dismissible @close=${() => { this.dispatchEvent(new CustomEvent("close")); }}>
        <span>Edit Photo</span>
        <div slot="body" class="photo-detail">
          ${this._saveError ? html`<ui-alert status="error" size="s" dismissible @dismiss=${() => { this._saveError = ""; }} style="margin-bottom:12px">${this._saveError}</ui-alert>` : nothing}
          <div class="photo-detail-preview">
            <ui-image src=${p.url} alt=${p.title || "Photo"} style="width:100%;border-radius:8px;"></ui-image>
          </div>
          <div class="photo-detail-info modal-form" style="width:340px;">
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
            ${this.albums.map((a) => html`<ui-dropdown-item value=${String(a.id)} ?selected=${p.album_id === a.id}>${a.title}</ui-dropdown-item>`)}
          </ui-select>
          <ui-input
            size="m"
            .value=${p.category}
            @input=${(e: Event) => { this._editingPhoto = { ...p, category: (e.target as HTMLInputElement).value }; }}
          ><ui-label slot="label" size="m">Category</ui-label></ui-input>
          <div style="display:flex;flex-direction:column;gap:4px;">
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
          <div style="display:flex;gap:8px;align-items:center;">
            <ui-button action="secondary" emphasis="subtle" size="s" ?disabled=${this._reuploadingPhotoId === p.id} status=${this._reuploadingPhotoId === p.id ? "loading" : this._reuploadedPhotoId === p.id ? "success" : "none"} @click=${() => this._reuploadPhoto(p)}>
              <ui-icon name="upload" size="s" slot="icon-start"></ui-icon>
              ${this._reuploadingPhotoId === p.id ? "Uploading..." : this._reuploadedPhotoId === p.id ? "Done" : "Reupload"}
            </ui-button>
            <ui-button action="secondary" emphasis="minimal" size="s" ?disabled=${this._regeneratingThumbs} status=${this._regeneratingThumbs ? "loading" : "none"} @click=${() => this._regenerateSingleThumbnail(p)}>
              Regen Thumb
            </ui-button>
          </div>
          ${p.thumbnail_url ? html`<span style="font-size:11px;color:var(--fd-text-secondary);">${p.thumbnail_url.split('/').pop()}</span>` : nothing}
        <div class="tag-section">
          <ui-label size="m">Tags</ui-label>
          <div class="tag-list">
            ${this.tags.map((t) => html`
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
        </div>
        <ui-button slot="footer-start" action="destructive" emphasis="minimal" size="s" status=${this._savingAction === "deleting" ? "loading" : "none"} ?disabled=${this._savingAction === "saving"} @click=${() => this._deletePhoto(p.id)}>Delete</ui-button>
        <div slot="footer-end" class="modal-actions-right">
          <ui-button action="secondary" emphasis="subtle" size="s" ?disabled=${this._savingAction !== "none"} @click=${() => { this._closeEditModal(); }}>Cancel</ui-button>
          <ui-button action="primary" size="s" status=${this._savingAction === "saving" ? "loading" : "none"} ?disabled=${this._savingAction === "deleting"} @click=${this._savePhoto}>Save</ui-button>
        </div>
      </ui-modal>
    `;
  }

  private _closeEditModal() {
    (this.shadowRoot!.querySelector('.photo-edit-modal') as HTMLElement & { close(): void })?.close();
  }

  private async _savePhoto() {
    const p = this._editingPhoto;
    if (!p) return;
    this._savingAction = "saving";
    try {
      await api.api.photos[":id"].$put({
        param: { id: String(p.id) },
        json: {
          title: p.title,
          caption: p.caption,
          album_id: p.album_id,
          category: p.category,
          featured: !!p.featured,
          status: p.status as "draft" | "published",
          tag_ids: this._editingPhotoTagIds,
          location: p.location,
          latitude: p.latitude ?? null,
          longitude: p.longitude ?? null,
        },
      });
      this._closeEditModal();
      this.dispatchEvent(new CustomEvent("photo-saved"));
    } catch {
      this._saveError = "Failed to save photo. Please try again.";
    } finally {
      this._savingAction = "none";
    }
  }

  private async _deletePhoto(id: number) {
    this._savingAction = "deleting";
    try {
      await api.api.photos[":id"].$delete({ param: { id: String(id) } });
      this._closeEditModal();
      this.dispatchEvent(new CustomEvent("photo-deleted"));
    } catch {
      this._saveError = "Failed to delete photo.";
    } finally {
      this._savingAction = "none";
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
          this.dispatchEvent(new CustomEvent("photo-saved"));
        }
      } finally {
        this._reuploadingPhotoId = null;
      }
    };
    input.click();
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
      await api.api.photos[":id"].$put({
        param: { id: String(photo.id) },
        json: { thumbnail_url: uploadData.url },
      });
      if (this._editingPhoto?.id === photo.id) {
        this._editingPhoto = { ...this._editingPhoto, thumbnail_url: uploadData.url };
      }
      this.dispatchEvent(new CustomEvent("photo-saved"));
    } finally {
      this._regeneratingThumbs = false;
    }
  }

  private async _createQuickTag() {
    if (!this._newTagName.trim()) return;
    try {
      const res = await api.api.tags.$post({
        json: { name: this._newTagName.trim() },
      });
      if (res.ok) {
        const data = await res.json() as { ok: boolean; id: number };
        this._editingPhotoTagIds = [...this._editingPhotoTagIds, data.id];
        this._creatingTag = false;
        this._newTagName = "";
        this.dispatchEvent(new CustomEvent("tags-changed"));
      }
    } catch {
      this._saveError = "Failed to create tag";
    }
  }
}
