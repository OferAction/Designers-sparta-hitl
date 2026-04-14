import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { NumberStepper } from "./number-stepper";

const meta: Meta<typeof NumberStepper> = {
  title: "UI/NumberStepper",
  component: NumberStepper,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    min: { control: "number" },
    max: { control: "number" },
    stepper: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof NumberStepper>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<number | undefined>(0);
    return (
      <div className="w-40">
        <NumberStepper value={value} onValueChange={setValue} />
        <p className="mt-2 text-xs text-muted-foreground">Value: {value ?? "empty"}</p>
      </div>
    );
  },
};

export const WithMinMax: Story = {
  render: () => (
    <div className="w-40">
      <NumberStepper defaultValue={5} min={0} max={10} />
      <p className="mt-1 text-xs text-muted-foreground">Range: 0–10</p>
    </div>
  ),
};

export const WithSuffix: Story = {
  render: () => (
    <div className="w-40">
      <NumberStepper defaultValue={100} suffix="%" min={0} max={100} />
    </div>
  ),
};

export const WithPrefix: Story = {
  render: () => (
    <div className="w-40">
      <NumberStepper defaultValue={50} prefix="$" min={0} stepper={5} />
    </div>
  ),
};

export const CustomStep: Story = {
  render: () => (
    <div className="w-40">
      <NumberStepper defaultValue={0} stepper={10} />
      <p className="mt-1 text-xs text-muted-foreground">Step: 10</p>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    defaultValue: 42,
    disabled: true,
  },
};
