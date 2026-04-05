import { registerPage } from "../registry.js";
import "@maneki/ui-components/components/ui-button.js";
import "@maneki/ui-components/components/ui-button-group.js";
import "@maneki/ui-components/components/ui-icon.js";

registerPage("button-group", {
  title: "Button Group",
  section: "Containers",
  render: () => `
    <h3>Default</h3>
    <div class="variant-row">
      <ui-button-group>
        <ui-button>Merge pull request</ui-button>
        <ui-button icon="icon-only" aria-label="More"><ui-icon name="expand_more" size="m" slot="icon-start"></ui-icon></ui-button>
      </ui-button-group>
    </div>

    <h3>Actions</h3>
    <div class="variant-col">
      ${["primary", "secondary", "destructive", "info", "contrast"]
        .map(
          (action) => `
        <ui-button-group action="${action}">
          <ui-button>One</ui-button>
          <ui-button>Two</ui-button>
          <ui-button>Three</ui-button>
        </ui-button-group>
      `,
        )
        .join("")}
    </div>

    <h3>Emphases</h3>
    <div class="variant-col">
      ${["bold", "subtle", "minimal"]
        .map(
          (emphasis) => `
        <ui-button-group emphasis="${emphasis}">
          <ui-button>One</ui-button>
          <ui-button>Two</ui-button>
          <ui-button>Three</ui-button>
        </ui-button-group>
      `,
        )
        .join("")}
    </div>

    <h3>Sizes</h3>
    <div class="variant-row">
      <ui-button-group size="s">
        <ui-button>Small</ui-button>
        <ui-button>Group</ui-button>
      </ui-button-group>
      <ui-button-group size="m">
        <ui-button>Medium</ui-button>
        <ui-button>Group</ui-button>
      </ui-button-group>
      <ui-button-group size="l">
        <ui-button>Large</ui-button>
        <ui-button>Group</ui-button>
      </ui-button-group>
    </div>

    <h3>Shapes</h3>
    <div class="variant-row">
      <ui-button-group>
        <ui-button>Basic</ui-button>
        <ui-button>Shape</ui-button>
      </ui-button-group>
      <ui-button-group shape="rounded">
        <ui-button>Rounded</ui-button>
        <ui-button>Shape</ui-button>
      </ui-button-group>
    </div>

    <h3>With Icons</h3>
    <div class="variant-row">
      <ui-button-group>
        <ui-button icon="leading-icon"><ui-icon name="share" size="m" slot="icon-start"></ui-icon>Share</ui-button>
        <ui-button icon="leading-icon"><ui-icon name="download" size="m" slot="icon-start"></ui-icon>Download</ui-button>
        <ui-button icon="leading-icon"><ui-icon name="upload" size="m" slot="icon-start"></ui-icon>Upload</ui-button>
      </ui-button-group>
    </div>

    <h3>Icon Only</h3>
    <div class="variant-row">
      <ui-button-group>
        <ui-button icon="icon-only" aria-label="Share"><ui-icon name="share" size="m" slot="icon-start"></ui-icon></ui-button>
        <ui-button icon="icon-only" aria-label="Download"><ui-icon name="download" size="m" slot="icon-start"></ui-icon></ui-button>
        <ui-button icon="icon-only" aria-label="Upload"><ui-icon name="upload" size="m" slot="icon-start"></ui-icon></ui-button>
      </ui-button-group>
    </div>
  `,
});
