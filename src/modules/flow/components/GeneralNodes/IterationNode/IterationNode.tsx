import { memo, useEffect, useMemo, useRef, useState } from "react";

import { MagnifyingGlassIcon, PlusIcon } from "@phosphor-icons/react";
import { Background, BackgroundVariant, NodeProps, Panel } from "@xyflow/react";

import { useChildNodeAddEffect, useChildNodeExtentUpdateEffect, useChildNodeRemoveEffect, useChildNodeResizeEffect } from "./hooks";
import { useAddNodeFromDropdown } from "../../../hooks/useAddNodeFromDropDown";
import NodeItems from "../../ContextMenus/NodeItems";
import { NodeContainer, NodeTitle } from "../../Node";
import { NodeResizeControl } from "../NodeResizeControl";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { MIN_NODE_HEIGHT, MIN_NODE_WIDTH } from "@/modules/flow/constants";
import { useGetConfigConverter } from "@/modules/flow/services";
import { NodeVariant } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

function IterationNode({ data, id, selected, parentId }: NodeProps<NodeVariant<"iterator">>) {
  const [isEmpty, setIsEmpty] = useState(true);
  const { handleAddNode } = useAddNodeFromDropdown({ sourceParentId: id, shouldAddInsideSourceParent: true });
  const subContainerRef = useRef<HTMLDivElement>(null);
  const [nodeSearch, setNodeSearch] = useState("");
  const { data: nodeTemplates } = useGetConfigConverter();
  const { nodes, onChange } = useFlowStore((state) => ({ nodes: state.nodes, onChange: state.onChange }));

  const [resizeProps, setResizeProps] = useState(() => ({
    minHeight: MIN_NODE_HEIGHT,
    minWidth: MIN_NODE_WIDTH,
  }));

  // Get all child nodes and their outputs
  const childOutputs = useMemo(() => {
    const childNodes = nodes.filter((node) => node.parentId === id);
    return childNodes.flatMap((node) => node.data.outputs.map((output) => ({ ...output, nodeId: output.nodeId || node.id })) || []);
  }, [nodes, id]);

  // Initial check to set isEmpty state
  useEffect(() => {
    setIsEmpty(useFlowStore.getState().nodes.filter((node) => node.parentId === id).length === 0);
  }, [id]);

  // Update iterator outputs based on child outputs (update or remove only, no new additions)
  useEffect(() => {
    // Create a map of child outputs for quick lookup
    const childOutputMap = new Map<string, (typeof childOutputs)[0]>();
    childOutputs.forEach((output) => {
      const key = `${output.nodeId}.${output.id}`;
      childOutputMap.set(key, output);
    });

    const currentOutputs = data.outputs || [];

    // Only keep current outputs that either:
    // 1. Still exist in children (auto-synced)
    // 2. Were manually added/toggled by user (have sourceNodeId)
    const filteredOutputs = currentOutputs.filter((output) => {
      // Keep manually added outputs from agent template
      if (!output.sourceNodeId) {
        return true;
      }

      // Keep auto-synced outputs that still exist in children
      const key = `${output.nodeId || ""}.${output.originalOutputId}`;
      return childOutputMap.has(key);
    });

    // Check if there are any changes (removals)
    if (filteredOutputs.length !== currentOutputs.length) {
      onChange(id, "outputs", filteredOutputs);
    }
  }, [id, data.outputs, onChange, childOutputs]);

  useChildNodeAddEffect(id, setIsEmpty, setResizeProps);
  useChildNodeRemoveEffect(id, setIsEmpty);
  useChildNodeResizeEffect(id);
  useChildNodeExtentUpdateEffect(id, setResizeProps);

  return (
    <div className="relative min-w-40 h-full">
      <NodeContainer data={data} selected={selected} id={id} nodeTypeWithState={{ type: "iteration", state: "success" }} parentId={parentId}>
        <NodeTitle title={data?.label || data?.title || data?.name} mainIcon={data.name} containerClasses="min-h-12 py-0" />
        <Panel position="top-left" className="m-0 min-w-full w-full h-full relative min-h-20 gap-2 flex flex-col justify-center items-center rounded-2xl">
          <Background id="2" gap={32} size={2} className="bg-background" variant={BackgroundVariant.Dots} color="rgba(248, 250, 252, 0.2)" />
          <div className="min-w-full w-full h-full min-h-20 gap-2 flex flex-col justify-center items-center border rounded-2xl py-2">
            {isEmpty && (
              <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default">
                      <PlusIcon weight="regular" size={16} />
                      <span className="leading-6 font-medium pe-1">Add nodes</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 max-w-64 max-h-64 overflow-auto z-[51]">
                    <div
                      className="flex items-center relative border-b border-border mb-2"
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "ArrowDown") {
                          const firstItem = subContainerRef.current?.querySelector('div[role="menuitem"]') as HTMLDivElement;
                          firstItem?.focus();
                        }
                      }}
                    >
                      <MagnifyingGlassIcon size={16} className="absolute ml-2" />
                      <Input
                        autoFocus
                        placeholder="Search nodes..."
                        value={nodeSearch}
                        onChange={(e) => setNodeSearch(e.target.value)}
                        className="m-0 pl-8 border-none"
                      />
                    </div>
                    <div
                      ref={subContainerRef}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp" && document.activeElement === subContainerRef.current?.querySelector('div[role="menuitem"]')) {
                          const searchInput = subContainerRef.current?.previousElementSibling?.querySelector("input") as HTMLInputElement;
                          searchInput?.scrollTo({ top: 0, behavior: "auto" });
                          searchInput?.focus();
                        }
                      }}
                    >
                      <NodeItems
                        nodeTemplates={nodeTemplates}
                        isDropdownMenu={true}
                        searchTerm={nodeSearch}
                        onAdd={(data) => {
                          handleAddNode(data.name);
                        }}
                      />
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <span className="text-muted-foreground leading-5">Or just drag here</span>
              </div>
            )}
            {!isEmpty && <NodeResizeControl id={id} minHeight={resizeProps.minHeight} minWidth={resizeProps.minWidth} parentId={parentId} />}
          </div>
        </Panel>
      </NodeContainer>
    </div>
  );
}

export default memo(IterationNode);
