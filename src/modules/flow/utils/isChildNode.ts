import { ParentLookup } from "@xyflow/system";
import { NodeLookup } from "@xyflow/system";

import { Node } from "@/modules/flow/types";

export const isChildNode = (
  parentLookup: ParentLookup,
  nodeLookup: NodeLookup,
  node?: Partial<Pick<Node, "id" | "parentId">>,
  testParentNodeId?: string
): boolean => {
  if (!node || !node.id || !node.parentId || !testParentNodeId) return false;
  if (node.id === testParentNodeId) return true;

  const childNodesLookup = parentLookup.get(testParentNodeId);
  if (childNodesLookup?.has(node.id)) return true;

  const parentNode = nodeLookup.get(node.parentId);

  return isChildNode(parentLookup, nodeLookup, parentNode, testParentNodeId);
};
