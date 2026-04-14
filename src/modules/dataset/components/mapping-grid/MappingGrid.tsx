import { useMemo, useEffect, useCallback } from "react";

import { isAxiosError } from "axios";
import { useParams } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";

import { mappingOutputStillExists, validateMappingMetrics, buildOutputsDatasetMapping, buildInputsList } from "./mappingHelpers";
import { MappingTable, StartNodeSection } from "./mappingtable";
import { transformNodesToTreeData } from "./utils";
import WorkflowReliabilityVariables from "./WorkflowReliabilityVariables";
import { usePostDatasetMapping, useGetConfigurationDatasetMappingById, useGetDatasetInfo } from "../../services";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";
import { useSelectedDataset } from "@/modules/dataset/hooks";
import { useDatasetMapping } from "@/modules/dataset/hooks";
import { DatasetMappingRequest } from "@/modules/dataset/types/dataset";
import { Node as FlowNode } from "@/modules/flow/types";
import { useGetConfigurationByFileId } from "@/services";
import { useFlowStore } from "@/store";

const MappingGrid = () => {
  const { toast } = useToast();

  const flaggedNodesOutputsFrontend = useFlowStore((state) => state.flaggedNodesOutputsFrontend);

  const { configId: configurationId, fileId = "" } = useParams();

  const postDatasetMapping = usePostDatasetMapping(fileId);

  const { selectedDatasetId } = useSelectedDataset();
  const { data: datasetInfo } = useGetDatasetInfo(selectedDatasetId || "");

  const { data: configData } = useGetConfigurationByFileId(fileId);

  const nodes = useMemo<FlowNode[]>(() => configData?.config?.parameters?.nodes || [], [configData?.config]);

  const { populateMappingsFromApi, getReliabilityOutputs, setFlaggedNodesOutputsFrontend, toggleFlaggedOutput, getAllAlignmentKeyErrors } =
    useDatasetMapping();

  const {
    data,
    isSuccess,
    isLoading: loading,
  } = useGetConfigurationDatasetMappingById(fileId, datasetInfo?.datasetTreeData, datasetInfo?.rawFilesData);

  useEffect(() => {
    if (isSuccess) {
      populateMappingsFromApi(data.mappings, data.inputsDict, data.alignmentKeys);
      if (data.flaggedNodesOutputsFrontend) {
        setFlaggedNodesOutputsFrontend(data.flaggedNodesOutputsFrontend);
      }
    }
  }, [
    data?.alignmentKeys,
    data?.flaggedNodesOutputsFrontend,
    data?.inputsDict,
    data?.mappings,
    isSuccess,
    populateMappingsFromApi,
    setFlaggedNodesOutputsFrontend,
  ]);

  const handleSave = useCallback(async () => {
    if (!selectedDatasetId || !configurationId) {
      return;
    }

    const { mappings, inputsDict, alignmentKeys, flaggedNodesOutputsFrontend } = useFlowStore.getState();

    const allMappings = Object.values(mappings);
    const nodeLookup = new Map(nodes.map((n) => [n.id, n]));

    // Filter to only valid mappings (outputs that still exist)
    const allValidMappings = allMappings.filter((m) => mappingOutputStillExists(m, nodeLookup));

    // Validate metrics are present for all mapped outputs
    const metricsOffenders = validateMappingMetrics(allValidMappings, nodeLookup);
    if (metricsOffenders.length > 0) {
      const preview = metricsOffenders.slice(0, 3).map((o) => o.label);
      toast({
        title: "Metrics required",
        description: `${metricsOffenders.length} mapped output${metricsOffenders.length > 1 ? "s" : ""} missing metrics (${preview.join(", ")}${metricsOffenders.length > 3 ? ", …" : ""}). Add at least one metric before saving.`,
        variant: "destructive",
      });
      return;
    }

    const aggregatedAlignmentKeyErrors = getAllAlignmentKeyErrors();
    if (aggregatedAlignmentKeyErrors.length > 0) {
      toast({
        title: "Alignment key error",
        description: aggregatedAlignmentKeyErrors.join("\n"),
        variant: "destructive",
      });
      return;
    }

    // Build request payload
    const startNodeIds = new Set(nodes.filter((n) => n.data.name === "start").map((n) => n.id));
    const startNodeMappings = allValidMappings.filter((m) => startNodeIds.has(m.nodeId));

    const outputsDatasetMapping = buildOutputsDatasetMapping(allValidMappings, startNodeIds, nodeLookup);

    const inputsList = buildInputsList(inputsDict, startNodeMappings, nodeLookup);

    const mappingRequest: DatasetMappingRequest = {
      fileId,
      datasetVersionId: selectedDatasetId,
      outputsDatasetMapping,
      inputsList,
      alignmentKeys,
      flaggedNodesOutputsFrontend,
    };

    try {
      await postDatasetMapping.mutateAsync(mappingRequest);
      toast({
        title: "Success",
        description: "Dataset mapping saved successfully",
      });
    } catch (error) {
      console.error("Failed to save dataset mapping:", error);
      let message = "Something went wrong while saving. Please try again.";
      if (error instanceof Error) {
        message = error.message;
      }
      if (isAxiosError(error) && error.response?.data?.message) {
        message = error.response?.data?.message;
      }
      toast({ title: "Save failed", description: message, variant: "destructive" });
      return;
    }
  }, [selectedDatasetId, configurationId, nodes, getAllAlignmentKeyErrors, fileId, toast, postDatasetMapping]);

  const { nodes: treeAndFooterNodes, footer: startFooterRow } = useMemo(() => {
    return transformNodesToTreeData(nodes);
  }, [nodes]);

  const outputs = useMemo(() => {
    return getReliabilityOutputs(nodes);
  }, [getReliabilityOutputs, nodes]);

  const totalOutputs = nodes.reduce((count, node) => {
    if (node.hidden) return count;
    return count + (node.data.outputs?.length || 0);
  }, 0);

  const isLoading = !isSuccess && loading;
  const isEmpty = treeAndFooterNodes.length === 0 && !isLoading;

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <div className="border-b bg-sidebar/30 px-4 sm:px-6 py-3 border-muted flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-sm font-semibold text-foreground">Match to orchestration</h1>
            <div className="text-xs text-muted-foreground">
              <span>
                {treeAndFooterNodes.length} nodes, {totalOutputs} variables
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="secondary"
              onClick={handleSave}
              disabled={postDatasetMapping.isPending || !selectedDatasetId}
              className="text-xs sm:text-sm"
            >
              {postDatasetMapping.isPending ? "Saving..." : "Save Mapping"}
            </Button>
          </div>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
        <ResizablePanel minSize={40} defaultSize={70} className="relative flex flex-col overflow-hidden h-full min-h-0">
          <div className="flex-1 relative overflow-auto">
            <div className="w-full relative flex flex-col overflow-auto h-full scrollbar-none">
              <div className="min-w-[800px]">
                <MappingTable treeData={treeAndFooterNodes} isLoading={isLoading} isEmpty={isEmpty} />
              </div>
              {startFooterRow && (
                <div className="min-w-[800px] mt-auto sticky bottom-0 z-20">
                  <StartNodeSection node={startFooterRow} />
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle className="bg-border/50 w-px hover:bg-foreground z-50 data-[resize-handle-state=drag]:bg-muted-foreground" />
        <ResizablePanel minSize={18} defaultSize={25} maxSize={32} className="bg-background flex flex-col overflow-hidden relative z-50 min-h-0">
          <div className="w-full flex-1 overflow-auto">
            <WorkflowReliabilityVariables
              outputs={outputs}
              flagged={flaggedNodesOutputsFrontend}
              onToggle={toggleFlaggedOutput}
              className="flex h-full flex-col"
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default MappingGrid;
