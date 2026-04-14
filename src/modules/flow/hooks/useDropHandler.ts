import React, { useCallback, useEffect, useRef, useState } from "react";

import { type NodePositionChange, type NodeSelectionChange, useReactFlow, useStoreApi } from "@xyflow/react";
import { useShallow } from "zustand/shallow";

import { useAddNode } from "./useAddNode";
import { useGetConfigConverter } from "@/modules/flow/services";
import { Node as FlowNode, NodeTypes } from "@/modules/flow/types";
import { FlowStoreState, useFlowStore } from "@/store";
import { getChildNodeExtent } from "@/utils";

const selector = (state: FlowStoreState) => ({
  nodes: state.nodes,
  draggedNodeMetadata: state.draggedNodeMetadata,
  onNodesChange: state.onNodesChange,
  setSelectedNodeId: state.setSelectedNodeId,
  setNode: state.setNode,
});

export const useDropHandler = () => {
  const { data: nodeTemplates } = useGetConfigConverter();
  const { addNode } = useAddNode();
  const { nodes, draggedNodeMetadata, onNodesChange, setSelectedNodeId, setNode } = useFlowStore(useShallow(selector));
  const { screenToFlowPosition, getNodesBounds, deleteElements, getNode, getInternalNode } = useReactFlow();
  const [newlyAddedNodeId, setNewlyAddedNodeId] = useState<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const flowStoreApi = useStoreApi();
  const subflowConfigId = draggedNodeMetadata?.subflowConfigId;
  const subflowId = draggedNodeMetadata?.subflowId;
  const type = draggedNodeMetadata?.nodeType;

  const getBoundingGroup = useCallback(
    (position: { x: number; y: number }, groups: FlowNode[]): FlowNode | null => {
      for (const group of groups) {
        const nodeRect = getNodesBounds([group]);

        if (
          position.x > nodeRect.x &&
          position.x < nodeRect.x + nodeRect.width &&
          position.y > nodeRect.y &&
          position.y < nodeRect.y + nodeRect.height
        ) {
          const childGroups = nodes.filter((node) => node.type === "iterator" && node.parentId === group.id);
          const nestedGroup = getBoundingGroup(position, childGroups);
          return nestedGroup || group;
        }
      }
      return null;
    },
    [getNodesBounds, nodes]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!nodeTemplates) return;

      const focusNode = (nodeId: string) => {
        setSelectedNodeId(nodeId);
        const selectChange: NodeSelectionChange = {
          id: nodeId,
          type: "select",
          selected: true,
        };
        onNodesChange([selectChange]);
      };

      const addedNodeId = newlyAddedNodeId;
      if (!addedNodeId) return;
      setNewlyAddedNodeId(null);

      const changeSelection: NodeSelectionChange = {
        id: addedNodeId,
        type: "select",
        selected: false,
      };
      const changeDragging: NodePositionChange = {
        id: addedNodeId,
        type: "position",
        dragging: false,
      };
      onNodesChange([changeSelection, changeDragging]);
      if (!type) return;

      const nodeData = nodeTemplates[type as NodeTypes];
      if (!nodeData) return;

      const groups = nodes.filter((node) => node.type === "iterator" && node.id !== addedNodeId);
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const group = getBoundingGroup(position, groups);

      if (group) {
        const rest = {
          ...draggedNodeMetadata,
          parentId: group.id,
          extent: getChildNodeExtent(group),
          subflowConfigId: type == "subflow" ? subflowConfigId : null,
          subflowId: type == "subflow" ? subflowId : null,
        };
        const internalGroup = getInternalNode(group.id)!;
        addNode(
          type as NodeTypes,
          {
            x: position.x - internalGroup.internals.positionAbsolute.x,
            y: position.y - internalGroup.internals.positionAbsolute.y,
          },
          rest
        );
        if (addedNodeId) {
          const node = getNode(addedNodeId);
          if (node) {
            deleteElements({ nodes: [node] });
          }
        }
      }
      focusNode(addedNodeId);
      setNode({
        id: addedNodeId,
        zIndex: 2,
      });
      const store = flowStoreApi.getState();
      const node = getNode(addedNodeId);
      if (node) {
        store.onNodeDragStop?.(event, node, useFlowStore.getState().nodes);
      }
    },
    [
      nodeTemplates,
      newlyAddedNodeId,
      onNodesChange,
      type,
      nodes,
      screenToFlowPosition,
      getBoundingGroup,
      setNode,
      flowStoreApi,
      getNode,
      setSelectedNodeId,
      draggedNodeMetadata,
      subflowConfigId,
      subflowId,
      getInternalNode,
      addNode,
      deleteElements,
    ]
  );

  const onDragEnter = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!nodeTemplates || newlyAddedNodeId) return;
      if (draggedNodeMetadata.nodeType) {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        const nodeData = nodeTemplates[draggedNodeMetadata.nodeType as NodeTypes];
        if (!nodeData) return;

        const rest: object = {
          ...draggedNodeMetadata,
          dragging: false,
          selected: true,
          zIndex: 9999,
          subflowConfigId: type == "subflow" ? subflowConfigId : null,
          subflowId: type == "subflow" ? subflowId : null,
        };

        const store = flowStoreApi.getState();
        store.resetSelectedElements();

        const nodeId = addNode(draggedNodeMetadata.nodeType as NodeTypes, position, rest);

        const nodes = useFlowStore.getState().nodes;
        const newNode = getNode(nodeId);
        if (newNode) {
          store.onNodeDragStart?.(event, newNode, nodes);
        }

        setNewlyAddedNodeId(nodeId);
      }
    },
    [addNode, draggedNodeMetadata, flowStoreApi, getNode, newlyAddedNodeId, nodeTemplates, screenToFlowPosition, subflowConfigId, subflowId, type]
  );

  const dragFrame = useCallback(
    (e: React.DragEvent) => {
      const { x, y } = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });
      const node = getNode(newlyAddedNodeId!);
      if (!node) {
        setNewlyAddedNodeId(null);
        return;
      }

      if (x === node.position.x && y === node.position.y) return;
      const change: NodePositionChange = {
        id: newlyAddedNodeId!,
        type: "position",
        dragging: true,
        position: { x, y },
      };
      onNodesChange([change]);
    },
    [getNode, newlyAddedNodeId, onNodesChange, screenToFlowPosition]
  );

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (!animationFrameRef.current) {
        if (!newlyAddedNodeId) return;

        const store = flowStoreApi.getState();
        const onNodeDrag = store.onNodeDrag;
        if (onNodeDrag) {
          const nodes = useFlowStore.getState().nodes;
          const node = getNode(newlyAddedNodeId);
          if (node) {
            onNodeDrag(e, node, nodes);
          }
        }
        animationFrameRef.current = requestAnimationFrame(() => {
          dragFrame(e);
          animationFrameRef.current = null;
        });
      }
    },
    [dragFrame, flowStoreApi, getNode, newlyAddedNodeId]
  );

  const onDragLeave = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!newlyAddedNodeId) return;
    if (!e.relatedTarget || e.currentTarget.contains(e.relatedTarget as Node)) return;

    const store = flowStoreApi.getState();
    const node = getNode(newlyAddedNodeId);
    if (node) {
      store.onNodeDragStop?.(e, node, useFlowStore.getState().nodes);
    }
    if (node) deleteElements({ nodes: [node] });
    setNewlyAddedNodeId(null);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return { onDragEnter, onDrop, onDragOver, onDragLeave };
};
