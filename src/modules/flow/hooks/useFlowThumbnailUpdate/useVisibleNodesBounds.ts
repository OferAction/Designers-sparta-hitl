import { useCallback } from "react";

import { useReactFlow, getNodesBounds, useStoreApi } from "@xyflow/react";

export const useVisibleNodesBounds = () => {
  const { getNodes } = useReactFlow();
  const storeApi = useStoreApi();

  return useCallback(() => {
    const nodes = getNodes();
    if (nodes.length === 0) return null;

    const visibleNodes = nodes.filter((node) => !node.hidden);
    return {
      visibleNodes,
      bounds: getNodesBounds(visibleNodes, {
        nodeOrigin: storeApi.getState().nodeOrigin,
      }),
    };
  }, [getNodes, storeApi]);
};
