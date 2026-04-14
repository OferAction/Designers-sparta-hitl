import { useEffect } from "react";

import { useStoreApi } from "@xyflow/react";

import { getMaxHeight, getMaxWidth } from "../utils";
import { mitt } from "@/lib/mitt";
import { useUpdateNodeInternalsAsync } from "@/modules/flow/hooks";
import { Node } from "@/modules/flow/types";

export function useChildNodeExtentUpdateEffect(
  id: string,
  setResizeProps: React.Dispatch<React.SetStateAction<{ minHeight: number; minWidth: number }>>
) {
  const updateNodeInternals = useUpdateNodeInternalsAsync();
  const { parentLookup } = useStoreApi<Node>().getState();

  useEffect(() => {
    const onChildNodeResize = async (resizedNodeId: string) => {
      // When a child node is resized, we need to update the resize properties of the parent node
      // so we don't allow the parent node to be resized smaller than the largest child node
      await updateNodeInternals(id);
      if (!parentLookup.get(id)?.has(resizedNodeId)) return;
      setResizeProps({
        minWidth: getMaxWidth(id, parentLookup),
        minHeight: getMaxHeight(id, parentLookup),
      });
    };

    mitt.on("flow:node:update-extent", onChildNodeResize);
    return () => {
      mitt.off("flow:node:update-extent", onChildNodeResize);
    };
  }, [id, parentLookup, updateNodeInternals, setResizeProps]);
}
