import { useEffect, useState, useMemo } from "react";

import { ExecutionPanelsContainer, InputsPanel, OutputsPanel, PanelWrapper, ExecutionPanelHandle } from "./ExecutionPanels";
import { RulesPanel } from "./ExecutionPanels/RulesExecution";
import { GroundTruthPanel } from "@/modules/flow/components/ExecutionPanels/GroundTruthPanel";
import { useFlowStore } from "@/store";
interface ExecutionPanelsManagerProps {
  visible?: boolean;
}

export function ExecutionPanelsManager({ visible = false }: ExecutionPanelsManagerProps) {
  const jobId = useFlowStore((state) => state.jobId);
  const mode = useFlowStore((state) => state.mode);
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
  const nodes = useFlowStore((state) => state.nodes);
  const [hasGroundTruth, setHasGroundTruth] = useState<boolean>(false);
  const [canShowPanels, setCanShowPanels] = useState<boolean>(false);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find((node) => node.id === selectedNodeId);
  }, [selectedNodeId, nodes]);

  useEffect(() => {
    setCanShowPanels(mode === "run");
  }, [mode]);

  // Show panels when job is running, node is selected, and run tab is active
  const shouldShowPanels = canShowPanels && visible && Boolean(jobId);

  const shouldShowRulesPanel = Boolean(selectedNode);

  // Calculate panel sizes based on which panels are visible
  const panelCount = 2 + (hasGroundTruth ? 1 : 0) + (shouldShowRulesPanel ? 1 : 0);
  const defaultPanelSize = 100 / panelCount;

  if (!shouldShowPanels) {
    return null;
  }

  return (
    <ExecutionPanelsContainer count={panelCount}>
      <PanelWrapper index={0} defaultSize={defaultPanelSize}>
        <InputsPanel />
      </PanelWrapper>

      <ExecutionPanelHandle />
      <PanelWrapper index={1} defaultSize={defaultPanelSize}>
        <OutputsPanel />
      </PanelWrapper>

      <ExecutionPanelHandle />
      {shouldShowRulesPanel && (
        <PanelWrapper index={2} defaultSize={defaultPanelSize}>
          <RulesPanel nodeId={selectedNode?.id} nodeLabel={selectedNode?.data.label} />
        </PanelWrapper>
      )}

      <GroundTruthPanel shouldShowRulesPanel={shouldShowRulesPanel} onGroundTruth={setHasGroundTruth} defaultPanelSize={defaultPanelSize} />
    </ExecutionPanelsContainer>
  );
}
