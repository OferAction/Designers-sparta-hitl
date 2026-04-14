import { useRun } from "./useRun";
import { useStartRunSample } from "@/modules/flow/services";
import { useFlowStore } from "@/store";

export const useRunSample = () => {
  const { mutate: startJobMutate, reset } = useStartRunSample();
  const jobId = useFlowStore((state) => state.jobId);

  const { onRunOrchestration, onCancelOrchestration, loading } = useRun({
    startJobMutate,
    resetStartJob: reset,
  });

  return { onRunOrchestration, onCancelOrchestration, jobId, loading };
};
