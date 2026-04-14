import { useState } from "react";

import { CheckCircleIcon, CircleIcon } from "@phosphor-icons/react";
import { useParams } from "react-router-dom";

import { useSignalRListener, useSignalRSubscribe } from "@/lib/signalr";
import { cn } from "@/utils";

type EvaluationStatus = "idle" | "running" | "completed";

interface EvaluationIndicatorProps {
  secondIcon?: boolean;
}

const EvaluationIndicator = ({ secondIcon = false }: EvaluationIndicatorProps) => {
  const { fileId } = useParams();
  const [status, setStatus] = useState<EvaluationStatus>("idle");

  useSignalRListener("ReceiveEngineBatchStarted", (event) => {
    if (event.eventType === "engine_batch_started" && status !== "running") {
      setStatus("running");
    }

    if (event.eventType === "engine_batch_completed" && status !== "completed") {
      setStatus("completed");
    }
  });

  useSignalRSubscribe(`evaluation_events:file_id:${fileId}`, [fileId]);
  useSignalRListener("ReceiveNotification", (event) => {
    if (event.eventType === "evaluation_started" && status !== "running") {
      setStatus("running");
    }
  });

  const isRunning = status === "running";
    const isCompleted = status === "completed";

  if (secondIcon && isCompleted) {
    return <CheckCircleIcon size={20} className="text-blue-accent mr-1" />;
  }

  if (!secondIcon && (isRunning || isCompleted)) {
    return (
      <div className="absolute bottom-1 left-1 rounded-full bg-sidebar p-0.5 group-hover/item:bg-sidebar-accent ">
        <CircleIcon weight="fill" size={10} className={cn(isRunning && "text-blue-accent-hover", isCompleted && "text-blue-accent")} />
      </div>
    );
  }

  return null;
};

export default EvaluationIndicator;
