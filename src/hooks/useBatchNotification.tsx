import { useNavigate, useParams } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";

import { ToastAction } from "@/components/ui/toast";
import { useSignalRListener, useSignalRSubscribe } from "@/lib/signalr";

const useBatchNotification = (fileId: string) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { folderId = "folderId", configId = "configId" } = useParams();

  useSignalRSubscribe(`engine_events:file_id:${fileId}`, [fileId]);

  useSignalRListener("ReceiveEngineBatchStarted", (event) => {
    if (event.eventType === "engine_batch_started") {
      toast({
        title: "Evaluation Started",
        description: `The evaluation job has started`,
        variant: "default",
        position: "center",
        action: (
          <ToastAction
            altText="Close"
            onClick={() =>
              navigate(`/canvas/${folderId}/${fileId}/${configId}/evaluation`, {
                state: { batchId: event.batchId },
              })
            }
          >
            View
          </ToastAction>
        ),
      });
    }

    if (event.eventType === "engine_batch_completed") {
      toast({
        title: "Evaluation Completed",
        description: `The evaluation is ready to view and analyze`,
        variant: "default",
        position: "center",
        action: (
          <ToastAction
            altText="Close"
            onClick={() =>
              navigate(`/canvas/${folderId}/${fileId}/${configId}/evaluation`, {
                state: { batchId: event.batchId },
              })
            }
          >
            View
          </ToastAction>
        ),
      });
    }
  });
};
export default useBatchNotification;
