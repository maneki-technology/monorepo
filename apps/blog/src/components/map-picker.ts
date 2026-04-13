/**
 * <map-picker> — Lazy-loaded Leaflet map picker for location selection.
 * Leaflet is only imported when the map is first opened (~40KB gzipped, cached after).
 * Fires `location-picked` event with { location, latitude, longitude }.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, state, property } from "lit/decorators.js";
import type L from "leaflet";
import "@maneki/ui-components/components/ui-search.js";
import "@maneki/ui-components/components/ui-input.js";
import "@maneki/ui-components/components/ui-icon.js";
import "@maneki/ui-components/components/ui-button.js";
import "@maneki/ui-components/components/ui-modal.js";
import "@maneki/ui-components/components/ui-input.js";
import "@maneki/ui-components/components/ui-icon.js";
import "@maneki/ui-components/components/ui-button.js";

interface LocationResult {
  location: string;
  latitude: number;
  longitude: number;
}

@customElement("map-picker")
export class MapPicker extends LitElement {
  @property({ type: Number }) latitude: number | null = null;
  @property({ type: Number }) longitude: number | null = null;
  @property({ type: String }) location = "";

  @state() private _open = false;
  @state() private _loading = false;
  @state() private _searchQuery = "";
  @state() private _searchResults: Array<{ display_name: string; lat: string; lon: string }> = [];
  @state() private _selectedLat: number | null = null;
  @state() private _selectedLng: number | null = null;
  @state() private _selectedName = "";

  private _map: L.Map | null = null;
  private _marker: L.Marker | null = null;
  private _leaflet: typeof L | null = null;
  private _mapContainer: HTMLDivElement | null = null;

  static styles = css`
    :host {
      display: block;
    }

    .trigger {
      cursor: pointer;
    }

    .trigger ui-input {
      pointer-events: none;
    }

    .search-bar {
      padding: 8px 0;
    }

    .search-results {
      max-height: 120px;
      overflow-y: auto;
    }

    .search-result {
      padding: 6px 8px;
      font-size: 12px;
      cursor: pointer;
      border-radius: 4px;
      color: var(--fd-text-secondary, #71717a);
    }

    .search-result:hover {
      background: var(--fd-surface-secondary, #f4f4f5);
      color: var(--fd-text-primary, #27272a);
    }

    .map-container {
      height: 300px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--fd-border-minimal, #e4e4e7);
    }

    .coords {
      font-size: 12px;
      color: var(--fd-text-secondary, #71717a);
    }

    .footer-left {
      display: flex;
      align-items: center;
      flex: 1;
    }

    .footer-right {
      display: flex;
      gap: 8px;
    }

    .loading-map {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--fd-text-secondary, #71717a);
      font-size: 13px;
    }
  `;

  render() {
    return html`
      <div class="trigger" @click=${this._openPicker}>
        <ui-input
          size="m"
          .value=${this.location || ""}
          placeholder="Pick a location..."
        >
          <ui-icon name="location_on" size="s" slot="trailing"></ui-icon>
        </ui-input>
      </div>
      <ui-modal size="l" ?open=${this._open} dismissible @close=${(e: Event) => { e.stopPropagation(); this._onModalClose(); }}>
        <span>Pick Location</span>
        <div slot="body">
          <div class="search-bar">
            <ui-search
              size="s"
              placeholder="Search for a place..."
              .value=${this._searchQuery}
              @search-input=${(e: CustomEvent) => { this._searchQuery = (e as CustomEvent<{ value: string }>).detail.value; }}
              @search-submit=${() => this._search()}
            ></ui-search>
          </div>
          ${this._searchResults.length > 0 ? html`
            <div class="search-results">
              ${this._searchResults.map((r) => html`
                <div class="search-result" @click=${() => this._selectResult(r)}>${r.display_name}</div>
              `)}
            </div>
          ` : nothing}
          ${this._loading ? html`<div class="loading-map">Loading map...</div>` : html`<div class="map-container"></div>`}
        </div>
        <div slot="footer-start">
          <span class="coords">${this._selectedLat !== null ? `${this._selectedLat.toFixed(5)}, ${this._selectedLng!.toFixed(5)}` : "Click map or search"}</span>
        </div>
        <div slot="footer-end" class="footer-right">
          ${this.latitude !== null ? html`<ui-button action="destructive" emphasis="minimal" size="s" @click=${this._clearLocation}>Clear</ui-button>` : nothing}
          <ui-button action="secondary" emphasis="subtle" size="s" @click=${() => { (this.shadowRoot!.querySelector("ui-modal") as HTMLElement & { close(): void })?.close(); }}>Cancel</ui-button>
          <ui-button action="primary" size="s" ?disabled=${this._selectedLat === null} @click=${this._confirm}>Confirm</ui-button>
        </div>
      </ui-modal>
    `;
  }

  private async _openPicker() {
    this._open = true;
    this._selectedLat = this.latitude;
    this._selectedLng = this.longitude;
    this._selectedName = this.location;
    this._searchResults = [];
    this._searchQuery = "";

    if (!this._leaflet) {
      this._loading = true;
      const [L, cssText] = await Promise.all([
        import("leaflet"),
        fetch("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css").then((r) => r.text()),
      ]);
      this._leaflet = L.default ?? L;
      // Inject Leaflet CSS into shadow DOM
      const style = document.createElement("style");
      style.textContent = cssText;
      this.shadowRoot!.appendChild(style);
      this._loading = false;
    }

    await this.updateComplete;
    this._initMap();
  }

  private _initMap() {
    const container = this.shadowRoot!.querySelector(".map-container") as HTMLDivElement;
    if (!container || !this._leaflet) return;
    this._mapContainer = container;

    const L = this._leaflet;
    const lat = this._selectedLat ?? 20;
    const lng = this._selectedLng ?? 0;
    const zoom = this._selectedLat !== null ? 13 : 2;

    this._map = L.map(container).setView([lat, lng], zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this._map);

    if (this._selectedLat !== null) {
      this._marker = L.marker([this._selectedLat, this._selectedLng!], {
        icon: L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      }).addTo(this._map);
    }

    this._map.on("click", (e: L.LeafletMouseEvent) => {
      this._placeMarker(e.latlng.lat, e.latlng.lng);
      this._reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    // Fix map rendering in shadow DOM
    setTimeout(() => this._map?.invalidateSize(), 100);
  }

  private _placeMarker(lat: number, lng: number) {
    if (!this._map || !this._leaflet) return;
    this._selectedLat = lat;
    this._selectedLng = lng;

    if (this._marker) {
      this._marker.setLatLng([lat, lng]);
    } else {
      const L = this._leaflet;
      this._marker = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      }).addTo(this._map);
    }
    this.requestUpdate();
  }

  private async _reverseGeocode(lat: number, lng: number) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14`, {
        headers: { "Accept-Language": "en" },
      });
      if (res.ok) {
        const data = (await res.json()) as { display_name?: string };
        this._selectedName = data.display_name ?? "";
        this.requestUpdate();
      }
    } catch {
      /* geocode failed */
    }
  }

  private async _search() {
    if (!this._searchQuery.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(this._searchQuery)}&format=json&limit=5`,
        { headers: { "Accept-Language": "en" } },
      );
      if (res.ok) {
        this._searchResults = await res.json();
      }
    } catch {
      /* search failed */
    }
  }

  private _selectResult(r: { display_name: string; lat: string; lon: string }) {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    this._selectedName = r.display_name;
    this._searchResults = [];
    this._placeMarker(lat, lng);
    this._map?.setView([lat, lng], 13);
  }

  private _confirm() {
    if (this._selectedLat === null) return;
    const detail: LocationResult = {
      location: this._selectedName,
      latitude: this._selectedLat,
      longitude: this._selectedLng!,
    };
    this.dispatchEvent(new CustomEvent("location-picked", { bubbles: true, composed: true, detail }));
    this._dismissModal();
  }

  private _clearLocation() {
    this.dispatchEvent(
      new CustomEvent("location-picked", {
        bubbles: true,
        composed: true,
        detail: { location: "", latitude: null, longitude: null },
      }),
    );
    this._dismissModal();
  }

  private _dismissModal() {
    const modal = this.shadowRoot!.querySelector("ui-modal") as HTMLElement & { close(): void } | null;
    if (modal) modal.close();
  }

  private _onModalClose() {
    this._open = false;
    if (this._map) {
      this._map.remove();
      this._map = null;
      this._marker = null;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
  }
}
