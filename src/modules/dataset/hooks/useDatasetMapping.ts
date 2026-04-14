import { useAlignmentKeyErrors } from "@/modules/dataset/hooks/useAlignmentKeyErrors";
import { useReliabilityOutputs } from "@/modules/dataset/hooks/useReliabilityOutputs";

import { useFlowStore } from "@/store";

// Hook for mapping operations
export const useDatasetMapping = () => {
  const setMapping = useFlowStore((state) => state.setMapping);
  const removeMapping = useFlowStore((state) => state.removeMapping);
  const setMetrics = useFlowStore((state) => state.setMetrics);
  const setInputDict = useFlowStore((state) => state.setInputDict);
  const removeInputDict = useFlowStore((state) => state.removeInputDict);
  const setAlignmentKey = useFlowStore((state) => state.setAlignmentKey);
  const removeAlignmentKey = useFlowStore((state) => state.removeAlignmentKey);
  const setMetricParams = useFlowStore((state) => state.setMetricParams);
  const setAlignmentKeyErrorsForNode = useFlowStore((state) => state.setAlignmentKeyErrorsForNode);
  const clearAlignmentKeyErrorsForNode = useFlowStore((state) => state.clearAlignmentKeyErrorsForNode);
  const setFlaggedNodesOutputsFrontend = useFlowStore((state) => state.setFlaggedNodesOutputsFrontend);
  const toggleFlaggedOutput = useFlowStore((state) => state.toggleFlaggedOutput);
  const clearAll = useFlowStore((state) => state.clearAll);
  const populateMappingsFromApi = useFlowStore((state) => state.populateMappingsFromApi);

  const { getAllAlignmentKeyErrors } = useAlignmentKeyErrors();
  const { getReliabilityOutputs } = useReliabilityOutputs();

  return {
    setMapping,
    removeMapping,
    setMetrics,
    setInputDict,
    removeInputDict,
    setAlignmentKey,
    setAlignmentKeyErrorsForNode,
    clearAlignmentKeyErrorsForNode,
    getAllAlignmentKeyErrors,
    removeAlignmentKey,
    setMetricParams,
    setFlaggedNodesOutputsFrontend,
    toggleFlaggedOutput,
    clearAll,
    populateMappingsFromApi,
    getReliabilityOutputs,
  };
};

// Hook for selected dataset operations
export const useSelectedDataset = () => {
  const selectedDatasetId = useFlowStore((state) => state.selectedDatasetId);
  const setSelectedDatasetId = useFlowStore((state) => state.setSelectedDatasetId);

  return {
    selectedDatasetId,
    setSelectedDatasetId,
  };
};
