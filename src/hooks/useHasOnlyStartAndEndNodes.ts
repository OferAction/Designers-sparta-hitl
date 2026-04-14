import { useMemo } from "react";

import { FlowStoreState, useFlowStore } from "@/store";

const selector = (state: FlowStoreState) => state.nodes;

/** Returns true when the orchestration contains only start and end nodes */
export const useHasOnlyStartAndEndNodes = (): boolean => {
  const nodes = useFlowStore(selector);

  return useMemo(() => {
    return nodes.length > 0 && nodes.every((node) => node.data.type === "start" || node.data.type === "end");
  }, [nodes]);
};
