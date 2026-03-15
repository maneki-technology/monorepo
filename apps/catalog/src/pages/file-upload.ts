import { registerPage } from "../registry.js";

registerPage("file-upload", {
  title: "File Upload",
  section: "Form Controls",
  render: () => `
    <h3>Sizes</h3>
    <div class="stack-m w-320">
      <ui-file-upload size="s" placeholder="Small upload"></ui-file-upload>
      <ui-file-upload size="m" placeholder="Medium upload"></ui-file-upload>
      <ui-file-upload size="l" placeholder="Large upload"></ui-file-upload>
    </div>

    <h3>Disabled</h3>
    <div class="stack-m w-320">
      <ui-file-upload size="s" disabled placeholder="Cannot upload"></ui-file-upload>
      <ui-file-upload size="m" disabled placeholder="Cannot upload"></ui-file-upload>
      <ui-file-upload size="l" disabled placeholder="Cannot upload"></ui-file-upload>
    </div>

    <h3>With Accept Filter</h3>
    <div class="stack-m w-320">
      <ui-file-upload size="m" accept="image/*" placeholder="Select an image" button-text="Browse Images"></ui-file-upload>
      <ui-file-upload size="m" accept=".pdf,.doc,.docx" placeholder="Select a document" button-text="Browse Docs"></ui-file-upload>
    </div>

    <h3>Multiple Files</h3>
    <div class="stack-m w-320">
      <ui-file-upload size="m" multiple placeholder="Select multiple files"></ui-file-upload>
    </div>
  `,
});
