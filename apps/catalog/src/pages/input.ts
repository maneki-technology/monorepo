import { registerPage } from "../registry.js";
import "@maneki/ui-components/components/ui-icon.js";
import "@maneki/ui-components/components/ui-input.js";
import "@maneki/ui-components/components/ui-input-group.js";

registerPage("input", {
  title: "Input",
  section: "Form Controls",
  render: () => `
    <h3>Sizes</h3>
    <div class="stack-m w-320">
      <ui-input size="s" placeholder="Size S"><ui-label slot="label" size="s">Small</ui-label></ui-input>
      <ui-input size="m" placeholder="Size M"><ui-label slot="label" size="m">Medium</ui-label></ui-input>
      <ui-input size="l" placeholder="Size L"><ui-label slot="label" size="l">Large</ui-label></ui-input>
    </div>

    <h3>Types</h3>
    <div class="stack-m w-320">
      <ui-input type="text" placeholder="Enter text..."><ui-label slot="label">Text</ui-label></ui-input>
      <ui-input type="numeric" value="10"><ui-label slot="label">Numeric</ui-label></ui-input>
      <ui-input type="clearable" value="Clear me"><ui-label slot="label">Clearable</ui-label></ui-input>
      <ui-input type="password" value="secret123"><ui-label slot="label">Password</ui-label></ui-input>
    </div>

    <h3>States</h3>
    <div class="stack-m w-320">
      <ui-input placeholder="Default state"><ui-label slot="label">Enabled</ui-label></ui-input>
      <ui-input value="Some value"><ui-label slot="label">Filled</ui-label></ui-input>
      <ui-input placeholder="Cannot edit" disabled><ui-label slot="label">Disabled</ui-label></ui-input>
      <ui-input value="Cannot edit" disabled><ui-label slot="label">Disabled filled</ui-label></ui-input>
      <ui-input value="Read only value" readonly><ui-label slot="label">Readonly</ui-label></ui-input>
    </div>

    <h3>Statuses</h3>
    <div class="stack-m w-320">
      <ui-input status="none" placeholder="No status"><ui-label slot="label">None</ui-label><span slot="supportive">Default supportive text</span></ui-input>
      <ui-input status="warning" value="Might be wrong"><ui-label slot="label">Warning</ui-label><span slot="supportive">Please double-check this value</span></ui-input>
      <ui-input status="error" value="Invalid"><ui-label slot="label">Error</ui-label><span slot="supportive">This field is required</span></ui-input>
      <ui-input error value="Invalid"><ui-label slot="label">Error (boolean)</ui-label><span slot="supportive">This field has an error</span></ui-input>
      <ui-input status="success" value="Valid input"><ui-label slot="label">Success</ui-label><span slot="supportive">Looks good!</span></ui-input>
      <ui-input status="loading" value="Checking..."><ui-label slot="label">Loading</ui-label><span slot="supportive">Validating...</span></ui-input>
    </div>

    <h3>With Label &amp; Supportive Text</h3>
    <div class="stack-m w-320">
      <ui-input placeholder="you@example.com"><ui-label slot="label">Email</ui-label><span slot="supportive">We'll never share your email</span></ui-input>
      <ui-input placeholder="johndoe"><ui-label slot="label">Username</ui-label><ui-label slot="secondary-label" emphasis="subtle">Optional</ui-label></ui-input>
      <ui-input placeholder="Enter password"><ui-label slot="label">Password</ui-label><span slot="supportive">Must be at least 8 characters</span></ui-input>
    </div>

    <h3>Leading &amp; Trailing Elements</h3>
    <div class="stack-m w-320">
      <ui-input placeholder="Search...">
        <ui-label slot="label">Search</ui-label>
        <ui-icon name="search" size="m" slot="leading"></ui-icon>
      </ui-input>
      <ui-input placeholder="0.00">
        <ui-label slot="label">Amount</ui-label>
        <ui-icon name="attach_money" size="m" slot="leading"></ui-icon>
      </ui-input>
      <ui-input placeholder="0" value="72">
        <ui-label slot="label">Weight</ui-label>
        <span slot="trailing" class="text-secondary">kg</span>
      </ui-input>
      <ui-input placeholder="example.com">
        <ui-label slot="label">Website</ui-label>
        <span slot="trailing" class="text-secondary">.com</span>
      </ui-input>
    </div>

    <h3>Full Featured</h3>
    <div class="stack-l w-400">
      <ui-input type="clearable" placeholder="you@example.com" value="john@example.com" status="success">
        <ui-label slot="label">Email Address</ui-label>
        <ui-label slot="secondary-label" emphasis="subtle">Required</ui-label>
        <span slot="supportive">Email verified successfully</span>
        <ui-icon name="mail" size="m" slot="leading"></ui-icon>
      </ui-input>
      <ui-input type="numeric" placeholder="0" value="5"><ui-label slot="label">Quantity</ui-label><ui-label slot="secondary-label" emphasis="subtle">Max 99</ui-label><span slot="supportive">Enter the number of items</span></ui-input>
      <ui-input size="l" placeholder="Enter a description...">
        <ui-label slot="label">Description</ui-label>
        <ui-label slot="secondary-label" emphasis="subtle">Optional</ui-label>
        <span slot="supportive">Maximum 200 characters</span>
        <span slot="trailing" class="text-secondary">0/200</span>
      </ui-input>
    </div>

    <h3>Input Group</h3>
    <div class="stack-m w-400">
      <ui-input-group size="m">
        <span slot="prefix">https://</span>
        <ui-input aria-label="URL" placeholder="www.example.com"></ui-input>
        <span slot="suffix">Open URL</span>
      </ui-input-group>
      <ui-input-group size="m">
        <span slot="prefix">$</span>
        <ui-input aria-label="Amount" placeholder="0.00"></ui-input>
      </ui-input-group>
      <ui-input-group size="m">
        <ui-input aria-label="Email" placeholder="Enter email"></ui-input>
        <span slot="suffix">@gmail.com</span>
      </ui-input-group>
    </div>

    <h3>Input Group Sizes</h3>
    <div class="stack-m w-400">
      <ui-input-group size="s">
        <span slot="prefix">https://</span>
        <ui-input size="s" aria-label="URL" placeholder="www.example.com"></ui-input>
        <span slot="suffix">Open URL</span>
      </ui-input-group>
      <ui-input-group size="m">
        <span slot="prefix">https://</span>
        <ui-input size="m" aria-label="URL" placeholder="www.example.com"></ui-input>
        <span slot="suffix">Open URL</span>
      </ui-input-group>
      <ui-input-group size="l">
        <span slot="prefix">https://</span>
        <ui-input size="l" aria-label="URL" placeholder="www.example.com"></ui-input>
        <span slot="suffix">Open URL</span>
      </ui-input-group>
    </div>
  `,
});
