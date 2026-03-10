import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-file-upload.js";

const meta: Meta = {
  title: "Components/File Upload",
  component: "ui-file-upload",
  argTypes: {
    size: { control: { type: "select" }, options: ["s", "m", "l"] },
    placeholder: { control: "text" },
    "button-text": { control: "text" },
    accept: { control: "text" },
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    size: "m",
    placeholder: "Choose files to upload",
    "button-text": "Browse",
    accept: "",
    multiple: false,
    disabled: false,
  },
  render: (args) => html`
    <ui-file-upload
      size=${args.size}
      placeholder=${args.placeholder}
      button-text=${args["button-text"]}
      accept=${args.accept || undefined}
      ?multiple=${args.multiple}
      ?disabled=${args.disabled}
    ></ui-file-upload>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <ui-file-upload
      placeholder="Choose files to upload"
      style="width: 320px;"
    ></ui-file-upload>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-file-upload size="s" placeholder="Small upload"></ui-file-upload>
      <ui-file-upload size="m" placeholder="Medium upload"></ui-file-upload>
      <ui-file-upload size="l" placeholder="Large upload"></ui-file-upload>
    </div>
  `,
};

export const WithAccept: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-file-upload
        accept="image/*"
        placeholder="Select an image"
        button-text="Browse Images"
      ></ui-file-upload>
    </div>
  `,
};

export const Multiple: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-file-upload
        multiple
        placeholder="Select multiple files"
      ></ui-file-upload>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ui-file-upload disabled placeholder="Cannot upload"></ui-file-upload>
    </div>
  `,
};
