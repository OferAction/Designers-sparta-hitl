import { useCallback } from "react";

import { OnSelectionChangeFunc, useOnSelectionChange } from "@xyflow/react";
import { useShallow } from "zustand/shallow";

import { FlowStoreState, useFlowStore } from "@/store";

const selector = (state: FlowStoreState) => ({
  setSelectedNodeId: state.setSelectedNodeId,
  setSelectedNodeIds: state.setSelectedNodeIds,
  draggedNodeMetadata: state.draggedNodeMetadata,
  setSelectedNodeIdsSet: state.setSelectedNodeIdsSet,
  selectedNodeIdsSet: state.selectedNodeIdsSet,
});

export const useHandleSelection = () => {
  const { setSelectedNodeId, setSelectedNodeIds, draggedNodeMetadata, setSelectedNodeIdsSet } = useFlowStore(useShallow(selector));

  const handleSelectionChange: OnSelectionChangeFunc = useCallback(
    ({ nodes, edges }) => {
      setSelectedNodeIdsSet(new Set(nodes.map((node) => node.id)));
      if (nodes.length == 1 && edges.length == 0 && !draggedNodeMetadata.draggedNodeType) {
        setSelectedNodeId(nodes[0].id);
        setSelectedNodeIds([]);
        return;
      }
      if (nodes.length > 1) {
        setSelectedNodeIds(nodes.map((node) => node.id));
        setSelectedNodeId("");
        return;
      }
      // Clear selection when no nodes are selected
      setSelectedNodeId("");
      setSelectedNodeIds([]);
    },
    [draggedNodeMetadata.draggedNodeType, setSelectedNodeId, setSelectedNodeIds, setSelectedNodeIdsSet]
  );
  useOnSelectionChange({
    onChange: handleSelectionChange,
  });
};
