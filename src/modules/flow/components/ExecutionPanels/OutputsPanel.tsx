import { useMemo } from "react";

import { useShallow } from "zustand/shallow";

import { useIterationPathForNode } from "@/modules/flow/hooks/useIteratorPath";

import { ExecutionDataPanel } from "./ExecutionDataPanel";
import { NodeResultType } from "./types";
import { useDownloadRawFiles, useGetNodeResult } from "@/modules/flow/services";
import { FlowStoreState, useFlowStore } from "@/store";

const selector = (state: FlowStoreState) => ({
  selectedNodeId: state.selectedNodeId,
  jobId: state.jobId,
  nodes: state.nodes,
});

export function OutputsPanel() {
  const { selectedNodeId, jobId, nodes } = useFlowStore(useShallow(selector));

  const endNode = useMemo(() => nodes.find((node) => node.data.type === "end"), [nodes]);
  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId), [nodes, selectedNodeId]);

  const endNodeId = selectedNodeId || endNode?.id;

  const iteration = useIterationPathForNode(endNodeId || undefined);
  const retryForOutputs = true;
  const { data: endNodeOutputs, isStale } = useGetNodeResult(jobId, endNodeId || "", iteration, retryForOutputs);

  const nodeIdToLabelMap = useMemo(() => new Map(nodes.map((node) => [node.id, node.data.label || node.id])), [nodes]);

  const replaceNodeIdsWithLabels = useMemo(() => {
    const replaceInValue = (value: Record<string, any>): any => {
      if (value === null || value === undefined) {
        return value;
      }

      if (typeof value === "string") {
        return nodeIdToLabelMap.get(value) ?? value;
      }

      if (Array.isArray(value)) {
        return value.map(replaceInValue);
      }

      if (typeof value === "object") {
        return Object.entries(value).reduce(
          (acc, [key, val]) => {
            const transformedKey = nodeIdToLabelMap.get(key) ?? key;
            acc[transformedKey] = replaceInValue(val);
            return acc;
          },
          {} as Record<string, any>
        );
      }

      return value;
    };

    return replaceInValue;
  }, [nodeIdToLabelMap]);

  const transformedOutput = useMemo(() => {
    return endNodeOutputs?.output && replaceNodeIdsWithLabels(endNodeOutputs.output);
  }, [endNodeOutputs?.output, replaceNodeIdsWithLabels]);

  const downloadHook = useDownloadRawFiles(jobId || "", endNodeId || "");

  const handleDownload = (fileKey: string) => {
    downloadHook.download(fileKey, NodeResultType.OUTPUT);
  };

  return (
    <ExecutionDataPanel
      title="Outputs"
      data={transformedOutput}
      nodeLabel={selectedNodeId ? selectedNode?.data.label : endNode?.data.label}
      nodeType={selectedNodeId ? selectedNode?.data.type : "end"}
      emptyMessage="No outputs available"
      iterationPath={iteration}
      fileKeys={endNodeOutputs?.outputFileKeys}
      showFilesDropdown={Boolean(endNodeOutputs?.outputFileKeys.length)}
      onFileSelect={handleDownload}
      isError={isStale}
    />
  );
}
