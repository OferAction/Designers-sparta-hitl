import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import TimePicker from "./time-picker";

const meta: Meta<typeof TimePicker> = {
  title: "UI/TimePicker",
  component: TimePicker,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    minuteStep: { control: "select", options: [1, 5, 10, 15, 30] },
  },
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

export const Default: Story = {
  render: () => {
    const [time, setTime] = useState("");
    return (
      <div>
        <TimePicker value={time} onChange={setTime} />
        <p className="mt-2 text-xs text-muted-foreground">Value: {time || "not set"}</p>
      </div>
    );
  },
};

export const Preselected: Story = {
  render: () => {
    const [time, setTime] = useState("14:30");
    return <TimePicker value={time} onChange={setTime} />;
  },
};

export const Step15Minutes: Story = {
  render: () => {
    const [time, setTime] = useState("");
    return <TimePicker value={time} onChange={setTime} minuteStep={15} />;
  },
};

export const Disabled: Story = {
  render: () => <TimePicker value="09:00" onChange={() => {}} disabled />,
};
