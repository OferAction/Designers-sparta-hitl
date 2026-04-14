import * as React from "react";

import { Combobox as ComboboxPrimitive } from "@base-ui/react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxList,
  ComboboxValue,
  ComboboxTrigger,
} from "@/components/ui/comboboxNew";
import { Option } from "@/components/ui/input-tag";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_ITEMS = 1;

export function MultiSelect({
  data,
  selectedValues,
  setSelectedValues,
  triggerComponent,
}: {
  data: Option[];
  selectedValues: Option[];
  setSelectedValues: (newTriggers: Option[] | null) => void;
  triggerComponent?: React.ReactNode;
}) {
  const popupContainerRef = React.useRef<HTMLDivElement | null>(null);
  const handleSelectAll = React.useCallback(() => {
    if (selectedValues?.length === data.length) {
      setSelectedValues([]);
    } else {
      setSelectedValues(data);
    }
  }, [selectedValues, data, setSelectedValues]);

  const isAllSelected = selectedValues.length === data.length;
  return (
    <div ref={popupContainerRef} className="relative w-full">
      <Combobox multiple items={data} value={selectedValues} onValueChange={(value) => setSelectedValues(value)}>
        <ComboboxTrigger className="w-full h-full rounded-lg max-w-xs bg-muted/40">
          <ComboboxChips className="w-full h-full flex items-center gap-2 px-3 py-2">
            {triggerComponent}
            <ComboboxValue>
              {(values: Option[]) => {
                const remainingCount = values.length - MAX_VISIBLE_ITEMS;
                const visibleValues = values.length > MAX_VISIBLE_ITEMS ? [] : values.slice(0, MAX_VISIBLE_ITEMS);

                return (
                  <React.Fragment>
                    {visibleValues.map((item) => (
                      <ComboboxChip key={item?.label} showRemove={false}>
                        {item?.label}
                      </ComboboxChip>
                    ))}
                    {remainingCount > 0 && <span className="text-xs text-muted-foreground px-2 bg-muted rounded-sm">+{remainingCount} more</span>}
                  </React.Fragment>
                );
              }}
            </ComboboxValue>
          </ComboboxChips>
        </ComboboxTrigger>
        <ComboboxContent container={popupContainerRef} align="end">
          <ComboboxChipsInput autoFocus className="m-1 bg-transparent text-sm p-2 border-b" placeholder="Search versions..." />
          <div
            onClick={handleSelectAll}
            className={cn(
              "data-highlighted:bg-accent data-highlighted:text-accent-foreground gap-2 rounded-md py-1 pr-2 pl-1.5 text-sm relative flex w-full cursor-pointer items-center outline-hidden select-none mx-1 mb-1 font-medium hover:bg-accent/50"
            )}
          >
            <Checkbox checked={isAllSelected} className="pointer-events-none" />
            <span>Select All</span>
          </div>
          <ComboboxList>
            {(item) => {
              const isSelected = selectedValues.includes(item);
              return (
                <ComboboxPrimitive.Item
                  key={item.value}
                  value={item}
                  data-slot="combobox-item"
                  className={cn(
                    "data-highlighted:bg-accent data-highlighted:text-accent-foreground gap-2 rounded-md py-1 pr-2 pl-1.5 text-sm relative flex w-full cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent/50"
                  )}
                >
                  <Checkbox checked={isSelected} className="pointer-events-none" />
                  <span>{item.label}</span>
                </ComboboxPrimitive.Item>
              );
            }}
          </ComboboxList>
          <ComboboxEmpty>No versions found.</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
