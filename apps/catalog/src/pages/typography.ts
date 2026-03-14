import { registerPage } from "../registry.js";
import { typography } from "@maneki/foundation";

const groupLabels: Record<string, string> = {
  display: "Display", heading: "Heading", body: "Body", ui: "UI",
  caption: "Caption", badge: "Badge", code: "Code",
};

registerPage("typography", {
  title: "Typography",
  section: "Foundation",
  render: () => {
    const groups = Object.entries(typography) as [string, Record<string, any>][];
    let html = `
      <style>
        .type-group { margin-bottom: 40px; }
        .group-header {
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: #5b7282; margin: 0 0 16px;
          padding-bottom: 8px; border-bottom: 1px solid #dce3e8;
        }
        .type-row {
          display: grid; grid-template-columns: 1fr 280px;
          align-items: baseline; gap: 24px; padding: 12px 0;
          border-bottom: 1px solid #f2f5f7;
        }
        .type-sample { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .type-meta { display: flex; gap: 16px; align-items: baseline; font-size: 11px; color: #5b7282; }
        .meta-key { font-weight: 500; color: #3e5463; min-width: 70px; }
        .meta-detail { font-family: monospace; font-size: 10px; color: #5b7282; }
        .meta-var { font-family: monospace; font-size: 10px; color: #7a909e; margin-top: 2px; }
        .meta-usage { font-size: 10px; color: #5b7282; margin-top: 4px; font-style: italic; }
      </style>
    `;

    for (const [group, tokens] of groups) {
      html += `<div class="type-group"><p class="group-header">${groupLabels[group] ?? group}</p>`;
      for (const [key, t] of Object.entries(tokens) as [string, any][]) {
        html += `
          <div class="type-row">
            <div class="type-sample" style="font-family:${t.fontFamily};font-size:${t.fontSize}px;line-height:${t.lineHeight}px;font-weight:${t.fontWeight};">
              The quick brown fox jumps
            </div>
            <div>
              <div class="type-meta">
                <span class="meta-key">${group}/${key}</span>
                <span class="meta-detail">${t.fontSize}px / ${t.lineHeight}px \u00b7 ${t.fontWeight}</span>
              </div>
              <div class="meta-var">--fd-type-${group}-${key}-font-size</div>
              ${t.usage ? `<div class="meta-usage">${t.usage}</div>` : ""}
            </div>
          </div>`;
      }
      html += `</div>`;
    }
    return html;
  },
});
