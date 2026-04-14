import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";

import FilterDropdown from "./FilterDropdown";

const STATUS_OPTIONS = [
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
  { value: "pending", label: "Pending" },
  { value: "running", label: "Running" },
];

const meta: Meta<typeof FilterDropdown> = {
  title: "HQ/FilterDropdown",
  component: FilterDropdown,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="p-8 bg-background min-h-24 flex items-start">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FilterDropdown>;

export const AllSelected: Story = {
  render: () => {
    const [selected, setSelected] = useState(STATUS_OPTIONS.map((o) => o.value));
    return (
      <FilterDropdown
        label="statuses"
        allLabel="All statuses"
        options={STATUS_OPTIONS}
        selected={selected}
        onChange={setSelected}
      />
    );
  },
};

export const NoneSelected: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);
    return (
      <FilterDropdown
        label="statuses"
        allLabel="All statuses"
        options={STATUS_OPTIONS}
        selected={selected}
        onChange={setSelected}
      />
    );
  },
};

export const PartialSelection: Story = {
  render: () => {
    const [selected, setSelected] = useState(["success", "running"]);
    return (
      <FilterDropdown
        label="statuses"
        allLabel="All statuses"
        options={STATUS_OPTIONS}
        selected={selected}
        onChange={setSelected}
      />
    );
  },
};
