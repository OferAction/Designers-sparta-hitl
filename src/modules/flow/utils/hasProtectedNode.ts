import { Node } from "@/modules/flow/types";

export const hasProtectedNode = (node?: Pick<Node, "type"> | Pick<Node, "type">[]) => {
  if (!node) return false;
  if (Array.isArray(node)) {
    return node.some((n) => n.type === "start" || n.type === "end");
  }
  return node.type === "start" || node.type === "end";
};
