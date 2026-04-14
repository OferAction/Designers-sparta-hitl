import { useCallback } from "react";

import { useReactFlow } from "@xyflow/react";

import { useHandleLargeFlowsViewport } from "./useHandleLargeFlowsViewport";
import { useVisibleNodesBounds } from "./useVisibleNodesBounds";
import { calculateThumbnailViewport } from "./utils";

export const useGetViewportForThumbnail = () => {
  const getVisibleNodesBounds = useVisibleNodesBounds();
  const handleLargeFlowsViewport = useHandleLargeFlowsViewport();
  const { getViewport } = useReactFlow();

  return useCallback(() => {
    const currentViewport = getViewport();

    const nodesBoundsResult = getVisibleNodesBounds();
    if (!nodesBoundsResult) return { targetViewport: currentViewport, currentViewport };

    const { visibleNodes, bounds } = nodesBoundsResult;
    const initialViewport = calculateThumbnailViewport(bounds);
    const targetViewport = handleLargeFlowsViewport(initialViewport, visibleNodes);
    return { targetViewport, currentViewport };
  }, [getVisibleNodesBounds, handleLargeFlowsViewport, getViewport]);
};
