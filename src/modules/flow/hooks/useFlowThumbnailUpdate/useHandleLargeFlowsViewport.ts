import { useCallback } from "react";

import { useReactFlow, Viewport, Node } from "@xyflow/react";

import { MIN_ZOOM, PADDING, THUMBNAIL_HEIGHT } from "./constants";

export const useHandleLargeFlowsViewport = () => {
  const { getInternalNode } = useReactFlow();

  return useCallback(
    (viewport: Viewport, visibleNodes: Node[]): Viewport => {
      if (viewport.zoom > MIN_ZOOM) {
        return viewport;
      }

      const startNode = visibleNodes.find((node) => node.type === "start");
      if (!startNode) return viewport;

      // Position start node at left edge
      const internalNode = getInternalNode(startNode.id);
      if (!internalNode) return viewport;

      const { x, y } = internalNode.internals.positionAbsolute;
      const nodeHeight = internalNode.measured?.height ?? internalNode.height ?? 0;

      // Calculate actual left edge of the node
      const nodeLeftEdge = x;
      const nodeCenter = y + nodeHeight / 2;

      return {
        x: -nodeLeftEdge * MIN_ZOOM + PADDING,
        y: -nodeCenter * MIN_ZOOM + THUMBNAIL_HEIGHT / 2,
        zoom: MIN_ZOOM,
      };
    },
    [getInternalNode]
  );
};
