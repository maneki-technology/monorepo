import { registerPage } from "../registry.js";

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
            <span style="font-size:10px;color:#7a909e;text-align:center;word-break:break-all">${name}</span>
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
    `;
  },
});
