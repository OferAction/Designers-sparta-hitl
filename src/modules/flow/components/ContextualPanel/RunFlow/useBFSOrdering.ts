import { useCallback } from "react";

import { ReactFlowInstance, ReactFlowState, useReactFlow, useStore, useStoreApi } from "@xyflow/react";

import { Edge, Node } from "@/modules/flow/types";

const selector = (state: ReactFlowState) => state.nodes as Node[];

const traverseGraph = (
  startNodeIds: string[],
  connectionType: "source" | "target",
  getNodeConnections: ReactFlowInstance["getNodeConnections"],
  direction: "source" | "target"
): Set<string> => {
  const visited = new Set<string>();
  const queue: string[] = [...startNodeIds];
  let currentIndex = 0;

  while (currentIndex < queue.length) {
    const currentNodeId = queue[currentIndex++];
    if (visited.has(currentNodeId)) {
      continue;
    }

    visited.add(currentNodeId);

    const connections = getNodeConnections({
      type: connectionType,
      nodeId: currentNodeId,
    });

    connections.forEach((connection) => {
      const nextNodeId = connection[direction];
      if (!visited.has(nextNodeId)) {
        queue.push(nextNodeId);
      }
    });
  }

  return visited;
};

export const useBFSOrdering = () => {
  const store = useStoreApi<Node, Edge>();
  const nodes = useStore(selector);
  const { getNodeConnections } = useReactFlow<Node>();

  const getBFSOrderedNodes = useCallback(() => {
    const startNode = nodes.find((node) => node.data.name === "start");
    const endNode = nodes.find((node) => node.data.name === "end");

    if (!startNode || !endNode) {
      return [];
    }

    const reachableFromStart = traverseGraph([startNode.id], "source", getNodeConnections, "target");
    const canReachEnd = traverseGraph([endNode.id], "target", getNodeConnections, "source");

    const validNodeIds = [...reachableFromStart].filter((nodeId) => canReachEnd.has(nodeId));

    const nodeLookup = store.getState().nodeLookup;
    return validNodeIds.map((nodeId) => nodeLookup.get(nodeId)).filter((node) => node !== undefined) as Node[];
  }, [nodes, store, getNodeConnections]);

  return { getBFSOrderedNodes };
};
