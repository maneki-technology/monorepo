import { registerPage } from "../registry.js";

registerPage("tag", {
  title: "Tag",
  section: "Primitives",
  render: () => `
    <h3>Sizes</h3>
    <div class="variant-row">
      <ui-tag size="xs">XS Tag</ui-tag>
      <ui-tag size="s">S Tag</ui-tag>
      <ui-tag size="m">M Tag</ui-tag>
      <ui-tag size="l">L Tag</ui-tag>
    </div>

    <h3>Types</h3>
    <div class="variant-row">
      <ui-tag type="basic">Basic</ui-tag>
      <ui-tag type="selectable">Selectable</ui-tag>
      <ui-tag type="toggle">Toggle</ui-tag>
    </div>

    <h3>Emphases</h3>
    <div class="variant-row">
      <ui-tag emphasis="bold">Bold</ui-tag>
      <ui-tag emphasis="subtle">Subtle</ui-tag>
      <ui-tag emphasis="minimal">Minimal</ui-tag>
    </div>

    <h3>States</h3>
    <div class="variant-row">
      <ui-tag type="selectable" state="enabled">Enabled</ui-tag>
      <ui-tag type="selectable" state="selected">Selected</ui-tag>
      <ui-tag type="selectable" state="disabled">Disabled</ui-tag>
    </div>

    <h3>Dismissible</h3>
    <div class="variant-row">
      <ui-tag dismissible>Dismissible</ui-tag>
      <ui-tag emphasis="subtle" dismissible>Subtle Dismissible</ui-tag>
      <ui-tag emphasis="minimal" dismissible>Minimal Dismissible</ui-tag>
    </div>

    <h3>Check</h3>
    <div class="variant-row">
      <ui-tag check>With Check</ui-tag>
      <ui-tag emphasis="subtle" check>Subtle Check</ui-tag>
      <ui-tag emphasis="minimal" check>Minimal Check</ui-tag>
    </div>

    <h3>Check + Dismissible</h3>
    <div class="variant-row">
      <ui-tag check dismissible>Bold</ui-tag>
      <ui-tag emphasis="subtle" check dismissible>Subtle</ui-tag>
      <ui-tag emphasis="minimal" check dismissible>Minimal</ui-tag>
    </div>

    <h3>Colors (Bold)</h3>
    <div class="variant-row row-wrap">
      ${["red","yellow","green","blue","lime","teal","turquoise","aqua","ultramarine","pink","purple","orange"].map(c =>
        `<ui-tag color="${c}">${c}</ui-tag>`
      ).join("")}
      <ui-tag>None (default)</ui-tag>
    </div>
    <h3>Colors (Subtle)</h3>
    <div class="variant-row row-wrap">
      ${["red","yellow","green","blue","lime","teal","turquoise","aqua","ultramarine","pink","purple","orange"].map(c =>
        `<ui-tag color="${c}" emphasis="subtle">${c}</ui-tag>`
      ).join("")}
      <ui-tag emphasis="subtle">None (default)</ui-tag>
    </div>
    <h3>Colors (Minimal)</h3>
    <div class="variant-row row-wrap">
      ${["red","yellow","green","blue","lime","teal","turquoise","aqua","ultramarine","pink","purple","orange"].map(c =>
        `<ui-tag color="${c}" emphasis="minimal">${c}</ui-tag>`
      ).join("")}
      <ui-tag emphasis="minimal">None (default)</ui-tag>
    </div>

    <h3>Interaction</h3>
    <div class="stack-m">
      <div>
        <p class="hint">Selectable — click to toggle</p>
        <div class="variant-row">
          <ui-tag type="selectable">Click me</ui-tag>
          <ui-tag type="selectable" check>With check</ui-tag>
          <ui-tag type="selectable" size="s">Small</ui-tag>
          <ui-tag type="selectable" size="l">Large</ui-tag>
        </div>
      </div>
      <div>
        <p class="hint">Dismissible — click close icon</p>
        <div class="variant-row">
          <ui-tag dismissible>Dismiss me</ui-tag>
          <ui-tag emphasis="subtle" dismissible>Subtle</ui-tag>
          <ui-tag emphasis="minimal" dismissible>Minimal</ui-tag>
        </div>
      </div>
      <div>
        <p class="hint">Disabled selectable — non-interactive</p>
        <div class="variant-row">
          <ui-tag type="selectable" state="disabled">Disabled</ui-tag>
          <ui-tag type="selectable" state="disabled" check>Disabled check</ui-tag>
          <ui-tag type="selectable" state="disabled" dismissible>Disabled dismiss</ui-tag>
        </div>
      </div>
    </div>

    <h3>Editable</h3>
    <div class="variant-row">
      <ui-tag emphasis="subtle">Existing Tag</ui-tag>
      <ui-tag emphasis="subtle">Another Tag</ui-tag>
      <ui-tag editable>New tag</ui-tag>
    </div>
  `,
});
