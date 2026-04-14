import { useSignalRListener } from "@/lib/signalr";
import { useExecutionStore } from "@/store/executionStore";

/**
 * RuleStatusListener handles SignalR events and resets execution stores on flow start
 * SignalR events for node and rule status updates are centralized in nodeExecutionStore
 */
export function RuleStatusListener() {
  useSignalRListener("ReceiveNotification", useExecutionStore.getState().handleReceiveNotification, []);
  useSignalRListener("ReceiveMessage", useExecutionStore.getState().handleReceiveMessage, []);

  return null;
}

export default RuleStatusListener;
