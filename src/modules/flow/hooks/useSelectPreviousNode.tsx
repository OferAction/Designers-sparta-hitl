import { useCallback } from "react";

import { useFlowStore } from "@/store";
import { useCheckCanvasPermission } from "@/store/slices/flowSlice";

/**
 * Custom hook to select the previous node in the flow
 * Follows the incoming edge to the currently selected node
 * If no node is selected, selects the end node or last node
 */
export const useSelectPreviousNode = () => {
  const checkCanvasPermission = useCheckCanvasPermission();
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
  const selectedNodeIds = useFlowStore((state) => state.selectedNodeIds);
  const onNodesChange = useFlowStore((state) => state.onNodesChange);

  const selectPreviousNode = useCallback(() => {
    if (!checkCanvasPermission("canSelectNodes")) return;

    if (nodes.length === 0 || selectedNodeIds.length > 1) return;

    const currentNodeId = selectedNodeId;

    let prevNodeId: string | null = null;

    if (currentNodeId) {
      const incomingEdge = edges.find((e) => e.target === currentNodeId);
      if (incomingEdge) {
        prevNodeId = incomingEdge.source;
      }
    } else {
      const endNode = nodes.find((n) => n.type === "end");
      prevNodeId = endNode?.id || nodes[nodes.length - 1]?.id || null;
    }

    if (prevNodeId) {
      onNodesChange([
        ...nodes.filter((n) => n.selected).map((n) => ({ id: n.id, type: "select" as const, selected: false })),
        { id: prevNodeId, type: "select" as const, selected: true },
      ]);
    }
  }, [checkCanvasPermission, nodes, edges, selectedNodeId, selectedNodeIds, onNodesChange]);

  return selectPreviousNode;
};
