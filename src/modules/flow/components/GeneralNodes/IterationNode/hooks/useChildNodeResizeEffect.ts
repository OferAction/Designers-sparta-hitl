import { useEffect } from "react";

import { NodeDimensionChange, useReactFlow } from "@xyflow/react";

import { mitt } from "@/lib/mitt";
import { useUpdateNodeInternalsAsync } from "@/modules/flow/hooks";
import { Node } from "@/modules/flow/types";
import { useFlowStore } from "@/store";
import { getChildNodeExtent, handleNodeHeightChange, handleNodeWidthChange } from "@/utils";

export function useChildNodeResizeEffect(id: string) {
  const { getInternalNode } = useReactFlow<Node>();
  const updateNodeInternals = useUpdateNodeInternalsAsync();
  const onNodesChange = useFlowStore((state) => state.onNodesChange);

  useEffect(() => {
    const onResize = async (resizedNodeId: string) => {
      // When the a child node is resized we need to accommodate its new size
      // so that the parent node is not smaller than the largest child node
      if (resizedNodeId === id) return;
      await updateNodeInternals(id);
      const internalNode = getInternalNode(resizedNodeId);
      if (internalNode?.parentId !== id) return;
      const internalParentNode = getInternalNode(id);
      if (!internalParentNode || !internalNode) return;

      const extent = getChildNodeExtent(internalParentNode);
      const panelWidth = extent[1][0] - extent[0][0];
      const panelHeight = extent[1][1] - extent[0][1];
      const changes: NodeDimensionChange[] = [];

      const widthChange = handleNodeWidthChange(internalNode, panelWidth, id);
      if (widthChange) changes.push(widthChange);

      const heightChange = handleNodeHeightChange(internalNode, panelHeight, id);
      if (heightChange) changes.push(heightChange);

      if (changes.length) {
        onNodesChange(changes);
        mitt.emit("flow:node:update-extent", id);
        mitt.emit("flow:node:resize", id);
      }
    };

    mitt.on("flow:node:resize", onResize);
    return () => {
      mitt.off("flow:node:resize", onResize);
    };
  }, [getInternalNode, id, onNodesChange, updateNodeInternals]);
}
