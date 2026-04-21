import { LitElement, html, css, nothing } from "lit";
import { customElement, state, property } from "lit/decorators.js";
import ExifReader from "exifreader";
import { generateThumbHash } from "../lib/thumbhash.js";
import "../components/map-picker.js";
import { api } from "../lib/api.js";
import type { Photo, Album, Tag } from "./gallery-types.js";
import { optimizeImage, generateThumbnail, slugify } from "./gallery-utils.js";
import "@maneki/ui-components/components/ui-button.js";
import "@maneki/ui-components/components/ui-icon.js";
import "@maneki/ui-components/components/ui-input.js";
import "@maneki/ui-components/components/ui-label.js";
import "@maneki/ui-components/components/ui-select.js";
import "@maneki/ui-components/components/ui-dropdown-item.js";
import "@maneki/ui-components/components/ui-modal.js";
import "@maneki/ui-components/components/ui-checkbox-item.js";
import "@maneki/ui-components/components/ui-dropzone.js";
import "@maneki/ui-components/components/ui-tag.js";
import "@maneki/ui-components/components/ui-wizard.js";
import "@maneki/ui-components/components/ui-step-group.js";
import "@maneki/ui-components/components/ui-step-item.js";
import "@maneki/ui-components/components/ui-alert.js";

@customElement("gallery-upload-wizard")
export class GalleryUploadWizard extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: Array }) albums: Album[] = [];
  @property({ type: Array }) tags: Tag[] = [];

  @state() private _uploading = false;
  @state() private _wizardStep = 1;
  @state() private _wizardError = "";
  @state() private _uploadFiles: File[] = [];
  @state() private _uploadMeta: Array<{ title: string; caption: string }> = [];
  @state() private _batchAlbumId: number | null = null;
  @state() private _batchCategory = "";
  @state() private _batchStatus = "draft";
  @state() private _batchFeatured = false;
  @state() private _batchLocation = "";
  @state() private _batchLatitude: number | null = null;
  @state() private _batchLongitude: number | null = null;
  @state() private _creatingAlbum = false;
  @state() private _newAlbumTitle = "";
  @state() private _batchTagIds: number[] = [];
  @state() private _creatingTag = false;
  @state() private _newTagName = "";
  private _blobUrlCache = new Map<File, string>();

  static styles = css`
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
    .field-row { display: flex; gap: 12px; }
    .field-row > * { flex: 1; min-width: 0; }
    .toggle-row { display: flex; align-items: center; gap: 8px; }
    .tag-section { margin-top: 12px; }
    .tag-section ui-label { display: block; margin-bottom: 6px; }
    .tag-list { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .new-tag-inline { display: inline-flex; }
    .new-tag-inline ui-input { width: 120px; }
  `;

  disconnectedCallback() {
    super.disconnectedCallback();
    this._revokeBlobUrls();
  }

  render() {
    return html`
      <ui-modal size="l" style="--ui-modal-width: 800px" ?open=${this.open} dismissible @close=${this._onClose}>
        <span>Upload Photos</span>
        <div slot="body">
          ${this._wizardError ? html`<ui-alert status="error" size="s" dismissible @dismiss=${() => { this._wizardError = ""; }} style="margin-bottom:12px">${this._wizardError}</ui-alert>` : nothing}
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
          <ui-button action="secondary" emphasis="subtle" size="s" @click=${this._onClose}>Cancel</ui-button>
          ${this._wizardStep < 4 ? html`
            <ui-button action="primary" size="s" ?disabled=${this._wizardStep === 1 && this._uploadFiles.length === 0} @click=${() => { this._wizardStep++; }}>Next</ui-button>
          ` : html`
            <ui-button action="primary" size="s" status=${this._uploading ? "loading" : "none"} @click=${() => this._executeUpload()}>Upload</ui-button>
          `}
        </div>
      </ui-modal>
    `;
  }

  private _onClose() {
    this._resetUploadWizard();
    this.dispatchEvent(new CustomEvent("close"));
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
              <ui-button action="secondary" emphasis="minimal" size="s" @click=${() => { this._revokeBlobUrls(); this._uploadFiles = []; this._uploadMeta = []; }}>Clear all</ui-button>
            </div>
            <div class="selected-files-thumbs">
              ${this._uploadFiles.map((f, i) => html`
                <div class="selected-file-chip">
                  <img class="selected-file-img" src=${this._getBlobUrl(f)} alt=${f.name} />
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
          ${this.albums.map((a) => html`
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
            ${this.tags.map((t) => html`
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
              <img class="file-thumb" src=${this._getBlobUrl(this._uploadFiles[i])} alt=${m.title} />
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
    const albumName = this._batchAlbumId ? this.albums.find((a) => a.id === this._batchAlbumId)?.title ?? "—" : "None";
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
          <div class="summary-value">${this._batchTagIds.length > 0 ? this.tags.filter((t) => this._batchTagIds.includes(t.id)).map((t) => t.name).join(", ") : "None"}</div>
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
      const res = await api.api.albums.$post({
        json: {
          title: this._newAlbumTitle.trim(),
          slug: slugify(this._newAlbumTitle.trim()),
          description: "",
          status: "draft",
          location: "",
          latitude: null,
          longitude: null,
        },
      });
      if (res.ok) {
        await this._refetchAlbums();
        const newAlbum = this.albums.find((a) => a.slug === slugify(this._newAlbumTitle.trim()));
        if (newAlbum) this._batchAlbumId = newAlbum.id;
        this._creatingAlbum = false;
        this._newAlbumTitle = "";
      }
    } catch { this._wizardError = "Failed to create album"; }
  }

  private async _refetchAlbums() {
    try {
      const res = await api.api.albums.$get();
      if (!res.ok) return;
      const data = await res.json();
      this.albums = data.albums as unknown as Album[];
    } catch { this._dispatchWarning("Failed to refresh albums"); }
  }

  private async _createQuickTag() {
    if (!this._newTagName.trim()) return;
    try {
      const res = await api.api.tags.$post({
        json: { name: this._newTagName.trim() },
      });
      if (res.ok) {
        const data = await res.json() as { ok: boolean; id: number };
        this._batchTagIds = [...this._batchTagIds, data.id];
        this._creatingTag = false;
        this._newTagName = "";
        this.dispatchEvent(new CustomEvent("tags-changed"));
      }
    } catch { this._wizardError = "Failed to create tag"; }
  }

  private async _executeUpload() {
    this._uploading = true;
    for (let i = 0; i < this._uploadFiles.length; i++) {
      const file = this._uploadFiles[i];
      if (!file.type.startsWith("image/")) continue;

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
      } catch { this._dispatchWarning("Could not read EXIF data — metadata will be missing"); }

      let thumbhash = "";
      try { thumbhash = await generateThumbHash(file); } catch { this._dispatchWarning("Thumbhash generation failed — no blur placeholder"); }

      const optimized = await optimizeImage(file);

      const formData = new FormData();
      formData.append("file", optimized);
      try {
        const res = await fetch("/api/images?prefix=photos", { method: "POST", body: formData, credentials: "same-origin" });
        if (!res.ok) continue;
        const data = (await res.json()) as { url: string; name: string; r2_key?: string };

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
        } catch { this._dispatchWarning("Thumbnail generation failed — uploading without thumbnail"); }

        const meta = this._uploadMeta[i] ?? { title: file.name.replace(/\.[^.]+$/, ""), caption: "" };
        await api.api.photos.$post({
          json: {
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
            status: this._batchStatus as "draft" | "published",
            featured: this._batchFeatured,
            thumbhash,
            tag_ids: this._batchTagIds,
          },
        });
      } catch { this._wizardError = `Failed to upload ${file.name}`; }
    }
    this._uploading = false;
    this._resetUploadWizard();
    this.dispatchEvent(new CustomEvent("upload-complete"));
  }

  private _dispatchWarning(message: string) {
    this.dispatchEvent(new CustomEvent("show-warning", { bubbles: true, composed: true, detail: { message } }));
  }
  private _resetUploadWizard() {
    this._wizardError = "";
    this._wizardStep = 1;
    this._revokeBlobUrls();
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

  private _getBlobUrl(file: File): string {
    let url = this._blobUrlCache.get(file);
    if (!url) {
      url = URL.createObjectURL(file);
      this._blobUrlCache.set(file, url);
    }
    return url;
  }

  private _revokeBlobUrls() {
    for (const url of this._blobUrlCache.values()) {
      URL.revokeObjectURL(url);
    }
    this._blobUrlCache.clear();
  }
}
