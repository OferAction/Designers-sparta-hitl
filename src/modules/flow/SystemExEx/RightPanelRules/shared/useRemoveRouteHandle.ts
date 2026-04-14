import { useCallback } from "react";

import { NodeConnection, ReactFlowInstance, useNodeConnections, useReactFlow, useUpdateNodeInternals } from "@xyflow/react";

import { Node } from "@/modules/flow/types";
import { FlowStoreState, useFlowStore } from "@/store";

export function removeRouteHandle(
  reactFlow: ReactFlowInstance<Node>,
  onChange: FlowStoreState["onChange"],
  nodeId: string,
  handleId: string,
  nodeConnections: NodeConnection[],
  updateNodeInternals: (id: string) => void
) {
  if (!nodeId || !handleId) return;

  const toRemove = nodeConnections.filter((e) => e.sourceHandle === handleId);
  if (toRemove.length) {
    reactFlow.deleteElements({ edges: toRemove.map((e) => ({ id: e.edgeId })) });
  }

  const node = reactFlow.getNode(nodeId);
  if (!node) return;

  const data = node.data;
  const prevHandles: string[] = Array.isArray(data?.routeHandles) ? data.routeHandles : [];
  if (!prevHandles.includes(handleId)) return;
  const nextHandles = prevHandles.filter((h) => h !== handleId);
  onChange(nodeId, "routeHandles", nextHandles);

  queueMicrotask(() => updateNodeInternals(nodeId));
}

export function useRemoveRouteHandle(nodeId?: string) {
  const reactFlow = useReactFlow<Node>();

  const storeSelectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const onChange = useFlowStore((s) => s.onChange);

  const updateNodeInternals = useUpdateNodeInternals();

  const selectedNodeId = nodeId || storeSelectedNodeId || "dummy-id";
  const connections = useNodeConnections({
    id: selectedNodeId,
    handleType: "source",
  });

  return useCallback(
    (handleId: string) => {
      if (!selectedNodeId) return;
      removeRouteHandle(reactFlow, onChange, selectedNodeId, handleId, connections, updateNodeInternals);
    },
    [connections, onChange, reactFlow, selectedNodeId, updateNodeInternals]
  );
}
