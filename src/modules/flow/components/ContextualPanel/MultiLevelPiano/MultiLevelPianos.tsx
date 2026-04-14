import { useShallow } from "zustand/shallow";

import { RenderPianoLevel } from "./RenderPianoLevel";
import { FlowStoreState, useFlowStore } from "@/store";

const selector = (s: FlowStoreState) => ({
  mode: s.mode,
  jobId: s.jobId,
  selectedNodeId: s.selectedNodeId,
});

export function MultiLevelPianos() {
  const { mode, selectedNodeId } = useFlowStore(useShallow(selector));

  if (mode !== "run" || !selectedNodeId) return null;

  return <RenderPianoLevel />;
}
