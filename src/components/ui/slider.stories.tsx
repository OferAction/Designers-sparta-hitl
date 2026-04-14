import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Slider } from "./slider";

const meta: Meta<typeof Slider> = {
  title: "UI/Slider",
  component: Slider,
  tags: ["autodocs"],
  argTypes: {
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState([50]);
    return (
      <div className="w-72 space-y-2">
        <Slider value={value} onValueChange={setValue} min={0} max={100} step={1} />
        <p className="text-xs text-muted-foreground">Value: {value[0]}</p>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="w-72">
      <Slider value={[40]} min={0} max={100} disabled />
    </div>
  ),
};

export const StepSize: Story = {
  render: () => {
    const [value, setValue] = useState([0]);
    return (
      <div className="w-72 space-y-2">
        <Slider value={value} onValueChange={setValue} min={0} max={100} step={10} />
        <p className="text-xs text-muted-foreground">Step 10 — Value: {value[0]}</p>
      </div>
    );
  },
};
