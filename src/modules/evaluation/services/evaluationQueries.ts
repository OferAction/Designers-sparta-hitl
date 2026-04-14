import { produce } from "immer";

import { EvaluationHistory, EvaluationResult, EvaluationStatus, startEvaluationInterface } from "../types";
import { createApiDeleteMutation, createApiInfiniteQuery, createApiPostMutation, createApiQuery } from "@/api";
import API_CONFIGS from "@/config/api.config";
import { queryClient } from "@/lib/queryClient";

const apiClientKey = "SCHEDULER";
const FLOW_STORAGE_CONFIG = API_CONFIGS[apiClientKey];

export const getEvaluationQuery = (batchId: string) =>
  createApiQuery<EvaluationResult>(FLOW_STORAGE_CONFIG.ENDPOINTS.EVALUATION(batchId), ["EvaluationResult", batchId], { apiClientKey });

export const getEvaluationHistoryQuery = (fileId: string) => {
  const PAGE_SIZE = 20;
  return createApiInfiniteQuery<EvaluationHistory>(
    FLOW_STORAGE_CONFIG.ENDPOINTS.EVALUATION_HISTORY(fileId),
    ["EvaluationHistory", fileId],
    {
      apiClientKey,
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage || lastPage.items.length < PAGE_SIZE) return undefined;

        const totalFetched = allPages.reduce((sum, page) => sum + page.items.length, 0);
        if (totalFetched >= lastPage.totalCount) return undefined;

        return allPages.length + 1;
      },
    },
    {
      params: {
        pageSize: PAGE_SIZE,
      },
    },
    "page"
  );
};

export const startEvaluation = () =>
  createApiPostMutation<{ id: string; withoutMissingValues: boolean }, startEvaluationInterface>(FLOW_STORAGE_CONFIG.ENDPOINTS.START_EVALUATION, {
    mutationKey: ["startEvaluation"],
    onSuccess: (data) => {
      console.log("evaluation started ", data);
    },
    apiClientKey,
  });
  
export const deleteEvaluation = (batchId: string, fileId: string) =>
  createApiDeleteMutation(FLOW_STORAGE_CONFIG.ENDPOINTS.EVALUATION_DELETE(batchId), {
    mutationKey: ["deleteEvaluation", batchId],
    apiClientKey,
    onMutate: async () => {
      const queryConfig = getEvaluationHistoryQuery(fileId).queryKey;
      const prevEvaluationData = queryClient.getQueryData(queryConfig);

      queryClient.setQueryData(queryConfig, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            items: page.items.filter((evaluation) => evaluation.id !== batchId),
            totalCount: page.totalCount - 1,
          })),
          pageParams: oldData.pageParams,
        };
      });

      return { prevEvaluationData };
    },
    onError: (_, __, context) => {
      const queryConfig = getEvaluationHistoryQuery(fileId);
      queryClient.setQueryData(queryConfig.queryKey, context?.prevEvaluationData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: getEvaluationHistoryQuery(fileId).queryKey,
      });
    },
  });

export const pauseResumeEvaluation = (batchId: string, fileId: string) =>
  createApiPostMutation(FLOW_STORAGE_CONFIG.ENDPOINTS.PAUSE_RESUME_EVALUATION(batchId), {
    mutationKey: ["pauseResumeEvaluation", batchId],
    apiClientKey,
    onMutate: async () => {
      const queryKey = getEvaluationQuery(batchId).queryKey;
      const batchesQueryKey = getEvaluationHistoryQuery(fileId).queryKey;
      await Promise.all([queryClient.cancelQueries({ queryKey }), queryClient.cancelQueries({ queryKey: batchesQueryKey })]);
      const prevEvaluationData = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          status: oldData.status === "Running" ? "Paused" : ("Running" as EvaluationStatus),
        };
      });

      const prevBatchesData = queryClient.getQueryData(batchesQueryKey);
      queryClient.setQueryData(batchesQueryKey, (oldData) => {
        return produce(oldData, (draft) => {
          if (!draft) return;
          for (const page of draft.pages) {
            const index = page.items.findIndex((item) => item.id === batchId);
            if (index !== -1) {
              const item = page.items[index];
              item.runningStatus = item.runningStatus === "Running" ? "Paused" : ("Running" as EvaluationStatus);
              return;
            }
          }
        });
      });
      return { prevEvaluationData, prevBatchesData };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(getEvaluationQuery(batchId).queryKey, context?.prevEvaluationData);
      queryClient.setQueryData(getEvaluationHistoryQuery(fileId).queryKey, context?.prevBatchesData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: getEvaluationQuery(batchId).queryKey });
      queryClient.invalidateQueries({
        queryKey: getEvaluationHistoryQuery(fileId).queryKey,
      });
    },
  });

export const downloadEvaluationSamplesLogs = (batchId: string, nodeId: string) =>
  createApiPostMutation<Blob>(
    FLOW_STORAGE_CONFIG.ENDPOINTS.DOWNLOAD_SAMPLES_LOGS,
    {
      mutationKey: ["downloadEvaluationSamplesLogs", batchId, nodeId],
      apiClientKey,
      onSuccess: (blob) => {
        // Create a download link from the blob
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `evaluation-logs-${batchId}-${nodeId}.json`;

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
    },
    {
      params: { batchId, nodeId },
      responseType: "blob",
    }
  );
