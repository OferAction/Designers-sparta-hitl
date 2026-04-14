import { useMemo } from "react";

import { ReactFlowState, useStore } from "@xyflow/react";

import { useBFSOrdering } from "@/modules/flow/components/ContextualPanel/RunFlow/useBFSOrdering";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TreeNode } from "@/modules/flow/components/ContextualPanel/RunFlow/ExecutionPath/TreeNode";
import { buildParentChildMap, convertNodeToTreeItem } from "@/modules/flow/components/ContextualPanel/shared/treeUtils";
import { Node } from "@/modules/flow/types";

const selector = (state: ReactFlowState) => state.nodes as Node[];

export const ExecutionPathSection = () => {
  const { getBFSOrderedNodes } = useBFSOrdering();
  const allNodes = useStore(selector);

  const orderedNodes = getBFSOrderedNodes();

  const parentChildMap = useMemo(() => buildParentChildMap(allNodes), [allNodes]);

  const treeData = useMemo(() => {
    return orderedNodes.map((node) => convertNodeToTreeItem(node, parentChildMap));
  }, [orderedNodes, parentChildMap]);

  if (orderedNodes.length === 0) {
    return (
      <div className="px-4 py-2">
        <span className="text-muted-foreground font-inter text-sm">No execution path available</span>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex flex-col max-h-96 min-w-max">
        {treeData.map((item, index) => (
          <TreeNode key={item.path || `${item.name}-${index}`} item={item} level={0} />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
