import { useMemo } from "react";

import { useShallow } from "zustand/shallow";

import { useIterationPathForNode } from "@/modules/flow/hooks/useIteratorPath";

import { ExecutionDataPanel } from "./ExecutionDataPanel";
import { NodeResultType } from "./types";
import { useDownloadRawFiles, useGetNodeResult } from "@/modules/flow/services/jobService/jobService";
import { FlowStoreState, useFlowStore } from "@/store";

const selector = (state: FlowStoreState) => ({
  selectedNodeId: state.selectedNodeId,
  jobId: state.jobId,
  nodes: state.nodes,
});

export function InputsPanel() {
  const { selectedNodeId, jobId, nodes } = useFlowStore(useShallow(selector));
  const startNode = useMemo(() => nodes.find((node) => node.data.type === "start"), [nodes]);
  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId), [nodes, selectedNodeId]);

  const startNodeId = selectedNodeId || startNode?.id;

  const iteration = useIterationPathForNode(startNodeId || undefined);
  const { data: startNodeOutputs, isStale } = useGetNodeResult(jobId, startNodeId || "", iteration, true);

  const downloadHook = useDownloadRawFiles(jobId || "", startNodeId || "");

  const handleDownload = (fileKey: string) => {
    downloadHook.download(fileKey, NodeResultType.INPUT);
  };

  return (
    <ExecutionDataPanel
      title="Inputs"
      nodeLabel={selectedNodeId ? selectedNode?.data.label : startNode?.data.label}
      nodeType={selectedNodeId ? selectedNode?.data.type : "start"}
      data={startNodeOutputs?.input}
      emptyMessage="No inputs available"
      iterationPath={iteration}
      fileKeys={startNodeOutputs?.inputFileKeys}
      showFilesDropdown={Boolean(startNodeOutputs?.inputFileKeys.length)}
      onFileSelect={handleDownload}
      isError={isStale}
    />
  );
}
