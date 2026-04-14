import { TextBIcon as Bold, TextItalicIcon as Italic, TextUnderlineIcon as Underline } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react";

import { Toggle } from "./toggle";

const meta: Meta<typeof Toggle> = {
  title: "UI/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "outline"] },
    size: { control: "select", options: ["default", "sm", "lg"] },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  args: { children: <Bold />, "aria-label": "Bold" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-3">
      <Toggle variant="default" aria-label="Bold"><Bold /></Toggle>
      <Toggle variant="outline" aria-label="Italic"><Italic /></Toggle>
    </div>
  ),
};

export const ToolbarGroup: Story = {
  render: () => (
    <div className="flex gap-1 border border-border rounded-md p-1 w-fit">
      <Toggle size="sm" aria-label="Bold"><Bold /></Toggle>
      <Toggle size="sm" aria-label="Italic"><Italic /></Toggle>
      <Toggle size="sm" aria-label="Underline"><Underline /></Toggle>
    </div>
  ),
};
