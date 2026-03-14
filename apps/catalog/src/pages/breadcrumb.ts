import { registerPage } from "../registry.js";

registerPage("breadcrumb", {
  title: "Breadcrumb",
  section: "Navigation",
  render: () => `
    <h3>Default</h3>
    <div class="variant-row">
      <ui-breadcrumb-group>
        <ui-breadcrumb-item href="#">Home</ui-breadcrumb-item>
        <ui-breadcrumb-item href="#">Products</ui-breadcrumb-item>
        <ui-breadcrumb-item href="#">Shoes</ui-breadcrumb-item>
        <ui-breadcrumb-item>Running Shoes</ui-breadcrumb-item>
      </ui-breadcrumb-group>
    </div>

    <h3>Sizes</h3>
    <div class="stack-l">
      <div class="variant-row">
        <span class="variant-label" style="width:30px">S</span>
        <ui-breadcrumb-group size="s">
          <ui-breadcrumb-item href="#">Home</ui-breadcrumb-item>
          <ui-breadcrumb-item href="#">Docs</ui-breadcrumb-item>
          <ui-breadcrumb-item>Current</ui-breadcrumb-item>
        </ui-breadcrumb-group>
      </div>
      <div class="variant-row">
        <span class="variant-label" style="width:30px">M</span>
        <ui-breadcrumb-group size="m">
          <ui-breadcrumb-item href="#">Home</ui-breadcrumb-item>
          <ui-breadcrumb-item href="#">Docs</ui-breadcrumb-item>
          <ui-breadcrumb-item>Current</ui-breadcrumb-item>
        </ui-breadcrumb-group>
      </div>
      <div class="variant-row">
        <span class="variant-label" style="width:30px">L</span>
        <ui-breadcrumb-group size="l">
          <ui-breadcrumb-item href="#">Home</ui-breadcrumb-item>
          <ui-breadcrumb-item href="#">Docs</ui-breadcrumb-item>
          <ui-breadcrumb-item>Current</ui-breadcrumb-item>
        </ui-breadcrumb-group>
      </div>
    </div>

    <h3>States</h3>
    <div class="variant-row">
      <ui-breadcrumb-group size="m">
        <ui-breadcrumb-item href="#">Enabled</ui-breadcrumb-item>
        <ui-breadcrumb-item disabled>Disabled</ui-breadcrumb-item>
        <ui-breadcrumb-item>Current</ui-breadcrumb-item>
      </ui-breadcrumb-group>
    </div>

    <h3>With Many Items</h3>
    <div class="variant-row">
      <ui-breadcrumb-group size="m">
        <ui-breadcrumb-item href="#">Home</ui-breadcrumb-item>
        <ui-breadcrumb-item href="#">Products</ui-breadcrumb-item>
        <ui-breadcrumb-item href="#">Clothing</ui-breadcrumb-item>
        <ui-breadcrumb-item href="#">Men's</ui-breadcrumb-item>
        <ui-breadcrumb-item href="#">Shirts</ui-breadcrumb-item>
        <ui-breadcrumb-item>Oxford Button-Down</ui-breadcrumb-item>
      </ui-breadcrumb-group>
    </div>
  `,
});
