import { NonNullableOption } from "@/components/ui/input-tag";

export const getRequiredInputs = <T>(inputs: T): NonNullableOption[] => {
  if (!inputs) return [];
  if (typeof inputs === "object") {
    if ("isReference" in inputs && inputs.isReference === true) {
      return [inputs as unknown as NonNullableOption];
    }
    return Object.values(inputs).flatMap((item) => getRequiredInputs(item));
  }
  if (Array.isArray(inputs)) {
    return inputs.flatMap((item) => getRequiredInputs(item));
  }
  return [];
};

/*
 * Transforms references to any node inside combinedNodes to newNodeId
 * This is useful in subflow when we are merging nodes inside it and we want to update their references
 * so that the subflow nodes references the new start node
 * and the outside nodes references the new subflow node itself
 */
export const transformInputsToNewNodeOutputs = <T>(inputs: T, extractedNodes: Set<string>, newNodeId = "node_0"): void => {
  if (!inputs) return;
  if (typeof inputs === "object") {
    if ("isReference" in inputs && inputs.isReference === true) {
      const nonNullableOption = inputs as unknown as NonNullableOption;
      if (!extractedNodes.has(nonNullableOption.value.split(".")[0])) {
        nonNullableOption.value = newNodeId + "." + nonNullableOption.value.split(".").slice(1);
      }
      return;
    }
    return Object.values(inputs).forEach((item) => transformInputsToNewNodeOutputs(item, extractedNodes, newNodeId));
  }
  if (Array.isArray(inputs)) {
    return inputs.forEach((item) => transformInputsToNewNodeOutputs(item, extractedNodes, newNodeId));
  }
  return;
};
