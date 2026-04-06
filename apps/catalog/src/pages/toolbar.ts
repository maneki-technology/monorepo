import { registerPage } from "../registry.js";
import "@maneki/ui-components/components/ui-toolbar.js";
import "@maneki/ui-components/components/ui-toolbar-separator.js";
import "@maneki/ui-components/components/ui-button.js";
import "@maneki/ui-components/components/ui-button-group.js";
import "@maneki/ui-components/components/ui-icon.js";

registerPage("toolbar", {
  title: "Toolbar",
  section: "Containers",
  render: () => `
    <h3>Default (Horizontal)</h3>
    <div class="variant-row">
      <ui-toolbar aria-label="Text formatting">
        <ui-button-group action="secondary">
          <ui-button icon="icon-only" size="s" action="secondary" aria-label="Share"><ui-icon name="share" size="s" slot="icon-start"></ui-icon></ui-button>
          <ui-button icon="icon-only" size="s" action="secondary" aria-label="Download"><ui-icon name="download" size="s" slot="icon-start"></ui-icon></ui-button>
          <ui-button icon="icon-only" size="s" action="secondary" aria-label="Upload"><ui-icon name="upload" size="s" slot="icon-start"></ui-icon></ui-button>
        </ui-button-group>
        <ui-toolbar-separator></ui-toolbar-separator>
        <ui-button-group action="secondary">
          <ui-button icon="icon-only" size="s" action="secondary" aria-label="Grid view"><ui-icon name="grid_view" size="s" slot="icon-start"></ui-icon></ui-button>
          <ui-button icon="icon-only" size="s" action="secondary" aria-label="Bar chart"><ui-icon name="bar_chart" size="s" slot="icon-start"></ui-icon></ui-button>
          <ui-button icon="icon-only" size="s" action="secondary" aria-label="Calendar"><ui-icon name="calendar_today" size="s" slot="icon-start"></ui-icon></ui-button>
          <ui-button icon="icon-only" size="s" action="secondary" aria-label="Schedule"><ui-icon name="schedule" size="s" slot="icon-start"></ui-icon></ui-button>
        </ui-button-group>
        <ui-toolbar-separator></ui-toolbar-separator>
        <ui-button-group action="secondary">
          <ui-button icon="icon-only" size="s" action="secondary" aria-label="Delete"><ui-icon name="delete" size="s" slot="icon-start"></ui-icon></ui-button>
          <ui-button icon="icon-only" size="s" action="secondary" aria-label="Refresh"><ui-icon name="refresh" size="s" slot="icon-start"></ui-icon></ui-button>
          <ui-button size="s" action="secondary" icon="leading-icon"><ui-icon name="add" size="s" slot="icon-start"></ui-icon>Insert</ui-button>
        </ui-button-group>
      </ui-toolbar>
    </div>

    <h3>Attached (Floating)</h3>
    <div class="variant-row" style="padding: 32px; background: var(--fd-surface-secondary, #f5f5f5); border-radius: 12px;">
      <ui-toolbar attached aria-label="Floating toolbar">
        <ui-button-group action="secondary">
          <ui-button icon="icon-only" size="s" action="secondary" aria-label="Share"><ui-icon name="share" size="s" slot="icon-start"></ui-icon></ui-button>
          <ui-button icon="icon-only" size="s" action="secondary" aria-label="Download"><ui-icon name="download" size="s" slot="icon-start"></ui-icon></ui-button>
        </ui-button-group>
        <ui-toolbar-separator></ui-toolbar-separator>
        <ui-button-group action="secondary">
          <ui-button icon="icon-only" size="s" action="secondary" aria-label="Settings"><ui-icon name="settings" size="s" slot="icon-start"></ui-icon></ui-button>
          <ui-button icon="icon-only" size="s" action="secondary" aria-label="More"><ui-icon name="more_vert" size="s" slot="icon-start"></ui-icon></ui-button>
        </ui-button-group>
      </ui-toolbar>
    </div>

    <h3>Vertical</h3>
    <div class="variant-row">
      <ui-toolbar orientation="vertical" aria-label="Vertical toolbar">
        <ui-button-group action="secondary" orientation="vertical">
          <ui-button icon="icon-only" size="s" action="secondary" aria-label="Home"><ui-icon name="home" size="s" slot="icon-start"></ui-icon></ui-button>
          <ui-button icon="icon-only" size="s" action="secondary" aria-label="Search"><ui-icon name="search" size="s" slot="icon-start"></ui-icon></ui-button>
          <ui-button icon="icon-only" size="s" action="secondary" aria-label="Person"><ui-icon name="person" size="s" slot="icon-start"></ui-icon></ui-button>
        </ui-button-group>
        <ui-toolbar-separator></ui-toolbar-separator>
        <ui-button-group action="secondary" orientation="vertical">
          <ui-button icon="icon-only" size="s" action="secondary" aria-label="Settings"><ui-icon name="settings" size="s" slot="icon-start"></ui-icon></ui-button>
          <ui-button icon="icon-only" size="s" action="secondary" aria-label="Notifications"><ui-icon name="notifications" size="s" slot="icon-start"></ui-icon></ui-button>
        </ui-button-group>
      </ui-toolbar>
    </div>

    <h3>Vertical Attached</h3>
    <div class="variant-row" style="padding: 32px; background: var(--fd-surface-secondary, #f5f5f5); border-radius: 12px;">
      <ui-toolbar orientation="vertical" attached aria-label="Vertical floating toolbar">
        <ui-button-group action="secondary" orientation="vertical">
          <ui-button icon="icon-only" size="s" action="secondary" aria-label="Home"><ui-icon name="home" size="s" slot="icon-start"></ui-icon></ui-button>
          <ui-button icon="icon-only" size="s" action="secondary" aria-label="Search"><ui-icon name="search" size="s" slot="icon-start"></ui-icon></ui-button>
          <ui-button icon="icon-only" size="s" action="secondary" aria-label="Person"><ui-icon name="person" size="s" slot="icon-start"></ui-icon></ui-button>
        </ui-button-group>
        <ui-toolbar-separator></ui-toolbar-separator>
        <ui-button-group action="secondary" orientation="vertical">
          <ui-button icon="icon-only" size="s" action="secondary" aria-label="Settings"><ui-icon name="settings" size="s" slot="icon-start"></ui-icon></ui-button>
        </ui-button-group>
      </ui-toolbar>
    </div>
  `,
});
