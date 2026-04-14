import { DataType } from "@/modules/dataset/types/preprocessing";
import type { NodeInputOutputType } from "@/modules/flow/types/BaseNodeTypes";

/**
 * Maps output type string to DataType enum
 */
export const mapOutputTypeToDataType = (outputType?: NodeInputOutputType["type"]): number | undefined => {
  if (!outputType) return undefined;
  if (outputType === "String") return DataType.String;
  if (outputType === "Number") return DataType.Number;
  if (outputType === "List" || outputType.startsWith("List")) return DataType.List;
  return undefined;
};

/**
 * Extracts parameters from function format: functionName[params]
 * Handles patterns containing brackets by finding outermost brackets
 */
export const extractParameters = (input: string): string => {
  const firstBracket = input.indexOf("[");
  const lastBracket = input.lastIndexOf("]");

  if (firstBracket === -1 || lastBracket === -1 || firstBracket >= lastBracket) {
    return "";
  }

  return input.substring(firstBracket + 1, lastBracket).trim();
};

/**
 * Formats display text for a function with optional parameters
 */
export const formatDisplayText = (functionName: string, parameters?: string): string => {
  return parameters ? `${functionName}[${parameters}]` : functionName;
};

/**
 * Creates filter function for searching options
 */
export const createFilterFunction = (options: Array<{ label: string; value: string } | null>) => {
  return (value: string, search: string) => {
    const searchLower = search.toLowerCase();
    if (!searchLower) return 1;
    const option = options.find((opt) => opt?.value === value);
    if (!option) return 0;
    return option.label.toLowerCase().includes(searchLower) ? 1 : 0;
  };
};

/**
 * Updates function list by either adding a new function or replacing an existing one
 */
export const updateFunctionsList = <T extends { functionId: string }>(
  existingFunctions: T[],
  newFunction: T,
  editingFunctionId: string | null
): T[] => {
  if (editingFunctionId) {
    return existingFunctions.map((f) => (f.functionId === editingFunctionId ? newFunction : f));
  }
  return [...existingFunctions, newFunction];
};
