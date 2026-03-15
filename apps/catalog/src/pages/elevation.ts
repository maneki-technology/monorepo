import { registerPage } from "../registry.js";
import { elevation } from "@maneki/foundation";

registerPage("elevation", {
  title: "Elevation",
  section: "Foundation",
  render: () => {
    const levels = Object.entries(elevation) as [string, { boxShadow: string }][];
    let html = `
      <style>
        .elevation-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; padding: 32px; background: #f2f5f7; border-radius: 12px; }
        .elevation-card {
          background: #fff; border-radius: 10px; padding: 24px; min-height: 160px; width: 100%;
          display: flex; flex-direction: column; justify-content: space-between;
          transition: transform 0.2s ease; overflow: hidden;
        }
        .elevation-card:hover { transform: translateY(-2px); }
        .elevation-level { font-size: 20px; font-weight: 600; color: #1c2b36; margin-bottom: 8px; }
        .elevation-var { font-size: 11px; font-family: monospace; color: #5b7282; margin-bottom: 12px; }
        .elevation-shadow { font-size: 10px; font-family: monospace; color: #5b7282; line-height: 1.5; word-break: break-all; overflow: hidden; max-height: 60px; }
      </style>
      <div class="elevation-grid">`;

    for (const [level, token] of levels) {
      html += `
        <div class="elevation-card" style="box-shadow:${token.boxShadow}">
          <div>
            <div class="elevation-level">${level}</div>
            <div class="elevation-var">--fd-elevation-${level}</div>
          </div>
          <div class="elevation-shadow">${token.boxShadow}</div>
        </div>`;
    }
    html += `</div>`;
    return html;
  },
});
