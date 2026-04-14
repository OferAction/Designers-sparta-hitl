import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TagIcon as Tag, StarIcon as Star, LightningIcon as Zap, ShieldIcon as Shield } from "@phosphor-icons/react";

import { MultiSelect } from "./multi-select";

const FRAMEWORK_OPTIONS = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Angular", value: "angular" },
  { label: "Svelte", value: "svelte" },
  { label: "Next.js", value: "nextjs" },
  { label: "Nuxt.js", value: "nuxtjs" },
  { label: "Remix", value: "remix" },
];

const OPTIONS_WITH_ICONS = [
  { label: "Tagging", value: "tag", icon: Tag },
  { label: "Starred", value: "star", icon: Star },
  { label: "Performance", value: "perf", icon: Zap },
  { label: "Security", value: "security", icon: Shield },
];

const GROUPED_OPTIONS = [
  {
    heading: "Frontend",
    options: [
      { label: "React", value: "react" },
      { label: "Vue", value: "vue" },
      { label: "Angular", value: "angular" },
    ],
  },
  {
    heading: "Backend",
    options: [
      { label: "Node.js", value: "node" },
      { label: "Python", value: "python" },
      { label: "Go", value: "go" },
    ],
  },
];

const meta: Meta<typeof MultiSelect> = {
  title: "UI/MultiSelect",
  component: MultiSelect,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MultiSelect>;

export const Default: Story = {
  render: () => {
    const [values, setValues] = useState<string[]>([]);
    return (
      <div className="w-80">
        <MultiSelect options={FRAMEWORK_OPTIONS} onValueChange={setValues} placeholder="Select frameworks…" />
        <p className="mt-2 text-xs text-muted-foreground">Selected: {values.join(", ") || "none"}</p>
      </div>
    );
  },
};

export const WithIcons: Story = {
  render: () => (
    <div className="w-80">
      <MultiSelect options={OPTIONS_WITH_ICONS} onValueChange={() => {}} placeholder="Select features…" defaultValue={["tag", "star"]} />
    </div>
  ),
};

export const Grouped: Story = {
  render: () => (
    <div className="w-80">
      <MultiSelect options={GROUPED_OPTIONS} onValueChange={() => {}} placeholder="Select technologies…" />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="w-80">
      <MultiSelect
        options={FRAMEWORK_OPTIONS}
        onValueChange={() => {}}
        placeholder="Select frameworks…"
        error
        errorMessage="Please select at least one framework."
      />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-80">
      <MultiSelect
        options={FRAMEWORK_OPTIONS}
        onValueChange={() => {}}
        defaultValue={["react", "vue"]}
        disabled
      />
    </div>
  ),
};

export const WithMaxCount: Story = {
  render: () => (
    <div className="w-80">
      <MultiSelect
        options={FRAMEWORK_OPTIONS}
        onValueChange={() => {}}
        defaultValue={["react", "vue", "angular", "svelte"]}
        maxCount={2}
      />
    </div>
  ),
};
