import { registerPage } from "../registry.js";

registerPage("dropdown", {
  title: "Dropdown",
  section: "Menus & Dropdowns",
  render: () => `
    <h3>Sizes</h3>
    <div class="variant-row">
      <div class="variant-col">
        <span class="variant-label">S</span>
        <ui-dropdown size="s" label="Small">
          <ui-dropdown-item>Profile</ui-dropdown-item>
          <ui-dropdown-item>Settings</ui-dropdown-item>
          <ui-dropdown-item>Log out</ui-dropdown-item>
        </ui-dropdown>
      </div>
      <div class="variant-col">
        <span class="variant-label">M</span>
        <ui-dropdown size="m" label="Medium">
          <ui-dropdown-item>Profile</ui-dropdown-item>
          <ui-dropdown-item>Settings</ui-dropdown-item>
          <ui-dropdown-item>Log out</ui-dropdown-item>
        </ui-dropdown>
      </div>
      <div class="variant-col">
        <span class="variant-label">L</span>
        <ui-dropdown size="l" label="Large">
          <ui-dropdown-item>Profile</ui-dropdown-item>
          <ui-dropdown-item>Settings</ui-dropdown-item>
          <ui-dropdown-item>Log out</ui-dropdown-item>
        </ui-dropdown>
      </div>
      <div class="variant-col">
        <span class="variant-label">XL</span>
        <ui-dropdown size="xl" label="Extra Large">
          <ui-dropdown-item>Profile</ui-dropdown-item>
          <ui-dropdown-item>Settings</ui-dropdown-item>
          <ui-dropdown-item>Log out</ui-dropdown-item>
        </ui-dropdown>
      </div>
    </div>

    <h3>All Actions</h3>
    <div class="variant-row row-wrap">
      <ui-dropdown action="primary" label="Primary">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown>
      <ui-dropdown action="secondary" label="Secondary">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown>
      <ui-dropdown action="destructive" label="Destructive">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown>
      <ui-dropdown action="info" label="Info">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown>
      <ui-dropdown action="contrast" label="Contrast">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown>
    </div>

    <h3>All Emphases</h3>
    <div class="variant-row">
      <ui-dropdown emphasis="bold" label="Bold">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown>
      <ui-dropdown emphasis="subtle" label="Subtle">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown>
      <ui-dropdown emphasis="minimal" label="Minimal">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown>
    </div>

    <h3>With Headings &amp; Separators</h3>
    <div class="variant-row">
      <ui-dropdown label="Actions">
        <ui-dropdown-heading>Edit</ui-dropdown-heading>
        <ui-dropdown-item>Cut</ui-dropdown-item>
        <ui-dropdown-item>Copy</ui-dropdown-item>
        <ui-dropdown-item>Paste</ui-dropdown-item>
        <ui-dropdown-separator></ui-dropdown-separator>
        <ui-dropdown-heading>View</ui-dropdown-heading>
        <ui-dropdown-item>Zoom in</ui-dropdown-item>
        <ui-dropdown-item>Zoom out</ui-dropdown-item>
        <ui-dropdown-item>Reset</ui-dropdown-item>
      </ui-dropdown>
    </div>

    <h3>Disabled</h3>
    <div class="variant-row">
      <ui-dropdown disabled label="Disabled">
        <ui-dropdown-item>Item 1</ui-dropdown-item>
        <ui-dropdown-item>Item 2</ui-dropdown-item>
      </ui-dropdown>
    </div>

    <h3>Rounded Shape</h3>
    <div class="variant-row">
      <ui-dropdown shape="rounded" label="Rounded">
        <ui-dropdown-item>Option A</ui-dropdown-item>
        <ui-dropdown-item>Option B</ui-dropdown-item>
        <ui-dropdown-item>Option C</ui-dropdown-item>
      </ui-dropdown>
    </div>

    <h3>Selectable (Single)</h3>
    <div class="variant-row">
      <ui-dropdown label="Choose fruit" selectable>
        <ui-dropdown-item value="apple">Apple</ui-dropdown-item>
        <ui-dropdown-item value="banana" selected>Banana</ui-dropdown-item>
        <ui-dropdown-item value="cherry">Cherry</ui-dropdown-item>
        <ui-dropdown-item value="date">Date</ui-dropdown-item>
      </ui-dropdown>
    </div>

    <h3>Selectable (Multi)</h3>
    <div class="variant-row">
      <ui-dropdown label="Select toppings" multiple selectable>
        <ui-dropdown-item value="cheese" selected>Cheese</ui-dropdown-item>
        <ui-dropdown-item value="pepperoni">Pepperoni</ui-dropdown-item>
        <ui-dropdown-item value="mushrooms" selected>Mushrooms</ui-dropdown-item>
        <ui-dropdown-item value="olives">Olives</ui-dropdown-item>
        <ui-dropdown-item value="onions">Onions</ui-dropdown-item>
      </ui-dropdown>
    </div>

    <h3>Split Dropdown</h3>
    <div class="variant-row">
      <ui-dropdown-split size="m" action="primary" label="Split Primary">
        <ui-dropdown-item value="a">Option A</ui-dropdown-item>
        <ui-dropdown-item value="b">Option B</ui-dropdown-item>
      </ui-dropdown-split>
      <ui-dropdown-split size="m" action="secondary" emphasis="subtle" label="Split Subtle">
        <ui-dropdown-item value="a">Option A</ui-dropdown-item>
        <ui-dropdown-item value="b">Option B</ui-dropdown-item>
      </ui-dropdown-split>
      <ui-dropdown-split size="m" action="destructive" label="Split Destructive">
        <ui-dropdown-item value="a">Option A</ui-dropdown-item>
        <ui-dropdown-item value="b">Option B</ui-dropdown-item>
      </ui-dropdown-split>
    </div>
  `,
});
