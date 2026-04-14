import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { format } from "date-fns";

import { DatePicker } from "./date-picker";

const meta: Meta<typeof DatePicker> = {
  title: "UI/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>();
    return (
      <div className="w-60">
        <DatePicker value={date} onChange={setDate} />
        <p className="mt-2 text-xs text-muted-foreground">
          Selected: {date ? format(date, "PPP") : "none"}
        </p>
      </div>
    );
  },
};

export const WithPreselectedDate: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date(2024, 0, 15));
    return (
      <div className="w-60">
        <DatePicker value={date} onChange={setDate} />
      </div>
    );
  },
};

export const CustomFormat: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
      <div className="w-60">
        <DatePicker
          value={date}
          onChange={setDate}
          formatDate={(d) => format(d, "dd/MM/yyyy")}
          placeholder="DD/MM/YYYY"
        />
      </div>
    );
  },
};
