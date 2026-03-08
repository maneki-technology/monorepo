import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-modal.js";
import "../components/ui-button.js";

const meta: Meta = {
  title: "Components/Modal",
  component: "ui-modal",
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["s", "m", "l"],
    },
    layout: {
      control: { type: "select" },
      options: ["auto", "fluid"],
    },
    dismissible: { control: { type: "boolean" } },
  },
  args: {
    size: "m",
    layout: "auto",
    dismissible: true,
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <ui-button onclick="document.querySelector('#default-modal').show()">Open Modal</ui-button>
    <ui-modal id="default-modal" dismissible>
      Modal Title
      <div slot="body">This is the body content of the modal dialog.</div>
      <div slot="footer-end" style="display:flex;gap:8px;">
        <ui-button action="secondary" size="m">Cancel</ui-button>
        <ui-button action="primary" size="m">Confirm</ui-button>
      </div>
    </ui-modal>
  `,
};

export const WithSubtitle: Story = {
  render: () => html`
    <ui-button onclick="document.querySelector('#subtitle-modal').show()">Open Modal</ui-button>
    <ui-modal id="subtitle-modal" dismissible>
      <span slot="subtitle">Optional subtitle text</span>
      Modal Title
      <div slot="body">Body content with a subtitle above the title.</div>
      <div slot="footer-end" style="display:flex;gap:8px;">
        <ui-button action="secondary" size="m">Cancel</ui-button>
        <ui-button action="primary" size="m">Save</ui-button>
      </div>
    </ui-modal>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px;">
      <ui-button onclick="document.querySelector('#modal-s').show()">Small</ui-button>
      <ui-button onclick="document.querySelector('#modal-m').show()">Medium</ui-button>
      <ui-button onclick="document.querySelector('#modal-l').show()">Large</ui-button>
    </div>
    <ui-modal id="modal-s" size="s" dismissible>
      Small Modal
      <div slot="body">Small size body content.</div>
      <div slot="footer-end" style="display:flex;gap:8px;">
        <ui-button action="secondary" size="s">Cancel</ui-button>
        <ui-button action="primary" size="s">OK</ui-button>
      </div>
    </ui-modal>
    <ui-modal id="modal-m" size="m" dismissible>
      Medium Modal
      <div slot="body">Medium size body content.</div>
      <div slot="footer-end" style="display:flex;gap:8px;">
        <ui-button action="secondary" size="m">Cancel</ui-button>
        <ui-button action="primary" size="m">OK</ui-button>
      </div>
    </ui-modal>
    <ui-modal id="modal-l" size="l" dismissible>
      Large Modal
      <div slot="body">Large size body content.</div>
      <div slot="footer-end" style="display:flex;gap:8px;">
        <ui-button action="secondary" size="m">Cancel</ui-button>
        <ui-button action="primary" size="m">OK</ui-button>
      </div>
    </ui-modal>
  `,
};

export const FluidLayout: Story = {
  render: () => html`
    <ui-button onclick="document.querySelector('#fluid-modal').show()">Open Fluid Modal</ui-button>
    <ui-modal id="fluid-modal" layout="fluid" dismissible>
      Fluid Layout Modal
      <div slot="body">
        <p>This modal has a fixed height and the body area scrolls when content overflows.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.</p>
        <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.</p>
        <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
        <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.</p>
      </div>
      <div slot="footer-end" style="display:flex;gap:8px;">
        <ui-button action="secondary" size="m">Cancel</ui-button>
        <ui-button action="primary" size="m">Save</ui-button>
      </div>
    </ui-modal>
  `,
};

export const Dismissible: Story = {
  render: () => html`
    <ui-button onclick="document.querySelector('#dismiss-modal').show()">Open Dismissible Modal</ui-button>
    <ui-modal id="dismiss-modal" dismissible>
      Dismissible Modal
      <div slot="body">Click the X button, press Escape, or click the backdrop to close.</div>
      <div slot="footer-end" style="display:flex;gap:8px;">
        <ui-button action="primary" size="m">Got it</ui-button>
      </div>
    </ui-modal>
  `,
};

export const NonDismissible: Story = {
  render: () => html`
    <ui-button onclick="document.querySelector('#nondismiss-modal').show()">Open Non-Dismissible Modal</ui-button>
    <ui-modal id="nondismiss-modal">
      Non-Dismissible Modal
      <div slot="body">This modal can only be closed by the action buttons below.</div>
      <div slot="footer-end" style="display:flex;gap:8px;">
        <ui-button action="primary" size="m" onclick="document.querySelector('#nondismiss-modal').close()">Accept</ui-button>
      </div>
    </ui-modal>
  `,
};

export const WithTertiaryButton: Story = {
  render: () => html`
    <ui-button onclick="document.querySelector('#tertiary-modal').show()">Open Modal</ui-button>
    <ui-modal id="tertiary-modal" dismissible>
      Modal with Tertiary Action
      <div slot="body">This modal has a tertiary button on the left side of the footer.</div>
      <ui-button slot="footer-start" action="secondary" emphasis="subtle" size="m">Learn more</ui-button>
      <div slot="footer-end" style="display:flex;gap:8px;">
        <ui-button action="secondary" size="m">Cancel</ui-button>
        <ui-button action="primary" size="m">Confirm</ui-button>
      </div>
    </ui-modal>
  `,
};

export const NoFooter: Story = {
  render: () => html`
    <ui-button onclick="document.querySelector('#nofooter-modal').show()">Open Modal</ui-button>
    <ui-modal id="nofooter-modal" dismissible>
      Information
      <div slot="body">This modal has no footer buttons. Use the close button to dismiss.</div>
    </ui-modal>
  `,
};

export const Interactive: Story = {
  render: () => html`
    <ui-button onclick="document.querySelector('#demo-modal').show()">Open Modal</ui-button>
    <ui-modal id="demo-modal" dismissible>
      <span slot="subtitle">Subtitle</span>
      Modal Title
      <div slot="body">Body content here...</div>
      <ui-button slot="footer-start" action="secondary" emphasis="subtle" size="m">Tertiary</ui-button>
      <div slot="footer-end" style="display:flex;gap:8px;">
        <ui-button action="secondary" size="m">Cancel</ui-button>
        <ui-button action="primary" size="m">Confirm</ui-button>
      </div>
    </ui-modal>
  `,
};
