import { useCallback } from "react";

import { useReactFlow, useStoreApi, type Connection } from "@xyflow/react";
import { useShallow } from "zustand/shallow";

import { useAddNode } from "./useAddNode";
import { NodeTypes } from "@/modules/flow/types";
import { File } from "@/modules/workspace";
import { useFlowStore, FlowStoreState } from "@/store";
import { getChildNodeExtent } from "@/utils";

type hookTypes = {
  sourceParentId: string;
  sourceHandleId?: string | null | undefined;
  targetHandleId?: string | null | undefined;
  targetParentId?: string;
  edgeId?: string;
  shouldAddInsideSourceParent?: boolean;
};
const selector = ({ onConnect, onEdgesChange, onDelete }: FlowStoreState) => ({
  onConnect,
  onEdgesChange,
  onDelete,
});

export const useAddNodeFromDropdown = (arg: hookTypes) => {
  const { onConnect, onEdgesChange, onDelete } = useFlowStore(useShallow(selector));
  const { addNode } = useAddNode();
  const { getNodesBounds } = useReactFlow();
  const { nodeLookup, edges } = useStoreApi().getState();

  /**
   * Common logic for calculating position and adding a node/subflow
   */
  const addNodeWithPosition = useCallback(
    (nodeType: NodeTypes, offset: { x: number; y: number }, additionalProps?: Record<string, any>) => {
      let newNodeId;

      const sourceParent = nodeLookup.get(arg.sourceParentId);
      if (!sourceParent) return;

      // Calculate position based on connected nodes
      const connectedNodes = edges.filter((edge) => edge.source === sourceParent.id).map((edge) => nodeLookup.get(edge.target));

      const lowestNode = connectedNodes.reduce((a, b) => {
        return a && b && a.position.y > b.position.y ? a : b;
      }, connectedNodes[0]);

      const parentDimensions = getNodesBounds([arg.sourceParentId]);
      const newPosition = {
        x: Math.ceil(parentDimensions.x + parentDimensions.width + offset.x),
        y: Math.ceil(parentDimensions.y + parentDimensions.height / 2),
      };

      if (lowestNode) {
        const lowestChildDimensions = getNodesBounds([lowestNode?.id ?? ""]);
        newPosition.y = Math.ceil(lowestChildDimensions.y + lowestChildDimensions.height + offset.y);
      }

      // Calculate positioning relative to parent groups
      let rest: any = {};

      if (sourceParent.parentId && !arg.shouldAddInsideSourceParent) {
        const groupParent = nodeLookup.get(sourceParent.parentId)!;
        const groupParentDimensions = getNodesBounds([groupParent?.id ?? ""]);
        rest = {
          parentId: sourceParent.parentId,
          extent: getChildNodeExtent(groupParent),
          position: {
            x: newPosition.x - groupParentDimensions.x,
            y: newPosition.y - groupParentDimensions.y,
          },
        };
      } else if (arg.shouldAddInsideSourceParent) {
        const extent = getChildNodeExtent(sourceParent);
        rest = {
          parentId: sourceParent.id,
          extent: extent,
          position: {
            x: (extent[1][0] + extent[0][0]) / 2,
            y: (extent[1][1] + extent[0][1]) / 2,
          },
        };
      } else if (sourceParent.type === "group") {
        const groupParent = nodeLookup.get(arg.sourceParentId)!;
        const groupParentDimensions = getNodesBounds([groupParent?.id ?? ""]);
        rest = {
          parentId: groupParent?.id,
          extent: getChildNodeExtent(groupParent),
          position: {
            x: newPosition.x - groupParentDimensions.x,
            y: newPosition.y - groupParentDimensions.y,
          },
        };

        newNodeId = addNode(nodeType, newPosition, { ...rest, ...additionalProps });
        return newNodeId;
      }

      newNodeId = addNode(nodeType, newPosition, { ...rest, ...additionalProps });

      // Connect source to new node
      if (newNodeId && !arg.shouldAddInsideSourceParent) {
        const edge: Connection = {
          source: sourceParent.id,
          target: newNodeId,
          sourceHandle: arg.sourceHandleId ? arg.sourceHandleId : null,
          targetHandle: "a",
        };
        onConnect(edge);
      }

      return newNodeId;
    },
    [nodeLookup, arg.sourceParentId, arg.shouldAddInsideSourceParent, arg.sourceHandleId, edges, getNodesBounds, addNode, onConnect]
  );

  /**
   * Handles connecting the new node to target and removing the old edge
   */
  const connectToTargetAndCleanup = useCallback(
    (newNodeId: string) => {
      if (!arg.edgeId || !arg.targetParentId || !arg.targetHandleId) return;

      const targetParent = nodeLookup.get(arg.targetParentId);
      const edgeToRemove = edges.find((e) => e.id === arg.edgeId);

      if (targetParent && edgeToRemove) {
        const edge: Connection = {
          source: newNodeId,
          target: targetParent.id,
          sourceHandle: "b",
          targetHandle: arg.targetHandleId,
        };
        onConnect(edge);

        const edgeChange = [{ id: arg.edgeId, type: "remove" as const, item: edgeToRemove }];
        onEdgesChange(edgeChange);
        onDelete({ edges: [edgeToRemove], nodes: [] });
      }
    },
    [arg.edgeId, arg.targetParentId, arg.targetHandleId, nodeLookup, edges, onConnect, onEdgesChange, onDelete]
  );

  const handleAddNode = useCallback(
    async (nodeType: string) => {
      const offset = {
        x: 100,
        y: nodeType === "iterator" || nodeType === "conditionalOperator" ? 350 : 100,
      };

      const newNodeId = addNodeWithPosition(nodeType as NodeTypes, offset);

      if (newNodeId) {
        connectToTargetAndCleanup(newNodeId);
      }
    },
    [addNodeWithPosition, connectToTargetAndCleanup]
  );

  const handleAddSubflow = useCallback(
    async (subflow: File & { flowName: string }) => {
      const offset = {
        x: 100,
        y: 100,
      };

      const newNodeId = addNodeWithPosition("subflow", offset, {
        selected: true,
        subflowId: subflow.id,
        subflowConfigId: subflow.activeConfigurationId,
        data: { label: subflow.name },
      });

      if (newNodeId) {
        connectToTargetAndCleanup(newNodeId);
      }

      return newNodeId;
    },
    [addNodeWithPosition, connectToTargetAndCleanup]
  );

  return {
    handleAddNode,
    handleAddSubflow,
  };
};
