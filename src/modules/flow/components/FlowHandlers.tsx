import { useEffect } from "react";

import { useToast } from "@/hooks/use-toast";

import { useGetNodeStatusIntoStore, useHandleSelection } from "../hooks";
import { useLoadActiveConfiguration } from "../hooks/useLoadActiveConfiguration";
import { Loader } from "@/components/common/Loader";
import { useSignalRListener } from "@/lib/signalr";
import { useCollaborativeStore } from "@/store";
import { useExecutionStore } from "@/store/executionStore";

const useHandleLastGraphEvent = () => {
  const { toast } = useToast();

  // Watch for graph completion events from centralized store
  const lastGraphEventType = useExecutionStore((state) => state.getGraphEvent()?.eventType);

  useEffect(() => {
    if (!lastGraphEventType) return;

    if (lastGraphEventType === "engine_graph_failed") {
      toast({
        title: "Flow failed",
        description: "An error occurred while running the flow",
        variant: "destructive",
      });
    }
    if (lastGraphEventType === "engine_graph_completed") {
      toast({
        title: "Flow completed",
        description: "The flow has been completed successfully",
      });
    }
  }, [lastGraphEventType, toast]);
};

export const FlowHandlers = () => {
  const { isLoading } = useLoadActiveConfiguration();
  useHandleSelection();

  useSignalRListener("ReceiveMessage", (event) => {
    console.log("Received message: ", event);
  });

  useHandleLastGraphEvent();

  return (
    <>
      {isLoading ? (
        <div className="flex-grow z-50 absolute w-full h-full flex items-center justify-center bg-background">
          <Loader />
        </div>
      ) : null}
    </>
  );
};
export const RealtimeFlowHandlers = () => {
  const { isLoading } = useLoadActiveConfiguration();
  useHandleSelection();

  useSignalRListener("ReceiveMessage", (event) => {
    console.log("Received message: ", event);
  });

  useHandleLastGraphEvent();

  const isSynced = useCollaborativeStore((state) => state.isSynced);
  return (
    <>
      {!isSynced || isLoading ? (
        <div className="flex-grow absolute z-50 w-full h-screen flex items-center justify-center bg-background">
          <Loader />
        </div>
      ) : null}
    </>
  );
};

export const VersionFlowHandlers = () => {
  const { isLoading } = useLoadActiveConfiguration();
  useHandleSelection();

  useGetNodeStatusIntoStore();

  if (isLoading) {
    return (
      <div className="flex-grow z-50 absolute w-full h-full flex items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }
  return null;
};
