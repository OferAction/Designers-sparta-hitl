import { NodeDimensionChange } from "@xyflow/react";

import { NODE_HORIZONTAL_PADDING, NODE_VERTICAL_PADDING } from "@/modules/flow/constants/nodeDimensions";

/**
 * Handles node width change if it exceeds panel width
 */
export const handleNodeWidthChange = (internalNode: any, panelWidth: number, id: string): NodeDimensionChange | null => {
  if ((internalNode.measured?.width || 0) > panelWidth) {
    const width = (internalNode.measured?.width || 0) + NODE_HORIZONTAL_PADDING;
    return {
      id,
      type: "dimensions",
      dimensions: {
        width,
        height: 0,
      },
      setAttributes: "width",
    } satisfies NodeDimensionChange;
  }
  return null;
};

/**
 * Handles node height change if it exceeds panel height
 */
export const handleNodeHeightChange = (internalNode: any, panelHeight: number, id: string): NodeDimensionChange | null => {
  if ((internalNode.measured?.height || 0) > panelHeight) {
    const height = (internalNode.measured?.height || 0) + NODE_VERTICAL_PADDING;
    return {
      id,
      type: "dimensions",
      dimensions: {
        width: 0,
        height,
      },
      setAttributes: "height",
    } satisfies NodeDimensionChange;
  }
  return null;
};
