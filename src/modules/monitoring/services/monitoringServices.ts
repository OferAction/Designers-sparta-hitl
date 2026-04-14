import {
  getAnalyticsCardsQuery,
  getChartTimeSeriesDataQuery,
  getLiveActivityQuery,
  getLiveWorkflowQuery,
  getPerformanceMetricsQuery,
} from "./monitoringQueries";
import { MonitorApiParams } from "./types";
import { useApiQuery } from "@/api";

const refetchOnMountOptions = {
  refetchOnMount: "always" as const,
};

export function useGetTimeSeriesData(fileId: string, params: MonitorApiParams) {
  return useApiQuery(getChartTimeSeriesDataQuery(fileId, params), {
    ...refetchOnMountOptions,
    enabled: !!fileId,
  });
}

export const useGetAnalyticsCards = (fileId: string, params: MonitorApiParams) => {
  return useApiQuery(getAnalyticsCardsQuery(fileId, params), {
    ...refetchOnMountOptions,
    enabled: !!fileId,
  });
};

export const useGetPerformanceMetricsAnalytics = (fileId: string, params: MonitorApiParams) => {
  return useApiQuery(getPerformanceMetricsQuery(fileId, params), {
    ...refetchOnMountOptions,
    enabled: !!fileId && !!params?.ConfigIds?.length,
  });
};

export const useGetPerformanceMetricsLive = (fileId: string, params: MonitorApiParams) => {
  return useApiQuery(getPerformanceMetricsQuery(fileId, params), {
    ...refetchOnMountOptions,
    enabled: !!fileId && !!params.TriggerTypes?.length,
  });
};

export const useGetLiveActivity = (fileId: string, params: MonitorApiParams) => {
  return useApiQuery(getLiveActivityQuery(fileId, params), {
    ...refetchOnMountOptions,
    enabled: !!fileId,
  });
};

export const useGetLiveWorkflow = (fileId: string, params: MonitorApiParams) => {
  return useApiQuery(getLiveWorkflowQuery(fileId, params), {
    ...refetchOnMountOptions,
    enabled: !!fileId,
  });
};
