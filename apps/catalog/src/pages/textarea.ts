import { registerPage } from "../registry.js";
import "@maneki/ui-components/components/ui-textarea.js";

registerPage("textarea", {
  title: "Textarea",
  section: "Form Controls",
  render: () => `
    <h3>Sizes</h3>
    <div class="stack-m w-320">
      <ui-textarea size="s" placeholder="Size S"><ui-label slot="label" size="s">Small</ui-label></ui-textarea>
      <ui-textarea size="m" placeholder="Size M"><ui-label slot="label" size="m">Medium</ui-label></ui-textarea>
      <ui-textarea size="l" placeholder="Size L"><ui-label slot="label" size="l">Large</ui-label></ui-textarea>
    </div>

    <h3>States</h3>
    <div class="stack-m w-320">
      <ui-textarea placeholder="Default state"><ui-label slot="label">Enabled</ui-label></ui-textarea>
      <ui-textarea value="Some value entered by the user"><ui-label slot="label">Filled</ui-label></ui-textarea>
      <ui-textarea placeholder="Cannot edit" disabled><ui-label slot="label">Disabled</ui-label></ui-textarea>
      <ui-textarea value="Cannot edit this content" disabled><ui-label slot="label">Disabled filled</ui-label></ui-textarea>
      <ui-textarea value="Read only value" readonly><ui-label slot="label">Readonly</ui-label></ui-textarea>
    </div>

    <h3>Statuses</h3>
    <div class="stack-m w-320">
      <ui-textarea status="none" placeholder="No status"><ui-label slot="label">None</ui-label><ui-label slot="secondary-label" emphasis="subtle">Default secondary text</ui-label></ui-textarea>
      <ui-textarea status="warning" value="Might be wrong"><ui-label slot="label">Warning</ui-label><ui-label slot="secondary-label" emphasis="subtle">Please double-check this value</ui-label></ui-textarea>
      <ui-textarea status="error" value="Invalid"><ui-label slot="label">Error</ui-label><ui-label slot="secondary-label" emphasis="subtle">This field is required</ui-label></ui-textarea>
      <ui-textarea error value="Invalid"><ui-label slot="label">Error (boolean)</ui-label><ui-label slot="secondary-label" emphasis="subtle">This field has an error</ui-label></ui-textarea>
      <ui-textarea status="success" value="Valid input"><ui-label slot="label">Success</ui-label><ui-label slot="secondary-label" emphasis="subtle">Looks good!</ui-label></ui-textarea>
      <ui-textarea status="loading" value="Checking..."><ui-label slot="label">Loading</ui-label><ui-label slot="secondary-label" emphasis="subtle">Validating...</ui-label></ui-textarea>
    </div>

    <h3>With Labels</h3>
    <div class="stack-m w-320">
      <ui-textarea placeholder="Enter a description..."><ui-label slot="label">Description</ui-label></ui-textarea>
      <ui-textarea placeholder="Tell us about yourself..." maxlength="200"><ui-label slot="label">Bio</ui-label></ui-textarea>
    </div>

    <h3>With Secondary Label</h3>
    <div class="stack-m w-320">
      <ui-textarea placeholder="Add notes..."><ui-label slot="label">Notes</ui-label><ui-label slot="secondary-label" emphasis="subtle">Optional</ui-label></ui-textarea>
      <ui-textarea placeholder="Share your feedback..."><ui-label slot="label">Feedback</ui-label><ui-label slot="secondary-label" emphasis="subtle">Max 500 characters</ui-label></ui-textarea>
    </div>

    <h3>Full Featured</h3>
    <div class="stack-l w-400">
      <ui-textarea size="m" placeholder="Enter a detailed description..." value="This is a fully featured textarea with all options enabled." maxlength="300" status="success"><ui-label slot="label" size="m">Description</ui-label><ui-label slot="secondary-label" emphasis="subtle">Required</ui-label></ui-textarea>
      <ui-textarea size="l" placeholder="Leave a comment..." rows="6" maxlength="500"><ui-label slot="label" size="l">Comments</ui-label><ui-label slot="secondary-label" emphasis="subtle">Optional</ui-label></ui-textarea>
    </div>
  `,
});
