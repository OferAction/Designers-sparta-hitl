import { TreeInputItem } from "@/modules/flow/hooks";
import { NodeIOItem } from "@/modules/flow/types";

export const isPydanticOrhasPydanticParent = (node: TreeInputItem, flatTree: NodeIOItem[]) => {
  if (node.type === "Pydantic") return true;
  if (!node.parentId) return false;

  const linearTree: Map<string, TreeInputItem> = new Map(flatTree.map((item) => [item.id, { ...item }]));

  const isPydanticRecursive = (currentNode: TreeInputItem | undefined): boolean => {
    if (!currentNode) return false;
    if (currentNode.type === "Pydantic") return true;
    if (!currentNode.parentId) return false;
    const parentNode = linearTree.get(currentNode.parentId);
    return isPydanticRecursive(parentNode);
  };

  return isPydanticRecursive(node);
};
