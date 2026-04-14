import { useCallback } from "react";

import { useReactFlow } from "@xyflow/react";

import { FlowStoreState, useFlowStore } from "@/store";

// Compute ancestor iterator node ids for a given node id (outer-most first)

export function useAncestorIteratorIds() {
  const reactFlowInstance = useReactFlow();

  const getAncestorIteratorIds = useCallback(
    (nodeId: string): string[] => {
      const visited = new Set<string>();
      const chain: string[] = [];

      let current = reactFlowInstance.getNode(nodeId);

      while (current && current.parentId) {
        if (visited.has(current.id)) break; // cycle guard
        visited.add(current.id);

        const parent = reactFlowInstance.getNode(current.parentId);
        if (!parent) break;

        if (parent.data?.type === "iterator") {
          chain.push(parent.id);
        }

        current = parent;
      }
      return chain.reverse();
    },
    [reactFlowInstance]
  );

  return getAncestorIteratorIds;
}

// Return iteration path (outer -> inner) using runSlice.iteratorSelections
export function useIterationPathForNode(nodeId?: string): number[] {
  const { iteratorSelections } = useFlowStore((s: FlowStoreState) => ({
    iteratorSelections: s.iteratorSelections,
  }));

  const getAncestorIteratorIds = useAncestorIteratorIds();

  if (!nodeId) return [];

  const ancestorIteratorIds = getAncestorIteratorIds(nodeId);

  if (ancestorIteratorIds.length === 0) return [];

  return ancestorIteratorIds.map((_, idx) => Math.max(1, iteratorSelections[idx] || 1));
}
