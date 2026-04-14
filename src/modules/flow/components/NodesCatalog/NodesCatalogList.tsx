import React, { useMemo, useState } from "react";

import { NodeCard } from "./NodeCard";
import { NodeCatalogCaretDownIcon as CaretDownIcon } from "@/lib/icons";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CommandItem, CommandList } from "@/components/ui/command";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCatalogDragHandlers } from "@/modules/flow/hooks";
import { FlowConfiguration, NodeTypes } from "@/modules/flow/types";
import { cn } from "@/utils";

import { hasProtectedNode } from "@/modules/flow/utils/hasProtectedNode";

import { NODE_CATEGORY_GROUP, NODE_GROUP_COLOR } from "@/constants/NodesConstants";

type NodesCatalogNodesProps = {
  commandListRef: React.RefObject<HTMLDivElement>;
  searchValue: string;
  selectedNodeType: string | null;
  nodeTemplates?: FlowConfiguration | undefined;
  isNodesLoading?: boolean;
  isNodesError?: boolean;
  onSelectNode: (nodeType: NodeTypes) => void;
};

export const NodesCatalogList: React.FC<NodesCatalogNodesProps> = ({
  commandListRef,
  searchValue,
  selectedNodeType,
  nodeTemplates,
  isNodesLoading,
  isNodesError,
  onSelectNode,
}) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const { currentDraggedItemId, handleDragStart, handleDragEnd, handleDragEnter, handleDragOver, handleDragLeave } = useCatalogDragHandlers();

  const filteredAndSortedItems = useMemo(() => {
    if (!nodeTemplates) return [];
    const allNodes = Object.values(nodeTemplates).filter((node): node is NonNullable<FlowConfiguration[keyof FlowConfiguration]> => {
      if (!node || !node.data || node.type === "subflow" || node.type === "connector" || hasProtectedNode(node)) return false;
      return true;
    });

    if (!searchValue.trim()) return allNodes;
    const query = searchValue.toLowerCase();
    const filteredNodes = allNodes.filter((node) => {
      if (node.data.title.toLowerCase() === query) return true;
      return node.data.title.toLowerCase().includes(query);
    });

    return filteredNodes.sort((a, b) => {
      const aTitle = a.data.title.toLowerCase();
      const bTitle = b.data.title.toLowerCase();
      if (aTitle === query && bTitle !== query) return -1;
      if (aTitle !== query && bTitle === query) return 1;
      if (aTitle.startsWith(query) && !bTitle.startsWith(query)) return -1;
      if (!aTitle.startsWith(query) && bTitle.startsWith(query)) return 1;
      return aTitle.localeCompare(bTitle);
    });
  }, [nodeTemplates, searchValue]);

  // Group nodes using the canonical 4 groups from NODE_CATEGORY_GROUP
  const groupedNodes = useMemo(() => {
    const groups: Record<keyof typeof NODE_GROUP_COLOR, any[]> = {
      Agents: [],
      Custom: [],
      "Data Processing": [],
      Logic: [],
    };
    filteredAndSortedItems.forEach((node: any) => {
      const nameKey = node.data.name as string;
      const groupKey = NODE_CATEGORY_GROUP[nameKey];
      groups[groupKey].push(node);
    });
    const orderedKeys: (keyof typeof NODE_GROUP_COLOR)[] = ["Agents", "Logic", "Data Processing", "Custom"];
    return orderedKeys
      .filter((k) => groups[k].length > 0)
      .map((category) => ({ category, color: NODE_GROUP_COLOR[category as keyof typeof NODE_GROUP_COLOR], nodes: groups[category] }));
  }, [filteredAndSortedItems]);

  if (isNodesLoading) {
    return <div className="w-full mt-2 flex items-center justify-center text-primary">Loading node templates...</div>;
  }
  if (isNodesError) {
    return <div className="w-full mt-2 flex items-center justify-center text-destructive">Error loading node templates</div>;
  }

  return (
    <CommandList ref={commandListRef} className="max-h-full scrollbar-none">
      {filteredAndSortedItems.length === 0 && searchValue.trim() !== "" ? (
        <div className="py-6 text-center text-muted-foreground">No Nodes Found</div>
      ) : (
        <div className="pl-4 pr-2">
          {groupedNodes.map((group) => (
            <Collapsible
              key={group.category}
              open={openGroups[group.category] ?? true}
              onOpenChange={(next) => setOpenGroups((prev) => ({ ...prev, [group.category]: next }))}
            >
              <div>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center justify-between w-full py-2 pr-2">
                    <span className="text-xs text-sidebar-foreground">{group.category}</span>
                    <CaretDownIcon
                      className={cn(
                        "h-[4px] w-[7px] transition-transform",
                        (openGroups[group.category] ?? true) ? "rotate-[180deg]" : "rotate-[0deg]",
                        "text-muted-foreground"
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {group.nodes.map((node: any) => {
                    const dragged = currentDraggedItemId === node.id;
                    const isSearchMatch = searchValue.trim() && node.data.title.toLowerCase().includes(searchValue.trim().toLowerCase());
                    const isSelected = selectedNodeType === node.data.name;
                    return (
                      <React.Fragment key={`file${node.id}`}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="w-full">
                              <CommandItem
                                key={node.id}
                                className={cn(
                                  "items-start rounded-none relative cursor-grab transition-all duration-500 ease-in-out p-2 pl-0 hover:rounded-md truncate",
                                  isSearchMatch ? "bg-accent/10" : "",
                                  isSelected ? "bg-accent text-accent-foreground font-medium" : "",
                                  "hover:bg-muted"
                                )}
                                onDragStart={(event) => handleDragStart(event, node.data.name, node.id)}
                                onDragEnter={handleDragEnter}
                                onDragEnd={handleDragEnd}
                                onDragLeave={(event) => handleDragLeave(event, node.data.name)}
                                onDragOver={handleDragOver}
                                data-dragged={dragged}
                                data-node-type={node.data.name}
                                data-selected={isSelected}
                                onSelect={() => onSelectNode(node.data.name)}
                                draggable
                                tabIndex={0}
                                aria-label={`Drag ${node.data.title}`}
                              >
                                <NodeCard node={node.data} dragged={dragged} searchTerm={searchValue.trim() || undefined} />
                              </CommandItem>
                            </TooltipTrigger>
                            <TooltipContent>
                              <span>{node.data.description || node.data.name}</span>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </React.Fragment>
                    );
                  })}
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      )}
    </CommandList>
  );
};
