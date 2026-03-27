import { registerPage } from "../registry.js";
import "@maneki/ui-components/components/ui-dropdown-heading.js";
import "@maneki/ui-components/components/ui-dropdown-item.js";
import "@maneki/ui-components/components/ui-dropdown-separator.js";
import "@maneki/ui-components/components/ui-icon.js";
import "@maneki/ui-components/components/ui-select.js";

registerPage("select", {
  title: "Select",
  section: "Form Controls",
  render: () => `
    <h3>Sizes — Without Labels</h3>
    <div class="stack-m w-320">
      <ui-select size="s" placeholder="Small (S)">
        <ui-dropdown-item value="a">Option A</ui-dropdown-item>
        <ui-dropdown-item value="b">Option B</ui-dropdown-item>
      </ui-select>
      <ui-select size="m" placeholder="Medium (M)">
        <ui-dropdown-item value="a">Option A</ui-dropdown-item>
        <ui-dropdown-item value="b">Option B</ui-dropdown-item>
      </ui-select>
      <ui-select size="l" placeholder="Large (L)">
        <ui-dropdown-item value="a">Option A</ui-dropdown-item>
        <ui-dropdown-item value="b">Option B</ui-dropdown-item>
      </ui-select>
    </div>

    <h3>Sizes — With Labels</h3>
    <div class="stack-m w-320">
      <ui-select size="s" placeholder="Small (S)">
        <ui-label slot="label" size="s">Label</ui-label>
        <span slot="supportive">Supportive Text</span>
        <ui-dropdown-item value="a">Option A</ui-dropdown-item>
        <ui-dropdown-item value="b">Option B</ui-dropdown-item>
      </ui-select>
      <ui-select size="m" placeholder="Medium (M)">
        <ui-label slot="label" size="m">Label</ui-label>
        <span slot="supportive">Supportive Text</span>
        <ui-dropdown-item value="a">Option A</ui-dropdown-item>
        <ui-dropdown-item value="b">Option B</ui-dropdown-item>
      </ui-select>
      <ui-select size="l" placeholder="Large (L)">
        <ui-label slot="label" size="l">Label</ui-label>
        <span slot="supportive">Supportive Text</span>
        <ui-dropdown-item value="a">Option A</ui-dropdown-item>
        <ui-dropdown-item value="b">Option B</ui-dropdown-item>
      </ui-select>
    </div>

    <h3>States</h3>
    <div class="grid-3">
      <div class="card-content">
        <span class="variant-label">Enabled</span>
        <ui-select placeholder="Select an option">
          <ui-label slot="label">Label</ui-label>
          <span slot="supportive">Supportive Text</span>
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
          <ui-dropdown-item value="b">Option B</ui-dropdown-item>
        </ui-select>
      </div>
      <div class="card-content">
        <span class="variant-label">Filled (Single)</span>
        <ui-select value="a">
          <ui-label slot="label">Label</ui-label>
          <span slot="supportive">Supportive Text</span>
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
          <ui-dropdown-item value="b">Option B</ui-dropdown-item>
        </ui-select>
      </div>
      <div class="card-content">
        <span class="variant-label">Filled (Multi)</span>
        <ui-select multiple value="a,b">
          <ui-label slot="label">Label</ui-label>
          <span slot="supportive">Supportive Text</span>
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
          <ui-dropdown-item value="b">Option B</ui-dropdown-item>
          <ui-dropdown-item value="c">Option C</ui-dropdown-item>
        </ui-select>
      </div>
      <div class="card-content">
        <span class="variant-label">Disabled</span>
        <ui-select disabled placeholder="Select an option">
          <ui-label slot="label">Label</ui-label>
          <span slot="supportive">Supportive Text</span>
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
          <ui-dropdown-item value="b">Option B</ui-dropdown-item>
        </ui-select>
      </div>
      <div class="card-content">
        <span class="variant-label">Read Only</span>
        <ui-select readonly value="a">
          <ui-label slot="label">Label</ui-label>
          <span slot="supportive">Supportive Text</span>
          <ui-dropdown-item value="a">Option A</ui-dropdown-item>
          <ui-dropdown-item value="b">Option B</ui-dropdown-item>
        </ui-select>
      </div>
    </div>

    <h3>Statuses</h3>
    <div class="stack-m w-320">
      <ui-select placeholder="Select an option">
        <ui-label slot="label">Label</ui-label>
        <span slot="supportive">Supportive Text</span>
        <ui-dropdown-item value="a">Option A</ui-dropdown-item>
      </ui-select>
      <ui-select status="warning" placeholder="Select an option">
        <ui-label slot="label">Label</ui-label>
        <span slot="supportive">Warning message</span>
        <ui-dropdown-item value="a">Option A</ui-dropdown-item>
      </ui-select>
      <ui-select status="error" placeholder="Select an option">
        <ui-label slot="label">Label</ui-label>
        <span slot="supportive">Error message</span>
        <ui-dropdown-item value="a">Option A</ui-dropdown-item>
      </ui-select>
      <ui-select status="success" placeholder="Select an option">
        <ui-label slot="label">Label</ui-label>
        <span slot="supportive">Success message</span>
        <ui-dropdown-item value="a">Option A</ui-dropdown-item>
      </ui-select>
      <ui-select status="loading" placeholder="Select an option">
        <ui-label slot="label">Label</ui-label>
        <span slot="supportive">Loading...</span>
        <ui-dropdown-item value="a">Option A</ui-dropdown-item>
      </ui-select>
    </div>

    <h3>Leading Icon</h3>
    <div class="variant-row">
      <ui-select placeholder="Select an option">
        <ui-label slot="label">With Leading Icon</ui-label>
        <span slot="supportive">Supportive Text</span>
        <ui-icon name="account_circle" size="m" slot="leading"></ui-icon>
        <ui-dropdown-item value="a">Option A</ui-dropdown-item>
        <ui-dropdown-item value="b">Option B</ui-dropdown-item>
        <ui-dropdown-item value="c">Option C</ui-dropdown-item>
      </ui-select>
      <ui-select placeholder="Select an option">
        <ui-label slot="label">Without Leading Icon</ui-label>
        <span slot="supportive">Supportive Text</span>
        <ui-dropdown-item value="a">Option A</ui-dropdown-item>
        <ui-dropdown-item value="b">Option B</ui-dropdown-item>
        <ui-dropdown-item value="c">Option C</ui-dropdown-item>
      </ui-select>
    </div>

    <h3>With Headings &amp; Separators</h3>
    <div class="variant-row">
      <ui-select placeholder="Choose a country" class="w-fixed-300">
        <ui-label slot="label">Country</ui-label>
        <span slot="supportive">Select your country</span>
        <ui-dropdown-heading>North America</ui-dropdown-heading>
        <ui-dropdown-item value="us">United States</ui-dropdown-item>
        <ui-dropdown-item value="ca">Canada</ui-dropdown-item>
        <ui-dropdown-item value="mx">Mexico</ui-dropdown-item>
        <ui-dropdown-separator></ui-dropdown-separator>
        <ui-dropdown-heading>Europe</ui-dropdown-heading>
        <ui-dropdown-item value="uk">United Kingdom</ui-dropdown-item>
        <ui-dropdown-item value="de">Germany</ui-dropdown-item>
        <ui-dropdown-item value="fr">France</ui-dropdown-item>
      </ui-select>
    </div>

    <h3>Multi-Select</h3>
    <div class="variant-row">
      <ui-select multiple style="width:400px;">
        <ui-label slot="label">Tags</ui-label>
        <span slot="supportive">Select multiple tags</span>
        <ui-dropdown-item value="react">React</ui-dropdown-item>
        <ui-dropdown-item value="vue">Vue</ui-dropdown-item>
        <ui-dropdown-item value="angular">Angular</ui-dropdown-item>
        <ui-dropdown-item value="svelte">Svelte</ui-dropdown-item>
        <ui-dropdown-item value="solid">Solid</ui-dropdown-item>
      </ui-select>
    </div>
  `,
});
