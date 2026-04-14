import { useParams } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";

import { EvaluationStatus } from "../types";
import {
  deleteEvaluation,
  downloadEvaluationSamplesLogs,
  getEvaluationHistoryQuery,
  getEvaluationQuery,
  pauseResumeEvaluation,
  startEvaluation,
} from "./evaluationQueries";
import { useApiMutation, useApiQuery, useInfiniteApiQuery } from "@/api";

export function useGetEvaluation(batchId: string) {
  return useApiQuery(getEvaluationQuery(batchId), {
    refetchOnMount: "always",
    enabled: !!batchId,
    retry: true,
    retryDelay: 1000,
    staleTime: 60 * 1000 * 2, // 2 minutes
    refetchInterval: (query) => {
      const isFinished = ["Failed", "Finished"].includes(query.state.data?.status || "");
      return isFinished ? false : 10000; // 10 seconds
    },
  });
}

export function useGetEvaluationHistory(fileId: string) {
  return useInfiniteApiQuery(getEvaluationHistoryQuery(fileId), {
    refetchOnMount: "always",
    enabled: !!fileId,
    refetchInterval: 5000, // 5 seconds
  });
}

export function useStartEvaluation() {
  return useApiMutation(startEvaluation());
}

export function usePauseResumeEvaluation(batchId: string, runningStatus: EvaluationStatus) {
  const { fileId = "" } = useParams();
  const { toast } = useToast();

  const isRunning = runningStatus === "Running";
  const isPaused = runningStatus === "Paused";
  const errorDescription = isRunning ? "Failed to pause Evaluation" : isPaused ? "Failed to resume Evaluation" : null;

  return useApiMutation(pauseResumeEvaluation(batchId, fileId), {
    onError: () => {
      toast({
        description: errorDescription,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteEvaluation(batchId: string, onDeleteSuccess?: () => void) {
  const { toast } = useToast();
  const { fileId = "" } = useParams();

  return useApiMutation(deleteEvaluation(batchId, fileId), {
    onSuccess: () => {
      onDeleteSuccess?.();
      toast({
        description: "evaluation deleted successfully",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        description: "failed to delete evaluation",
        variant: "destructive",
      });
    },
  });
}

export function useDownloadEvaluationSamplesLogs(batchId: string, nodeId: string) {
  const { toast } = useToast();
  return useApiMutation(downloadEvaluationSamplesLogs(batchId, nodeId), {
    onSuccess: () => {
      toast({
        description: "Logs download started. Check the notifications for progress.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        description: "Failed to start logs download.",
        variant: "destructive",
      });
    },
  });
}
