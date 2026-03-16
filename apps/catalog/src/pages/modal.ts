import { registerPage } from "../registry.js";

registerPage("modal", {
  title: "Modal",
  section: "Overlays",
  render: () => `
    <h3>Sizes (click to open)</h3>
    <div class="variant-row">
      ${["s", "m", "l"].map(size =>
        `<ui-button size="m" onclick="document.getElementById('modal-${size}').show()">Size ${size.toUpperCase()}</ui-button>
         <ui-modal id="modal-${size}" size="${size}" dismissible>
           ${size.toUpperCase()} Modal
           <div slot="body">${size.toUpperCase()} size body content.</div>
           <div slot="footer-end" class="row-gap-8">
             <ui-button action="secondary" size="m">Cancel</ui-button>
             <ui-button action="primary" size="m">OK</ui-button>
           </div>
         </ui-modal>`
      ).join("")}
    </div>

    <h3>With Subtitle</h3>
    <div class="variant-row">
      <ui-button size="m" onclick="document.getElementById('subtitle-modal').show()">Open Modal</ui-button>
    </div>
    <ui-modal id="subtitle-modal" dismissible>
      <span slot="subtitle">Optional subtitle text</span>
      Modal Title
      <div slot="body">Body content with a subtitle above the title.</div>
      <div slot="footer-end" class="row-gap-8">
        <ui-button action="secondary" size="m">Cancel</ui-button>
        <ui-button action="primary" size="m">Save</ui-button>
      </div>
    </ui-modal>

    <h3>Fluid Layout</h3>
    <div class="variant-row">
      <ui-button size="m" onclick="document.getElementById('fluid-modal').show()">Open Fluid Modal</ui-button>
    </div>
    <ui-modal id="fluid-modal" layout="fluid" dismissible>
      Fluid Layout Modal
      <div slot="body">
        <p>This modal has a fixed height and the body area scrolls when content overflows.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
      </div>
      <div slot="footer-end" class="row-gap-8">
        <ui-button action="secondary" size="m">Cancel</ui-button>
        <ui-button action="primary" size="m">Save</ui-button>
      </div>
    </ui-modal>

    <h3>With Tertiary Button</h3>
    <div class="variant-row">
      <ui-button size="m" onclick="document.getElementById('tertiary-modal').show()">Open Modal</ui-button>
    </div>
    <ui-modal id="tertiary-modal" dismissible>
      Modal with Tertiary Action
      <div slot="body">This modal has a tertiary button on the left side of the footer.</div>
      <ui-button slot="footer-start" action="secondary" emphasis="subtle" size="m">Learn more</ui-button>
      <div slot="footer-end" class="row-gap-8">
        <ui-button action="secondary" size="m">Cancel</ui-button>
        <ui-button action="primary" size="m">Confirm</ui-button>
      </div>
    </ui-modal>

    <h3>Non-Dismissible</h3>
    <div class="variant-row">
      <ui-button size="m" onclick="document.getElementById('nondismiss-modal').show()">Open Non-Dismissible</ui-button>
    </div>
    <ui-modal id="nondismiss-modal">
      Non-Dismissible Modal
      <div slot="body">This modal can only be closed by the action button below.</div>
      <div slot="footer-end" class="row-gap-8">
        <ui-button action="primary" size="m" onclick="document.getElementById('nondismiss-modal').close()">Accept</ui-button>
      </div>
    </ui-modal>

    <h3>No Footer</h3>
    <div class="variant-row">
      <ui-button size="m" onclick="document.getElementById('nofooter-modal').show()">Open Modal</ui-button>
    </div>
    <ui-modal id="nofooter-modal" dismissible>
      Information
      <div slot="body">This modal has no footer buttons. Use the close button to dismiss.</div>
    </ui-modal>
  `,
});
