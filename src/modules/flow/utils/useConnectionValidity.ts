import { useReactFlow, type Connection } from "@xyflow/react";

import {
  BUILT_IN_RULE_HANDLE_PREFIX,
  CUSTOM_RULE_HANDLE_PREFIX,
  isHandleDefaultRule,
  SYSTEM_RULE_HANDLE_PREFIX,
} from "@/modules/flow/SystemExEx/RightPanelRules/shared";
import { type Edge } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

export const isRuleSourceHandle = (handle?: string | null) =>
  !!handle &&
  (handle.startsWith(SYSTEM_RULE_HANDLE_PREFIX) || handle.startsWith(BUILT_IN_RULE_HANDLE_PREFIX) || handle.startsWith(CUSTOM_RULE_HANDLE_PREFIX));

export const useConnectionValidity = () => {
  const { getNode } = useReactFlow();

  const isValidConnection = (connection: Edge | Connection) => {
    const { source, target } = connection;
    const edges = useFlowStore.getState().edges;

    // checks if the connection will form a cycle
    const willFormCycle = (connection: Edge | Connection) => {
      const { source, target } = connection;

      // Build an adjacency list for faster lookups
      const adjacencyList = edges.reduce(
        (acc, edge) => {
          if (!acc[edge.source]) acc[edge.source] = [];
          acc[edge.source].push(edge.target);
          return acc;
        },
        {} as Record<string, string[]>
      );

      const visited = new Set<string>();
      const stack = [target!];

      while (stack.length > 0) {
        const current = stack.pop();
        if (!current) continue;
        if (current === source) {
          return true;
        }
        if (!visited.has(current)) {
          visited.add(current);
          const connectedNodes = adjacencyList[current] || [];
          stack.push(...connectedNodes);
        }
      }

      return false;
    };

    const isSameParent = (connection: Edge | Connection) => {
      const { source, target } = connection;

      const sourceNode = getNode(source);
      if (!sourceNode) return false;

      const targetNode = getNode(target);
      if (!targetNode) return false;

      return sourceNode.parentId === targetNode.parentId;
    };

    const exists = (connection: Edge | Connection) => {
      return edges.some(
        (edge) =>
          edge.className !== "temp" &&
          edge.source === connection.source &&
          edge.target === connection.target &&
          edge.sourceHandle === connection.sourceHandle &&
          edge.targetHandle === connection.targetHandle
      );
    };

    if (isRuleSourceHandle(connection.sourceHandle)) {
      const existingRuleEdge = edges.find(
        (e) => e.className !== "temp" && e.source === connection.source && e.sourceHandle === connection.sourceHandle
      );
      if (existingRuleEdge) return false;
    }

    const nodes = useFlowStore.getState().nodes;
    if (connection.sourceHandle && isHandleDefaultRule(connection.sourceHandle, nodes, connection.source)) {
      return false;
    }

    if (source === target || willFormCycle(connection) || !isSameParent(connection) || exists(connection)) return false;
    return true;
  };

  return {
    isValidConnection,
    isRuleSourceHandle,
  };
};
