import { SubsetFilterParams, SubsetFilterParamsMonitoring, SubsetFilterResponse } from "./types";
import { createApiPostMutation, createApiQuery } from "@/api";
import API_CONFIGS from "@/config/api.config";

const apiClientKey = "SCHEDULER";
const FLOW_STORAGE_CONFIG = API_CONFIGS[apiClientKey];

export const subsetFilterQuery = (params: SubsetFilterParams, nonce: string | number) =>
  createApiQuery<SubsetFilterResponse>(
    FLOW_STORAGE_CONFIG.ENDPOINTS.SUBSET_FILTER,
    [
      "subsetFilter",
      params.BatchId,
      params.ResultPath,
      params.FileId || "",
      params.ConfigurationId || "",
      params.ClickedColumn?.toString() || "",
      params.MetricName || "",
      nonce.toString(),
    ],
    { apiClientKey },
    {
      params,
    }
  );

export const subsetFilterMonitoringQuery = (params: SubsetFilterParamsMonitoring, nonce: string | number) =>
  createApiQuery<SubsetFilterResponse>(
    FLOW_STORAGE_CONFIG.ENDPOINTS.MONITORING_SUBSET_FILTER,
    [
      "monitoringSubsetFilter",
      params.ResultPath,
      params.FileId || "",
      params.ClickedColumn?.toString() || "",
      params.TriggerTypes?.toString() || "",
      params.EndDate || "",
      params.StartDate || "",
      nonce.toString(),
    ],
    { apiClientKey },
    {
      params,
      paramsSerializer: {
        indexes: null,
      },
    }
  );

export const saveSubset = () =>
  createApiPostMutation<void, SubsetFilterParams, { previousSubsetData?: SubsetFilterResponse }>(FLOW_STORAGE_CONFIG.ENDPOINTS.SUBSET_SAVE, {
    mutationKey: ["saveSubset"],
    apiClientKey,
  });
