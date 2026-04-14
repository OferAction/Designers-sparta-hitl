import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { AutoSizeInput } from "./AutoSizeInput";

const meta: Meta<typeof AutoSizeInput> = {
  title: "Common/AutoSizeInput",
  component: AutoSizeInput,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AutoSizeInput>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("Edit me");
    return (
      <AutoSizeInput>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="border border-border rounded px-2 py-1 text-sm bg-background outline-none focus:ring-1 focus:ring-ring"
        />
      </AutoSizeInput>
    );
  },
};

export const WithPlaceholder: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <AutoSizeInput minWidth={80} maxWidth={300}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type something…"
          className="border border-border rounded px-2 py-1 text-sm bg-background outline-none focus:ring-1 focus:ring-ring"
        />
      </AutoSizeInput>
    );
  },
};

export const InlineWithText: Story = {
  render: () => {
    const [name, setName] = useState("My Workflow");
    return (
      <div className="flex items-center gap-1 text-sm">
        <span className="text-muted-foreground">Editing:</span>
        <AutoSizeInput minWidth={60} maxWidth={200}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-b border-border bg-transparent outline-none px-1 font-medium"
          />
        </AutoSizeInput>
      </div>
    );
  },
};
