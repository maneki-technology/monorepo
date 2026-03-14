import { registerPage } from "../registry.js";
import { colors } from "@maneki/foundation";

const families = ["red", "orange", "yellow", "lime", "green", "teal", "turquoise", "aqua", "blue", "ultramarine", "purple", "pink", "gray"] as const;
const steps = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

registerPage("colors", {
  title: "Colors",
  section: "Foundation",
  render: () => {
    let html = `<style>
      .color-family { margin-bottom: 24px; }
      .color-family-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #5b7282; margin: 0 0 8px; }
      .color-row { display: flex; gap: 8px; }
      .color-cell { display: flex; flex-direction: column; align-items: center; gap: 4px; width: 72px; }
      .color-swatch { width: 64px; height: 40px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.06); }
      .color-label { font-size: 9px; color: #7a909e; font-family: monospace; }
      .color-var { display: none; font-size: 9px; font-family: monospace; color: #3e5463; text-align: center; user-select: all; cursor: text; white-space: nowrap; }
      .color-hex { display: none; font-size: 8px; font-family: monospace; color: #9fb1bd; text-align: center; user-select: none; white-space: nowrap; }
      .color-cell:hover .color-var, .color-cell:hover .color-hex { display: block; }
    </style>`;

    for (const family of families) {
      html += `<div class="color-family"><p class="color-family-title">${family}</p><div class="color-row">`;
      for (const step of steps) {
        const val = (colors as any)[family]?.[step] || "";
        html += `<div class="color-cell">
          <div class="color-swatch" style="background:${val}"></div>
          <span class="color-label">${step}</span>
          <span class="color-var">--fd-color-${family}-${step}</span>
          <span class="color-hex">${val}</span>
        </div>`;
      }
      html += `</div></div>`;
    }
    return html;
  },
});
