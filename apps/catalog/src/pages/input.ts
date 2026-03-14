import { registerPage } from "../registry.js";

registerPage("input", {
  title: "Input",
  section: "Form Controls",
  render: () => `
    <h3>Sizes</h3>
    <div class="stack-m w-320">
      <ui-input size="s" label="Small" placeholder="Size S"></ui-input>
      <ui-input size="m" label="Medium" placeholder="Size M"></ui-input>
      <ui-input size="l" label="Large" placeholder="Size L"></ui-input>
    </div>

    <h3>Types</h3>
    <div class="stack-m w-320">
      <ui-input type="text" label="Text" placeholder="Enter text..."></ui-input>
      <ui-input type="numeric" label="Numeric" value="10"></ui-input>
      <ui-input type="clearable" label="Clearable" value="Clear me"></ui-input>
      <ui-input type="password" label="Password" value="secret123"></ui-input>
    </div>

    <h3>States</h3>
    <div class="stack-m w-320">
      <ui-input label="Enabled" placeholder="Default state"></ui-input>
      <ui-input label="Filled" value="Some value"></ui-input>
      <ui-input label="Disabled" placeholder="Cannot edit" disabled></ui-input>
      <ui-input label="Disabled filled" value="Cannot edit" disabled></ui-input>
      <ui-input label="Readonly" value="Read only value" readonly></ui-input>
    </div>

    <h3>Statuses</h3>
    <div class="stack-m w-320">
      <ui-input status="none" label="None" supportive="Default supportive text" placeholder="No status"></ui-input>
      <ui-input status="warning" label="Warning" supportive="Please double-check this value" value="Might be wrong"></ui-input>
      <ui-input status="error" label="Error" supportive="This field is required" value="Invalid"></ui-input>
      <ui-input error label="Error (boolean)" supportive="This field has an error" value="Invalid"></ui-input>
      <ui-input status="success" label="Success" supportive="Looks good!" value="Valid input"></ui-input>
      <ui-input status="loading" label="Loading" supportive="Validating..." value="Checking..."></ui-input>
    </div>

    <h3>With Label &amp; Supportive Text</h3>
    <div class="stack-m w-320">
      <ui-input label="Email" supportive="We'll never share your email" placeholder="you@example.com"></ui-input>
      <ui-input label="Username" secondary-label="Optional" placeholder="johndoe"></ui-input>
      <ui-input label="Password" placeholder="Enter password" supportive="Must be at least 8 characters"></ui-input>
    </div>

    <h3>Leading &amp; Trailing Elements</h3>
    <div class="stack-m w-320">
      <ui-input label="Search" placeholder="Search...">
        <ui-icon name="search" size="m" slot="leading"></ui-icon>
      </ui-input>
      <ui-input label="Amount" placeholder="0.00">
        <ui-icon name="attach_money" size="m" slot="leading"></ui-icon>
      </ui-input>
      <ui-input label="Weight" placeholder="0" value="72">
        <span slot="trailing" class="text-secondary">kg</span>
      </ui-input>
      <ui-input label="Website" placeholder="example.com">
        <span slot="trailing" class="text-secondary">.com</span>
      </ui-input>
    </div>

    <h3>Full Featured</h3>
    <div class="stack-l w-400">
      <ui-input type="clearable" label="Email Address" secondary-label="Required" placeholder="you@example.com" value="john@example.com" status="success" supportive="Email verified successfully">
        <ui-icon name="mail" size="m" slot="leading"></ui-icon>
      </ui-input>
      <ui-input type="numeric" label="Quantity" secondary-label="Max 99" placeholder="0" value="5" supportive="Enter the number of items"></ui-input>
      <ui-input size="l" label="Description" secondary-label="Optional" placeholder="Enter a description..." supportive="Maximum 200 characters">
        <span slot="trailing" class="text-secondary">0/200</span>
      </ui-input>
    </div>

    <h3>Input Group</h3>
    <div class="stack-m w-400">
      <ui-input-group size="m">
        <span slot="prefix">https://</span>
        <ui-input placeholder="www.example.com"></ui-input>
        <span slot="suffix">Open URL</span>
      </ui-input-group>
      <ui-input-group size="m">
        <span slot="prefix">$</span>
        <ui-input placeholder="0.00"></ui-input>
      </ui-input-group>
      <ui-input-group size="m">
        <ui-input placeholder="Enter email"></ui-input>
        <span slot="suffix">@gmail.com</span>
      </ui-input-group>
    </div>

    <h3>Input Group Sizes</h3>
    <div class="stack-m w-400">
      <ui-input-group size="s">
        <span slot="prefix">https://</span>
        <ui-input size="s" placeholder="www.example.com"></ui-input>
        <span slot="suffix">Open URL</span>
      </ui-input-group>
      <ui-input-group size="m">
        <span slot="prefix">https://</span>
        <ui-input size="m" placeholder="www.example.com"></ui-input>
        <span slot="suffix">Open URL</span>
      </ui-input-group>
      <ui-input-group size="l">
        <span slot="prefix">https://</span>
        <ui-input size="l" placeholder="www.example.com"></ui-input>
        <span slot="suffix">Open URL</span>
      </ui-input-group>
    </div>
  `,
});
