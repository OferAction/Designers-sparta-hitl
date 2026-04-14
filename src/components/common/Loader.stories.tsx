import type { Meta, StoryObj } from "@storybook/react";

import { Loader } from "./Loader";

const meta: Meta<typeof Loader> = {
  title: "Common/Loader",
  component: Loader,
  tags: ["autodocs"],
  argTypes: {
    isFull: { control: "boolean" },
    size: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof Loader>;

export const Default: Story = {
  args: {
    isFull: false,
    size: 16,
  },
};

export const Large: Story = {
  args: {
    isFull: false,
    size: 32,
  },
};

export const FullContainer: Story = {
  args: {
    isFull: true,
    size: 24,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300, height: 200, border: "1px dashed #444", borderRadius: 8 }}>
        <Story />
      </div>
    ),
  ],
};
