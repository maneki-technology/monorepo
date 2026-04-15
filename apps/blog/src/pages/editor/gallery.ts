/**
 * Image gallery — browse uploaded images, click to insert into editor.
 * Uses <ui-side-panel> component for the slide-in panel.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, state as litState, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import "@maneki/ui-components/components/ui-side-panel.js";
import "@maneki/ui-components/components/ui-card.js";
import "@maneki/ui-components/components/ui-button.js";
import "@maneki/ui-components/components/ui-icon.js";

interface GalleryImage {
  name: string;
  url: string;
  size: number;
  uploaded: string;
  contentType: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

@customElement("editor-gallery")
export class EditorGallery extends LitElement {
  @property({ attribute: false }) declare onSelect: ((url: string, name: string) => void) | null;

  @litState() private _images: GalleryImage[] = [];
  @litState() private _loading = false;
  @litState() private _uploading = false;

  private _defaultOnSelect: ((url: string, name: string) => void) | null = null;

  static styles = css`
    :host { display: contents; }
    #admin-gallery { position: absolute; top: 0; right: 0; height: 100%; z-index: 10; --ui-sp-width: 320px; --ui-sp-bg: var(--fd-surface-primary); }
    .admin-gallery-grid { flex: 1; overflow-y: auto; padding: var(--fd-space-1); display: grid; grid-template-columns: 1fr 1fr; gap: var(--fd-space-1); align-content: start; }
    .gallery-item-name { font-family: var(--fd-type-body-03-font-family); font-size: var(--fd-type-body-03-font-size); color: var(--fd-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .gallery-item-size { font-family: var(--fd-type-body-03-font-family); font-size: 10px; color: var(--fd-text-secondary); }
    .gallery-loading, .gallery-empty { grid-column: 1 / -1; text-align: center; padding: var(--fd-space-3); font-family: var(--fd-type-body-02-font-family); font-size: var(--fd-type-body-02-font-size); color: var(--fd-text-secondary); }
  `;

  protected firstUpdated(): void {
    this._defaultOnSelect = this.onSelect;
  }

  show(callback?: (url: string, name: string) => void): void {
    if (callback) this.onSelect = callback;
    const panel = this.renderRoot.querySelector("ui-side-panel") as (HTMLElement & { show(): void }) | null;
    panel?.show();
    this._fetchImages();
  }

  hide(): void {
    const panel = this.renderRoot.querySelector("ui-side-panel") as (HTMLElement & { hide(): void }) | null;
    panel?.hide();
  }

  toggle(): void {
    const panel = this.renderRoot.querySelector("ui-side-panel") as HTMLElement | null;
    if (panel?.hasAttribute("open")) {
      this.hide();
    } else {
      // Reset to default onSelect when toggling from toolbar
      this.onSelect = this._defaultOnSelect;
      this.show();
    }
  }

  protected render(): unknown {
    return html`
      <ui-side-panel id="admin-gallery" position="right" no-collapse dismissible>
        <div slot="header" style="display:flex;align-items:center;justify-content:space-between;width:100%;">
          <span>Images</span>
          <ui-button
            action="primary"
            emphasis="minimal"
            size="s"
            icon="icon-only"
            aria-label="Upload image"
            ?loading=${this._uploading}
            @click=${this._onUpload}
            ><ui-icon name="upload" size="s" slot="icon-start"></ui-icon
          ></ui-button>
        </div>
        <div class="admin-gallery-grid">
          ${this._loading
            ? html`<div class="gallery-loading">Loading...</div>`
            : this._images.length === 0
              ? html`<div class="gallery-empty">No images uploaded yet</div>`
              : repeat(
                  this._images,
                  (img) => img.name,
                  (img) => this._renderCard(img),
                )}
        </div>
      </ui-side-panel>
    `;
  }

  private _renderCard(img: GalleryImage): unknown {
    return html`
      <ui-card size="s" bordered style="min-width:0;">
        <img
          slot="image"
          src=${img.url}
          alt=${img.name}
          loading="lazy"
          style="width:100%;height:80px;object-fit:cover;"
        />
        <div>
          <span class="gallery-item-name">${img.name}</span>
          <span class="gallery-item-size">${formatSize(img.size)}</span>
        </div>
        <div slot="footer" style="display:flex;gap:4px;padding:var(--fd-space-0-75);">
          <ui-button action="primary" emphasis="minimal" size="s" @click=${() => this._onSelect(img)}>Select</ui-button>
          <ui-button action="destructive" emphasis="minimal" size="s" @click=${(e: Event) => this._onDelete(e, img)}
            >Delete</ui-button
          >
        </div>
      </ui-card>
    `;
  }

  private _onSelect(img: GalleryImage): void {
    if (this.onSelect) this.onSelect(img.url, img.name);
    this.hide();
  }

  private async _onDelete(e: Event, img: GalleryImage): Promise<void> {
    const btn = e.currentTarget as HTMLElement;
    btn.setAttribute("status", "loading");
    try {
      await fetch(`/api/images/${img.name}`, { method: "DELETE" });
      this._images = this._images.filter((i) => i.name !== img.name);
    } catch {
      btn.setAttribute("status", "error");
      setTimeout(() => btn.setAttribute("status", "none"), 2000);
    }
  }

  private _onUpload(): void {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async () => {
      if (!input.files) return;
      this._uploading = true;
      try {
        for (const file of input.files) {
          const formData = new FormData();
          formData.append("file", file);
          await fetch("/api/images", { method: "POST", body: formData });
        }
        await this._fetchImages();
      } finally {
        this._uploading = false;
      }
    };
    input.click();
  }

  private async _fetchImages(): Promise<void> {
    this._loading = true;
    try {
      const res = await fetch("/api/images");
      if (!res.ok) {
        this._images = [];
        return;
      }
      const data = (await res.json()) as { images: GalleryImage[] };
      this._images = data.images;
    } catch {
      this._images = [];
    } finally {
      this._loading = false;
    }
  }
}
