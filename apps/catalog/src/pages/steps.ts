import { registerPage } from "../registry.js";

registerPage("steps", {
  title: "Steps",
  section: "Navigation",
  render: () => `
    <h3>Horizontal — Size M</h3>
    <div class="w-600">
      <ui-step-group size="m" orientation="horizontal" current-step="3" labels>
        <ui-step-item label="Account" sublabel="Create account"></ui-step-item>
        <ui-step-item label="Profile" sublabel="Personal info"></ui-step-item>
        <ui-step-item label="Contact" sublabel="Contact info"></ui-step-item>
        <ui-step-item label="Review" sublabel="Review details"></ui-step-item>
        <ui-step-item label="Payment" sublabel="Add payment"></ui-step-item>
        <ui-step-item label="Confirm" sublabel="Confirmation"></ui-step-item>
      </ui-step-group>
    </div>

    <h3>Horizontal — Size S</h3>
    <div class="w-480">
      <ui-step-group size="s" orientation="horizontal" current-step="3" labels>
        <ui-step-item label="Account" sublabel="Step 1"></ui-step-item>
        <ui-step-item label="Profile" sublabel="Step 2"></ui-step-item>
        <ui-step-item label="Contact" sublabel="Step 3"></ui-step-item>
        <ui-step-item label="Review" sublabel="Step 4"></ui-step-item>
        <ui-step-item label="Payment" sublabel="Step 5"></ui-step-item>
        <ui-step-item label="Confirm" sublabel="Step 6"></ui-step-item>
      </ui-step-group>
    </div>

    <h3>Vertical — Size M</h3>
    <div style="height: 420px;">
      <ui-step-group size="m" orientation="vertical" current-step="3" labels>
        <ui-step-item label="Account" sublabel="Create account"></ui-step-item>
        <ui-step-item label="Profile" sublabel="Personal info"></ui-step-item>
        <ui-step-item label="Contact" sublabel="Contact info"></ui-step-item>
        <ui-step-item label="Review" sublabel="Review details"></ui-step-item>
        <ui-step-item label="Payment" sublabel="Add payment"></ui-step-item>
        <ui-step-item label="Confirm" sublabel="Confirmation"></ui-step-item>
      </ui-step-group>
    </div>

    <h3>Statuses (M)</h3>
    <div class="variant-row gap-40">
      <div class="variant-col items-center">
        <span class="variant-label">Complete</span>
        <ui-step-item size="m" status="complete" labels label="Done" sublabel="Finished"></ui-step-item>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Active</span>
        <ui-step-item size="m" status="active" labels label="Current" sublabel="In progress"></ui-step-item>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Incomplete</span>
        <ui-step-item size="m" status="incomplete" labels label="Pending" sublabel="Not started"></ui-step-item>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Disabled</span>
        <ui-step-item size="m" status="disabled" labels label="Locked" sublabel="Unavailable"></ui-step-item>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Error</span>
        <ui-step-item size="m" status="error" labels label="Failed" sublabel="Fix required"></ui-step-item>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Warning</span>
        <ui-step-item size="m" status="warning" labels label="Attention" sublabel="Review needed"></ui-step-item>
      </div>
    </div>

    <h3>Without Labels</h3>
    <div class="w-600">
      <ui-step-group size="m" orientation="horizontal" current-step="3">
        <ui-step-item></ui-step-item>
        <ui-step-item></ui-step-item>
        <ui-step-item></ui-step-item>
        <ui-step-item></ui-step-item>
        <ui-step-item></ui-step-item>
        <ui-step-item></ui-step-item>
      </ui-step-group>
    </div>
  `,
});
