import { registerPage } from "../registry.js";

registerPage("button", {
  title: "Button",
  section: "Primitives",
  render: () => `
    <h3>Actions × Emphases</h3>
    <div class="variant-group" style="display:grid;grid-template-columns:80px 1fr 1fr 1fr;gap:8px 12px;align-items:center;">
      <span class="variant-label"></span>
      <span class="variant-label">Bold</span>
      <span class="variant-label">Subtle</span>
      <span class="variant-label">Minimal</span>
      ${["primary", "secondary", "destructive", "info", "contrast"].map(action =>
        `<span class="variant-label">${action}</span>
          <ui-button action="${action}" emphasis="bold" size="m">${action}</ui-button>
          <ui-button action="${action}" emphasis="subtle" size="m">${action}</ui-button>
          <ui-button action="${action}" emphasis="minimal" size="m">${action}</ui-button>`
      ).join("")}
    </div>
    <h3>Sizes</h3>
    <div class="variant-group" style="display:grid;grid-template-columns:80px 1fr 1fr 1fr 1fr;gap:8px 12px;align-items:center;">
      <span class="variant-label"></span>
      <span class="variant-label">S</span>
      <span class="variant-label">M</span>
      <span class="variant-label">L</span>
      <span class="variant-label">XL</span>
      <span class="variant-label">Basic</span>
      <ui-button size="s">Small</ui-button>
      <ui-button size="m">Medium</ui-button>
      <ui-button size="l">Large</ui-button>
      <ui-button size="xl">XL</ui-button>
      <span class="variant-label">Rounded</span>
      <ui-button size="s" shape="rounded">Small</ui-button>
      <ui-button size="m" shape="rounded">Medium</ui-button>
      <ui-button size="l" shape="rounded">Large</ui-button>
      <ui-button size="xl" shape="rounded">XL</ui-button>
    </div>
    <h3>States</h3>
    <div class="variant-row">
      <ui-button>Enabled</ui-button>
      <ui-button disabled>Disabled</ui-button>
      <ui-button status="loading">Loading</ui-button>
    </div>
    <h3>Icon Modes</h3>
    <div class="variant-row">
      <ui-button icon="leading-icon"><ui-icon name="add_circle" size="m" slot="icon-start"></ui-icon>Leading</ui-button>
      <ui-button icon="trailing-icon">Trailing<ui-icon name="add_circle" size="m" slot="icon-end"></ui-icon></ui-button>
      <ui-button icon="icon-only"><ui-icon name="add_circle" size="m" slot="icon-start"></ui-icon></ui-button>
    </div>
    <h3>Status Indicators</h3>
    <div class="variant-row">
      <ui-button status="none">Normal</ui-button>
      <ui-button status="loading">Loading</ui-button>
      <ui-button status="success">Success</ui-button>
      <ui-button status="error">Error</ui-button>
    </div>
  `,
});
