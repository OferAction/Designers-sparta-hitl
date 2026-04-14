"use client";

import * as React from "react";

import { CheckIcon } from "@phosphor-icons/react";

import { useAncestors } from "@/modules/flow/hooks/useAncestors";
import useAncestorValueOptions from "@/modules/flow/hooks/useAncestorValueOptions";

import { IconTrailingIcon as IconTrailling } from "@/lib/icons";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { IOSectionContext } from "@/modules/flow/components/ContextualPanel/shared/NodeIOSection";
import { useSelectedNode, TreeInputItem } from "@/modules/flow/hooks";
import { NodeVariant } from "@/modules/flow/types";

/** Nodes that support Pydantic outputs */
const PYDANTIC_SOURCE_NODES = new Set(["start", "customCodeAgent"]);

interface DynamicOutputCommandProps {
  item: TreeInputItem;
  ctx: IOSectionContext;
}

export function DynamicOutputCommand({ item, ctx }: DynamicOutputCommandProps) {
  const [open, setOpen] = React.useState(false);
  const selectedNode = useSelectedNode() as NodeVariant<"agent">;
  const selectedNodeId = selectedNode?.id || "";

  const options = useAncestorValueOptions(selectedNodeId);
  const ancestors = useAncestors(selectedNodeId);

  /** Resolves the source node type when the referenced output is Pydantic */
  const resolveParentNodeType = React.useCallback(
    (optionValue: string): string | undefined => {
      const sourceNodeId = optionValue.split(".")[0];
      if (!sourceNodeId) return undefined;

      const group = options.find((opt) => opt.value === sourceNodeId);
      if (!group) return undefined;

      const child = group.children.find((c) => c.value === optionValue);
      if (!child || child.type !== "Pydantic") return undefined;

      const ancestor = ancestors.find((a) => a.id === sourceNodeId);
      if (!ancestor) return undefined;

      const nodeType = ancestor.data.name || ancestor.type;
      return nodeType && PYDANTIC_SOURCE_NODES.has(nodeType) ? nodeType : undefined;
    },
    [options, ancestors]
  );

  /** Handles reference selection, setting parentNodeType for Pydantic outputs */
  function handleSelectChange(optionValue: string) {
    if (!selectedNode) return;

    const parentNodeType = resolveParentNodeType(optionValue);
    const onReferenceChange = ctx.handlers.onReferenceChange as
      | ((id: string, value: { value: string; label: string; isReference?: boolean }, parentNodeType?: string) => void)
      | undefined;

    if (onReferenceChange) {
      onReferenceChange(item.id, { value: optionValue, label: optionValue, isReference: true }, parentNodeType);
    } else if (ctx.handlers.onValueChange) {
      ctx.handlers.onValueChange(item.id, { value: optionValue, label: optionValue, isReference: true });
    }

    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div aria-expanded={open} className="w-[200px] justify-between">
          <IconTrailling className="size-4" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search variable" />
          <CommandList>
            <CommandEmpty>No data found.</CommandEmpty>
            {options.map((option) => {
              return (
                <CommandGroup key={option.value} heading={option.children.length > 0 && option.label}>
                  {option.children.map((child) => {
                    const IconComponent = child.icon;
                    return (
                      <CommandItem key={child.value} value={child.value} onSelect={handleSelectChange}>
                        {IconComponent && <IconComponent />}
                        {child.label}
                        <CheckIcon className={cn("mr-2 h-4 w-4", item.value?.value === child.value ? "opacity-100" : "opacity-0")} />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
