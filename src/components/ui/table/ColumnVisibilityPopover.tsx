import { useMemo, useState } from "react";

import { SlidersHorizontalIcon, CheckIcon as Check, CaretUpDownIcon as ChevronsUpDown } from "@phosphor-icons/react";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ColumnVisibilityPopoverProps<TData> {
  table: Table<TData>;
}

export function ColumnVisibilityPopover<TData>({ table }: ColumnVisibilityPopoverProps<TData>) {
  const [open, setOpen] = useState(false);

  // Get all leaf columns (actual data columns, not groups)
  const allColumns = table.getAllLeafColumns().filter((column) => column.getCanHide());

  // Memoize column titles to prevent them from changing when visibility changes
  const columnTitles = useMemo(() => {
    const titles: Record<string, string> = {};

    allColumns.forEach((column) => {
      const columnId = column.id;
      const headerDef = column.columnDef.header;

      if (typeof headerDef === "string") {
        titles[columnId] = headerDef;
      } else {
        // Convert camelCase to Title Case
        titles[columnId] = columnId
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim();
      }
    });

    return titles;
  }, [allColumns]); // Only recalculate when number of columns changes

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9">
          <SlidersHorizontalIcon size={16} />
          View
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <Command className="bg-popover">
          <div className="p-3 pb-2 border-b border-border">
            <h4 className="font-medium text-sm mb-2">Table data</h4>
          </div>
          <CommandList className="max-h-80">
            <CommandEmpty>No column found.</CommandEmpty>
            <CommandGroup>
              {allColumns.map((column, index) => {
                const title = columnTitles[column.id] || column.id;
                const prevParentId = index > 0 ? allColumns[index - 1].parent?.id : null;
                const currentParentId = column.parent?.id;
                const showBorder = index > 0 && prevParentId !== currentParentId;

                return (
                  <div key={column.id}>
                    {showBorder && <div className="border-t border-border my-1" />}
                    <CommandItem
                      value={title}
                      onSelect={() => {
                        column.toggleVisibility();
                      }}
                      className="cursor-pointer"
                    >
                      <Check className={cn("mr-2 h-4 w-4", column.getIsVisible() ? "opacity-100" : "opacity-0")} />
                      <span>{title}</span>
                    </CommandItem>
                  </div>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
