import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import InputField from "./InputField";

const meta: Meta<typeof InputField> = {
  title: "Common/InputField",
  component: InputField,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    showLoader: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof InputField>;

export const Default: Story = {
  args: {
    label: "Source URL",
    placeholder: "Paste URL",
    helperText: "Import from URL",
    value: "",
  },
};

export const WithValue: Story = {
  args: {
    label: "Source URL",
    placeholder: "Paste URL",
    helperText: "Import from URL",
    value: "https://example.com/document.pdf",
  },
};

export const WithError: Story = {
  args: {
    label: "Source URL",
    placeholder: "Paste URL",
    helperText: "Import from URL",
    value: "not-a-url",
    error: "Please enter a valid URL",
  },
};

export const Loading: Story = {
  args: {
    label: "Source URL",
    placeholder: "Paste URL",
    helperText: "Validating URL…",
    value: "https://example.com/doc.pdf",
    showLoader: true,
  },
};

export const Disabled: Story = {
  args: {
    label: "Source URL",
    placeholder: "Paste URL",
    helperText: "Import from URL",
    value: "https://example.com/document.pdf",
    disabled: true,
  },
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <InputField
        label="Source URL"
        placeholder="Paste URL"
        helperText="Import from URL"
        value={value}
        onChange={setValue}
      />
    );
  },
};
