import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PlusIcon as Plus } from "@phosphor-icons/react";

import { Combobox } from "./combobox";
import type { Option } from "@/components/ui/input-tag/old-deprecated/InputTag/types";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: Infinity } },
});

const FRUIT_OPTIONS: Option[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Date", value: "date" },
  { label: "Elderberry", value: "elderberry" },
  { label: "Fig", value: "fig" },
  { label: "Grape", value: "grape" },
];

const GROUPED_OPTIONS: Option[] = [
  { label: "FRUITS", value: "fruits-title", isTitle: true },
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "VEGETABLES", value: "veg-title", isTitle: true },
  { label: "Carrot", value: "carrot" },
  { label: "Broccoli", value: "broccoli" },
  { label: "Spinach", value: "spinach" },
];

const meta: Meta = {
  title: "UI/Combobox",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<Option | null>(null);
    return (
      <div className="w-64">
        <Combobox options={FRUIT_OPTIONS} value={value} onChange={setValue} placeholder="Select a fruit…" />
      </div>
    );
  },
};

export const WithGroupedOptions: Story = {
  render: () => {
    const [value, setValue] = useState<Option | null>(null);
    return (
      <div className="w-64">
        <Combobox options={GROUPED_OPTIONS} value={value} onChange={setValue} placeholder="Select an item…" />
      </div>
    );
  },
};

export const WithStickyFooter: Story = {
  render: () => {
    const [value, setValue] = useState<Option | null>(null);
    return (
      <div className="w-64">
        <Combobox
          options={FRUIT_OPTIONS}
          value={value}
          onChange={setValue}
          placeholder="Select a fruit…"
          stickyFooterAction={{
            label: "Add new fruit",
            icon: <Plus className="size-4" />,
            onClick: () => alert("Add new fruit clicked"),
          }}
        />
      </div>
    );
  },
};

export const Preselected: Story = {
  render: () => {
    const [value, setValue] = useState<Option | null>({ label: "Cherry", value: "cherry" });
    return (
      <div className="w-64">
        <Combobox options={FRUIT_OPTIONS} value={value} onChange={setValue} />
      </div>
    );
  },
};
