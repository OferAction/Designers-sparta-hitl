import React, { useMemo } from "react";

import { BaseNode, FlowConfiguration } from "../../types";
import { hasProtectedNode } from "../../utils/hasProtectedNode";
import { ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { NODE_CATEGORY_GROUP, NODE_GROUP_COLOR, NodeIconsMapping } from "@/constants";
interface NodeItemsProps {
  nodeTemplates?: FlowConfiguration;
  searchTerm: string;
  isDropdownMenu?: boolean;
  onAdd: (data: BaseNode["data"]) => void;
}

const NodeItems: React.FC<NodeItemsProps> = ({ nodeTemplates, searchTerm, isDropdownMenu, onAdd }) => {
  const allNodes = Object.values(nodeTemplates || {}).filter((node): node is NonNullable<FlowConfiguration[keyof FlowConfiguration]> => {
    if (!node || !node.data || node.type === "subflow" || node.type === "connector" || hasProtectedNode(node)) return false;
    return true;
  });
  const term = searchTerm.trim().toLowerCase();
  const list = allNodes
    .filter((n) => n.type !== "start" && n.type !== "end")
    .filter((n) => {
      if (!term) return true;
      const title = String(n.data?.title || "").toLowerCase();
      const type = String(n.type || "").toLowerCase();
      return title.includes(term) || type.includes(term);
    });

  const groupedNodes = useMemo(() => {
    const groups: Record<keyof typeof NODE_GROUP_COLOR, any[]> = {
      Agents: [],
      Custom: [],
      "Data Processing": [],
      Logic: [],
    };
    list.forEach((node: any) => {
      const nameKey = node.data.name as string;
      const groupKey = NODE_CATEGORY_GROUP[nameKey];
      groups[groupKey].push(node);
    });
    const orderedKeys: (keyof typeof NODE_GROUP_COLOR)[] = ["Agents", "Logic", "Data Processing", "Custom"];
    return orderedKeys
      .filter((k) => groups[k].length > 0)
      .map((category) => ({ category, color: NODE_GROUP_COLOR[category as keyof typeof NODE_GROUP_COLOR], nodes: groups[category] }));
  }, [list]);

  if (!nodeTemplates) {
    return <div className="py-2 text-center text-foreground text-xs select-none">Loading...</div>;
  }

  if (!list.length) {
    return <div className="py-2 text-center text-foreground text-xs select-none">No nodes found</div>;
  }
  return (
    <>
      {groupedNodes.map((group, index: number) => (
        <React.Fragment key={`group-${group.category}`}>
          <div className="px-2 py-1">
            <span className="text-xs font-medium text-muted-foreground">{group.category}</span>
          </div>

          {group.nodes.map((n) => {
            const ItemIcon = NodeIconsMapping[n.data.name as keyof typeof NodeIconsMapping] || NodeIconsMapping["start"];
            const common = (
              <div className="flex items-center gap-2 truncate">
                {ItemIcon && <ItemIcon className="size-4" style={{ color: `hsl(${group.color})` }} />}
                <span className="truncate">{n.data.title}</span>
              </div>
            );

            return (
              <React.Fragment key={n.id}>
                {isDropdownMenu ? (
                  <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => onAdd(n.data)}>
                    {common}
                  </DropdownMenuItem>
                ) : (
                  <ContextMenuItem className="cursor-pointer gap-2" onClick={() => onAdd(n.data)}>
                    {common}
                  </ContextMenuItem>
                )}
              </React.Fragment>
            );
          })}

          {index < groupedNodes.length - 1 && (isDropdownMenu ? <DropdownMenuSeparator /> : <ContextMenuSeparator />)}
        </React.Fragment>
      ))}
    </>
  );
};
export default NodeItems;
