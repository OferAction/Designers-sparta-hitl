import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const meta: Meta = {
  title: "UI/Popover",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-sm">This is a popover with some content inside.</p>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Edit settings</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Dimensions</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Width</label>
              <input className="w-full border border-border rounded px-2 py-1 text-sm bg-background" defaultValue="100%" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Height</label>
              <input className="w-full border border-border rounded px-2 py-1 text-sm bg-background" defaultValue="auto" />
            </div>
          </div>
          <Button size="sm" className="w-full">Apply</Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const Positions: Story = {
  render: () => (
    <div className="flex gap-4 items-center justify-center p-16">
      {(["top", "bottom", "left", "right"] as const).map((side) => (
        <Popover key={side}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">{side}</Button>
          </PopoverTrigger>
          <PopoverContent side={side} className="w-40">
            <p className="text-xs text-center">Opened {side}</p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};
