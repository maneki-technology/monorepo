import { registerPage } from "../registry.js";

registerPage("alert", {
  title: "Alert",
  section: "Primitives",
  render: () => `
    <h3>All Statuses (with icons)</h3>
    <div class="variant-group stack-s">
      <ui-alert status="none" leading-icon>
        <ui-icon name="notifications" size="m" slot="icon"></ui-icon>
        None status
      </ui-alert>
      <ui-alert status="information" leading-icon>
        <ui-icon name="info" size="m" slot="icon"></ui-icon>
        Information status
      </ui-alert>
      <ui-alert status="success" leading-icon>
        <ui-icon name="check_circle" size="m" slot="icon"></ui-icon>
        Success status
      </ui-alert>
      <ui-alert status="error" leading-icon>
        <ui-icon name="error" size="m" slot="icon"></ui-icon>
        Error status
      </ui-alert>
      <ui-alert status="warning" leading-icon>
        <ui-icon name="warning" size="m" slot="icon"></ui-icon>
        Warning status
      </ui-alert>
    </div>

    <h3>Sizes</h3>
    <div class="variant-group stack-s">
      <ui-alert status="information" size="s">Small alert</ui-alert>
      <ui-alert status="information" size="m">Medium alert</ui-alert>
      <ui-alert status="information" size="l">Large alert</ui-alert>
    </div>

    <h3>Bold Emphasis</h3>
    <div class="variant-group stack-s">
      <ui-alert status="information" emphasis="bold">Information bold</ui-alert>
      <ui-alert status="success" emphasis="bold">Success bold</ui-alert>
      <ui-alert status="error" emphasis="bold">Error bold</ui-alert>
      <ui-alert status="warning" emphasis="bold">Warning bold</ui-alert>
    </div>

    <h3>Subtle Emphasis</h3>
    <div class="variant-group stack-s">
      <ui-alert status="information" emphasis="subtle">Information subtle</ui-alert>
      <ui-alert status="success" emphasis="subtle">Success subtle</ui-alert>
      <ui-alert status="error" emphasis="subtle">Error subtle</ui-alert>
      <ui-alert status="warning" emphasis="subtle">Warning subtle</ui-alert>
    </div>

    <h3>With Description</h3>
    <div class="variant-group stack-s">
      <ui-alert status="information">
        Alert Title
        <span slot="description">This is a longer description that provides more context about the alert.</span>
      </ui-alert>
    </div>

    <h3>Dismissable</h3>
    <div class="variant-group stack-s">
      <ui-alert status="information" dismissable>This alert can be dismissed</ui-alert>
    </div>

    <h3>With Footer Button</h3>
    <div class="variant-group stack-s">
      <ui-alert status="none" leading-icon dismissable>
        <ui-icon name="notifications" size="m" slot="icon"></ui-icon>
        Alert Title
        <span slot="description">Description text explaining the alert in more detail.</span>
        <div slot="footer">
          <ui-button action="contrast" emphasis="subtle" size="s">Refresh</ui-button>
        </div>
      </ui-alert>
    </div>
  `,
});
