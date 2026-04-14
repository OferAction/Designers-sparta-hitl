import React, { useEffect, useMemo, useRef, useState } from "react";

import { XIcon } from "@phosphor-icons/react";
import { useReactFlow, useStoreApi } from "@xyflow/react";
import { useParams } from "react-router-dom";
import { useShallow } from "zustand/shallow";

import useClickOutside from "@/hooks/useClickOutside";
import { useAddNode } from "@/modules/flow/hooks/useAddNode";

import { ConnectorsCatalogList } from "./ConnectorsCatalogList";
import { NodesCatalogList } from "./NodesCatalogList";
import { SubflowsCatalogList } from "./SubflowsCatalogList";
import { useGetConfigConverter } from "../../services/configConverterService";
import { Button } from "@/components/ui/button";
import { Command, CommandInput } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FlowConfiguration, NodeTypes } from "@/modules/flow/types";
import { File } from "@/modules/workspace";
import { useGetSubflowsProjectService } from "@/services/subflowConfiguratinService";
import { FlowStoreState, useFlowStore } from "@/store";
import { cn } from "@/utils";

import { hasProtectedNode } from "@/modules/flow/utils/hasProtectedNode";

const selector = (state: FlowStoreState) => ({
  leftPanelActiveItem: state.leftPanelActiveItem,
  setLeftPanelActiveItem: state.setLeftPanelActiveItem,
});

export const NodesCatalog: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);
  const { leftPanelActiveItem, setLeftPanelActiveItem } = useFlowStore(useShallow(selector));
  const store = useStoreApi();
  const { addNode } = useAddNode();
  const { screenToFlowPosition } = useReactFlow();
  const catalogRef = useRef<HTMLDivElement>(null);
  const commandListRef = useRef<HTMLDivElement>(null);
  const { data: nodeTemplates, isLoading: isNodesLoading, isError: isNodesError } = useGetConfigConverter();
  const { data: subflowsData, isLoading: isSubflowsLoading, isError: isSubflowsError } = useGetSubflowsProjectService();
  const { configId, subflowConfigId } = useParams();

  // Add useClickOutside hook to close the catalog when clicking outside
  useClickOutside(catalogRef, (event) => {
    const target = event.target as HTMLElement;
    if (target.closest("[data-config-menu]")) {
      return;
    }
    const menuItem = target.closest("[data-menu-item]");
    if (menuItem && ["Nodes", "Subflow", "Connectors"].includes(menuItem.getAttribute("data-menu-item") || "")) {
      return;
    }
    if (leftPanelActiveItem === "NodeTemplates" || leftPanelActiveItem === "SubflowTemplates" || leftPanelActiveItem === "ConnectorTemplates") {
      setLeftPanelActiveItem(null);
    }
  });

  // Flatten subflows data
  const subflows: (File & { flowName: string })[] = useMemo(() => {
    if (!subflowsData || !subflowsData.length) return [];
    return subflowsData.flatMap((flow) =>
      flow.files?.map((file) => ({
        ...file,
        flowName: flow.name,
      }))
    );
  }, [subflowsData]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        (leftPanelActiveItem === "NodeTemplates" || leftPanelActiveItem === "SubflowTemplates" || leftPanelActiveItem === "ConnectorTemplates")
      ) {
        setLeftPanelActiveItem("none");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [leftPanelActiveItem, setLeftPanelActiveItem]);

  useEffect(() => {
    if (commandListRef.current) {
      commandListRef.current.scrollTop = 0;
    }
  }, [searchValue]);

  // Filter and sort based on active tab
  const filteredAndSortedItems: any = useMemo(() => {
    // When searching nodes (excluding connector nodes)
    if (leftPanelActiveItem === "NodeTemplates") {
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
    }
    // When searching subflows
    else if (leftPanelActiveItem === "SubflowTemplates") {
      if (!subflows) return [];

      const id = subflowConfigId && configId ? subflowConfigId : configId && !subflowConfigId ? configId : null;

      const subflowList = id ? subflows.filter((file: any) => file.activeConfigurationId !== id) : subflows;

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
    }
    // When searching plugins (connector nodes only)
    else if (leftPanelActiveItem === "ConnectorTemplates") {
      if (!nodeTemplates) return [];

      const connectorNodes = Object.values(nodeTemplates).filter((node): node is NonNullable<FlowConfiguration[keyof FlowConfiguration]> => {
        if (!node || !node.data || node.type !== "connector") return false;
        return true;
      });

      if (!searchValue.trim()) return connectorNodes;

      const query = searchValue.toLowerCase();

      const filteredConnectors = connectorNodes.filter((node) => {
        if (node.data.title.toLowerCase() === query) return true;
        return node.data.title.toLowerCase().includes(query);
      });

      return filteredConnectors.sort((a, b) => {
        const aTitle = a.data.title.toLowerCase();
        const bTitle = b.data.title.toLowerCase();

        if (aTitle === query && bTitle !== query) return -1;
        if (aTitle !== query && bTitle === query) return 1;

        if (aTitle.startsWith(query) && !bTitle.startsWith(query)) return -1;
        if (!aTitle.startsWith(query) && bTitle.startsWith(query)) return 1;

        return aTitle.localeCompare(bTitle);
      });
    }

    return [];
  }, [leftPanelActiveItem, nodeTemplates, searchValue, subflows, subflowConfigId, configId]);

  // Update autoCompleteInfo to work with nodes, subflows, and plugins
  const autoCompleteInfo = useMemo(() => {
    if (!searchValue.trim() || !filteredAndSortedItems.length) {
      return { before: "", match: "", after: "", canSuggest: false };
    }

    // Get title based on active tab
    const itemTitle =
      leftPanelActiveItem === "SubflowTemplates" ? (filteredAndSortedItems[0] as any).name : (filteredAndSortedItems[0] as any).data.title;

    const searchLower = searchValue.toLowerCase().trim();
    const titleLower = itemTitle.toLowerCase();
    const matchIndex = titleLower.indexOf(searchLower);

    if (matchIndex === -1) return { before: "", match: itemTitle, after: "", canSuggest: false };

    return {
      before: itemTitle.substring(0, matchIndex),
      match: itemTitle.substring(matchIndex, matchIndex + searchValue.length),
      after: itemTitle.substring(matchIndex + searchValue.length),
      canSuggest: titleLower !== searchLower,
    };
  }, [searchValue, filteredAndSortedItems, leftPanelActiveItem]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Tab" || e.key === "ArrowRight") && searchValue.trim() && filteredAndSortedItems.length > 0) {
      e.preventDefault();
      const matchedNode = filteredAndSortedItems[0];

      if (leftPanelActiveItem === "NodeTemplates" || leftPanelActiveItem === "ConnectorTemplates") {
        setSearchValue(matchedNode.data.title);
        setSelectedNodeType(matchedNode.data.name);
      } else if (leftPanelActiveItem === "SubflowTemplates") {
        setSearchValue(matchedNode.name);
        setSelectedNodeType("subflow");
      }

      setTimeout(() => {
        let nodeType: string;
        if (leftPanelActiveItem === "NodeTemplates" || leftPanelActiveItem === "ConnectorTemplates") {
          nodeType = matchedNode.data.name; // Use node name for data-node-type
        } else if (leftPanelActiveItem === "SubflowTemplates") {
          nodeType = "subflow";
        } else {
          nodeType = "";
        }

        const nodeElement = document.querySelector(`[data-node-type="${nodeType}"]`);

        if (nodeElement && nodeElement instanceof HTMLElement) {
          nodeElement.scrollIntoView({ behavior: "smooth", block: "center" });

          nodeElement.classList.add("flash-highlight");
          setTimeout(() => nodeElement.classList.remove("flash-highlight"), 1000);

          nodeElement.focus();
        } else {
          console.error("Node element not found in DOM after autocomplete", nodeType);
        }
      }, 300);
    }
  };

  const handleNodeSelect = (
    nodeType: NodeTypes,
    { subflowConfigId, subflowId, label = "" }: { subflowConfigId?: string; subflowId?: string; label?: string } = {}
  ) => {
    const { domNode, resetSelectedElements } = store.getState();
    const { width, height, x = 0 } = domNode?.getBoundingClientRect() || { width: 800, height: 600 };

    // Calculate the center position in screen coordinates
    const centerX = width / 2;
    const centerY = height / 2;

    // Convert screen coordinates to flow coordinates
    const position = screenToFlowPosition({ x: centerX + x, y: centerY });
    const isSubflow = nodeType === "subflow";
    resetSelectedElements();
    const rest: object = {
      selected: true,
      zIndex: 9999,
      ...(isSubflow && { subflowConfigId: nodeType == "subflow" ? subflowConfigId : null, subflowId: nodeType == "subflow" ? subflowId : null }),
      data: {
        label,
      },
    };

    addNode(nodeType, position, rest);
  };

  return (
    <Command
      ref={catalogRef}
      className={cn(
        leftPanelActiveItem !== "NodeTemplates" &&
          leftPanelActiveItem !== "SubflowTemplates" &&
          leftPanelActiveItem !== "ConnectorTemplates" &&
          "hidden",
        "py-[10px] absolute  z-[40] -right-[300px] top-0  h-full w-[290px] bg-sidebar-background/30 backdrop-blur-[20px] transition-all ease-in-out  hover-fix duration-200"
      )}
      style={{
        pointerEvents: "auto",
      }}
      shouldFilter={false}
    >
      <div className="flex flex-col items-center justify-between p-3 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className={cn("relative transition-all duration-150 ease-in-out rounded-t-md")}>
            {autoCompleteInfo.canSuggest && (
              <div className="absolute text-base left-6 top-0 h-10 flex items-start pointer-events-none whitespace-pre">
                <span className="text-muted-foreground/70">{autoCompleteInfo.before}</span>
                <span className="text-primary font-medium">{searchValue}</span>
                <span className="text-muted-foreground/60">{autoCompleteInfo.after}</span>
              </div>
            )}

            <CommandInput
              placeholder="Search..."
              value={searchValue}
              suggestion={autoCompleteInfo}
              onValueChange={setSearchValue}
              containerClassName={cn(
                "transition-all duration-150 ease-in-out relative z-10 p-0 border-none h-5",
                searchValue.trim() && autoCompleteInfo.canSuggest ? "caret-primary selection:bg-accent/30" : ""
              )}
              onKeyDown={handleKeyDown}
              className={cn("p-0 rounded-none text-base", autoCompleteInfo.canSuggest && "text-transparent")}
            />
          </div>
          <div className="flex items-center">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setSearchValue("")}
              className={cn("p-1 w-6 h-6 opacity-0", searchValue && "opacity-1")}
              type="button"
            >
              <XIcon weight="regular" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="h-full w-full [&>div>div]:!block">
        {leftPanelActiveItem === "NodeTemplates" && (
          <NodesCatalogList
            commandListRef={commandListRef}
            searchValue={searchValue}
            selectedNodeType={selectedNodeType}
            nodeTemplates={nodeTemplates}
            isNodesLoading={isNodesLoading}
            isNodesError={isNodesError}
            onSelectNode={(nodeType) => handleNodeSelect(nodeType)}
          />
        )}
        {leftPanelActiveItem === "SubflowTemplates" && (
          <SubflowsCatalogList
            commandListRef={commandListRef}
            searchValue={searchValue}
            selectedNodeType={selectedNodeType}
            subflows={subflows}
            isSubflowsLoading={isSubflowsLoading}
            isSubflowsError={isSubflowsError}
            currentConfigId={subflowConfigId && configId ? subflowConfigId : configId && !subflowConfigId ? configId : null}
            onSelectSubflow={(params) => handleNodeSelect("subflow", params)}
          />
        )}
        {leftPanelActiveItem === "ConnectorTemplates" && (
          <ConnectorsCatalogList
            commandListRef={commandListRef}
            searchValue={searchValue}
            selectedNodeType={selectedNodeType}
            nodeTemplates={nodeTemplates}
            isNodesLoading={isNodesLoading}
            isNodesError={isNodesError}
            onSelectPlugin={(nodeType) => handleNodeSelect(nodeType as NodeTypes)}
          />
        )}
      </ScrollArea>
    </Command>
  );
};
