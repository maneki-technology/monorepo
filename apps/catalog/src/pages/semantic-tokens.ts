import { registerPage } from "../registry.js";
import {
  surface, border, text, icon, global,
  statusSurface, statusText, statusIcon, statusGeneral,
  resolveSemanticValue,
} from "@maneki/foundation";

function toKebab(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function renderSwatch(name: string, cssVar: string, value: any, mode: string): string {
  const resolved = resolveSemanticValue(value);
  const isLight = resolved === "#ffffff" || resolved === "rgba(28, 43, 54, 0.8)";

  let swatchHtml = "";
  if (mode === "surface") {
    swatchHtml = `<div style="width:44px;height:44px;border-radius:6px;flex-shrink:0;background:${resolved};${isLight ? "border:1px solid #dce3e8;" : ""}"></div>`;
  } else if (mode === "border") {
    swatchHtml = `<div style="width:44px;height:44px;border-radius:6px;flex-shrink:0;background:#fff;border:2px solid ${resolved};"></div>`;
  } else {
    swatchHtml = `<div style="width:44px;height:44px;border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:600;background:#fff;border:1px solid #dce3e8;color:${resolved};">${mode === "icon" ? "\u2605" : "Aa"}</div>`;
  }

  return `
    <div style="display:flex;align-items:center;gap:12px;padding:8px;border-radius:8px;background:#f8f9fa;">
      ${swatchHtml}
      <div style="min-width:0;">
        <div style="font-size:12px;font-weight:500;margin-bottom:2px;">${name}</div>
        <code style="font-size:10px;color:#5b7282;display:block;margin-bottom:1px;">${cssVar}</code>
        <div style="font-size:10px;color:#5b7282;font-family:monospace;">${resolved}</div>
      </div>
    </div>`;
}

function renderGroup(title: string, tokens: Record<string, any>, prefix: string, mode: string): string {
  let html = `<h3>${title}</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-bottom:32px;">`;
  for (const [name, value] of Object.entries(tokens)) {
    const cssVar = `--fd-${prefix}-${toKebab(name)}`;
    html += renderSwatch(name, cssVar, value, mode);
  }
  html += `</div>`;
  return html;
}

registerPage("semantic-tokens", {
  title: "Semantic Tokens",
  section: "Foundation",
  render: () => {
    return renderGroup("Surface", surface, "surface", "surface") +
      renderGroup("Border", border, "border", "border") +
      renderGroup("Text", text, "text", "text") +
      renderGroup("Icon", icon, "icon", "icon") +
      renderGroup("Global", global, "global", "surface") +
      renderGroup("Status \u2014 General", statusGeneral, "status-general", "surface") +
      renderGroup("Status \u2014 Surface", statusSurface, "status-surface", "surface") +
      renderGroup("Status \u2014 Text", statusText, "status-text", "text") +
      renderGroup("Status \u2014 Icon", statusIcon, "status-icon", "icon");
  },
});
