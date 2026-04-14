import { useCallback } from "react";

import { useFlowStore } from "@/store";
import { useCheckCanvasPermission } from "@/store/slices/flowSlice";

/**
 * Custom hook to select the next node in the flow
 * Follows the outgoing edge from the currently selected node
 * If no node is selected, selects the start node or first node
 */
export const useSelectNextNode = () => {
  const checkCanvasPermission = useCheckCanvasPermission();
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
  const selectedNodeIds = useFlowStore((state) => state.selectedNodeIds);
  const onNodesChange = useFlowStore((state) => state.onNodesChange);

  const selectNextNode = useCallback(() => {
    if (!checkCanvasPermission("canSelectNodes")) return;

    if (nodes.length === 0 || selectedNodeIds.length > 1) return;

    const currentNodeId = selectedNodeId;

    let nextNodeId: string | null = null;

    if (currentNodeId) {
      const outgoingEdge = edges.find((e) => e.source === currentNodeId);
      if (outgoingEdge) {
        nextNodeId = outgoingEdge.target;
      }
    } else {
      const startNode = nodes.find((n) => n.type === "start");
      nextNodeId = startNode?.id || nodes[0]?.id || null;
    }

    if (nextNodeId) {
      onNodesChange([
        ...nodes.filter((n) => n.selected).map((n) => ({ id: n.id, type: "select" as const, selected: false })),
        { id: nextNodeId, type: "select" as const, selected: true },
      ]);
    }
  }, [checkCanvasPermission, nodes, edges, selectedNodeId, selectedNodeIds, onNodesChange]);

  return selectNextNode;
};
