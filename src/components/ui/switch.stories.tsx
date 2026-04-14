import type { Meta, StoryObj } from "@storybook/react";

import { Switch } from "./switch";

const meta: Meta<typeof Switch> = {
  title: "UI/Switch",
  component: Switch,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["default", "sm", "xs"] },
    disabled: { control: "boolean" },
    defaultChecked: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: { size: "default" },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Switch size="xs" defaultChecked />
      <Switch size="sm" defaultChecked />
      <Switch size="default" defaultChecked />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Switch />
        <span className="text-sm text-muted-foreground">Off</span>
      </div>
      <div className="flex items-center gap-2">
        <Switch defaultChecked />
        <span className="text-sm text-muted-foreground">On</span>
      </div>
      <div className="flex items-center gap-2">
        <Switch disabled />
        <span className="text-sm text-muted-foreground">Disabled off</span>
      </div>
      <div className="flex items-center gap-2">
        <Switch disabled defaultChecked />
        <span className="text-sm text-muted-foreground">Disabled on</span>
      </div>
    </div>
  ),
};
