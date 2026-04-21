import { LitElement, html, css, nothing } from "lit";
import { customElement, state, property } from "lit/decorators.js";
import "../components/map-picker.js";
import { api } from "../lib/api.js";
import type { Album } from "./gallery-types.js";
import { slugify } from "./gallery-utils.js";
import "@maneki/ui-components/components/ui-button.js";
import "@maneki/ui-components/components/ui-input.js";
import "@maneki/ui-components/components/ui-label.js";
import "@maneki/ui-components/components/ui-textarea.js";
import "@maneki/ui-components/components/ui-select.js";
import "@maneki/ui-components/components/ui-dropdown-item.js";
import "@maneki/ui-components/components/ui-modal.js";
import "@maneki/ui-components/components/ui-alert.js";

@customElement("gallery-album-modal")
export class GalleryAlbumModal extends LitElement {
  @property({ type: Object }) album: Album | null = null;
  @property({ type: Array }) albums: Album[] = [];

  @state() private _editingAlbum: Album | null = null;
  @state() private _savingAction: "none" | "saving" | "deleting" = "none";
  @state() private _saveError = "";

  static styles = css`
    .modal-form { display: flex; flex-direction: column; gap: 12px; }
    .modal-actions-right { display: flex; gap: 8px; }
  `;

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("album") && this.album) {
      this._editingAlbum = { ...this.album };
      this._saveError = "";
      this._savingAction = "none";
    }
    if (changed.has("album") && !this.album) {
      this._editingAlbum = null;
    }
  }

  render() {
    if (!this._editingAlbum) return html`<ui-modal size="m" dismissible></ui-modal>`;
    const a = this._editingAlbum;
    const isNew = a.id === 0;
    return html`
      <ui-modal class="album-edit-modal" size="m" open dismissible @close=${() => { this.dispatchEvent(new CustomEvent("close")); this._saveError = ""; }}>
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
          <ui-button action="secondary" emphasis="subtle" size="s" ?disabled=${this._savingAction !== "none"} @click=${() => { this._closeModal(); }}>Cancel</ui-button>
          <ui-button action="primary" size="s" status=${this._savingAction === "saving" ? "loading" : "none"} ?disabled=${this._savingAction === "deleting"} @click=${this._saveAlbum}>${isNew ? "Create" : "Save"}</ui-button>
        </div>
      </ui-modal>
    `;
  }

  private _closeModal() {
    (this.shadowRoot!.querySelector('.album-edit-modal') as HTMLElement & { close(): void })?.close();
  }

  private async _saveAlbum() {
    const a = this._editingAlbum;
    if (!a) return;
    this._savingAction = "saving";
    this._saveError = "";
    try {
      if (a.id === 0) {
        let slug = a.slug || slugify(a.title);
        let res = await api.api.albums.$post({
          json: {
            title: a.title, slug, description: a.description, status: a.status as "draft" | "published",
            location: a.location, latitude: a.latitude ?? null, longitude: a.longitude ?? null,
          },
        });
        // Auto-resolve slug conflict by appending suffix
        if (!res.ok && res.status === 409) {
          for (let i = 2; i <= 10; i++) {
            slug = `${slugify(a.title)}-${i}`;
            res = await api.api.albums.$post({
              json: {
                title: a.title, slug, description: a.description, status: a.status as "draft" | "published",
                location: a.location, latitude: a.latitude ?? null, longitude: a.longitude ?? null,
              },
            });
            if (res.ok || res.status !== 409) break;
          }
        }
        if (!res.ok) {
          this._saveError = "Could not create album. Please try a different name.";
          return;
        }
      } else {
        const original = this.albums.find((x) => x.id === a.id);
        if (!original) return;
        const res = await api.api.albums[":slug"].$put({
          param: { slug: original.slug },
          json: {
            title: a.title,
            slug: a.slug,
            description: a.description,
            status: a.status as "draft" | "published",
            location: a.location,
            latitude: a.latitude ?? null,
            longitude: a.longitude ?? null,
          },
        });
        if (!res.ok) {
          this._saveError = "Could not update album. Please try again.";
          return;
        }
      }
      this._closeModal();
      this.dispatchEvent(new CustomEvent("album-saved"));
    } finally {
      this._savingAction = "none";
    }
  }

  private async _deleteAlbum(slug: string) {
    this._savingAction = "deleting";
    try {
      await api.api.albums[":slug"].$delete({ param: { slug } });
      this._closeModal();
      this.dispatchEvent(new CustomEvent("album-deleted", { detail: { slug } }));
    } finally {
      this._savingAction = "none";
    }
  }
}
