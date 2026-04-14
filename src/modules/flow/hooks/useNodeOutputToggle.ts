import { useCallback } from "react";

import { useReactFlow } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";

import { Node, NodeOutput } from "@/modules/flow/types";
import { useFlowStore } from "@/store";
import { genId } from "@/utils";

const outputMatchPredicate = (o: NodeOutput, toggledOutputInsideIterator: NodeOutput, nodeInsideIteratorId: string) => {
  if (o.originalOutputId !== toggledOutputInsideIterator.id) return false;
  if (o.sourceNodeId !== nodeInsideIteratorId) return false;
  if (toggledOutputInsideIterator.nodeId && o.nodeId !== toggledOutputInsideIterator.nodeId) return false;
  if (!toggledOutputInsideIterator.nodeId && o.nodeId !== nodeInsideIteratorId) return false;
  return true;
};

export const useNodeOutputToggle = () => {
  const { getNode } = useReactFlow<Node>();
  const { onChange } = useFlowStore(
    useShallow((state) => ({
      onChange: state.onChange,
      nodes: state.nodes,
    }))
  );

  const isOutputActive = useCallback(
    (iteratorParentOutputs: NodeOutput[], toggledOutputInsideIterator: NodeOutput, nodeInsideIteratorId: string): boolean => {
      return iteratorParentOutputs.some((o) => outputMatchPredicate(o, toggledOutputInsideIterator, nodeInsideIteratorId));
    },
    []
  );

  const updateNodeOutputs = useCallback(
    (parentOutputs: NodeOutput[], toggledOutputInsideIterator: NodeOutput, nodeInsideIteratorId: string): NodeOutput[] => {
      if (!isOutputActive(parentOutputs, toggledOutputInsideIterator, nodeInsideIteratorId)) {
        const iteratorOutput = {
          ...toggledOutputInsideIterator,
          sourceNodeId: nodeInsideIteratorId,
          nodeId: toggledOutputInsideIterator.nodeId || nodeInsideIteratorId,
          originalOutputId: toggledOutputInsideIterator.id,
          id: genId(),
        };

        return [...parentOutputs, iteratorOutput];
      }

      return parentOutputs.filter((o) => !outputMatchPredicate(o, toggledOutputInsideIterator, nodeInsideIteratorId));
    },
    [isOutputActive]
  );

  const propagateToParents = useCallback(
    (parentNodeId: string, toggledOutputInsideIterator: NodeOutput, nodeInsideIteratorId: string) => {
      const parentNode = getNode(parentNodeId);
      if (!parentNode) return;

      const parentOutputs = parentNode.data.outputs || [];
      const updatedOutputs = updateNodeOutputs(parentOutputs, toggledOutputInsideIterator, nodeInsideIteratorId);

      // if (updatedOutputs !== parentOutputs) {
      onChange(parentNode.id, "outputs", updatedOutputs);
      // }
    },
    [getNode, onChange, updateNodeOutputs]
  );

  const onToggle = useCallback(
    (nodeInsideIterator: Node, toggledOutputInsideIterator: NodeOutput) => {
      if (!nodeInsideIterator.parentId) return;
      const iteratorParentNode = getNode(nodeInsideIterator.parentId);
      if (!iteratorParentNode) return;

      // Toggle in parent and propagate with sourceNodeId set to node.id
      propagateToParents(nodeInsideIterator.parentId, toggledOutputInsideIterator, nodeInsideIterator.id);
    },
    [getNode, propagateToParents]
  );

  return {
    onToggle,
    isOutputActive,
    propagateToParents,
  };
};
