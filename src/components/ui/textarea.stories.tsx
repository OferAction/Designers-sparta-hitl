import type { Meta, StoryObj } from "@storybook/react";

import { Textarea } from "./textarea";

const meta: Meta<typeof Textarea> = {
  title: "UI/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    state: { control: "select", options: ["default", "error", "disabled"] },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: { placeholder: "Type your message here...", state: "default" },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Textarea state="default" placeholder="Default state" />
      <Textarea state="error" placeholder="Error state" errorMessage="This field is required." />
      <Textarea state="disabled" placeholder="Disabled state" />
    </div>
  ),
};

export const WithMaxLength: Story = {
  args: {
    placeholder: "Max 200 characters...",
    maxLength: 200,
    state: "default",
  },
};
