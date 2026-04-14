import { ParentLookup } from "@xyflow/system";

import { NODE_HORIZONTAL_PADDING, NODE_VERTICAL_PADDING } from "@/modules/flow/constants";

export const getMaxHeight = (id: string, parentLookup: ParentLookup) => {
  let maxHeight = 0;
  const children = parentLookup.get(id);
  if (!children) return maxHeight;
  for (const child of children) {
    maxHeight = Math.max(maxHeight, child[1].measured.height || 0);
  }
  return maxHeight + NODE_VERTICAL_PADDING; // add padding to the max height
};

export const getMaxWidth = (id: string, parentLookup: ParentLookup) => {
  let maxWidth = 0;
  const children = parentLookup.get(id);
  if (!children) return maxWidth;
  for (const child of children) {
    maxWidth = Math.max(maxWidth, child[1].measured.width || 0);
  }
  return maxWidth + NODE_HORIZONTAL_PADDING; // add padding to the max width
};
