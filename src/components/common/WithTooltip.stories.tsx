import type { Meta, StoryObj } from "@storybook/react";
import { InfoIcon as Info } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import WithTooltip from "./WithTooltip";

const meta: Meta<typeof WithTooltip> = {
  title: "Common/WithTooltip",
  component: WithTooltip,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof WithTooltip>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center justify-center p-8">
      <WithTooltip tooltip="This is a helpful tooltip">
        <Button variant="outline">Hover me</Button>
      </WithTooltip>
    </div>
  ),
};

export const OnIcon: Story = {
  render: () => (
    <div className="flex items-center gap-2 p-8">
      <span className="text-sm">API endpoint</span>
      <WithTooltip tooltip="The URL your workflow will call when triggered.">
        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
      </WithTooltip>
    </div>
  ),
};

export const Positions: Story = {
  render: () => (
    <div className="flex gap-4 items-center justify-center p-16">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <WithTooltip key={side} tooltip={`Tooltip on the ${side}`} side={side}>
          <Button variant="outline" size="sm">{side}</Button>
        </WithTooltip>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center justify-center p-8">
      <WithTooltip tooltip="This will never show" disableTooltip>
        <Button variant="outline">No tooltip</Button>
      </WithTooltip>
    </div>
  ),
};

export const RichContent: Story = {
  render: () => (
    <div className="flex items-center justify-center p-8">
      <WithTooltip
        tooltip={
          <div className="space-y-1">
            <p className="font-medium text-xs">Keyboard shortcut</p>
            <p className="text-xs text-muted-foreground">Press ⌘K to open the command palette</p>
          </div>
        }
      >
        <Button variant="ghost" size="sm">⌘K</Button>
      </WithTooltip>
    </div>
  ),
};
