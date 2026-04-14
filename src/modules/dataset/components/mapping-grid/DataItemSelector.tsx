import { useState } from "react";

import { CaretDownIcon, ArrowRightIcon, XCircleIcon } from "@phosphor-icons/react";

import { isTypeMismatch as isTypeMismatchStrings } from "./utils";
import { Button } from "@/components/ui/button";
import { Command, CommandInput } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { TreeView, TreeItem } from "@/components/ui/tree-view";
import { cn } from "@/utils";

const filterTreeData = (items: TreeItem[], searchTerm: string): TreeItem[] => {
  if (!searchTerm) return items;

  const searchLower = searchTerm.toLowerCase();

  const filterItems = (items: TreeItem[]): TreeItem[] => {
    return items.reduce<TreeItem[]>((filtered, item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchLower) ||
        item.type.toLowerCase().includes(searchLower) ||
        (item.sample && item.sample.toLowerCase().includes(searchLower));

      let filteredChildren: TreeItem[] | undefined;
      if (item.children) {
        filteredChildren = filterItems(item.children);
      }

      if (matchesSearch || (filteredChildren && filteredChildren.length > 0)) {
        filtered.push({
          ...item,
          children: filteredChildren,
        });
      }

      return filtered;
    }, []);
  };

  return filterItems(items);
};

interface DataItemSelectorProps {
  datasetTreeData: TreeItem[];
  inputKeysData?: TreeItem[];
  onDataItemSelect?: (item: TreeItem) => void;
  selectedItem?: TreeItem | null;
  expectedType?: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
  triggerContent?: React.ReactNode;
  showVisibilityControl?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

function DataItemSelector({
  datasetTreeData,
  inputKeysData = [],
  onDataItemSelect,
  selectedItem,
  expectedType = null,
  isOpen,
  onOpenChange,
  placeholder,
  triggerContent,
  showVisibilityControl = true,
  isError = false,
  errorMessage,
}: DataItemSelectorProps) {
  const [searchValue, setSearchValue] = useState("");

  const isTypeMismatch = (item?: TreeItem | null, expected?: string | null) => {
    if (!item || !expected) return false;
    return isTypeMismatchStrings(item.type, expected);
  };

  const handleItemSelect = (item: TreeItem) => {
    onDataItemSelect?.(item);
    onOpenChange(false);
    setSearchValue("");
  };

  const filteredLabelsData = searchValue ? filterTreeData(datasetTreeData, searchValue) : datasetTreeData;
  const filteredInputKeysData = searchValue ? filterTreeData(inputKeysData, searchValue) : inputKeysData;

  const mismatch = isTypeMismatch(selectedItem, expectedType);

  const defaultTriggerContent = (
    <Button variant="ghost" className="w-full flex justify-between hover:bg-transparent min-w-0">
      <div className="flex items-center gap-1 min-w-0 flex-1">
        {/* show warning color when selected item type mismatches expectedType; show tooltip on hover */}

        <span className={cn("text-sm truncate", isError ? "text-destructive" : mismatch ? "text-warning" : "text-blue-foreground")}>
          {selectedItem ? selectedItem.name : placeholder || "Select item..."}
        </span>

        <div
          className={cn(
            "h-6 w-6 p-0 group-hover/row:opacity-100 hover:bg-accent rounded-md transition-opacity flex-shrink-0 inline-flex items-center justify-center",
            isOpen && "opacity-100"
          )}
        >
          <CaretDownIcon size={16} weight="regular" />
        </div>
      </div>
      {selectedItem && <ArrowRightIcon size={16} weight="regular" className="flex-shrink-0" />}
    </Button>
  );

  const hasInputKeys = inputKeysData.length > 0;
  const hasLabels = datasetTreeData.length > 0;
  const hasAnyData = hasInputKeys || hasLabels;

  return (
    <div
      className={cn(
        "relative",
        showVisibilityControl && "group-hover/row:opacity-100",
        showVisibilityControl && !selectedItem && !isOpen && "opacity-0"
      )}
    >
      <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
        <TooltipProvider>
          <Tooltip>
            <DropdownMenuTrigger asChild>
              <TooltipTrigger asChild>{triggerContent || defaultTriggerContent}</TooltipTrigger>
            </DropdownMenuTrigger>
            {isError && (
              <TooltipContent side="top" align="start" className="bg-popover">
                <div className="text-sm text-foreground">{errorMessage || "Missing data column. click to replace"}</div>
              </TooltipContent>
            )}
            {mismatch && !isError && (
              <TooltipContent side="top" className="bg-popover text-popover-foreground rounded-md border border-border p-3 max-w-xs">
                <div className="space-y-1 text-sm">
                  <div className="font-medium">
                    <strong>Type mismatch</strong>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Selected: <span className="font-medium">{selectedItem?.type || "Unknown"}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Expected: <span className="font-medium">{expectedType || "Unknown"}</span>
                  </div>
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent side="bottom" align="start" className="p-0 bg-popover border-border rounded-md shadow-md overflow-hidden">
          <Command className="bg-popover border-0">
            <CommandInput
              placeholder={hasInputKeys ? "Search input keys or label" : "Search label"}
              value={searchValue}
              onValueChange={setSearchValue}
              className="border-border bg-popover text-muted-foreground placeholder:text-muted-foreground text-sm"
            />

            <ScrollArea className="flex-1">
              <div className="max-h-80 flex flex-col relative">
                {/* Input Keys Section */}
                {hasInputKeys && (
                  <div className=" border-border">
                    <div className="px-2 py-1.5">
                      <span className="text-xs font-normal text-muted-foreground">
                        {searchValue && filteredInputKeysData.length === 0 ? "Matched Input Keys (0)" : "Input Keys"}
                      </span>
                    </div>
                    {filteredInputKeysData.length > 0 ? (
                      <TreeView
                        data={filteredInputKeysData}
                        onItemSelect={handleItemSelect}
                        searchValue={searchValue}
                        draggable={false}
                        showSample={false}
                        allowParentSelect={true} // parents disabled: items with children cannot be selected
                        disableParentToggle={true}
                        showParentDisabledStyle={false}
                      />
                    ) : searchValue ? (
                      <div className="flex items-center justify-center pb-4 gap-1 text-muted-foreground">
                        <XCircleIcon size={16} weight="fill" />
                        <div className="text-center text-sm">no matched input keys</div>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Labels Section */}
                {hasLabels && (
                  <div>
                    <div className="px-2 py-1.5 ">
                      <span className="text-xs font-normal text-muted-foreground">
                        {searchValue && filteredLabelsData.length === 0 ? "Matched Labels (0)" : "Labels"}
                      </span>
                    </div>
                    {filteredLabelsData.length > 0 ? (
                      <TreeView
                        data={filteredLabelsData}
                        onItemSelect={handleItemSelect}
                        searchValue={searchValue}
                        draggable={false}
                        showSample={false}
                        allowParentSelect={true} // parents disabled: items with children cannot be selected
                        disableParentToggle={true}
                        showParentDisabledStyle={false}
                      />
                    ) : searchValue ? (
                      <div className="flex items-center justify-center pb-4 gap-1 text-muted-foreground">
                        <XCircleIcon size={16} weight="fill" />
                        <div className="text-center text-sm">no matched labels</div>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* No data at all */}
                {!hasAnyData && (
                  <div className="flex items-center justify-center pb-4 gap-1 text-muted-foreground">
                    <XCircleIcon size={16} weight="fill" />
                    <div className="text-center text-sm">no data available</div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Command>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default DataItemSelector;
