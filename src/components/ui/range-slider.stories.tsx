import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import RangeSlider from "./range-slider";

const meta: Meta<typeof RangeSlider> = {
  title: "UI/RangeSlider",
  component: RangeSlider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RangeSlider>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    return (
      <div className="w-96 space-y-1">
        <RangeSlider totalSamples={1000} value={value} onValueChange={setValue} />
        <p className="text-xs text-muted-foreground">Selected: {value} samples</p>
      </div>
    );
  },
};

export const WithInitialValue: Story = {
  render: () => {
    const [value, setValue] = useState(250);
    return (
      <div className="w-96">
        <RangeSlider totalSamples={1000} value={value} onValueChange={setValue} />
      </div>
    );
  },
};

export const SmallDataset: Story = {
  render: () => {
    const [value, setValue] = useState(5);
    return (
      <div className="w-96">
        <RangeSlider totalSamples={20} value={value} onValueChange={setValue} />
      </div>
    );
  },
};
