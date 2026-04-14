import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CaretDownIcon as ChevronDown } from "@phosphor-icons/react";

import { Button } from "./button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";

const meta: Meta = {
  title: "UI/Collapsible",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Collapsible open={open} onOpenChange={setOpen} className="w-72 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Configuration options</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-1">
          <div className="rounded-md border px-3 py-2 text-sm">Option one</div>
          <div className="rounded-md border px-3 py-2 text-sm">Option two</div>
          <div className="rounded-md border px-3 py-2 text-sm">Option three</div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};

export const OpenByDefault: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <Collapsible open={open} onOpenChange={setOpen} className="w-72 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Advanced settings</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-1">
          <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground">Timeout: 30s</div>
          <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground">Retries: 3</div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};
