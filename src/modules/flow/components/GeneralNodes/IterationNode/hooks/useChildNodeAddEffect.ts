import { useEffect } from "react";

import { NodeDimensionChange, useReactFlow, useStoreApi } from "@xyflow/react";

import { getMaxHeight, getMaxWidth } from "../utils";
import { mitt } from "@/lib/mitt";
import { useUpdateNodeInternalsAsync } from "@/modules/flow/hooks";
import { Node } from "@/modules/flow/types";
import { useFlowStore } from "@/store";
import { getChildNodeExtent, handleNodeHeightChange, handleNodeWidthChange } from "@/utils";

export function useChildNodeAddEffect(
  id: string,
  setIsEmpty: (isEmpty: boolean) => void,
  setResizeProps: React.Dispatch<React.SetStateAction<{ minHeight: number; minWidth: number }>>
) {
  const { getInternalNode } = useReactFlow<Node>();
  const updateNodeInternals = useUpdateNodeInternalsAsync();
  const { parentLookup } = useStoreApi<Node>().getState();
  const onNodesChange = useFlowStore((state) => state.onNodesChange);

  useEffect(() => {
    const onAddChildNode = async (node: Partial<Node> & Pick<Node, "id">) => {
      if (node?.parentId === id) {
        setIsEmpty(false);
        await updateNodeInternals(id);
        const internalParentNode = getInternalNode(id)!;
        const internalNode = getInternalNode(node.id)!;
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
          mitt.emit("flow:node:resize", id);
          mitt.emit("flow:node:update-extent", id);
        }
        setResizeProps({
          minWidth: getMaxWidth(id, parentLookup),
          minHeight: getMaxHeight(id, parentLookup),
        });
      }
    };

    mitt.on("flow:node:add", onAddChildNode);
    return () => {
      mitt.off("flow:node:add", onAddChildNode);
    };
  }, [getInternalNode, id, onNodesChange, parentLookup, updateNodeInternals, setIsEmpty, setResizeProps]);
}
