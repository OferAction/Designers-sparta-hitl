import { useGetDatasetInfo } from "@/modules/dataset/services";
import { useFlowStore } from "@/store";

// Hook for dataset operations with automatic data fetching
export const useDataset = () => {
  const selectedDatasetId = useFlowStore((state) => state.selectedDatasetId);
  const { data: datasetInfo, isLoading: isLoadingFromApi } = useGetDatasetInfo(selectedDatasetId || "");

  const isLoading = isLoadingFromApi;

  return {
    selectedDatasetId,
    datasetTreeData: datasetInfo?.datasetTreeData || [],
    rawFilesData: datasetInfo?.rawFilesData || [],
    isLoading,
    labelsCount: datasetInfo?.labelsCount,
    dataItemsCount: datasetInfo?.dataItemsCount,
    samplesCount: datasetInfo?.samplesCount,
  };
};
