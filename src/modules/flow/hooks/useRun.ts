import { useCallback } from "react";

import { UseMutateFunction } from "@tanstack/react-query";
import { useShallow } from "zustand/shallow";

import { useCancelJob } from "@/modules/flow/services";
import { FlowStoreState, useFlowStore, useExecutionStore } from "@/store";
import { genId } from "@/utils";

const selector = (state: FlowStoreState) => ({
  loading: state.loading,
  setLoading: state.setLoading,
  setJobId: state.setJobId,
  jobId: state.jobId,
});

type UseRunProps<T> = {
  startJobMutate: UseMutateFunction<
    {
      id: string;
    },
    Error,
    T
  >;
  resetStartJob: () => void;
};

export const useRun = <T extends { jobId: string }>({ startJobMutate, resetStartJob }: UseRunProps<T>) => {
  const { loading, setJobId, setLoading, jobId } = useFlowStore(useShallow(selector));

  const { mutate: cancelJobMutate } = useCancelJob(jobId);

  const onRunOrchestration = useCallback(
    (config: Omit<T, "jobId">, cb?: () => void) => {
      useExecutionStore.getState().reset();
      useExecutionStore.getState().reset();
      const jobId = genId().replace(/-/g, "");
      startJobMutate({ ...config, jobId } as T, {
        onSuccess: (data) => {
          console.log("Success: ", data);
          cb?.();
        },
      });
    },
    [startJobMutate]
  );

  const onCancelOrchestration = useCallback(
    (nodeId?: string) => {
      console.log("canceling: ", nodeId);
      setLoading(false);
      cancelJobMutate(undefined, {
        onSuccess: () => {
          resetStartJob();
          setJobId("");
        },
      });
    },
    [cancelJobMutate, resetStartJob, setJobId, setLoading]
  );

  return { onRunOrchestration, onCancelOrchestration, jobId, loading };
};
