import { useEffect } from "react";

import { useGetNodeStatus } from "@/modules/flow/services";
import { useExecutionStore, useFlowStore } from "@/store";

export const useGetNodeStatusIntoStore = () => {
  const jobId = useFlowStore((state) => state.jobId);
  const { data, isSuccess, isLoading } = useGetNodeStatus(jobId);

  useEffect(() => {
    if (isLoading) {
      const { reset } = useExecutionStore.getState();
      reset();
    }
    return () => {
      const { reset } = useExecutionStore.getState();
      reset();
    };
  }, [isLoading]);

  useEffect(() => {
    if (isSuccess && data) {
      const { handleReceiveMessage, handleReceiveNotification, reset, setGraphEvent } = useExecutionStore.getState();
      reset();
      Object.entries(data).forEach(([nodeId, statusData]) => {
        handleReceiveNotification({
          nodeId,
          ...statusData,
          jobId,
          executionTime: statusData.executionTime || 0,
        });

        if (statusData.status) {
          handleReceiveMessage({
            eventType: `engine_node_${statusData.status}`,
            payload: {
              jobId,
              nodeId,
              additionalFields: statusData.additionalFields,
            },
          });

          if (["failed", "completed"].includes(statusData.status)) {
            handleReceiveMessage({
              eventType: `engine_node_started`,
              payload: {
                jobId,
                nodeId,
                additionalFields: statusData.additionalFields,
              },
            });
          }
        }
      });

      // Set a dummy graph event to mark the graph as completed
      setGraphEvent({ eventType: "engine_graph_completed", payload: { jobId, nodeId: "" } });
    }
  }, [isSuccess, data, jobId]);
};
