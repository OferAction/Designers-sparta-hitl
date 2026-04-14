import { useRun } from "./useRun";
import { useStartJob } from "@/modules/flow/services";
import { useFlowStore } from "@/store";

export const useConfigRun = () => {
  const { mutate: startJobMutate, reset } = useStartJob();
  const jobId = useFlowStore((state) => state.jobId);

  const { onRunOrchestration, onCancelOrchestration, loading } = useRun({
    startJobMutate,
    resetStartJob: reset,
  });

  return { onRunOrchestration, onCancelOrchestration, jobId, loading };
};
