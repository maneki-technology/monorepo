import { registerPage } from "../registry.js";
import "@maneki/ui-components/components/ui-input.js";
import "@maneki/ui-components/components/ui-step-group.js";
import "@maneki/ui-components/components/ui-step-item.js";
import "@maneki/ui-components/components/ui-wizard.js";

registerPage("wizard", {
  title: "Wizard",
  section: "Navigation",
  render: () => `
    <h3>Horizontal</h3>
    <div style="height: 422px; width: 760px; border: 1px solid var(--fd-border-minimal, #dce3e8); border-radius: 4px; overflow: hidden;">
      <ui-wizard layout="horizontal" title="Wizard Title Small" current-step="3">
        <ui-step-group slot="steps">
          <ui-step-item label="Account"></ui-step-item>
          <ui-step-item label="Profile"></ui-step-item>
          <ui-step-item label="Contact"></ui-step-item>
          <ui-step-item label="Review"></ui-step-item>
          <ui-step-item label="Payment"></ui-step-item>
          <ui-step-item label="Confirm"></ui-step-item>
        </ui-step-group>
        <div style="padding: 24px;">
          <h4 style="margin: 0 0 8px; font-size: 16px; font-weight: 500; color: var(--fd-text-primary, #1c2b36);">3. Contact Information</h4>
          <p style="margin: 0 0 16px; font-size: 14px; color: var(--fd-text-secondary, #3e5463);">Enter the following information to complete the section.</p>
          <ui-input size="m" placeholder="Enter email"><ui-label slot="label" size="m">Email</ui-label></ui-input>
          <div style="height: 16px;"></div>
          <ui-input size="m" placeholder="Enter phone number"><ui-label slot="label" size="m">Phone</ui-label></ui-input>
        </div>
      </ui-wizard>
    </div>

    <h3>Vertical</h3>
    <div style="height: 460px; width: 760px; border: 1px solid var(--fd-border-minimal, #dce3e8); border-radius: 4px; overflow: hidden;">
      <ui-wizard layout="vertical" title="Wizard Title Large" current-step="3">
        <ui-step-group slot="steps">
          <ui-step-item label="Account" sublabel="Optional"></ui-step-item>
          <ui-step-item label="Profile" sublabel="Optional"></ui-step-item>
          <ui-step-item label="Contact" sublabel="Optional"></ui-step-item>
          <ui-step-item label="Review" sublabel="Optional"></ui-step-item>
          <ui-step-item label="Confirm" sublabel="Optional"></ui-step-item>
        </ui-step-group>
        <div style="padding: 24px;">
          <h4 style="margin: 0 0 8px; font-size: 16px; font-weight: 500; color: var(--fd-text-primary, #1c2b36);">3. Step Active Heading</h4>
          <p style="margin: 0 0 16px; font-size: 14px; color: var(--fd-text-secondary, #3e5463);">Enter the following information, in order to complete the section.</p>
          <ui-input size="m" placeholder="Placeholder Label"><ui-label slot="label" size="m">Label</ui-label></ui-input>
          <div style="height: 16px;"></div>
          <ui-input size="m" placeholder="Placeholder Label"><ui-label slot="label" size="m">Label</ui-label></ui-input>
        </div>
      </ui-wizard>
    </div>

    <h3>First Step (Previous disabled)</h3>
    <div style="height: 422px; width: 760px; border: 1px solid var(--fd-border-minimal, #dce3e8); border-radius: 4px; overflow: hidden;">
      <ui-wizard layout="horizontal" title="First Step" current-step="1">
        <ui-step-group slot="steps">
          <ui-step-item label="Step 1"></ui-step-item>
          <ui-step-item label="Step 2"></ui-step-item>
          <ui-step-item label="Step 3"></ui-step-item>
        </ui-step-group>
        <div style="padding: 24px; color: var(--fd-text-secondary, #3e5463); font-size: 14px;">
          First step content. Previous button is disabled.
        </div>
      </ui-wizard>
    </div>

    <h3>Last Step (Finish button)</h3>
    <div style="height: 422px; width: 760px; border: 1px solid var(--fd-border-minimal, #dce3e8); border-radius: 4px; overflow: hidden;">
      <ui-wizard layout="horizontal" title="Last Step" current-step="3">
        <ui-step-group slot="steps">
          <ui-step-item label="Step 1"></ui-step-item>
          <ui-step-item label="Step 2"></ui-step-item>
          <ui-step-item label="Step 3"></ui-step-item>
        </ui-step-group>
        <div style="padding: 24px; color: var(--fd-text-secondary, #3e5463); font-size: 14px;">
          Last step content. Next button shows "Finish".
        </div>
      </ui-wizard>
    </div>
  `,
});
