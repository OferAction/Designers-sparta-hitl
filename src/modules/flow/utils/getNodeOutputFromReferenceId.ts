import { Node } from "@/modules/flow/types";

export const getNodeOutputFromReferenceId = (id: `${string}.${string}` | string, getNode: (id: string) => Node | undefined) => {
  const [nodeId, outputId] = id.split(".");
  if (!nodeId || !outputId) throw new Error("Invalid reference id");
  const node = getNode(nodeId);
  if (!node) return undefined;
  return node.data.outputs.find((output) => output.id === outputId);
};
