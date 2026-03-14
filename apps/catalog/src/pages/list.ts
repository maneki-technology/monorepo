import { registerPage } from "../registry.js";

registerPage("list", {
  title: "List",
  section: "List",
  render: () => `
    <h3>Sizes</h3>
    <div class="variant-row row-start-wrap">
      ${["s", "m", "l"].map(size => `
        <div class="variant-col" style="min-width:240px">
          <span class="variant-label">Size ${size}</span>
          <ui-list-item size="${size}">Basic item</ui-list-item>
        </div>
      `).join("")}
    </div>

    <h3>With Description</h3>
    <div class="w-360">
      <ui-list-item size="m" description="Supporting text that describes this item in more detail">Multi-line list item</ui-list-item>
    </div>

    <h3>Leading Icon</h3>
    <div class="w-360">
      <ui-list-item size="m" leading="icon"><ui-icon slot="leading" name="home" size="s"></ui-icon>Home</ui-list-item>
      <ui-list-item size="m" leading="icon"><ui-icon slot="leading" name="settings" size="s"></ui-icon>Settings</ui-list-item>
      <ui-list-item size="m" leading="icon"><ui-icon slot="leading" name="person" size="s"></ui-icon>Profile</ui-list-item>
    </div>

    <h3>Leading Avatar</h3>
    <div class="w-360">
      <ui-list-item size="m" leading="avatar"><ui-avatar slot="leading" size="s" type="text" color="blue">AB</ui-avatar>Alice Brown</ui-list-item>
      <ui-list-item size="m" leading="avatar"><ui-avatar slot="leading" size="s" type="text" color="green">CD</ui-avatar>Charlie Davis</ui-list-item>
    </div>

    <h3>Selected</h3>
    <div class="w-360">
      <ui-list-item size="m" selected>Selected item</ui-list-item>
      <ui-list-item size="m">Unselected item</ui-list-item>
    </div>

    <h3>Trailing Icon</h3>
    <div class="w-360">
      <ui-list-item size="m" trailing-icon>Navigate<ui-icon slot="trailing" name="chevron_right" size="xs"></ui-icon></ui-list-item>
      <ui-list-item size="m" trailing-icon>Another item<ui-icon slot="trailing" name="chevron_right" size="xs"></ui-icon></ui-list-item>
    </div>

    <h3>With Top Border</h3>
    <div class="w-360">
      <ui-list-item size="m" top-border>Item with top border</ui-list-item>
      <ui-list-item size="m" top-border>Another bordered item</ui-list-item>
      <ui-list-item size="m" top-border>Third bordered item</ui-list-item>
    </div>

    <h3>Padding Variants</h3>
    <div class="variant-row row-start-wrap">
      ${["none", "s", "m"].map(p => `
        <div class="variant-col">
          <span class="variant-label">Padding ${p}</span>
          <ui-list-item size="m" padding="${p}">Padding ${p}</ui-list-item>
        </div>
      `).join("")}
    </div>

    <h3>List Header</h3>
    <div class="w-360">
      <ui-list-header size="m">Section Header</ui-list-header>
      <ui-list-item size="m">Item one</ui-list-item>
      <ui-list-item size="m">Item two</ui-list-item>
    </div>

    <h3>List Group</h3>
    <div class="w-360">
      <ui-list-group size="m">
        <ui-list-header slot="header" size="m">Group Header</ui-list-header>
        <ui-list-item top-border>First item</ui-list-item>
        <ui-list-item top-border>Second item</ui-list-item>
        <ui-list-item top-border>Third item</ui-list-item>
      </ui-list-group>
    </div>

    <h3>Group with Leading Icons &amp; Description</h3>
    <div class="w-360">
      <ui-list-group size="m">
        <ui-list-header slot="header">Notifications</ui-list-header>
        <ui-list-item top-border leading="icon" description="You have 3 new messages in your inbox">
          <ui-icon slot="leading" name="mail" size="s"></ui-icon>
          New Messages
        </ui-list-item>
        <ui-list-item top-border leading="icon" description="Your monthly report is ready to download">
          <ui-icon slot="leading" name="download" size="s"></ui-icon>
          Report Ready
        </ui-list-item>
        <ui-list-item top-border leading="icon" description="2 team members joined your project">
          <ui-icon slot="leading" name="group" size="s"></ui-icon>
          Team Update
        </ui-list-item>
        <ui-list-item top-border leading="icon" description="System maintenance scheduled for tonight">
          <ui-icon slot="leading" name="settings" size="s"></ui-icon>
          Maintenance
        </ui-list-item>
        <ui-list-item top-border leading="icon" description="Your file has been shared with 5 people">
          <ui-icon slot="leading" name="share" size="s"></ui-icon>
          File Shared
        </ui-list-item>
      </ui-list-group>
    </div>

    <h3>Group Sizes</h3>
    <div class="variant-row row-start-wrap">
      ${["s", "m", "l"].map(size => `
        <div class="variant-col">
          <span class="variant-label">Size ${size}</span>
          <ui-list-group size="${size}">
            <ui-list-header slot="header">${size.toUpperCase()} Group</ui-list-header>
            <ui-list-item top-border>Item 1</ui-list-item>
            <ui-list-item top-border>Item 2</ui-list-item>
            <ui-list-item top-border>Item 3</ui-list-item>
          </ui-list-group>
        </div>
      `).join("")}
    </div>

    <h3>Collapsed Group</h3>
    <div class="w-360">
      <ui-list-group size="m" collapsed>
        <ui-list-header slot="header">Collapsed Section</ui-list-header>
        <ui-list-item top-border>Item 1</ui-list-item>
        <ui-list-item top-border>Item 2</ui-list-item>
        <ui-list-item top-border>Item 3</ui-list-item>
      </ui-list-group>
    </div>
  `,
});
