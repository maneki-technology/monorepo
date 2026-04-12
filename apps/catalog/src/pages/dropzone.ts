import { registerPage } from "../registry.js";
import "@maneki/ui-components/components/ui-dropzone.js";
import "@maneki/ui-components/components/ui-label.js";

registerPage("dropzone", {
  title: "Dropzone",
  section: "Form Controls",
  render: () => `
    <h3>Sizes</h3>
    <div class="stack-m w-320">
      <ui-dropzone size="s" hint="PNG, JPG up to 5MB" multiple>
        <ui-label slot="label" size="s">Small</ui-label>
      </ui-dropzone>
      <ui-dropzone size="m" hint="Drag images or click to browse" multiple>
        <ui-label slot="label" size="m">Medium</ui-label>
      </ui-dropzone>
      <ui-dropzone size="l" hint="Supports PNG, JPG, WebP up to 10MB" multiple>
        <ui-label slot="label" size="l">Large</ui-label>
      </ui-dropzone>
    </div>

    <h3>With Accept Filter</h3>
    <div class="stack-m w-320">
      <ui-dropzone size="m" accept="image/*" hint="Images only (PNG, JPG, WebP)" multiple>
        <ui-label slot="label" size="m">Image Upload</ui-label>
      </ui-dropzone>
      <ui-dropzone size="m" accept=".pdf,.doc,.docx" hint="PDF and Word documents">
        <ui-label slot="label" size="m">Document Upload</ui-label>
      </ui-dropzone>
    </div>

    <h3>Disabled</h3>
    <div class="stack-m w-320">
      <ui-dropzone size="s" disabled hint="Upload unavailable">
        <ui-label slot="label" size="s">Disabled S</ui-label>
      </ui-dropzone>
      <ui-dropzone size="m" disabled hint="Upload unavailable">
        <ui-label slot="label" size="m">Disabled M</ui-label>
      </ui-dropzone>
      <ui-dropzone size="l" disabled hint="Upload unavailable">
        <ui-label slot="label" size="l">Disabled L</ui-label>
      </ui-dropzone>
    </div>

    <h3>Custom Text</h3>
    <div class="stack-m w-320">
      <ui-dropzone size="m" text="Click or drag photos to " hint="WebP recommended"></ui-dropzone>
    </div>

    <h3>Without Label</h3>
    <div class="stack-m w-320">
      <ui-dropzone size="m" hint="Any file type, max 25MB" multiple></ui-dropzone>
    </div>
  `,
});
