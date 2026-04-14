import { useCallback } from "react";

import { PlusIcon, StopIcon, SpinnerGapIcon as LoaderIcon } from "@phosphor-icons/react";
import { useStoreApi } from "@xyflow/react";
import { useParams } from "react-router-dom";
import { useShallow } from "zustand/shallow";

import { useCancelWithConfirmCheck } from "@/hooks/useConfirmationDialogs";
import { useParentFileId } from "@/hooks/useFileCache";

import { CancelConfirmationDialog } from "./CancelConfirmationDialog";
import RunSummaryMessage from "./RunSummaryMessage";
import EvaluationRunButton from "@/components/common/evaluationRunButton/EvaluationRunButton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSignalRContext } from "@/lib/signalr";
import { useGetConfigurationDatasetMappingById, useGetDatasets } from "@/modules/dataset/services";
import { FlowPath, RunInfoHeader } from "@/modules/flow/components/ContextualPanel/RunSummary";
import { useSubflowContext } from "@/modules/flow/contexts";
import { useConfigRun, useRunHandlers, useSaveOrchestration } from "@/modules/flow/hooks";
import { useGetLatestSample } from "@/modules/flow/services";
import { FlowStoreState, useFlowStore } from "@/store";
import { cn } from "@/utils";

const selector = (state: FlowStoreState) => ({
  mode: state.mode,
  setMode: state.setMode,
  jobId: state.jobId,
  selectedDatasetId: state.selectedDatasetId,
});

export function OrchestrationModeHeader() {
  const reactFlowInstance = useStoreApi();
  const { isPending, onSaveOrchestration } = useSaveOrchestration();
  const { mode, setMode, selectedDatasetId, jobId } = useFlowStore(useShallow(selector));
  const isSubflow = useSubflowContext();
  const { onCancelOrchestration, loading } = useConfigRun();

  const { cancelWithConfirmCheck, cancelDialogIsOpen, handleCloseCancelDialog, handleConfirmCancel } = useCancelWithConfirmCheck(loading);

  const connection = useSignalRContext();
  const canRun = connection?.state === "Connected";

  const handleCancelAll = useCallback(() => {
    reactFlowInstance.getState().resetSelectedElements();
    cancelWithConfirmCheck(() => onCancelOrchestration());
  }, [onCancelOrchestration, reactFlowInstance, cancelWithConfirmCheck]);

  const { handleRunPath } = useRunHandlers();

  const { data: datasets } = useGetDatasets();
  const { fileId = "" } = useParams();
  const [resolvedId, isLive] = useParentFileId(fileId);
  const { data: latestSample } = useGetLatestSample(fileId, jobId);
  const { data: configurationDatasetMapping } = useGetConfigurationDatasetMappingById(fileId);

  const isMainBranch = resolvedId === fileId;
  const connectedDataset = datasets?.find((dataset) => dataset.activeVersionId === selectedDatasetId);
  const canEvaluate = connectedDataset?.id && configurationDatasetMapping?.id && (!isLive || !isMainBranch);

  return (
    <div className="flex flex-col bg-muted/40  gap-2 rounded-lg ">
      {/* Added CancelConfirmationDialog */}
      <CancelConfirmationDialog isOpen={cancelDialogIsOpen} onClose={handleCloseCancelDialog} onConfirm={handleConfirmCancel} />
      <div className="flex items-center justify-between p-4">
        {loading ? (
          <Button variant="secondary" className={cn("flex items-center justify-center gap-2 px-3 h-full py-0 ")} disabled={!canRun} asChild>
            <div>
              <div className={cn("flex items-center justify-center px-3  gap-2 h-full border-r border-r-border")}>
                <p className="leading-6 font-normal text-foreground text-sm">Running</p>
                <LoaderIcon className=" animate-spinSlow text-foreground " />
              </div>
              <div className="px-1 cursor-pointer" role="button" aria-label="Stop process" onClick={handleCancelAll}>
                <StopIcon size={16} weight="fill" />
              </div>
            </div>
          </Button>
        ) : (
          <>
            <Tabs value={mode} onValueChange={(value) => setMode(value as "run" | "build")}>
              <TabsList className="bg-background h-10">
                <TabsTrigger value="build" className="data-[state=active]:bg-sidebar ">
                  Build
                </TabsTrigger>
                <TabsTrigger value="run" className="data-[state=active]:bg-sidebar ">
                  Run
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </>
        )}
        <div className="flex justify-end  h-full  items-center gap-4">
          {isSubflow && (
            <Button variant="secondary" className="gap-1 py-2 px-3 h-full" loading={isPending} onClick={() => onSaveOrchestration()}>
              <span className="px-1 font-medium leading-6 min-h-4">Save</span>
            </Button>
          )}
          <EvaluationRunButton disabled={!canEvaluate} />
        </div>
      </div>
      {mode === "run" && (
        <div className="flex flex-col items-center border-t border-sidebar-border p-4 gap-2">
          {latestSample ? (
            <RunSummaryMessage sample={latestSample}>
              <RunInfoHeader startTime={latestSample.startTime} />
              <FlowPath />
            </RunSummaryMessage>
          ) : (
            <span className="text-xs text-muted-foreground  justify-center flex leading-5">
              There is no available run to show. Execute new run to see execution data
            </span>
          )}
          <Button
            className={cn("items-center justify-center gap-2 px-2 flex-shrink-0 py-1.5 h-9", {
              "self-end": !!latestSample,
            })}
            disabled={!canRun}
            onClick={() => handleRunPath()}
          >
            {`Run new ${latestSample ? "" : "sample"}`}
            <PlusIcon size={16} weight="regular" className="text-black" />
          </Button>
        </div>
      )}
    </div>
  );
}
