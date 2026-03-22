import { registerPage } from "../registry.js";
import { registerIcon } from "@maneki/ui-components";

// Register custom icons for the demo
registerIcon("brand-star", () => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.innerHTML = '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>';
  return svg;
});

registerIcon("brand-heart", () => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.innerHTML = '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>';
  return svg;
});

registerIcon("brand-bolt", () => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.innerHTML = '<path d="M11 21h-1l1-7H7.5c-.88 0-.33-.75-.31-.78C8.48 10.94 10.42 7.54 13.01 3h1l-1 7h3.51c.4 0 .62.19.4.66C12.97 17.55 11 21 11 21z"/>';
  return svg;
});
registerPage("icon", {
  title: "Icon",
  section: "Primitives",
  render: () => {
    const icons = ["close", "check_circle", "warning", "error", "info", "search", "settings", "home", "person", "notifications", "expand_more", "expand_less", "chevron_right", "chevron_left", "arrow_back_ios", "arrow_forward_ios", "add_circle", "share", "download", "upload", "more_vert", "bar_chart", "group", "mail", "account_circle", "attach_money", "visibility", "visibility_off", "cancel", "arrow_drop_up", "arrow_drop_down", "check", "calendar_today", "schedule"];
    return `
      <h3>All Icons</h3>
      <div class="variant-group">
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:16px">
          ${icons.map(name => `<div class="variant-col" style="align-items:center;padding:12px 4px">
            <ui-icon name="${name}" size="m"></ui-icon>
            <span style="font-size:10px;color:#3e5463;text-align:center;word-break:break-all">${name}</span>
          </div>`).join("")}
        </div>
      </div>

      <h3>Sizes</h3>
      <div class="variant-row">
        ${[{s:"xxs",px:12},{s:"xs",px:14},{s:"s",px:16},{s:"m",px:20},{s:"l",px:24}].map(v =>
          `<div class="variant-col items-center">
            <ui-icon name="home" size="${v.s}"></ui-icon>
            <span class="variant-label">${v.s} (${v.px})</span>
          </div>`
        ).join("")}
      </div>

      <h3>States</h3>
      <div class="variant-row">
        ${["enabled","hover","active","focus","disabled"].map(state =>
          `<div class="variant-col items-center">
            <ui-icon name="home" size="m" state="${state}"></ui-icon>
            <span class="variant-label">${state}</span>
          </div>`
        ).join("")}
      </div>

      <h3>States (Inverse)</h3>
      <div class="variant-row" style="background:#1C2B36;padding:24px;border-radius:8px">
        ${["enabled-inverse","hover-inverse","active-inverse","focus-inverse","disabled-inverse"].map(state =>
          `<div class="variant-col items-center">
            <ui-icon name="home" size="m" state="${state}"></ui-icon>
            <span style="font-size:11px;color:rgba(255,255,255,0.6)">${state.replace("-inverse","")}</span>
          </div>`
        ).join("")}
      </div>

      <h3>Filled vs Outlined</h3>
      <div class="variant-row">
        ${["home","settings","check_circle","info","warning"].map(name =>
          `<div class="variant-col items-center">
            <div class="row-gap-8">
              <ui-icon name="${name}" size="m"></ui-icon>
              <ui-icon name="${name}" size="m" filled></ui-icon>
            </div>
            <span class="variant-label">${name}</span>
          </div>`
        ).join("")}
      </div>

      <h3>With Label (a11y)</h3>
      <div class="variant-row">
        <ui-icon name="home" size="m" label="Home"></ui-icon>
        <ui-icon name="settings" size="m" label="Settings"></ui-icon>
        <ui-icon name="person" size="m" label="User profile"></ui-icon>
      </div>

      <h3>Custom Icons (via registerIcon)</h3>
      <p class="hint">These icons are registered at runtime — not part of Material Symbols.</p>
      <div class="variant-row">
        ${["brand-star", "brand-heart", "brand-bolt"].map(name =>
          `<div class="variant-col items-center">
            <ui-icon name="${name}" size="m"></ui-icon>
            <span class="variant-label">${name}</span>
          </div>`
        ).join("")}
      </div>

      <h3>Custom Icons — Sizes</h3>
      <div class="variant-row">
        ${["xxs","xs","s","m","l"].map(s =>
          `<div class="variant-col items-center">
            <ui-icon name="brand-star" size="${s}"></ui-icon>
            <span class="variant-label">${s}</span>
          </div>`
        ).join("")}
      </div>

      <h3>Custom Icons — Inherit Color</h3>
      <div class="variant-row">
        <div style="color:#186ade"><ui-icon name="brand-heart" size="m"></ui-icon></div>
        <div style="color:#D91F11"><ui-icon name="brand-heart" size="m"></ui-icon></div>
        <div style="color:#1B806A"><ui-icon name="brand-heart" size="m"></ui-icon></div>
        <div style="color:#E86427"><ui-icon name="brand-bolt" size="m"></ui-icon></div>
      </div>
    `;
  },
});
