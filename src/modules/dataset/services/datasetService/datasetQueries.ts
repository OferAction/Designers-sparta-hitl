import { QueryClient } from "@tanstack/react-query";

import { createApiQuery, createApiPostMutation, createApiPutMutation } from "@/api";
import API_CONFIGS from "@/config/api.config";
import type {
  DatasetsResponse,
  DatasetInfo,
  DatasetMappingRequest,
  DatasetMappingResponse,
  Subset,
  DatasetVersionResponse,
  DatasetSampleResponse,
} from "@/modules/dataset/types";
import type { PreprocessingFunctionsResponse } from "@/modules/dataset/types/preprocessing";
import { DatasetResponse } from "@/modules/flow/types";

const apiClientKey = "DEFAULT";
const CONFIG = API_CONFIGS[apiClientKey];
const SCHEDULER_CONFIG = API_CONFIGS["SCHEDULER"];

type CreateDatasetPayload = {
  name: string;
  datasetVersion: {
    zipUrl?: string;
    jsonUrl: string;
  };
};

export const getConfigurationDatasetMappingById = (fileId: string) =>
  createApiQuery<DatasetMappingResponse>(
    CONFIG.ENDPOINTS.CONFIGURATION_DATASET_MAPPING_GET_BY_ID(fileId),
    ["configuration-dataset-mapping-by-id", fileId],
    {
      apiClientKey,
    }
  );

export const getDatasets = (fileId?: string) =>
  createApiQuery<DatasetsResponse>(
    CONFIG.ENDPOINTS.DATASET,
    ["datasets", fileId || ""],
    {
      apiClientKey,
    },
    {
      params: {
        fileId,
      },
    }
  );
export const getFileDatasets = (fileId: string) =>
  createApiQuery<DatasetsResponse>(
    CONFIG.ENDPOINTS.DATASET_SUBSETS,
    ["file-datasets", fileId],
    {
      apiClientKey,
    },
    {
      params: {
        fileId,
      },
    }
  );

export const getSubsetsByDatasetId = (datasetId: string) =>
  createApiQuery<Subset[]>(SCHEDULER_CONFIG.ENDPOINTS.SUBSET_BY_DATASET(datasetId), ["subsets-by-dataset", datasetId], {
    apiClientKey: "SCHEDULER",
  });

export const getDatasetInfo = (datasetId: string) =>
  createApiQuery<DatasetInfo>(CONFIG.ENDPOINTS.DATASET_INFO(datasetId), ["dataset-info", datasetId], {
    apiClientKey,
  });

export const postDatasetMapping = (fileId: string, queryClient: QueryClient) => {
  return createApiPostMutation<DatasetMappingResponse, DatasetMappingRequest>(CONFIG.ENDPOINTS.CONFIGURATION_DATASET_MAPPING_CREATE, {
    apiClientKey,
    onSuccess: () => {
      queryClient.invalidateQueries(getConfigurationDatasetMappingById(fileId));
    },
  });
};

export const getConfigurationDatasetMapping = (configurationId: string, datasetVersionId: string) =>
  createApiQuery<DatasetMappingResponse>(
    CONFIG.ENDPOINTS.CONFIGURATION_DATASET_MAPPING_BY_DATASET_ID,
    ["configuration-dataset-mapping", configurationId, datasetVersionId],
    {
      apiClientKey,
    },
    {
      params: {
        configurationId,
        datasetVersionId,
      },
    }
  );
export const getDatasetVersion = (datasetVersionId: string) =>
  createApiQuery<DatasetVersionResponse>(CONFIG.ENDPOINTS.DATASET_VERSION_ID(datasetVersionId), ["datasetVersion", datasetVersionId], {
    apiClientKey,
  });

export const getDatasetSample = (mappingId: string, index: number, subsetId: string) =>
  createApiQuery<DatasetSampleResponse>(
    SCHEDULER_CONFIG.ENDPOINTS.DATASET_SAMPLE,
    ["datasetSample", mappingId, index.toString(), subsetId],
    {
      apiClientKey: "SCHEDULER",
    },
    {
      params: {
        mappingId,
        index,
        subsetId,
      },
    }
  );

export const getPreprocessingFunctions = (dataType: number) =>
  createApiQuery<PreprocessingFunctionsResponse>(
    CONFIG.ENDPOINTS.PREPROCESSING_FUNCTION,
    ["preprocessing-functions", dataType.toString()],
    {
      apiClientKey,
    },
    {
      params: {
        dataType,
      },
    }
  );

export const updateDataset = (queryClient: QueryClient) => {
  return createApiPutMutation<
    void,
    {
      zipUrl: string;
      $datasetVersionId: string;
    }
  >(CONFIG.ENDPOINTS.DATASET_VERSION, {
    mutationKey: ["updateDataset"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getDatasets().queryKey });
    },
    apiClientKey,
  });
};

export const createDataset = (queryClient: QueryClient) => {
  return createApiPostMutation<Omit<DatasetResponse, "createdTime">, CreateDatasetPayload>(CONFIG.ENDPOINTS.DATASET, {
    mutationKey: ["createDataset"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getDatasets().queryKey });
    },
    apiClientKey,
  });
};
