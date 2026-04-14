import { useMemo } from "react";

import { useShallow } from "zustand/shallow";

import { mapOutputTypeToDataType } from "./utils";
import { useGetPreprocessingFunctions } from "@/modules/dataset/services/datasetService";
import { type PreprocessingFunctionWithParams } from "@/modules/dataset/types/preprocessing";
import type { NodeInputOutputType } from "@/modules/flow/types/BaseNodeTypes";
import { useFlowStore } from "@/store";

interface UsePreprocessingFunctionsParams {
  nodeId: string;
  outputId: string;
  outputType?: NodeInputOutputType["type"];
}

/**
 * Provides preprocessing function data for a specific mapping output.
 * Reads existing functions from the flow store and fetches available functions from the API.
 */
export function usePreprocessingFunctions({ nodeId, outputId, outputType }: UsePreprocessingFunctionsParams) {
  const mappings = useFlowStore(useShallow((state) => state.mappings));

  const key = `${nodeId}-${outputId}`;
  const existingFunctions = useMemo<PreprocessingFunctionWithParams[]>(() => mappings[key]?.preprocessingFunctions ?? [], [mappings, key]);

  const dataType = mapOutputTypeToDataType(outputType);
  const { data: availableFunctions = [], isLoading } = useGetPreprocessingFunctions(dataType || 0, !!dataType);

  return {
    existingFunctions,
    availableFunctions,
    isLoading,
  };
}

/** Filters available functions by excluding already-applied ones (except the one being edited) */
export function getSelectableFunctions(
  availableFunctions: ReturnType<typeof usePreprocessingFunctions>["availableFunctions"],
  existingFunctions: PreprocessingFunctionWithParams[],
  editingFunctionId: string | null
) {
  const usedIds = new Set(existingFunctions.filter((fn) => fn.functionId !== editingFunctionId).flatMap((fn) => [fn.functionId, fn.functionName]));
  return availableFunctions.filter((fn) => !usedIds.has(fn.id) && !usedIds.has(fn.name));
}
