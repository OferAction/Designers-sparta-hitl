import { useReactFlow } from "@xyflow/react";
import { useUpdateNodeInternals } from "@xyflow/react";
import { useShallow } from "zustand/shallow";

import { ConditionType, NodeVariant } from "../../../types";
import { useSelectedNode } from "@/modules/flow/hooks";
import { FlowStoreState, useFlowStore } from "@/store";
import { genId } from "@/utils";

const selector = ({ onChange }: FlowStoreState) => ({
  onChange,
});

/**
 * Custom hook for handling adding and removing conditions
 */
export const useConditionHandlers = () => {
  const { onChange } = useFlowStore(useShallow(selector));
  const selectedNode = useSelectedNode<NodeVariant<"ifelse">>();
  const updateNodeInternals = useUpdateNodeInternals();

  const { deleteElements, getNodeConnections } = useReactFlow();
  const handleAddElif = () => {
    if (!selectedNode || selectedNode.type !== "ifelse") return;

    const newElif: ConditionType = {
      id: `elif-${genId()}`,
      type: "elif",
      then: [],
      values: [],
    };

    const conditions = selectedNode.data.conditions;
    const updatedConditions = conditions.slice(0, -1).concat([newElif, conditions[conditions.length - 1]]);
    onChange(selectedNode.id, "conditions", updatedConditions);
    updateNodeInternals(selectedNode.id);
  };

  const handleRemoveElif = (conditionId?: string) => {
    if (!conditionId || !selectedNode || selectedNode.type !== "ifelse") return;
    // Find all edges connected to this condition using the latest edges
    const connectedEdges = getNodeConnections({
      type: "source",
      nodeId: selectedNode.id,
      handleId: conditionId,
    }).map((edge) => ({ id: edge.edgeId }));
    // First update the node's conditions data
    const updatedConditions = selectedNode.data.conditions.filter((condition) => condition.id !== conditionId);
    onChange(selectedNode.id, "conditions", updatedConditions);

    // Then use ReactFlow's deleteElements to cleanly remove all connected edges
    if (connectedEdges.length > 0) {
      deleteElements({
        edges: connectedEdges,
      });
    }
    updateNodeInternals(selectedNode.id);
  };

  return {
    handleAddElif,
    handleRemoveElif,
  };
};

export default useConditionHandlers;
