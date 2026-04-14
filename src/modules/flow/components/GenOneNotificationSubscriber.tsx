import { useState, useEffect } from "react";

import { useNotificationHub } from "@/lib/signalr/useNotificationHub";

import { useDescriptionSession } from "@/contexts/DescriptionSessionContext";
import { useSignalRSubscribe, useSignalRListener } from "@/lib/signalr";
import { useFlowStore } from "@/store";

interface WorkflowNotificationEvent {
  workflowStatus: boolean;
  message?: string;
  [key: string]: any;
}

interface GenOneNotificationSubscriberProps {
  sessionId?: string;
  onWorkflowNotification?: (event: WorkflowNotificationEvent) => void;
}

export const GenOneNotificationSubscriber = ({ onWorkflowNotification }: GenOneNotificationSubscriberProps) => {
  const sessionId = useFlowStore((state) => state.sessionId);
  const { connect, connectionState } = useNotificationHub();
  const [_, setIsConnected] = useState(false);
  const { isDescriptionSessionActive } = useDescriptionSession();

  // Subscribe to the GenOne events topic only if sessionId is provided
  useSignalRSubscribe(`genone_events:session_id:${sessionId}`, [sessionId]);

  // Connect to the notification hub when component mounts
  useEffect(() => {
    const initConnection = async () => {
      const connected = await connect();
      setIsConnected(connected);
    };

    initConnection();
  }, [connect]);

  // Listen for incoming notifications (skip description-generation events)
  useSignalRListener(
    "ReceiveNotification",
    (event: any) => {
      if (isDescriptionSessionActive) return;

      // Handle workflow notifications if callback is provided
      if (onWorkflowNotification && event.workflowStatus !== undefined) {
        onWorkflowNotification(event as WorkflowNotificationEvent);
      }
    },
    [onWorkflowNotification, isDescriptionSessionActive]
  );

  // For debugging purposes
  useEffect(() => {
    console.log("Connection state:", connectionState);
  }, [connectionState]);

  return null;
};
