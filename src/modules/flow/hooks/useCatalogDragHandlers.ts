import React, { useState } from "react";

import { useShallow } from "zustand/shallow";

import { FlowStoreState, useFlowStore } from "@/store";

const selector = (state: FlowStoreState) => ({
  leftPanelActiveItem: state.leftPanelActiveItem,
  setDraggedNodeMetadata: state.setDraggedNodeMetadata,
  draggedNodeMetadata: state.draggedNodeMetadata,
  updateDraggedNodeMetadata: state.updateDraggedNodeMetadata,
  setLeftPanelActiveItem: state.setLeftPanelActiveItem,
});

export const useCatalogDragHandlers = () => {
  const { setDraggedNodeMetadata, draggedNodeMetadata } = useFlowStore(useShallow(selector));
  const [currentDraggedItemId, setCurrentDraggedItemId] = useState<string | null>(null);

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string,
    nodeId: string,
    { subflowConfigId, subflowId, label }: { subflowConfigId?: string; subflowId?: string; label?: string } = {}
  ): void => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
    setDraggedNodeMetadata({
      nodeType,
      subflowConfigId: subflowConfigId ? subflowConfigId : null,
      subflowId: subflowId ? subflowId : null,
      data: {
        label,
      },
    });
    setCurrentDraggedItemId(nodeId);
    event.dataTransfer.setDragImage(document.createElement("span"), 0, 0);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDragEnd = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentDraggedItemId(null);
    setDraggedNodeMetadata({});
  };

  const handleDragLeave = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string,
    { subflowConfigId, subflowId, label }: { subflowConfigId?: string; subflowId?: string; label?: string } = {}
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (draggedNodeMetadata.nodeType) return;
    if (draggedNodeMetadata.subflowConfigId) return;
    if (draggedNodeMetadata.subflowId) return;
    if (!event.relatedTarget || event.currentTarget.contains(event.relatedTarget as Node)) return;
    setDraggedNodeMetadata({
      nodeType,
      subflowConfigId: subflowConfigId ? subflowConfigId : null,
      subflowId: subflowId ? subflowId : null,
      data: {
        label,
      },
    });
  };

  return { currentDraggedItemId, handleDragStart, handleDragOver, handleDragEnter, handleDragEnd, handleDragLeave };
};
