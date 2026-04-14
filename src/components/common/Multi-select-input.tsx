import React from "react";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/comboboxNew";
import { cn } from "@/lib/utils";

interface MultiSelectInputProps<T> {
  items?: readonly T[];
  value?: T[];
  defaultValue?: T[];
  onValueChange?: (values: T[]) => void;

  getItemValue: (item: T) => string;
  getItemLabel?: (item: T) => string;
  renderItem?: (item: T) => React.ReactNode;
  renderChip?: (item: T) => React.ReactNode;
  filterItems?: (items: readonly T[], search: string) => readonly T[];
  onSearchChange?: (search: string) => void;

  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  container?: React.RefObject<HTMLDivElement>;
}

export function MultiSelectInput<T>({
  items = [],
  value,
  onValueChange,
  getItemValue,
  getItemLabel,
  renderItem,
  renderChip,
  filterItems,
  onSearchChange,
  placeholder,
  emptyMessage = "No items found.",
  disabled = false,
  container,
}: MultiSelectInputProps<T>) {
  const anchor = useComboboxAnchor();
  const label = getItemLabel ?? getItemValue;
  const [search, setSearch] = React.useState("");

  const visibleItems = React.useMemo(() => {
    if (filterItems) return filterItems(items, search);
    return items;
  }, [items, search, filterItems]);

  const itemsByValue = React.useMemo(() => {
    const map = new Map<string, T>();
    for (const item of items) {
      map.set(getItemValue(item), item);
    }
    return map;
  }, [items, getItemValue]);

  const stringItems = React.useMemo(() => visibleItems.map(getItemValue), [visibleItems, getItemValue]);


  const stringValue = React.useMemo(() => value?.map(getItemValue), [value, getItemValue]);

  const scrollChipsToEnd = React.useCallback(() => {
    if (!anchor.current) return;
    const chipContainer = anchor.current;
    requestAnimationFrame(() => {
      chipContainer.scrollTo({ left: chipContainer.scrollWidth, behavior: "smooth" });
    });
  }, [anchor]);

  const handleValueChange = React.useCallback(
    (selected: string[]) => {
      if (!onValueChange) return;
      const previousSelectedCount = stringValue?.length ?? 0;
      const mapped = selected.map((v) => itemsByValue.get(v)).filter((item): item is T => item != null);
      onValueChange(mapped);

      if (selected.length > previousSelectedCount) {
        scrollChipsToEnd();
      }
    },
    [onValueChange, itemsByValue, scrollChipsToEnd, stringValue]
  );

  const handleInput = React.useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const val = e.currentTarget.value;
      setSearch(val);
      onSearchChange?.(val);
    },
    [onSearchChange]
  );

  return (
    <Combobox
      multiple
      items={stringItems}
      autoHighlight={true}
      value={stringValue}
      onValueChange={onValueChange ? handleValueChange : undefined}
      disabled={disabled}
    >
      <ComboboxChips ref={anchor} className={"flex-1 flex-nowrap overflow-x-auto min-w-0 max-w-full scrollbar-none !bg-background w-full focus-within:ring-0 "}>
        <ComboboxValue>
          {(values) => (
            <React.Fragment>
              {values.map((val: string) => {
                const item = itemsByValue.get(val);
                return (
                  <ComboboxChip
                    key={val}
                    className={"bg-secondary text-secondary-foreground text-xs rounded-sm p-0.25 px-1 shrink-0"}
                    removeClassName={"opacity-70 hover:opacity-100 m-0 p-0.5 mb-0.5"}
                    removeIconClassName={"!h-3 !w-3"}
                  >
                    {item && renderChip ? renderChip(item) : item ? label(item) : val}
                  </ComboboxChip>
                );
              })}
              <ComboboxChipsInput placeholder={placeholder} className={cn("flex-1 bg-transparent p-1")} onInput={handleInput} />
            </React.Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent container={container} anchor={anchor} >
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {(val) => {
            const item = itemsByValue.get(val);
            return (
              <ComboboxItem key={val} value={val} className="data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&[data-highlighted]_span]:text-accent-foreground hover:bg-accent/50 cursor-pointer p-2 rounded-md">
                {item && renderItem ? renderItem(item) : item ? label(item) : val}
              </ComboboxItem>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
