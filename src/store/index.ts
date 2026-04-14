import { devtools, persist } from "zustand/middleware";
import { createWithEqualityFn as create } from "zustand/traditional";

import {
  createDatasetMappingSlice,
  createFlowSidePanel,
  createGenOneSlice,
  createRunSlice,
  createCollaborativeSlice,
  type DatasetMappingState,
  type FlowSidePanelState,
  type FlowState,
  type GenOneState,
  type RunState,
  type CollaborativeState,
  createFlowSlice,
} from "./slices";

export type FlowStoreState = FlowState & RunState & FlowSidePanelState & DatasetMappingState & GenOneState;

export const useFlowStore = create<FlowStoreState>()(
  devtools(
    persist(
      (set, get, ...rest) => ({
        ...createFlowSlice(set, get),
        ...createRunSlice(set, get),
        ...createFlowSidePanel(set),
        ...createDatasetMappingSlice(set, get, ...rest),
        ...createGenOneSlice(set, get),
      }),
      {
        name: "flow-store-v1",
        partialize: (state) => ({
          panelLayoutRoot: state.panelLayoutRoot,
          panelLayoutLogs: state.panelLayoutLogs,
          panelLayoutHorizontal: state.panelLayoutHorizontal,
        }),
        version: 1,
      }
    ),
    { enabled: import.meta.env.DEV, name: "FlowStore" }
  )
);

export const useCollaborativeStore = create<CollaborativeState>()(
  devtools(
    (set, get, ...rest) => ({
      ...createCollaborativeSlice(set, get, ...rest),
    }),
    { enabled: import.meta.env.DEV, name: "CollaborativeStore" }
  )
);

export * from "./datasetUploadStore";
export * from "./dialogStore";
export * from "./evaluationRunStore";
export * from "./executionStore";
