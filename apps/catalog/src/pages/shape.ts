import { registerPage } from "../registry.js";
import { radius, borderWidth } from "@maneki/foundation";

registerPage("shape", {
  title: "Shape",
  section: "Foundation",
  render: () => {
    let html = `
      <style>
        .shape-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 24px; margin-bottom: 40px; }
        .shape-card {
          background: var(--fd-surface-tertiary, #f8f9fa); border: 1px solid var(--fd-border-minimal, #dce3e8);
          border-radius: 8px; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 12px;
        }
        .shape-preview { display: flex; align-items: center; justify-content: center; }
        .shape-name { font-size: 13px; font-weight: 500; color: var(--fd-text-primary, #1c2b36); }
        .shape-value { font-size: 11px; font-family: monospace; color: #5b7282; }
        .shape-var { font-size: 10px; font-family: monospace; color: #5b7282; }
      </style>

      <h3>Border Radius</h3>
      <div class="shape-grid">`;

    for (const [step, value] of Object.entries(radius)) {
      const isCircle = value === "50%";
      const isPill = value === "999px";
      const previewRadius = isCircle ? "50%" : isPill ? "24px" : value;
      const previewWidth = isPill ? "80px" : "48px";

      html += `
        <div class="shape-card">
          <div class="shape-preview">
            <div style="width:${previewWidth};height:48px;background:#186ade;opacity:0.7;border-radius:${previewRadius};"></div>
          </div>
          <div class="shape-name">${step}</div>
          <div class="shape-value">${value}</div>
          <div class="shape-var">--fd-radius-${step}</div>
        </div>`;
    }

    html += `</div>

      <h3>Border Width</h3>
      <div class="shape-grid">`;

    for (const [step, value] of Object.entries(borderWidth)) {
      html += `
        <div class="shape-card">
          <div class="shape-preview">
            <div style="width:80px;height:48px;background:var(--fd-surface-tertiary,#f8f9fa);border:${value} solid #186ade;border-radius:4px;"></div>
          </div>
          <div class="shape-name">${step}</div>
          <div class="shape-value">${value}</div>
          <div class="shape-var">--fd-border-width-${step}</div>
        </div>`;
    }

    html += `</div>`;
    return html;
  },
});
