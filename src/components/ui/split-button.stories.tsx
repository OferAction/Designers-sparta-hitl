import type { Meta, StoryObj } from "@storybook/react";
import { CaretDownIcon as ChevronDown, PlayIcon as Play, FloppyDiskIcon as Save, TrashIcon as Trash2 } from "@phosphor-icons/react";

import { IconSplitButtonItem, SplitButtonGroup, SplitButtonItem } from "./split-button";

const meta: Meta = {
  title: "UI/SplitButton",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <SplitButtonGroup variant="default">
      <SplitButtonItem>
        <Save className="mr-1.5 h-4 w-4" />
        Save
      </SplitButtonItem>
      <IconSplitButtonItem aria-label="More save options">
        <ChevronDown className="h-4 w-4" />
      </IconSplitButtonItem>
    </SplitButtonGroup>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 items-center">
      {(["default", "outline", "secondary", "destructive", "purple", "blue"] as const).map((variant) => (
        <SplitButtonGroup key={variant} variant={variant}>
          <SplitButtonItem>
            <Play className="mr-1.5 h-4 w-4" />
            Run
          </SplitButtonItem>
          <IconSplitButtonItem aria-label="More options">
            <ChevronDown className="h-4 w-4" />
          </IconSplitButtonItem>
        </SplitButtonGroup>
      ))}
    </div>
  ),
};

export const ThreeItems: Story = {
  render: () => (
    <SplitButtonGroup variant="outline">
      <SplitButtonItem>
        <Play className="mr-1.5 h-4 w-4" />
        Run
      </SplitButtonItem>
      <SplitButtonItem>
        <Save className="mr-1.5 h-4 w-4" />
        Save
      </SplitButtonItem>
      <SplitButtonItem>
        <Trash2 className="mr-1.5 h-4 w-4" />
        Delete
      </SplitButtonItem>
    </SplitButtonGroup>
  ),
};

export const WithoutSeparators: Story = {
  render: () => (
    <SplitButtonGroup variant="default" hideSeparators>
      <SplitButtonItem>Primary action</SplitButtonItem>
      <IconSplitButtonItem aria-label="Dropdown">
        <ChevronDown className="h-4 w-4" />
      </IconSplitButtonItem>
    </SplitButtonGroup>
  ),
};
