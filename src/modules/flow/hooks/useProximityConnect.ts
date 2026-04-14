import { useCallback } from "react";

import { Connection, EdgeChange, EdgeRemoveChange, useReactFlow } from "@xyflow/react";

import { useConnectionValidity } from "@/modules/flow/utils/useConnectionValidity";

import type { Edge, Node } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

const MIN_DISTANCE = 150;

/**
 * Calculates the closest valid edge that can be created between a dragged node and nearby nodes
 * based on handle proximity using Euclidean distance.
 */
export const useProximityConnect = () => {
  const { getInternalNode } = useReactFlow();
  const { isValidConnection } = useConnectionValidity();
  const onEdgesChange = useFlowStore((state) => state.onEdgesChange);
  const onConnect = useFlowStore((state) => state.onConnect);

  /**
   * Finds the closest edge by calculating distance from the dragged node's handles
   * to all other nodes' handles, considering only valid connections.
   */
  const getClosestEdge = useCallback(
    (node: Node): Connection | null => {
      const internalNode = getInternalNode(node.id);
      if (!internalNode?.internals?.handleBounds) return null;

      const { source: sourceHandles = [], target: targetHandles = [] } = internalNode.internals.handleBounds;
      const nodePosition = internalNode.internals.positionAbsolute;

      // Get all other nodes from the store
      const nodes = useFlowStore.getState().nodes;

      let closestEdge: Connection | null = null;
      let minDistance = Number.MAX_VALUE;

      // Check all combinations of handles between dragged node and other nodes
      for (const otherNode of nodes) {
        if (otherNode.id === node.id) continue;
        const otherInternalNode = getInternalNode(otherNode.id);
        if (!otherInternalNode?.internals?.handleBounds) continue;

        const otherNodePosition = otherInternalNode.internals.positionAbsolute;
        const { source: otherSourceHandles = [], target: otherTargetHandles = [] } = otherInternalNode.internals.handleBounds;

        // Check dragged node's source handles -> other node's target handles
        for (const sourceHandle of sourceHandles || []) {
          const sourceAbsPos = {
            x: nodePosition.x + sourceHandle.x + sourceHandle.width / 2,
            y: nodePosition.y + sourceHandle.y + sourceHandle.height / 2,
          };

          for (const targetHandle of otherTargetHandles || []) {
            const targetAbsPos = {
              x: otherNodePosition.x + targetHandle.x + targetHandle.width / 2,
              y: otherNodePosition.y + targetHandle.y + targetHandle.height / 2,
            };

            const distance = Math.sqrt(Math.pow(sourceAbsPos.x - targetAbsPos.x, 2) + Math.pow(sourceAbsPos.y - targetAbsPos.y, 2));

            if (distance < minDistance && distance < MIN_DISTANCE) {
              const potentialEdge: Connection = {
                source: node.id,
                target: otherNode.id,
                sourceHandle: sourceHandle.id ?? null,
                targetHandle: targetHandle.id ?? null,
              };

              // Validate the connection before considering it
              if (isValidConnection(potentialEdge)) {
                minDistance = distance;
                closestEdge = potentialEdge;
              }
            }
          }
        }

        // Check other node's source handles -> dragged node's target handles
        for (const targetHandle of targetHandles || []) {
          const targetAbsPos = {
            x: nodePosition.x + targetHandle.x + targetHandle.width / 2,
            y: nodePosition.y + targetHandle.y + targetHandle.height / 2,
          };

          for (const sourceHandle of otherSourceHandles || []) {
            const sourceAbsPos = {
              x: otherNodePosition.x + sourceHandle.x + sourceHandle.width / 2,
              y: otherNodePosition.y + sourceHandle.y + sourceHandle.height / 2,
            };

            const distance = Math.sqrt(Math.pow(targetAbsPos.x - sourceAbsPos.x, 2) + Math.pow(targetAbsPos.y - sourceAbsPos.y, 2));

            if (distance < minDistance && distance < MIN_DISTANCE) {
              const potentialEdge: Connection = {
                source: otherNode.id,
                target: node.id,
                sourceHandle: sourceHandle.id ?? null,
                targetHandle: targetHandle.id ?? null,
              };

              // Validate the connection before considering it
              if (isValidConnection(potentialEdge)) {
                minDistance = distance;
                closestEdge = potentialEdge;
              }
            }
          }
        }
      }

      return closestEdge;
    },
    [getInternalNode, isValidConnection]
  );

  /**
   * Handler for node drag - shows temporary edge if a valid proximity connection is detected
   */
  const handleProximityDrag = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const closeEdge = getClosestEdge(node);

      // Remove any existing temporary edges
      const changes: EdgeChange<Edge>[] = useFlowStore
        .getState()
        .edges.filter((e) => e.className === "temp")
        .map((e) => ({
          type: "remove" as const,
          id: e.id,
        }));

      // Add temporary edge if we found a valid close connection
      if (closeEdge) {
        changes.push({
          type: "add" as const,
          item: {
            ...closeEdge,
            id: `proximity-temp-${closeEdge.source}-${closeEdge.target}-${closeEdge.sourceHandle}-${closeEdge.targetHandle}`,
            className: "temp",
            animated: false,
            zIndex: Number.MAX_SAFE_INTEGER,
            data: {},
          },
        });
      }

      onEdgesChange(changes, {
        ignoreCollaboration: true,
      });
    },
    [getClosestEdge, onEdgesChange]
  );

  /**
   * Handler for node drag stop - creates permanent edge if a valid proximity connection exists
   */
  const handleProximityDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // Find all temporary edges
      const tempEdges = useFlowStore.getState().edges.filter((e: Edge) => e.className === "temp");

      if (tempEdges.length === 0) {
        return; // No temp edges to handle
      }

      // Find the temp edge connected to the dragged node
      const relevantTempEdge = tempEdges.find((e) => e.source === node.id || e.target === node.id);

      // Remove all temporary edges (cleans up orphaned ones too)
      const removeChanges: EdgeRemoveChange[] = tempEdges.map((e) => ({
        type: "remove" as const,
        id: e.id,
      }));
      onEdgesChange(removeChanges, {
        ignoreCollaboration: true,
      });

      // Create permanent edge only if we found a relevant temp edge for this node
      if (relevantTempEdge) {
        onConnect({
          source: relevantTempEdge.source,
          target: relevantTempEdge.target,
          sourceHandle: relevantTempEdge.sourceHandle ?? null,
          targetHandle: relevantTempEdge.targetHandle ?? null,
        });
      }
    },
    [onEdgesChange, onConnect]
  );

  return {
    handleProximityDrag,
    handleProximityDragStop,
  };
};
