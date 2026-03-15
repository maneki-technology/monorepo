import { registerPage } from "../registry.js";
import "@maneki/flex-layout";

const tabsHtml = `
  <ui-tab-group slot="tabs" size="s" closable>
    <ui-tab-item label="Tab 1" selected></ui-tab-item>
    <ui-tab-item label="Tab 2"></ui-tab-item>
    <ui-tab-item label="Tab 3"></ui-tab-item>
  </ui-tab-group>
`;

function dashboardLayout(size: string): string {
  return `
    <div class="demo-frame demo-frame-500">
      <flex-layout size="${size}">
        <flex-layout direction="column" size="${size}" class="flex-fill">
          <flex-panel>
            <flex-panel-header slot="header" heading="Card Heading" size="${size}" variant="tabs">${tabsHtml}</flex-panel-header>
            <div class="panel-content">Content</div>
          </flex-panel>
          <flex-layout size="${size}" class="flex-fill">
            <flex-panel>
              <flex-panel-header slot="header" heading="Card Heading" size="${size}" variant="tabs">${tabsHtml}</flex-panel-header>
              <div class="panel-content">Content</div>
            </flex-panel>
            <flex-panel>
              <flex-panel-header slot="header" heading="Card Heading" size="${size}" variant="tabs">${tabsHtml}</flex-panel-header>
              <div class="panel-content">Content</div>
            </flex-panel>
          </flex-layout>
        </flex-layout>
        <flex-panel width="300">
          <flex-panel-header slot="header" heading="Card Heading" size="${size}" variant="tabs">${tabsHtml}</flex-panel-header>
          <div class="panel-content">Content</div>
        </flex-panel>
      </flex-layout>
    </div>`;
}

registerPage("flex-layout", {
  title: "Flex Layout",
  section: "Layouts",
  render: () => `
    <h3>Large</h3>
    ${dashboardLayout("large")}

    <h3>Medium</h3>
    ${dashboardLayout("medium")}

    <h3>Small</h3>
    ${dashboardLayout("small")}

    <h3>Header: Tabs Only</h3>
    <div class="demo-frame demo-frame-400">
      <flex-layout size="medium">
        <flex-panel>
          <flex-panel-header slot="header" size="medium" variant="tabs">${tabsHtml}</flex-panel-header>
          <div class="panel-content">Content</div>
        </flex-panel>
        <flex-panel>
          <flex-panel-header slot="header" size="medium" variant="tabs">${tabsHtml}</flex-panel-header>
          <div class="panel-content">Content</div>
        </flex-panel>
      </flex-layout>
    </div>

    <h3>Header: Title Only</h3>
    <div class="demo-frame demo-frame-400">
      <flex-layout size="medium">
        <flex-panel>
          <flex-panel-header slot="header" heading="Card Heading" size="medium" variant="title"></flex-panel-header>
          <div class="panel-content">Content</div>
        </flex-panel>
        <flex-panel>
          <flex-panel-header slot="header" heading="Card Heading" size="medium" variant="title"></flex-panel-header>
          <div class="panel-content">Content</div>
        </flex-panel>
      </flex-layout>
    </div>

    <h3>Header: Title + Tabs</h3>
    <div class="demo-frame demo-frame-400">
      <flex-layout size="medium">
        <flex-panel>
          <flex-panel-header slot="header" heading="Card Heading" size="medium" variant="title-tabs">${tabsHtml}</flex-panel-header>
          <div class="panel-content">Content</div>
        </flex-panel>
        <flex-panel>
          <flex-panel-header slot="header" heading="Card Heading" size="medium" variant="title-tabs">${tabsHtml}</flex-panel-header>
          <div class="panel-content">Content</div>
        </flex-panel>
      </flex-layout>
    </div>
  `,
  });
