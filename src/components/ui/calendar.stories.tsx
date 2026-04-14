import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { DateRange } from "react-day-picker";

import { Calendar } from "./calendar";

const meta: Meta<typeof Calendar> = {
  title: "UI/Calendar",
  component: Calendar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date | undefined>(new Date());
    return (
      <Calendar
        mode="single"
        selected={selected}
        onSelect={setSelected}
        className="border border-border rounded-lg"
      />
    );
  },
};

export const RangeSelection: Story = {
  render: () => {
    const [range, setRange] = useState<DateRange | undefined>();
    return (
      <div className="space-y-2">
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          className="border border-border rounded-lg"
        />
        {range?.from && (
          <p className="text-xs text-muted-foreground">
            {range.from.toLocaleDateString()} → {range.to?.toLocaleDateString() ?? "…"}
          </p>
        )}
      </div>
    );
  },
};

export const WithDropdownCaption: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date | undefined>(new Date());
    return (
      <Calendar
        mode="single"
        selected={selected}
        onSelect={setSelected}
        captionLayout="dropdown"
        fromYear={2020}
        toYear={2030}
        className="border border-border rounded-lg"
      />
    );
  },
};
