import React, { useMemo, useState } from "react";

import { PlusIcon } from "@phosphor-icons/react";

import { NodeCard } from "./NodeCard";
import { NodeCatalogCaretDownIcon as CaretDownIcon } from "@/lib/icons";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CommandItem, CommandList } from "@/components/ui/command";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCatalogDragHandlers } from "@/modules/flow/hooks";
import { File, useFileActions } from "@/modules/workspace";
import { cn } from "@/utils";

type NodesCatalogSubflowsProps = {
  commandListRef: React.RefObject<HTMLDivElement>;
  searchValue: string;
  selectedNodeType: string | null;
  subflows: (File & { flowName: string })[];
  isSubflowsLoading?: boolean;
  isSubflowsError?: boolean;
  currentConfigId: string | null;
  onSelectSubflow: (params: { subflowConfigId?: string; subflowId?: string; label?: string }) => void;
};

export const SubflowsCatalogList: React.FC<NodesCatalogSubflowsProps> = ({
  commandListRef,
  searchValue,
  selectedNodeType,
  subflows,
  isSubflowsLoading,
  isSubflowsError,
  currentConfigId,
  onSelectSubflow,
}) => {
  const [openStart, setOpenStart] = useState<boolean>(true);
  const { currentDraggedItemId, handleDragStart, handleDragEnd, handleDragEnter, handleDragOver, handleDragLeave } = useCatalogDragHandlers();
  const { addUntitledSubflow } = useFileActions(false);

  const filteredAndSortedItems = useMemo(() => {
    const subflowList = currentConfigId ? subflows.filter((file: any) => file.activeConfigurationId !== currentConfigId) : subflows;
    if (!searchValue.trim()) return subflowList;
    const query = searchValue.toLowerCase();
    return subflowList
      .filter((file) => {
        if (file.name.toLowerCase() === query) return true;
        if (file.name.toLowerCase().includes(query)) return true;
        if (file.description?.toLowerCase().includes(query)) return true;
        return false;
      })
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        if (aName === query && bName !== query) return -1;
        if (aName !== query && bName === query) return 1;
        if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
        if (!aName.startsWith(query) && bName.startsWith(query)) return 1;
        return aName.localeCompare(bName);
      });
  }, [subflows, searchValue, currentConfigId]);

  if (isSubflowsLoading) {
    return <div className="py-6 text-center text-muted-foreground">Loading subflows...</div>;
  }
  if (isSubflowsError) {
    return <div className="py-6 text-center text-destructive">Error loading subflows</div>;
  }
  return (
    <CommandList ref={commandListRef} className="max-w-full max-h-full scrollbar-none">
      {!filteredAndSortedItems.length ? (
        <div className="py-6 text-center text-muted-foreground">{searchValue.trim() ? "No matching subflows found" : "No Subflows Found"}</div>
      ) : (
        <>
          <Collapsible className="pl-4 pr-2" open={openStart} onOpenChange={setOpenStart}>
            <div>
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full py-2 pr-2">
                  <span className="text-xs text-sidebar-foreground">Subflows</span>
                  <CaretDownIcon
                    className={cn("h-[4px] w-[7px] transition-transform", openStart ? "rotate-[180deg]" : "rotate-[0deg]", "text-muted-foreground")}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {filteredAndSortedItems.map((file: any) => {
                  const dragged = currentDraggedItemId === file.id;
                  const isSearchMatch = searchValue.trim() && file.name.toLowerCase().includes(searchValue.trim().toLowerCase());
                  const isSelected = selectedNodeType === "subflow";
                  return (
                    <React.Fragment key={`file${file.id}`}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="w-full">
                            <CommandItem
                              className={cn(
                                "items-start rounded-none relative cursor-grab transition-all duration-500 ease-in-out p-2 pl-0 hover:rounded-md truncate",
                                isSearchMatch ? "bg-accent/10" : "",
                                isSelected ? "bg-accent text-accent-foreground font-medium" : "",
                                "hover:bg-muted"
                              )}
                              draggable
                              tabIndex={0}
                              onDragStart={(event) =>
                                handleDragStart(event, "subflow", file.id, {
                                  subflowConfigId: file.activeConfigurationId,
                                  subflowId: file.id,
                                  label: file.name,
                                })
                              }
                              onDragEnd={handleDragEnd}
                              onDragEnter={handleDragEnter}
                              onDragLeave={(event) =>
                                handleDragLeave(event, "subflow", {
                                  subflowConfigId: file.activeConfigurationId,
                                  subflowId: file.id,
                                  label: file.name,
                                })
                              }
                              onDragOver={handleDragOver}
                              data-dragged={dragged}
                              onSelect={() => onSelectSubflow({ subflowConfigId: file.activeConfigurationId, subflowId: file.id, label: file.name })}
                              data-node-type="subflow"
                              data-selected={isSelected}
                              aria-label={`Drag ${file.name}`}
                            >
                              <NodeCard isSubflowNode={true} node={file} dragged={dragged} searchTerm={searchValue.trim() || undefined} />
                            </CommandItem>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>{file.description || file.name}</span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </React.Fragment>
                  );
                })}
              </CollapsibleContent>
            </div>
          </Collapsible>
          <CommandItem
            className="items-start relative cursor-pointer transition-all duration-500 ease-in-out py-2 px-0 ml-4 mr-2 data-[disabled=false]:hover:!bg-transparent hover:rounded-md"
            onSelect={() => {
              addUntitledSubflow().then((file) => {
                onSelectSubflow({ subflowConfigId: file.activeConfigurationId, subflowId: file.id, label: file.name });
              });
            }}
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center p-1 rounded bg-accent">
                <PlusIcon />
              </div>
              <span className="text-foreground">Add new...</span>
            </div>
          </CommandItem>
        </>
      )}
    </CommandList>
  );
};
