import { registerPage } from "../registry.js";

registerPage("avatar", {
  title: "Avatar",
  section: "Primitives",
  render: () => `
    <h3>Sizes</h3>
    <div class="variant-row">
      <ui-avatar type="text" size="xs" color="blue">XS</ui-avatar>
      <ui-avatar type="text" size="s" color="blue">S</ui-avatar>
      <ui-avatar type="text" size="m" color="blue">M</ui-avatar>
      <ui-avatar type="text" size="l" color="blue">L</ui-avatar>
      <ui-avatar type="text" size="xl" color="blue">XL</ui-avatar>
    </div>

    <h3>Types</h3>
    <div class="variant-group matrix matrix-5">
      <span class="variant-label"></span>
      <span class="variant-label">XS</span>
      <span class="variant-label">S</span>
      <span class="variant-label">M</span>
      <span class="variant-label">L</span>
      <span class="variant-label">XL</span>
      <span class="variant-label">Text</span>
      <ui-avatar type="text" size="xs" color="blue">AB</ui-avatar>
      <ui-avatar type="text" size="s" color="blue">AB</ui-avatar>
      <ui-avatar type="text" size="m" color="blue">AB</ui-avatar>
      <ui-avatar type="text" size="l" color="blue">AB</ui-avatar>
      <ui-avatar type="text" size="xl" color="blue">AB</ui-avatar>
      <span class="variant-label">Icon</span>
      <ui-avatar type="icon" size="xs" color="green"></ui-avatar>
      <ui-avatar type="icon" size="s" color="green"></ui-avatar>
      <ui-avatar type="icon" size="m" color="green"></ui-avatar>
      <ui-avatar type="icon" size="l" color="green"></ui-avatar>
      <ui-avatar type="icon" size="xl" color="green"></ui-avatar>
    </div>

    <h3>Colors</h3>
    <div style="display:grid;grid-template-columns:repeat(7,auto);gap:8px;align-items:center;">
      ${["gray","red","orange","yellow","lime","green","teal","turquoise","aqua","blue","ultramarine","purple","pink"].map(c =>
        `<ui-avatar type="text" size="m" color="${c}">${c.substring(0,2).toUpperCase()}</ui-avatar>`
      ).join("")}
    </div>

    <h3>Emphasis × Shape</h3>
    <div class="variant-group" style="display:grid;grid-template-columns:80px repeat(4,auto);gap:8px 16px;align-items:center;">
      <span class="variant-label"></span>
      <span class="variant-label">Bold Circle</span>
      <span class="variant-label">Bold Square</span>
      <span class="variant-label">Subtle Circle</span>
      <span class="variant-label">Subtle Square</span>
      <span class="variant-label">Text</span>
      <ui-avatar type="text" emphasis="bold" shape="circle" color="blue">AB</ui-avatar>
      <ui-avatar type="text" emphasis="bold" shape="square" color="blue">AB</ui-avatar>
      <ui-avatar type="text" emphasis="subtle" shape="circle" color="blue">AB</ui-avatar>
      <ui-avatar type="text" emphasis="subtle" shape="square" color="blue">AB</ui-avatar>
      <span class="variant-label">Icon</span>
      <ui-avatar type="icon" emphasis="bold" shape="circle" color="red"></ui-avatar>
      <ui-avatar type="icon" emphasis="bold" shape="square" color="red"></ui-avatar>
      <ui-avatar type="icon" emphasis="subtle" shape="circle" color="red"></ui-avatar>
      <ui-avatar type="icon" emphasis="subtle" shape="square" color="red"></ui-avatar>
    </div>

    <h3>Statuses</h3>
    <div class="variant-row">
      <div class="variant-col"><span class="variant-label">None</span><ui-avatar type="text" size="m" color="blue" status="none">AB</ui-avatar></div>
      <div class="variant-col"><span class="variant-label">Success</span><ui-avatar type="text" size="m" color="blue" status="success">AB</ui-avatar></div>
      <div class="variant-col"><span class="variant-label">Error</span><ui-avatar type="text" size="m" color="blue" status="error">AB</ui-avatar></div>
      <div class="variant-col"><span class="variant-label">Warning</span><ui-avatar type="text" size="m" color="blue" status="warning">AB</ui-avatar></div>
      <div class="variant-col"><span class="variant-label">Info</span><ui-avatar type="text" size="m" color="blue" status="information">AB</ui-avatar></div>
    </div>
  `,
});
