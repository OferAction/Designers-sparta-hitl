import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TagIcon as Tag, WarningCircleIcon as AlertCircle, CheckCircleIcon as CheckCircle } from "@phosphor-icons/react";

import { MultiSelectMenu } from "./multi-select-menu";
import type { MultiSelectOption } from "./multi-select";

const meta: Meta<typeof MultiSelectMenu> = {
  title: "UI/MultiSelectMenu",
  component: MultiSelectMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MultiSelectMenu>;

const STATUS_OPTIONS: MultiSelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
  { label: "Completed", value: "completed" },
];

const ICON_OPTIONS: MultiSelectOption[] = [
  { label: "Labels", value: "labels", icon: Tag },
  { label: "Alerts", value: "alerts", icon: AlertCircle },
  { label: "Done", value: "done", icon: CheckCircle },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(["active"]);
    return (
      <div className="w-48 border border-border rounded-lg p-2">
        <MultiSelectMenu options={STATUS_OPTIONS} value={value} onValueChange={setValue} />
      </div>
    );
  },
};

export const WithIcons: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <div className="w-48 border border-border rounded-lg p-2">
        <MultiSelectMenu options={ICON_OPTIONS} value={value} onValueChange={setValue} />
      </div>
    );
  },
};

export const AllSelected: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(STATUS_OPTIONS.map((o) => o.value));
    return (
      <div className="w-48 border border-border rounded-lg p-2">
        <MultiSelectMenu options={STATUS_OPTIONS} value={value} onValueChange={setValue} />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="w-48 border border-border rounded-lg p-2">
      <MultiSelectMenu
        options={STATUS_OPTIONS}
        value={["active"]}
        onValueChange={() => {}}
        disabled
      />
    </div>
  ),
};
