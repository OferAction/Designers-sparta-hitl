import type { Meta, StoryObj } from "@storybook/react";

import { Progress } from "./progress";

const meta: Meta<typeof Progress> = {
  title: "UI/Progress",
  component: Progress,
  tags: ["autodocs"],
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: {
    value: 60,
    className: "w-80",
  },
};

export const Empty: Story = {
  args: { value: 0, className: "w-80" },
};

export const Full: Story = {
  args: { value: 100, className: "w-80" },
};

export const AllValues: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      {[0, 25, 50, 75, 100].map((v) => (
        <div key={v} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-8">{v}%</span>
          <Progress value={v} className="flex-1" />
        </div>
      ))}
    </div>
  ),
};

export const CustomColor: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-80">
      <Progress value={70} indicatorClassName="bg-blue-500" />
      <Progress value={70} indicatorClassName="bg-green-500" />
      <Progress value={70} indicatorClassName="bg-destructive" />
    </div>
  ),
};
