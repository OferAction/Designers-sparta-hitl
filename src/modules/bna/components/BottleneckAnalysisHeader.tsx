import React, { useCallback, useMemo, useState } from "react";

import { BookmarkSimpleIcon, DatabaseIcon, ArrowUpRightIcon as ArrowUpRight } from "@phosphor-icons/react";
import { useParams } from "react-router-dom";
import { useShallow } from "zustand/shallow";

import { SubsetIcon } from "@/lib/icons";
import { Loader } from "@/components/common/Loader";
import { PianoIndicator } from "@/components/common/Piano";
import { PianoSection } from "@/components/common/Piano/PianoSection";
import WithTooltip from "@/components/common/WithTooltip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { NodeResultSubsetDto, useSubsetFilter, useSaveSubset } from "@/modules/bna/services";
import RunSummaryMessage from "@/modules/flow/components/ContextualPanel/RightPanelAction/RunSummaryMessage";
import { useGetSample } from "@/modules/flow/services";
import { FlowStoreState, useFlowStore } from "@/store";

const selector = (state: FlowStoreState) => ({
  jobId: state.jobId,
  selectedNodeId: state.selectedNodeId,
});

const convertTypeToIndicatorType = (type: NodeResultSubsetDto["type"] | undefined): PianoIndicator["type"] => {
  switch (type) {
    case "GtDiff":
    case "Flags":
      return "flag";
    case "SystemExEx":
    case "AgentExEx":
      return "error";
    default:
      return "default";
  }
};

const HideIfFalsy: React.FC<React.PropsWithChildren<{ data: unknown }>> = ({ children, data }) => {
  if (!data) return null;
  return <>{children}</>;
};

export function BottleneckAnalysisHeader() {
  const { jobId, selectedNodeId } = useFlowStore(useShallow(selector));
  const { data: subsetData, isLoading, refetch } = useSubsetFilter();
  const [selectedIndex, setSelectedIndex] = useState(1);
  const { data: sampleData, isLoading: sampleDataIsLoading } = useGetSample(jobId);
  const { mutate: saveSubset, mutateAsync: saveSubsetAsync, params, mutation } = useSaveSubset();

  const { fileId, folderId, configId } = useParams();

  const openEditWindow = useCallback(
    (subsetId: string) => {
      window.open(
        `/canvas/${folderId}/${fileId}/${configId}?subsetId=${subsetId}&subsetIndex=${selectedIndex}&selectedNodeId=${selectedNodeId}`,
        "_blank"
      );
    },
    [selectedIndex, selectedNodeId, folderId, fileId, configId]
  );

  const handleEdit = useCallback(async () => {
    if (subsetData?.subsetId) {
      openEditWindow(subsetData.subsetId);
      return;
    }

    await saveSubsetAsync(params);

    const { data } = await refetch();
    if (data?.subsetId) {
      openEditWindow(data.subsetId);
    }
  }, [subsetData?.subsetId, openEditWindow, saveSubsetAsync, params, refetch]);

  const indicators: PianoIndicator[] = useMemo(
    () =>
      subsetData?.nodeResultSubsetDtos
        ?.map((dto, index) => ({
          index: index + 1,
          type: convertTypeToIndicatorType(dto.type),
        }))
        .filter((dto) => dto.type && dto.type !== "default") || [],
    [subsetData]
  );

  if (isLoading) {
    return <Skeleton className="h-16 w-full" />;
  }

  const totalResults = subsetData?.nodeResultSubsetDtos?.length || 0;

  const handleIterationChange = (newIndex: number) => {
    setSelectedIndex(newIndex);
    const selected = subsetData?.nodeResultSubsetDtos?.[newIndex - 1];
    useFlowStore.getState().setJobId(selected?.jobId || "");
  };

  return (
    <div className="flex flex-col bg-muted/40 rounded-lg">
      <div className="px-4 py-3">
        <HideIfFalsy data={subsetData?.datasetName}>
          <div className="flex gap-1 text-muted-foreground items-center text-xs leading-5">
            <DatabaseIcon weight="fill" className="size-4" />
            <span>{subsetData?.datasetName}</span>
          </div>
        </HideIfFalsy>

        <HideIfFalsy data={subsetData?.subsetName}>
          <div className="text-sm flex gap-1 items-center">
            <SubsetIcon className="size-4" />
            <h1 className="truncate w-[65%]">{subsetData?.subsetName || "Subset Analysis"}</h1>
          </div>
        </HideIfFalsy>

        <HideIfFalsy data={subsetData?.datasetId}>
          <div className="top-6 right-6 absolute flex items-center gap-2">
            <WithTooltip
              side="left"
              tooltip={
                mutation?.status === "success" || subsetData?.hasSubset
                  ? "Subset is saved"
                  : mutation?.status === "pending"
                    ? "Saving subset..."
                    : "Save this subset"
              }
            >
              {mutation?.status === "pending" ? (
                <div className="p-3 rounded-lg bg-secondary flex items-center justify-center">
                  <Loader />
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (mutation?.status !== "success" && !subsetData?.hasSubset) saveSubset(params);
                  }}
                  disabled={mutation?.status === "success" || subsetData?.hasSubset}
                  aria-disabled={mutation?.status === "success" || subsetData?.hasSubset}
                  className={cn(
                    "p-3 rounded-lg",
                    mutation?.status === "success" || subsetData?.hasSubset ? "cursor-default" : "bg-secondary hover:bg-general-hover-secondary"
                  )}
                >
                  <BookmarkSimpleIcon size={16} weight={mutation?.status === "success" || subsetData?.hasSubset ? "fill" : "regular"} />
                </button>
              )}
            </WithTooltip>
            {totalResults > 0 && (
              <Button
                variant="default"
                size="default"
                className="group/edit-button"
                onClick={handleEdit}
                loading={mutation?.status === "pending"}
                disabled={mutation?.status === "pending"}
              >
                <span>Edit</span>
                {mutation?.status !== "pending" && <ArrowUpRight size={16} className="hidden group-hover/edit-button:block" />}
              </Button>
            )}
          </div>
        </HideIfFalsy>
      </div>
      {totalResults > 0 && (
        <PianoSection
          indicators={indicators}
          totalIterations={totalResults}
          iteration={selectedIndex}
          onIterationChange={handleIterationChange}
          headerText="Sample to preview"
          className="bg-transparent border-0"
        />
      )}
      <div className="flex flex-col items-center border-sidebar-border px-4 gap-2">
        <HideIfFalsy data={subsetData?.nodeResultSubsetDtos?.[selectedIndex]?.sampleIndex}>
          <div className="flex justify-end items-center w-full gap-3 text-muted-foreground">
            <DatabaseIcon weight="fill" className="size-4" />
            <p className="text-xs">Sample {subsetData?.nodeResultSubsetDtos[selectedIndex]?.sampleIndex}</p>
          </div>
        </HideIfFalsy>
        {sampleDataIsLoading ? <Skeleton className="h-[62px] my-2 w-full" /> : sampleData && <RunSummaryMessage sample={sampleData} />}
      </div>
    </div>
  );
}
