import { ActivitiesResponse, LiveNodesResponse, MetricsResponse, MonitorApiParams, VersionSeriesResponse } from "./types";
import { createApiQuery } from "@/api";
import API_CONFIG from "@/config/api.config";

export const getChartTimeSeriesDataQuery = (fileId: string, params: MonitorApiParams) => {
  return createApiQuery<VersionSeriesResponse>(
    API_CONFIG.SCHEDULER.ENDPOINTS.MONITORING_TIME_SERIES_DATA(fileId),
    ["monitoring", "timeSeriesData", fileId, params],
    { apiClientKey: "SCHEDULER" },
    {
      params,
      paramsSerializer: {
        indexes: null,
      },
    }
  );
};

export const getAnalyticsCardsQuery = (fileId: string, params: MonitorApiParams) => {
  return createApiQuery<MetricsResponse>(
    API_CONFIG.SCHEDULER.ENDPOINTS.MONITORING_ANALYTICS_CARDS(fileId),
    ["monitoring", "analyticsCards", fileId, params],
    { apiClientKey: "SCHEDULER" },
    {
      params,
      paramsSerializer: {
        indexes: null,
      },
    }
  );
};

export const getPerformanceMetricsQuery = (fileId: string, params: MonitorApiParams) => {
  return createApiQuery<{
    totalTokenUsage: number;
    averageTokensPerExecution: number;
    averageExecutionTime: number;
    publishedAt: string;
    versionName: string;
  }>(
    API_CONFIG.SCHEDULER.ENDPOINTS.MONITORING_PERFORMANCE_METRICS(fileId),
    ["monitoring", "performanceMetrics", fileId, params],
    { apiClientKey: "SCHEDULER" },
    {
      params,
      paramsSerializer: {
        indexes: null,
      },
    }
  );
};

export const getLiveActivityQuery = (fileId: string, params: MonitorApiParams) => {
  return createApiQuery<ActivitiesResponse>(
    API_CONFIG.SCHEDULER.ENDPOINTS.MONITORING_LIVE_ACTIVITY(fileId),
    ["monitoring", "liveActivity", fileId, params],
    { apiClientKey: "SCHEDULER" },
    {
      params,
      paramsSerializer: {
        indexes: null,
      },
    }
  );
};

export const getLiveWorkflowQuery = (fileId: string, params: MonitorApiParams) => {
  return createApiQuery<LiveNodesResponse>(
    API_CONFIG.SCHEDULER.ENDPOINTS.MONITORING_LIVE_WORKFLOW(fileId),
    ["monitoring", "liveWorkflow", fileId, params],
    { apiClientKey: "SCHEDULER" },
    {
      params,
      paramsSerializer: {
        indexes: null,
      },
    }
  );
};
