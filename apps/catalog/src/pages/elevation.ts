import { registerPage } from "../registry.js";
import { elevation } from "@maneki/foundation";

registerPage("elevation", {
  title: "Elevation",
  section: "Foundation",
  render: () => {
    const levels = Object.entries(elevation) as [string, { boxShadow: string }][];
    let html = `
      <style>
        .elev-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .elev-card {
          background: var(--fd-surface-primary, #fff); border-radius: 8px; padding: 24px;
          display: flex; flex-direction: column; gap: 8px;
          border: 1px solid var(--fd-border-minimal, #dce3e8);
        }
        .elev-level { font-size: 20px; font-weight: 600; color: var(--fd-text-primary, #1c2b36); }
        .elev-var { font-size: 11px; font-family: monospace; color: var(--fd-text-secondary, #3e5463); }
        .elev-shadow { font-size: 10px; font-family: monospace; color: var(--fd-text-secondary, #3e5463); word-break: break-all; }
      </style>
      <div class="elev-grid">`;

    for (const [level, token] of levels) {
      html += `
        <div class="elev-card" style="box-shadow:var(--fd-elevation-${level})">
          <div class="elev-level">${level}</div>
          <div class="elev-var">--fd-elevation-${level}</div>
          <div class="elev-shadow">${token.boxShadow || "none"}</div>
        </div>`;
    }
    html += `</div>`;
    return html;
  },
});
