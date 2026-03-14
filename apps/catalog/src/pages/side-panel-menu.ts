import { registerPage } from "../registry.js";

registerPage("side-panel-menu", {
  title: "Side Panel Menu",
  section: "Navigation",
  render: () => `
    <h3>Expanded (with content area)</h3>
    <div class="layout-frame layout-frame-400">
      <ui-side-panel-menu state="expanded" title="Navigation">
        <ui-side-panel-menu-item leading-icon>
          <ui-icon slot="icon" name="home" size="m"></ui-icon>
          Dashboard
        </ui-side-panel-menu-item>
        <ui-side-panel-menu-item leading-icon selected>
          <ui-icon slot="icon" name="person" size="m"></ui-icon>
          Profile
        </ui-side-panel-menu-item>
        <ui-side-panel-menu-item leading-icon>
          <ui-icon slot="icon" name="bar_chart" size="m"></ui-icon>
          Analytics
        </ui-side-panel-menu-item>
        <ui-side-panel-menu-item leading-icon>
          <ui-icon slot="icon" name="mail" size="m"></ui-icon>
          Messages
        </ui-side-panel-menu-item>
        <ui-side-panel-menu-item leading-icon>
          <ui-icon slot="icon" name="settings" size="m"></ui-icon>
          Settings
        </ui-side-panel-menu-item>
      </ui-side-panel-menu>
      <div class="main-content">
        <p class="card-text">Main content area</p>
      </div>
    </div>

    <h3>Collapsed</h3>
    <div class="layout-frame layout-frame-400">
      <ui-side-panel-menu state="collapsed" title="Navigation">
        <ui-side-panel-menu-item leading-icon>
          <ui-icon slot="icon" name="home" size="m"></ui-icon>
          Dashboard
        </ui-side-panel-menu-item>
        <ui-side-panel-menu-item leading-icon selected>
          <ui-icon slot="icon" name="person" size="m"></ui-icon>
          Profile
        </ui-side-panel-menu-item>
        <ui-side-panel-menu-item leading-icon>
          <ui-icon slot="icon" name="bar_chart" size="m"></ui-icon>
          Analytics
        </ui-side-panel-menu-item>
        <ui-side-panel-menu-item leading-icon>
          <ui-icon slot="icon" name="settings" size="m"></ui-icon>
          Settings
        </ui-side-panel-menu-item>
      </ui-side-panel-menu>
      <div class="main-content">
        <p class="card-text">Main content area</p>
      </div>
    </div>

    <h3>With Nested Items</h3>
    <div class="layout-frame layout-frame-500">
      <ui-side-panel-menu title="Navigation">
        <ui-side-panel-menu-item leading-icon>
          <ui-icon slot="icon" name="home" size="m"></ui-icon>
          Dashboard
        </ui-side-panel-menu-item>
        <ui-side-panel-menu-item leading-icon expandable expanded child-parent-selected>
          <ui-icon slot="icon" name="group" size="m"></ui-icon>
          Users
          <ui-side-panel-menu-item slot="children" level="secondary" child-parent-selected>All Users</ui-side-panel-menu-item>
          <ui-side-panel-menu-item slot="children" level="secondary" selected>Active Users</ui-side-panel-menu-item>
          <ui-side-panel-menu-item slot="children" level="secondary">Inactive Users</ui-side-panel-menu-item>
        </ui-side-panel-menu-item>
        <ui-side-panel-menu-item leading-icon expandable>
          <ui-icon slot="icon" name="bar_chart" size="m"></ui-icon>
          Reports
          <ui-side-panel-menu-item slot="children" level="secondary">Monthly</ui-side-panel-menu-item>
          <ui-side-panel-menu-item slot="children" level="secondary">Quarterly</ui-side-panel-menu-item>
        </ui-side-panel-menu-item>
        <ui-side-panel-menu-item leading-icon>
          <ui-icon slot="icon" name="settings" size="m"></ui-icon>
          Settings
        </ui-side-panel-menu-item>
      </ui-side-panel-menu>
      <div class="main-content">
        <p class="card-text">Main content area</p>
      </div>
    </div>

    <h3>All States</h3>
    <div class="layout-frame layout-frame-500">
      <ui-side-panel-menu title="Item States">
        <ui-side-panel-menu-item leading-icon>
          <ui-icon slot="icon" name="home" size="m"></ui-icon>
          Enabled
        </ui-side-panel-menu-item>
        <ui-side-panel-menu-item leading-icon selected>
          <ui-icon slot="icon" name="person" size="m"></ui-icon>
          Selected
        </ui-side-panel-menu-item>
        <ui-side-panel-menu-item leading-icon child-parent-selected>
          <ui-icon slot="icon" name="bar_chart" size="m"></ui-icon>
          Child/Parent Selected
        </ui-side-panel-menu-item>
        <ui-side-panel-menu-item leading-icon disabled>
          <ui-icon slot="icon" name="mail" size="m"></ui-icon>
          Disabled
        </ui-side-panel-menu-item>
        <ui-side-panel-menu-item leading-icon expandable expanded child-parent-selected>
          <ui-icon slot="icon" name="group" size="m"></ui-icon>
          Expandable (Expanded)
          <ui-side-panel-menu-item slot="children" level="secondary">Secondary Item</ui-side-panel-menu-item>
          <ui-side-panel-menu-item slot="children" level="secondary" selected>Secondary Selected</ui-side-panel-menu-item>
        </ui-side-panel-menu-item>
      </ui-side-panel-menu>
      <div class="main-content">
        <p class="card-text">Main content area</p>
      </div>
    </div>

    <h3>Levels</h3>
    <div class="layout-frame layout-frame-400">
      <ui-side-panel-menu title="Levels">
        <ui-side-panel-menu-item leading-icon>
          <ui-icon slot="icon" name="home" size="m"></ui-icon>
          Primary Level
        </ui-side-panel-menu-item>
        <ui-side-panel-menu-item level="secondary">Secondary Level</ui-side-panel-menu-item>
        <ui-side-panel-menu-item level="tertiary">Tertiary Level</ui-side-panel-menu-item>
        <ui-side-panel-menu-item leading-icon>
          <ui-icon slot="icon" name="person" size="m"></ui-icon>
          Primary Level
        </ui-side-panel-menu-item>
        <ui-side-panel-menu-item level="secondary" selected>Secondary Selected</ui-side-panel-menu-item>
        <ui-side-panel-menu-item level="tertiary" selected>Tertiary Selected</ui-side-panel-menu-item>
      </ui-side-panel-menu>
      <div class="main-content">
        <p class="card-text">Main content area</p>
      </div>
    </div>
  `,
});
