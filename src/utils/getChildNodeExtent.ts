import { CoordinateExtent, Node } from "@xyflow/react";

import {
  DEFAULT_NODE_WIDTH,
  DEFAULT_NODE_HEIGHT,
  NODE_EXTENT_LEFT,
  NODE_EXTENT_TOP,
  NODE_EXTENT_RIGHT_OFFSET,
  NODE_EXTENT_BOTTOM_OFFSET,
} from "@/modules/flow/constants/nodeDimensions";

export const getChildNodeExtent = (parentNode: Node): CoordinateExtent => {
  return [
    [NODE_EXTENT_LEFT, NODE_EXTENT_TOP],
    [
      (parentNode.measured?.width || parentNode.width || DEFAULT_NODE_WIDTH) - NODE_EXTENT_RIGHT_OFFSET,
      (parentNode.measured?.height || parentNode.height || DEFAULT_NODE_HEIGHT) - NODE_EXTENT_BOTTOM_OFFSET,
    ],
  ];
};
