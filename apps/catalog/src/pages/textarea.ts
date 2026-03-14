import { registerPage } from "../registry.js";

registerPage("textarea", {
  title: "Textarea",
  section: "Form Controls",
  render: () => `
    <h3>Sizes</h3>
    <div class="stack-m w-320">
      <ui-textarea size="s" label="Small" placeholder="Size S"></ui-textarea>
      <ui-textarea size="m" label="Medium" placeholder="Size M"></ui-textarea>
      <ui-textarea size="l" label="Large" placeholder="Size L"></ui-textarea>
    </div>

    <h3>States</h3>
    <div class="stack-m w-320">
      <ui-textarea label="Enabled" placeholder="Default state"></ui-textarea>
      <ui-textarea label="Filled" value="Some value entered by the user"></ui-textarea>
      <ui-textarea label="Disabled" placeholder="Cannot edit" disabled></ui-textarea>
      <ui-textarea label="Disabled filled" value="Cannot edit this content" disabled></ui-textarea>
      <ui-textarea label="Readonly" value="Read only value" readonly></ui-textarea>
    </div>

    <h3>Statuses</h3>
    <div class="stack-m w-320">
      <ui-textarea status="none" label="None" secondary-label="Default secondary text" placeholder="No status"></ui-textarea>
      <ui-textarea status="warning" label="Warning" secondary-label="Please double-check this value" value="Might be wrong"></ui-textarea>
      <ui-textarea status="error" label="Error" secondary-label="This field is required" value="Invalid"></ui-textarea>
      <ui-textarea error label="Error (boolean)" secondary-label="This field has an error" value="Invalid"></ui-textarea>
      <ui-textarea status="success" label="Success" secondary-label="Looks good!" value="Valid input"></ui-textarea>
      <ui-textarea status="loading" label="Loading" secondary-label="Validating..." value="Checking..."></ui-textarea>
    </div>

    <h3>With Labels</h3>
    <div class="stack-m w-320">
      <ui-textarea label="Description" placeholder="Enter a description..."></ui-textarea>
      <ui-textarea label="Bio" placeholder="Tell us about yourself..." maxlength="200"></ui-textarea>
    </div>

    <h3>With Secondary Label</h3>
    <div class="stack-m w-320">
      <ui-textarea label="Notes" placeholder="Add notes..." secondary-label="Optional"></ui-textarea>
      <ui-textarea label="Feedback" placeholder="Share your feedback..." secondary-label="Max 500 characters"></ui-textarea>
    </div>

    <h3>Full Featured</h3>
    <div class="stack-l w-400">
      <ui-textarea size="m" label="Description" secondary-label="Required" placeholder="Enter a detailed description..." value="This is a fully featured textarea with all options enabled." maxlength="300" status="success"></ui-textarea>
      <ui-textarea size="l" label="Comments" secondary-label="Optional" placeholder="Leave a comment..." rows="6" maxlength="500"></ui-textarea>
    </div>
  `,
});
