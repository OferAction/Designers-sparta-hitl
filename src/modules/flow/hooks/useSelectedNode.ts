import { useCallback } from "react";

import { useNodesData, useReactFlow } from "@xyflow/react";

import { Node } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

export const useSelectedNode = <T extends Node = Node>() => {
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
  const selectedNode = useNodesData<T>(selectedNodeId);

  return selectedNode || undefined;
};
export const useSelectedNodes = <T extends Node = Node>() => {
  const selectedNodeIds = useFlowStore((state) => state.selectedNodeIds);
  const selectedNodes = useNodesData<T>(selectedNodeIds);

  return selectedNodes || [];
};

export const useGetSelectedNodes = <T extends Node = Node>() => {
  const selectedNodeIds = useFlowStore((state) => state.selectedNodeIds);
  const { getNode } = useReactFlow();

  return useCallback(() => {
    return selectedNodeIds.map((id) => getNode(id)).filter((n): n is T => !!n);
  }, [selectedNodeIds, getNode]);
};
