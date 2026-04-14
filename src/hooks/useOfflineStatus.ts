import { useEffect, useState } from "react";

import { useShallow } from "zustand/shallow";

import { FlowStoreState, useFlowStore } from "@/store";

const selector = (state: FlowStoreState) => ({
  contextualMenuActiveAction: state.contextualMenuActiveAction,
  setContextualMenuActiveAction: state.setContextualMenuActiveAction,
});

export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { contextualMenuActiveAction, setContextualMenuActiveAction } = useFlowStore(useShallow(selector));

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setContextualMenuActiveAction("tryingToConnect");
    };
    const handleOnline = () => {
      setIsOffline(false);
      if (contextualMenuActiveAction === "tryingToConnect") {
        setContextualMenuActiveAction("idle");
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // initial sync in case events fired before mount
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [contextualMenuActiveAction, setContextualMenuActiveAction]);

  return { isOffline };
}

export default useOfflineStatus;
