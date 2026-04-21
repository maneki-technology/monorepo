import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../components/map-picker.js";
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
import type { Photo, Album, Tag } from "./gallery-types.js";

@customElement("gallery-photo-modal")
export class GalleryPhotoModal extends LitElement {
  @property({ type: Object }) photo: Photo | null = null;
  @property({ type: Object }) viewPhoto: Photo | null = null;
  @property({ type: Array }) albums: Album[] = [];
  @property({ type: Array }) tags: Tag[] = [];

  @state() private _editingPhoto: Photo | null = null;
  @state() private _editingPhotoTagIds: number[] = [];
  @state() private _savingAction: "none" | "saving" | "deleting" = "none";
  @state() private _creatingTag = false;
  @state() private _newTagName = "";

  static styles = css`
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
    .modal-actions-right {
      display: flex;
      gap: 8px;
    }
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

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("photo")) {
      if (this.photo) {
        this._editingPhoto = { ...this.photo };
        this._editingPhotoTagIds = (this.photo as Photo & { tags?: Array<{ id: number }> }).tags?.map((t) => t.id) ?? [];
      } else {
        this._editingPhoto = null;
        this._editingPhotoTagIds = [];
      }
    }
  }

  render() {
    return html`
      ${this._renderPhotoModal()}
      ${this._renderPhotoDetail()}
    `;
  }

  private _renderPhotoModal() {
    if (!this._editingPhoto) return html`<ui-modal size="m" dismissible></ui-modal>`;
    const p = this._editingPhoto;
    return html`
      <ui-modal class="photo-edit-modal" size="m" open dismissible @close=${() => { this._close(); }}>
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
              ${this.albums.map((a) => html`<ui-dropdown-item value=${String(a.id)} ?selected=${p.album_id === a.id}>${a.title}</ui-dropdown-item>`)}
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
        <ui-button slot="footer-start" action="destructive" emphasis="minimal" size="s" status=${this._savingAction === "deleting" ? "loading" : "none"} ?disabled=${this._savingAction === "saving"} @click=${() => this._deletePhoto(p.id)}>Delete</ui-button>
        <div slot="footer-end" class="modal-actions-right">
          <ui-button action="secondary" emphasis="subtle" size="s" ?disabled=${this._savingAction !== "none"} @click=${() => { this._closeEditModal(); }}>Cancel</ui-button>
          <ui-button action="primary" size="s" status=${this._savingAction === "saving" ? "loading" : "none"} ?disabled=${this._savingAction === "deleting"} @click=${this._savePhoto}>Save</ui-button>
        </div>
      </ui-modal>
    `;
  }

  private _renderPhotoDetail() {
    if (!this.viewPhoto) return html`<ui-modal size="l" style="--ui-modal-width: 900px" dismissible></ui-modal>`;
    const p = this.viewPhoto;
    const albumName = this.albums.find((a) => a.id === p.album_id)?.title ?? "None";
    const tags = (p as Photo & { tags?: Array<{ id: number; name: string }> }).tags ?? [];

    return html`
      <ui-modal size="l" style="--ui-modal-width: 900px" open dismissible @close=${() => { this.dispatchEvent(new CustomEvent("close-detail", { bubbles: true, composed: true })); }}>
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
            this.dispatchEvent(new CustomEvent("edit-from-detail", {
              bubbles: true,
              composed: true,
              detail: { photo: this.viewPhoto },
            }));
          }}>Edit</ui-button>
        </div>
      </ui-modal>
    `;
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
      this._closeEditModal();
      this.dispatchEvent(new CustomEvent("photo-saved", { bubbles: true, composed: true }));
    } finally {
      this._savingAction = "none";
    }
  }

  private async _deletePhoto(id: number) {
    this._savingAction = "deleting";
    try {
      await fetch(`/api/photos/${id}`, { method: "DELETE", credentials: "same-origin" });
      this._closeEditModal();
      this.dispatchEvent(new CustomEvent("photo-deleted", { bubbles: true, composed: true }));
    } finally {
      this._savingAction = "none";
    }
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
        this.dispatchEvent(new CustomEvent("tags-changed", { bubbles: true, composed: true }));
        await new Promise((r) => setTimeout(r, 100));
        this._editingPhotoTagIds = [...this._editingPhotoTagIds, data.id];
        this._creatingTag = false;
        this._newTagName = "";
      }
    } catch { /* network error */ }
  }

  private _closeEditModal() {
    (this.shadowRoot!.querySelector('.photo-edit-modal') as HTMLElement & { close(): void })?.close();
  }

  private _close() {
    this._editingPhoto = null;
    this._editingPhotoTagIds = [];
    this._creatingTag = false;
    this._newTagName = "";
    this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }));
  }
}
