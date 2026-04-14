import { keepPreviousData } from "@tanstack/react-query";

import {
  cancelJob,
  getLatestSample,
  downloadRawFile,
  getNodeLogs,
  getNodeOutput,
  getNodeResult,
  getRecentSamples,
  runSample,
  startJob,
  startSubflowJob,
  getSample,
  getNodeStatus,
} from "./jobQueries";
import { useSubflowContext } from "../../contexts";
import { useApiMutation, useApiQuery } from "@/api";
import { queryClient } from "@/lib/queryClient";

export function useStartJob() {
  const isSubflow = useSubflowContext();
  const queryFn = isSubflow ? startSubflowJob() : startJob();
  return useApiMutation(queryFn);
}
export function useCancelJob(jobId: string) {
  return useApiMutation(cancelJob(jobId));
}

export function useStartRunSample() {
  return useApiMutation(runSample());
}

export function useGetRecentSamples(fileId: string) {
  return useApiQuery(getRecentSamples(fileId), {
    refetchOnMount: "always",
    staleTime: 0,
    enabled: !!fileId,
  });
}

export function useGetLatestSample(fileId: string, jobId: string, enabled = true) {
  return useApiQuery(getLatestSample(fileId, jobId), {
    refetchOnMount: "always",
    enabled: !!fileId && enabled,
    // keep fetching when the orchestration is running
    refetchInterval: () => {
      const data = queryClient.getQueryData(getLatestSample(fileId, jobId).queryKey);
      return data?.status === "Running" || data?.status === "Pending" ? 1000 : false;
    },
    placeholderData: keepPreviousData,
    // gcTime: 0,
  });
}

export function useGetSample(jobId: string) {
  return useApiQuery(getSample(jobId), {
    enabled: !!jobId,
  });
}

export function useGetNodeStatus(jobId: string) {
  return useApiQuery(getNodeStatus(jobId), {
    enabled: !!jobId,
  });
}

// Deprecated: use useGetNodeResult instead
export function useGetNodeOutput(jobId: string, nodeId: string) {
  return useApiQuery(getNodeOutput(jobId, nodeId), {
    enabled: !!jobId && !!nodeId,
    refetchOnMount: "always",
    placeholderData: {
      jobId: jobId,
      nodeId: nodeId,
      input: {},
      output: {},
      executionTime: 0,
    },
    retry: true,
    retryDelay: 1000,
    staleTime: 0,
    gcTime: 0,
  });
}

export function useGetNodeResult(jobId: string, nodeId: string, iterationPath?: number[], retry?: boolean) {
  // UI stores iterations 1-based; backend expects 0-based indices
  const zeroBasedPath = iterationPath ? iterationPath.map((i) => Math.max(0, i - 1)) : undefined;
  return useApiQuery(getNodeResult(jobId, nodeId, zeroBasedPath), {
    enabled: !!jobId && !!nodeId,
    refetchOnMount: "always",
    // Only keep previous data if the nodeId matches
    // But clear data when switching nodes to avoid showing stale node data
    placeholderData: (previousData, previousQuery) => {
      if (previousQuery && previousQuery.queryKey[2] === nodeId) {
        return previousData;
      }
      return undefined;
    },
    retry: retry, // Allow retrying on failure, but can be disabled if needed (e.g., to avoid retrying on 404 when node result is not found)
    retryDelay: 1000,
    staleTime: Infinity, // Keep data fresh indefinitely after first successful fetch
    gcTime: Infinity, // Never garbage collect the cached data
  });
}

export function useDownloadRawFiles(jobId: string, nodeId: string) {
  return {
    download: async (fileKey: string, type: number) => {
      try {
        await downloadRawFile(jobId, nodeId, fileKey, type);
      } catch (error: any) {
        console.error("Download failed:", error);
        throw error;
      }
    },
  };
}

export function useGetNodeLogs(jobId: string, nodeId: string, iterationPath?: number[]) {
  const zeroBasedPath = iterationPath ? iterationPath.map((i) => Math.max(0, i - 1)) : undefined;
  return useApiQuery(getNodeLogs(jobId, nodeId, zeroBasedPath), {
    enabled: !!jobId && !!nodeId,
    refetchOnMount: "always",
    retry: true,
    retryDelay: 1000,
    staleTime: 0,
    gcTime: 0,
  });
}
