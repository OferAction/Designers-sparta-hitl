import { type DependencyList, useContext, useEffect } from "react";

import { useStableCallback } from "@/hooks/useStableCallback";

import { SignalRContext } from "./context";
import type { ClientToServerEvents, ServerToClientEvents, Topic } from "@/lib/signalr/types";

export const useSignalRContext = () => {
  const context = useContext(SignalRContext);
  if (context === undefined) {
    throw new Error("useSignalRContext must be used within a SignalRProvider");
  }
  return context;
};

export const useSignalRListener = <E extends keyof ServerToClientEvents>(
  event: E,
  cb: ServerToClientEvents[E],
  dependencies: DependencyList = []
) => {
  const connection = useSignalRContext();
  const callback = useStableCallback(cb);

  useEffect(() => {
    connection?.on(event, callback);
    return () => {
      connection?.off(event, callback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, ...dependencies]);
};

export const useSignalRSubscribe = <T extends Topic>(topic: T | null, dependencies: DependencyList = []) => {
  useSignalREmit("SubscribeTopic", topic, "UnsubscribeTopic", dependencies);
};

export const useSignalREmit = <E extends keyof ClientToServerEvents>(
  eventName: E,
  topic: ClientToServerEvents[E] | null,
  cleanupEvent: keyof ClientToServerEvents | null = null,
  dependencies: DependencyList = []
) => {
  const connection = useSignalRContext();

  useEffect(() => {
    if (topic) {
      connection?.invoke(eventName, topic);
    }
    return () => {
      if (cleanupEvent && topic) connection?.invoke(cleanupEvent, topic);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, topic, eventName, cleanupEvent, ...dependencies]);
};
