import React, { useCallback, useState } from "react";

import { useShallow } from "zustand/shallow";

import { useHasOnlyStartAndEndNodes } from "@/hooks/useHasOnlyStartAndEndNodes";

import { GenOneGradientIcon } from "@/lib/icons";
import WithTooltip from "@/components/common/WithTooltip";
import { useDescriptionSession } from "@/contexts/DescriptionSessionContext";
import { useSignalRListener, useSignalRSubscribe } from "@/lib/signalr";
import { GenOneNotificationEvent } from "@/lib/signalr/types/serverToClient";
import { cn } from "@/lib/utils";
import { useOrchestrationDescriptionGeneration } from "@/modules/genOne/genOneService";
import { FlowStoreState, useFlowStore } from "@/store";
import { genId } from "@/utils";

const selector = (state: FlowStoreState) => ({
  nodes: state.nodes,
  edges: state.edges,
});

interface ActOneButtonProps {
  className?: string;
  disabled?: boolean;
  onResult?: (description: string) => void;
}

/**
 * Terminal control button that generates an AI description
 * for the current orchestration via the onResult callback.
 * Subscribes to a SignalR topic to receive the async response.
 */
export const ActOneButton: React.FC<ActOneButtonProps> = ({ className, disabled: disabledProp, onResult }) => {
  const { mutate: generateDescription } = useOrchestrationDescriptionGeneration();
  const { nodes, edges } = useFlowStore(useShallow(selector));
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const { startDescriptionSession, endDescriptionSession } = useDescriptionSession();

  const isStartEndOnly = useHasOnlyStartAndEndNodes();
  const isWaiting = activeSessionId !== null;
  const disabled = disabledProp || isStartEndOnly;

  const topic = activeSessionId ? (`genone_events:session_id:${activeSessionId}` as const) : null;

  useSignalRSubscribe(topic, [activeSessionId]);

  useSignalRListener(
    "ReceiveNotification",
    (event) => {
      if (!activeSessionId) return;
      const notification = event as unknown as GenOneNotificationEvent;
      if (!notification.message) {
        return;
      }
      onResult?.(notification.message);
      endDescriptionSession(activeSessionId);
      setActiveSessionId(null);
    },
    [activeSessionId, onResult, endDescriptionSession]
  );

  const handleClick = useCallback(() => {
    if (disabled) return;

    const sessionId = genId();
    startDescriptionSession(sessionId);
    setActiveSessionId(sessionId);

    generateDescription({
      session_id: sessionId,
      user_id: "user",
      existing_config: { nodes, edges },
    });
  }, [disabled, generateDescription, nodes, edges, startDescriptionSession]);

  return (
    <WithTooltip tooltip={disabled || "Generate with ActOne"} delayDuration={0} disableTooltip={disabled}>
      <button
        type="button"
        aria-label="Generate with ActOne"
        onClick={handleClick}
        disabled={disabled}
        className="flex items-center justify-center size-full"
      >
        <GenOneGradientIcon
          className={cn(
            "h-4 w-4 cursor-pointer text-primary hover:text-muted-foreground",
            isWaiting && "animate-pulse",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none",
            className
          )}
        />
      </button>
    </WithTooltip>
  );
};
