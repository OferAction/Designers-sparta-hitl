import { useGetDatasetInfo } from "@/modules/dataset/services";
import { useFlowStore } from "@/store";

// Dataset mapping hooks
export const useDatasetMappings = () => {
  return useFlowStore((state) => ({
    mappings: state.mappings,
    inputsDict: state.inputsDict,
  }));
};

export const useDatasetMappingActions = () => {
  return useFlowStore((state) => ({
    setMapping: state.setMapping,
    removeMapping: state.removeMapping,
    setMetrics: state.setMetrics,
    setInputDict: state.setInputDict,
    removeInputDict: state.removeInputDict,
    clearAll: state.clearAll,
    populateMappingsFromApi: state.populateMappingsFromApi,
  }));
};

export const useSelectedDataset = () => {
  return useFlowStore((state) => ({
    selectedDatasetId: state.selectedDatasetId,
    setSelectedDatasetId: state.setSelectedDatasetId,
  }));
};

// Dataset hooks
export const useDatasetTree = () => {
  const { selectedDatasetId } = useSelectedDataset();
  const { data, isLoading } = useGetDatasetInfo(selectedDatasetId || "");
  return {
    datasetTreeData: data?.datasetTreeData,
    rawFilesData: data?.rawFilesData,
    isLoading,
  };
};

export const useDatasetMapping = () => {
  const mappings = useDatasetMappings();
  const actions = useDatasetMappingActions();

  return {
    ...mappings,
    ...actions,
  };
};

export const useDataset = () => {
  const tree = useDatasetTree();
  const { selectedDatasetId, setSelectedDatasetId } = useSelectedDataset();

  return {
    ...tree,
    selectedDatasetId,
    setSelectedDatasetId,
  };
};
