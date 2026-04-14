import { useEffect, useState } from "react";

import { useShallow } from "zustand/shallow";

import { UndoRedoControls } from "@/modules/flow/hooks/UndoRedoControls";

import { ExecutionPanelsManager } from "./ExecutionPanelsManager";
import StatusCenter from "./StatusCenter";
import { FlowStoreState, useFlowStore } from "@/store";
import { cn } from "@/utils";

const selector = (state: FlowStoreState) => ({
  jobId: state.jobId,
});

function FlowFooter({
  children,
  className,
  showExecutionPanelsProp,
}: {
  children?: React.ReactNode;
  className?: string;
  showExecutionPanelsProp?: boolean;
}) {
  const { jobId } = useFlowStore(useShallow(selector));
  const [showExecutionPanels, setShowExecutionPanels] = useState(false);

  // Show panels when there's an active job
  useEffect(() => {
    if (jobId !== "") {
      setShowExecutionPanels(true);
    }
  }, [jobId]);

  return (
    <>
      <ExecutionPanelsManager visible={showExecutionPanelsProp ?? showExecutionPanels} />
      <div className={cn("gap-4 flex w-full justify-between h-fit p-4 justify-self-end [&>*]:pointer-events-auto", className)}>
        <div className="pointer-events-auto justify-self-start">{children}</div>
        <div>
          <StatusCenter />
        </div>
        <div className="flex gap-4 pointer-events-auto">
          <UndoRedoControls />
        </div>
      </div>
    </>
  );
}

export default FlowFooter;
