import { useEffect, useMemo } from "react";

import { useShallow } from "zustand/shallow";

import { useStableCallback } from "@/hooks/useStableCallback";
import { useIterationPathForNode } from "@/modules/flow/hooks/useIteratorPath";

import { ExecutionDataPanel } from "@/modules/flow/components/ExecutionPanels/ExecutionDataPanel";
import { ExecutionPanelHandle, PanelWrapper } from "@/modules/flow/components/ExecutionPanels/ExecutionPanelsContainer";
import { NodeResultType } from "@/modules/flow/components/ExecutionPanels/types";
import { useDownloadRawFiles, useGetNodeResult } from "@/modules/flow/services";
import { FlowStoreState, useFlowStore } from "@/store";

interface GroundTruthPanelWrapperProps {
  shouldShowRulesPanel: boolean;
  defaultPanelSize: number;
  onGroundTruth?: (hasData: boolean) => void;
}

const selector = (state: FlowStoreState) => ({
  selectedNodeId: state.selectedNodeId,
  jobId: state.jobId,
  nodes: state.nodes,
});

export function GroundTruthPanel({ shouldShowRulesPanel, defaultPanelSize, onGroundTruth }: GroundTruthPanelWrapperProps) {
  const { selectedNodeId, jobId, nodes } = useFlowStore(useShallow(selector));

  const endNode = useMemo(() => nodes.find((node) => node.data.type === "end"), [nodes]);

  const endNodeId = selectedNodeId || endNode?.id;

  const iteration = useIterationPathForNode(endNodeId || undefined);
  const { data } = useGetNodeResult(jobId, endNodeId || "", iteration);

  const hasGroundTruth = !!(data?.groundTruth && Object.keys(data.groundTruth).length > 0);
  const downloadHook = useDownloadRawFiles(jobId || "", endNodeId || "");

  const handleDownload = (fileKey: string) => {
    downloadHook.download(fileKey, NodeResultType.GTDIFF);
  };

  const stableOnGroundTruth = useStableCallback(onGroundTruth);
  useEffect(() => {
    stableOnGroundTruth(hasGroundTruth);
  }, [hasGroundTruth, stableOnGroundTruth]);

  if (!hasGroundTruth) {
    return null;
  }

  return (
    <>
      <ExecutionPanelHandle />
      <PanelWrapper index={shouldShowRulesPanel ? 3 : 2} defaultSize={defaultPanelSize}>
        <ExecutionDataPanel
          title="Ground truth labels"
          data={data?.groundTruth}
          emptyMessage="No ground truth data available"
          iterationPath={iteration}
          onFileSelect={handleDownload}
          nodeLabel="test_labels.JSONL V2"
          showFilesDropdown={false}
        />
      </PanelWrapper>
    </>
  );
}
