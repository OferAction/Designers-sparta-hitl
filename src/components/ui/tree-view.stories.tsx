import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { TreeView, type TreeItem } from "./tree-view";

const FLAT_DATA: TreeItem[] = [
  { name: "id", type: "string", sample: "inv-001" },
  { name: "amount", type: "number", sample: "1250.00" },
  { name: "currency", type: "string", sample: "USD" },
  { name: "status", type: "string", sample: "pending" },
  { name: "createdAt", type: "date", sample: "2024-01-15" },
];

const NESTED_DATA: TreeItem[] = [
  {
    name: "invoice",
    type: "object",
    children: [
      { name: "id", type: "string", sample: "inv-001" },
      { name: "amount", type: "number", sample: "1250.00" },
      {
        name: "vendor",
        type: "object",
        children: [
          { name: "name", type: "string", sample: "Acme Corp" },
          { name: "email", type: "string", sample: "billing@acme.com" },
        ],
      },
    ],
  },
  {
    name: "lineItems",
    type: "array",
    children: [
      { name: "description", type: "string", sample: "Consulting services", isArrayItem: true },
      { name: "quantity", type: "number", sample: "5", isArrayItem: true },
      { name: "unitPrice", type: "number", sample: "250.00", isArrayItem: true },
    ],
  },
];

const meta: Meta<typeof TreeView> = {
  title: "UI/TreeView",
  component: TreeView,
  tags: ["autodocs"],
  argTypes: {
    draggable: { control: "boolean" },
    showSample: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof TreeView>;

export const Flat: Story = {
  render: () => (
    <div className="w-80 border border-border rounded-lg p-2">
      <TreeView data={FLAT_DATA} />
    </div>
  ),
};

export const Nested: Story = {
  render: () => (
    <div className="w-80 border border-border rounded-lg p-2">
      <TreeView data={NESTED_DATA} showSample />
    </div>
  ),
};

export const WithSearch: Story = {
  render: () => {
    const [search, setSearch] = useState("");
    return (
      <div className="w-80">
        <input
          type="text"
          placeholder="Search fields…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-2 px-3 py-1.5 text-sm border border-border rounded-md bg-background"
        />
        <div className="border border-border rounded-lg p-2">
          <TreeView data={NESTED_DATA} searchValue={search} showSample />
        </div>
      </div>
    );
  },
};

export const Selectable: Story = {
  render: () => {
    const [selected, setSelected] = useState<TreeItem | null>(null);
    return (
      <div className="w-80">
        <div className="border border-border rounded-lg p-2">
          <TreeView data={NESTED_DATA} onItemSelect={setSelected} showSample />
        </div>
        {selected && (
          <div className="mt-3 p-2 rounded-md bg-muted text-xs">
            Selected: <strong>{selected.name}</strong> ({selected.type})
          </div>
        )}
      </div>
    );
  },
};
