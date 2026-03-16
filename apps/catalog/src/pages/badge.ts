import { registerPage } from "../registry.js";

registerPage("badge", {
  title: "Badge",
  section: "Primitives",
  render: () => `
    <h3>Sizes</h3>
    <div class="variant-row">
      <div class="variant-col"><span class="variant-label">XS</span><ui-badge size="xs">Badge XS</ui-badge></div>
      <div class="variant-col"><span class="variant-label">S</span><ui-badge size="s">Badge S</ui-badge></div>
      <div class="variant-col"><span class="variant-label">M</span><ui-badge size="m">Badge M</ui-badge></div>
      <div class="variant-col"><span class="variant-label">L</span><ui-badge size="l">Badge L</ui-badge></div>
    </div>
    <h3>Emphases</h3>
    <div class="variant-row">
      <ui-badge emphasis="bold" color="blue">Bold</ui-badge>
      <ui-badge emphasis="subtle" color="blue">Subtle</ui-badge>
      <ui-badge emphasis="minimal" color="blue">Minimal</ui-badge>
    </div>
    <h3>Colors</h3>
    <div class="variant-row">
      <ui-badge color="red">Red</ui-badge>
      <ui-badge color="orange">Orange</ui-badge>
      <ui-badge color="yellow">Yellow</ui-badge>
      <ui-badge color="lime">Lime</ui-badge>
      <ui-badge color="green">Green</ui-badge>
      <ui-badge color="teal">Teal</ui-badge>
      <ui-badge color="turquoise">Turquoise</ui-badge>
      <ui-badge color="aqua">Aqua</ui-badge>
      <ui-badge color="blue">Blue</ui-badge>
      <ui-badge color="ultramarine">Ultramarine</ui-badge>
      <ui-badge color="purple">Purple</ui-badge>
      <ui-badge color="pink">Pink</ui-badge>
    </div>
    <h3>Shapes</h3>
    <div class="variant-row">
      <ui-badge shape="square">Square</ui-badge>
      <ui-badge shape="rounded">Rounded</ui-badge>
    </div>
    <h3>Statuses</h3>
    <div class="variant-row">
      <ui-badge status="information">Info</ui-badge>
      <ui-badge status="success">Success</ui-badge>
      <ui-badge status="warning">Warning</ui-badge>
      <ui-badge status="error">Error</ui-badge>
    </div>
  `,
});
