import { keepPreviousData } from "@tanstack/react-query";

import { ExecutionLogResponse, NodeOutputResponse, NodeResultResponse, NodeStatusResponse } from "./types";
import { createApiPostMutation, createApiQuery } from "@/api";
import API_CONFIGS from "@/config/api.config";
import { SampleType } from "@/modules/flow/components/ContextualPanel/RightPanelAction/RunSummaryMessage";
import { useFlowStore } from "@/store";

const apiClientKey = "SCHEDULER";
const FLOW_STORAGE_CONFIG = API_CONFIGS[apiClientKey];
const LOGS_CONFIG = API_CONFIGS["LOGS"];

export const startJob = () =>
  createApiPostMutation<
    { id: string },
    {
      jobId: string;
      fileId: string;
      configId?: string;
      inputs?: Record<string, string>;
    },
    void
  >(FLOW_STORAGE_CONFIG.ENDPOINTS.JOB_START, {
    mutationKey: ["startJob"],
    onMutate: (variables) => {
      useFlowStore.getState().setLoading(true);
      useFlowStore.getState().setJobId(variables.jobId);
    },
    onSuccess: (data) => {
      console.log("Job submitted successfully", data);
    },
    onError: (error) => {
      console.log("Job submitted failed", error);
      useFlowStore.getState().setLoading(false);
      useFlowStore.getState().setJobId("");
    },
    apiClientKey,
  });

export const startSubflowJob = () =>
  createApiPostMutation<
    { id: string },
    {
      jobId: string;
      fileId: string;
      configId?: string;
      inputs?: Record<string, string>;
    },
    void
  >(FLOW_STORAGE_CONFIG.ENDPOINTS.SUBFLOW_JOB_START, {
    mutationKey: ["startSubflowJob"],
    onMutate: (variables) => {
      useFlowStore.getState().setLoading(true);
      useFlowStore.getState().setJobId(variables.jobId);
    },
    onSuccess: (data) => {
      console.log("Job submitted successfully", data);
    },
    onError: (error) => {
      console.log("Job submitted failed", error);
      useFlowStore.getState().setLoading(false);
      useFlowStore.getState().setJobId("");
    },
    apiClientKey,
  });

export const cancelJob = (jobId: string) =>
  createApiPostMutation<{ id: string }>(FLOW_STORAGE_CONFIG.ENDPOINTS.JOB_CANCEL(jobId), {
    mutationKey: ["cancelJob"],
    onSuccess: (data) => {
      console.log("Job Canceled successfully", data);
    },
    apiClientKey,
  });

// Deprecated: use getNodeResult instead
export const getNodeOutput = (jobId: string, nodeId: string) =>
  createApiQuery<NodeOutputResponse>(
    FLOW_STORAGE_CONFIG.ENDPOINTS.NODE_OUTPUT,
    ["job_output", jobId, nodeId],
    { apiClientKey },
    {
      params: {
        NodeId: nodeId,
        JobId: jobId,
      },
    }
  );

export const getNodeResult = (jobId: string, nodeId: string, iteration?: number[]) =>
  createApiQuery<NodeResultResponse>(
    FLOW_STORAGE_CONFIG.ENDPOINTS.NODE_RESULT,
    ["node_result", jobId, nodeId, JSON.stringify(iteration)],
    { apiClientKey },
    {
      params: {
        jobId: jobId,
        nodeId: nodeId,
        ...(iteration && iteration.length > 0 ? { iteration: iteration } : {}),
      },
      paramsSerializer: {
        indexes: null,
      },
    }
  );

export const getNodeStatus = (jobId: string) =>
  createApiQuery<NodeStatusResponse>(
    FLOW_STORAGE_CONFIG.ENDPOINTS.NODE_STATUS,
    ["node_status", jobId],
    { apiClientKey },
    {
      params: {
        jobId,
      },
    }
  );

export const downloadRawFile = async (jobId: string, nodeId: string, fileKey: string, resultType: number) => {
  const { apiClients } = await import("@/api/axios-clients");
  const schedulerClient = apiClients.SCHEDULER;
  const endpoint = FLOW_STORAGE_CONFIG.ENDPOINTS.DOWNLOAD_RAW_FILE;

  const response = await schedulerClient.get<Blob>(endpoint, {
    params: {
      jobId,
      nodeId,
      fileKey,
      resultType,
    },
    responseType: "blob",
  });

  const contentType = response.headers["content-type"] || "application/octet-stream";

  const blob = new Blob([response.data], { type: contentType });
  const url = URL.createObjectURL(blob);

  const newWindow = window.open(url, "_blank");
  const intervalId = setInterval(() => {
    if (newWindow?.closed) {
      URL.revokeObjectURL(url);
      clearInterval(intervalId);
    }
  }, 10000);
};

export const runSample = () => {
  return createApiPostMutation<
    { id: string },
    {
      inputs: Record<string, any>;
      config: string;
      jobId: string;
      isSingleNode: boolean;
      configId: string;
    },
    void
  >(FLOW_STORAGE_CONFIG.ENDPOINTS.RUN_TEST, {
    mutationKey: ["runTest"],
    onMutate: (variables) => {
      useFlowStore.getState().setLoading(true);
      useFlowStore.getState().setJobId(variables.jobId);
    },
    onSuccess: (data) => {
      console.log("Node run successfully", data);
    },
    onError: (error) => {
      console.log("Node run failed", error);
      useFlowStore.getState().setLoading(false);
      useFlowStore.getState().setJobId("");
    },
    apiClientKey,
  });
};

export const getRecentSamples = (fileId: string) => {
  return createApiQuery<{
    items: {
      id: string;
      status: "Running" | "Pending" | "Finished" | "Cancelled" | "Failed";
      data: Record<string, any>;
      executionTime?: string;
      startTime: string;
    }[];
  }>(
    FLOW_STORAGE_CONFIG.ENDPOINTS.RECENT_SAMPLES,
    ["recentSamples"],
    { apiClientKey },
    {
      params: {
        fileId,
      },
    }
  );
};

export const getLatestSample = (fileId: string, jobId: string) => {
  return createApiQuery<SampleType | null>(FLOW_STORAGE_CONFIG.ENDPOINTS.LATEST_SAMPLE(fileId), ["latestSample", jobId], { apiClientKey });
};

export const getSample = (jobId: string) => {
  return createApiQuery<SampleType | null>(FLOW_STORAGE_CONFIG.ENDPOINTS.GET_SAMPLE(jobId), ["sample", jobId], { apiClientKey });
};

export const getNodeLogs = (jobId: string, nodeId: string, iterationPath?: number[]) =>
  createApiQuery<ExecutionLogResponse>(
    LOGS_CONFIG.ENDPOINTS.NODE_LOGS,
    ["Node_Logs", jobId, nodeId, JSON.stringify(iterationPath)],
    {
      apiClientKey: "LOGS",
      placeholderData: keepPreviousData,
    },
    {
      params: {
        nodeId,
        jobId,
        iterationpath: iterationPath,
      },
      paramsSerializer: {
        indexes: null,
      },
    }
  );
