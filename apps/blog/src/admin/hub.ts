import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import "../components/theme-toggle.js";
import "../components/loading-bounce.js";
import "@maneki/ui-components/components/ui-card.js";
import "@maneki/ui-components/components/ui-icon.js";
import { loadTheme, saveThemeToBackend } from "./theme.js";

@customElement("admin-hub")
export class AdminHub extends LitElement {
  @state() private _ready = false;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("theme-change", () => saveThemeToBackend());
    loadTheme().then(() => {
      this._ready = true;
    });
  }

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
      justify-content: space-between;
      padding: 12px 24px;
      border-bottom: 1px solid var(--fd-border-minimal, #e4e4e7);
    }

    .title {
      font-size: 16px;
      font-weight: 600;
    }

    .content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 12px;
      max-width: 800px;
      width: 100%;
    }

    ui-card {
      cursor: pointer;
      transition: transform 0.15s ease;
    }

    ui-card:hover {
      transform: translateY(-1px);
    }

    .card-body {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .card-body h2 {
      font-size: 14px;
      font-weight: 600;
      margin: 0;
    }

    .card-body p {
      font-size: 12px;
      color: var(--fd-text-secondary, #71717a);
      line-height: 1.4;
      margin: 0;
    }
  `;

  render() {
    return html`
      <div class="header">
        <span class="title">Admin</span>
        <theme-toggle></theme-toggle>
      </div>
      ${this._ready
        ? html`
            <div class="content">
              <div class="grid">
                <a href="/admin/editor" style="text-decoration:none;color:inherit;">
                  <ui-card bordered elevation="00" size="s">
                    <div class="card-body">
                      <ui-icon name="title" size="m"></ui-icon>
                      <h2>Editor</h2>
                      <p>Write and manage blog posts and projects</p>
                    </div>
                  </ui-card>
                </a>
                <a href="/admin/gallery" style="text-decoration:none;color:inherit;">
                  <ui-card bordered elevation="00" size="s">
                    <div class="card-body">
                      <ui-icon name="image" size="m"></ui-icon>
                      <h2>Gallery</h2>
                      <p>Manage photos, albums, and metadata</p>
                    </div>
                  </ui-card>
                </a>
                <a href="/" target="_blank" style="text-decoration:none;color:inherit;">
                  <ui-card bordered elevation="00" size="s">
                    <div class="card-body">
                      <ui-icon name="share" size="m"></ui-icon>
                      <h2>View Site</h2>
                      <p>Open the live blog in a new tab</p>
                    </div>
                  </ui-card>
                </a>
              </div>
            </div>
          `
        : html`<loading-bounce></loading-bounce>`}
    `;
  }
}
