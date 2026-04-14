import { useSignalRSubscribe } from "@/lib/signalr";
import { useFlowStore } from "@/store";

export const JobSubscriber = () => {
  const jobId = useFlowStore((state) => state.jobId);
  useSignalRSubscribe(jobId ? `engine_events:job_id:${jobId}` : null, [jobId]);
  useSignalRSubscribe(jobId ? `node_results:job_id:${jobId}` : null, [jobId]);

  return null;
};
