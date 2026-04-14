import { useEffect } from "react";

import { mitt } from "@/lib/mitt";
import { useFlowStore } from "@/store";

export function useChildNodeRemoveEffect(id: string, setIsEmpty: (isEmpty: boolean) => void) {
  useEffect(() => {
    const onRemoveChildNode = () => {
      setIsEmpty(useFlowStore.getState().nodes.filter((node) => node.parentId === id).length === 0);
    };

    mitt.on("flow:delete", onRemoveChildNode);
    return () => {
      mitt.off("flow:delete", onRemoveChildNode);
    };
  }, [id, setIsEmpty]);
}
