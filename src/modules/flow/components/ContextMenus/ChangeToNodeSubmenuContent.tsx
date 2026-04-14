import React, { useMemo, useRef, useState } from "react";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";

import { ContextMenuSubContent, ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { NodeIconsMapping } from "@/constants";
import { useUpdateNodeInternalsAsync } from "@/modules/flow/hooks";
import { useGetConfigConverter } from "@/modules/flow/services";
import { ConditionType, FlowConfiguration, Node } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

import { nodeLabelService } from "@/utils/nodeLabelService";

interface ChangeToNodeSubmenuContentProps {
  nodeId: string;
}

export const ChangeToNodeSubmenuContent: React.FC<ChangeToNodeSubmenuContentProps> = ({ nodeId }) => {
  const { data: nodeTemplates } = useGetConfigConverter();
  const updateNodeInternals = useUpdateNodeInternalsAsync();
  const { nodes, setNodes, setSelectedNodeId, setSelectedNodeIds } = useFlowStore((s) => ({
    nodes: s.nodes,
    setNodes: s.setNodes,
    setSelectedNodeId: s.setSelectedNodeId,
    setSelectedNodeIds: s.setSelectedNodeIds,
  }));
  const [search, setSearch] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const templates = useMemo(() => {
    if (!nodeTemplates) return [] as NonNullable<FlowConfiguration[keyof FlowConfiguration]>[];
    const all = Object.values(nodeTemplates).filter((node): node is NonNullable<FlowConfiguration[keyof FlowConfiguration]> => {
      if (!node || !node.data || node.type === "subflow" || node.type === "connector") return false;
      return true;
    });
    const term = search.trim().toLowerCase();
    return all
      .filter((tpl) => tpl.type !== "start" && tpl.type !== "end")
      .filter((tpl) => {
        if (!term) return true;
        const title = String(tpl.data?.title || "").toLowerCase();
        const type = String(tpl.type || "").toLowerCase();
        return title.includes(term) || type.includes(term);
      });
  }, [nodeTemplates, search]);

  const handleTemplateApply = (tpl: any) => {
    const targetIndex = nodes.findIndex((n) => n.id === nodeId);
    if (targetIndex === -1) return;
    const templateClone = JSON.parse(JSON.stringify(tpl));
    delete templateClone.id;
    if (templateClone.data) {
      templateClone.data.label = nodeLabelService.generateNextLabel(templateClone.data.name);
      if (templateClone.type === "ifelse" && Array.isArray(templateClone.data.conditions)) {
        templateClone.data.conditions = templateClone.data.conditions.map((c: ConditionType) => ({ ...c }));
      }
    }
    const updatedNodes = nodes.map((n: Node) =>
      n.id === nodeId
        ? {
            ...n,
            ...templateClone,
            id: n.id,
            position: n.position,
            selected: true,
          }
        : n
    );
    setNodes(updatedNodes);
    setSelectedNodeId(nodeId);
    if (!updatedNodes.some((n) => n.id !== nodeId && n.selected)) {
      setSelectedNodeIds([nodeId]);
    }
    setTimeout(() => updateNodeInternals(nodeId), 0);
  };

  return (
    <ContextMenuSubContent className="w-44 max-h-64 overflow-auto">
      <div
        className="flex items-center relative border-b border-border mb-2"
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "ArrowDown") {
            const firstItem = listRef.current?.querySelector('div[role="menuitem"]') as HTMLDivElement;
            firstItem?.focus();
          }
        }}
      >
        <MagnifyingGlassIcon size={16} className="absolute ml-2" />
        <Input autoFocus placeholder="Search nodes..." value={search} onChange={(e) => setSearch(e.target.value)} className="m-0 pl-8 border-none" />
      </div>
      <div
        ref={listRef}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" && document.activeElement === listRef.current?.querySelector('div[role="menuitem"]')) {
            const searchInput = listRef.current?.previousElementSibling?.querySelector("input") as HTMLInputElement;
            searchInput?.scrollTo({ top: 0, behavior: "auto" });
            searchInput?.focus();
          }
        }}
      >
        {templates.length === 0 && <div className="py-2 text-center text-foreground text-xs select-none">No nodes found</div>}
        {templates.map((tpl: any, index: number) => {
          const Icon = NodeIconsMapping[tpl.data.name as keyof typeof NodeIconsMapping] || NodeIconsMapping["start"];
          return (
            <React.Fragment key={tpl.id || tpl.type + index}>
              <ContextMenuItem className="cursor-pointer" onClick={() => handleTemplateApply(tpl)}>
                {Icon ? <Icon className="size-4 mr-2 text-foreground" /> : null}
                {tpl.data?.title || tpl.type}
              </ContextMenuItem>
              {index < templates.length - 1 && <ContextMenuSeparator />}
            </React.Fragment>
          );
        })}
      </div>
    </ContextMenuSubContent>
  );
};

export default ChangeToNodeSubmenuContent;
