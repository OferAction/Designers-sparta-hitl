import { EdgeChange, NodeChange } from "@xyflow/react";
import { produce } from "immer";

import type { Edge } from "@/modules/flow/types";
import type { Node } from "@/modules/flow/types/BaseNodeTypes";

/**
 * Updates if-else node conditions when an edge is removed
 */
export const updateIfElseConditions = (node: Node, edge: Edge): Node => {
  if (node.type !== "ifelse") {
    return node;
  }

  return produce(node, (draft) => {
    draft.data.conditions.forEach((condition) => {
      if (condition.id === edge.sourceHandle) {
        condition.then = condition.then.filter((targetId) => targetId !== edge.target);
      }
    });
  });
};

/**
 * Updates after_node_execution based on remaining outgoing edges
 */
export const updateAfterNodeExecution = (node: Node, edge: Edge, currentEdges: Edge[]): Node => {
  return produce(node, (draft) => {
    // Check if source node has any remaining outgoing connections after this deletion
    const remainingOutgoingEdges = currentEdges.filter((e) => e.source === edge.source && e.id !== edge.id);

    // If no more outgoing edges, set after_node_execution to "stop"
    if (remainingOutgoingEdges.length === 0 && (draft.data.after_node_execution === "continue" || draft.data.after_node_execution === undefined)) {
      draft.data.after_node_execution = "stop";
    }
  });
};

/**
 * Creates node changes for edge removal
 */
export const createNodeChangesForEdgeRemoval = (edge: Edge, currentNodes: Node[], currentEdges: Edge[]): NodeChange<Node>[] => {
  const nodeChanges: NodeChange<Node>[] = [];

  const sourceNode = currentNodes.find((node) => node.id === edge.source);

  if (sourceNode) {
    // Apply all source node updates in sequence
    let updatedSourceNode = updateIfElseConditions(sourceNode, edge);
    updatedSourceNode = updateAfterNodeExecution(updatedSourceNode, edge, currentEdges);

    nodeChanges.push({
      id: sourceNode.id,
      type: "replace",
      item: updatedSourceNode,
    });
  }

  return nodeChanges;
};

export const handleNodeChangesOnEdgeRemoval = (changes: EdgeChange<Edge>[], currentEdges: Edge[], currentNodes: Node[]): NodeChange<Node>[] => {
  const nodeChanges: NodeChange<Node>[] = [];
  const removeChanges = changes.filter((change) => change.type === "remove");
  if (removeChanges.length > 0) {
    removeChanges.forEach((change) => {
      const edge = currentEdges.find((e) => e.id === change.id);
      if (!edge) return;

      const edgeNodeChanges = createNodeChangesForEdgeRemoval(edge, currentNodes, currentEdges);
      nodeChanges.push(...edgeNodeChanges);
    });
  }
  return nodeChanges;
};
