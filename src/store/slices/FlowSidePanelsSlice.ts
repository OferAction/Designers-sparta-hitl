import merge from "lodash.merge";

export type contextualMenuActiveActionType = "idle" | "versionHistory" | "unsavedChanges" | "tryingToConnect";
// | "success" | "error" | "processing" | "analyzing" | "orchestrating"
export type FlowSidePanelState = {
  leftPanelActiveItem: "NodeTemplates" | "SubflowTemplates" | "ConnectorTemplates" | "Dataset" | "Evaluation" | "systemRules" | null;
  draggedNodeMetadata: {
    nodeType?: string;
    subflowConfigId?: string;
    subflowId?: string;
    data?: Record<string, any>;
  } & Record<string, any>;
  contextualMenuActiveAction: contextualMenuActiveActionType;
  setContextualMenuActiveAction: (action: contextualMenuActiveActionType) => void;
  setLeftPanelActiveItem: (item: string | null) => void;
  setDraggedNodeMetadata: (metadata: Record<string, any>) => void;
  updateDraggedNodeMetadata: (metadata: Record<string, any>) => void;
};

export const createFlowSidePanel = (set: any): FlowSidePanelState => ({
  leftPanelActiveItem: null,
  draggedNodeMetadata: {},
  contextualMenuActiveAction: "idle",
  setLeftPanelActiveItem: (item) => set({ leftPanelActiveItem: item }),
  setDraggedNodeMetadata: (metadata) => set({ draggedNodeMetadata: metadata }),
  updateDraggedNodeMetadata: (metadata) =>
    set((state: FlowSidePanelState) => ({ draggedNodeMetadata: merge({}, state.draggedNodeMetadata, metadata) })),
  setContextualMenuActiveAction: (action) => set({ contextualMenuActiveAction: action }),
});
