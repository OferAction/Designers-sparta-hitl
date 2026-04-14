import { StoreApi } from "zustand";

import { FlowStoreState } from "@/store";

export type NodeStatus = "idle" | "running" | "success" | "error";

export type NodeError = {
  details?: string;
  timestamp?: string;
};

export type NodeFullStatus = {
  status: NodeStatus;
  error?: NodeError;
  executionTime?: number;
};

export type DatasetMapping = {
  mappingId: string;
  datasetVersionId: string;
  createdTime: string;
};

export type RunDatasetSelection = {
  datasetId: string | null;
  datasetIndex: number | null;
  rowIndex: number | null;
  mappingId: string | null;
  subsetId: string | null;
};

export type RunState = {
  isInitialized: boolean;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  verdict: string;
  setVerdict: (verdict: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  selected: string;
  setSelected: (selected: string) => void;
  jobId: string;
  setJobId: (jobId: string) => void;
  runDatasetSelection: RunDatasetSelection;
  setRunDatasetSelection: (selection: Partial<RunDatasetSelection>) => void;
  // Iterator context state (multi-level iteration support)
  iteratorSelections: number[]; // 1-based selected iteration per level (outer -> inner)
  setIteratorSelections: (selections: number[]) => void;
  setIteratorSelectionAtLevel: (level: number, value: number, max: number) => void;
  resetIteratorSelections: () => void;
  // Panel layout persistence
  panelLayoutRoot: [number, number];
  panelLayoutLogs: [number, number];
  panelLayoutHorizontal: number[];
  setPanelLayoutRoot: (layout: number[]) => void;
  setPanelLayoutLogs: (layout: number[]) => void;
  setPanelLayoutHorizontal: (layout: number[]) => void;
  ensurePanelHorizontalCount: (count: number, fallback?: number) => void;
  // Deprecated: kept for backwards compatibility

  getCurrentConfig: () => object;
  setOrchestrationConfig: (config: any) => void;
  datasetMapping?: DatasetMapping;
  setDatasetMapping: (datasetMapping: DatasetMapping) => void;
  configDescription: string;
  updateConfigDescription: (description: string) => void;
};

export const createRunSlice = (set: StoreApi<FlowStoreState>["setState"], get: StoreApi<FlowStoreState>["getState"]): RunState => ({
  isInitialized: false,
  loading: false,
  setLoading: (loading: boolean) => set(() => ({ loading })),
  verdict: "",
  setVerdict: (verdict: string) => set(() => ({ verdict })),
  isModalOpen: false,
  setIsModalOpen: (isModalOpen) => set(() => ({ isModalOpen })),
  selected: "playground",
  setSelected: (selected: string) => set(() => ({ selected })),
  jobId: "",
  setJobId: (jobId: string) => {
    const prev = get().jobId;
    if (jobId && jobId !== prev) {
      set(() => ({ iteratorSelections: [] }));
    }
    set(() => ({ jobId }));
  },
  runDatasetSelection: {
    datasetId: null,
    datasetIndex: null,
    rowIndex: null,
    mappingId: null,
    subsetId: null,
  },
  setRunDatasetSelection: (selection: Partial<RunDatasetSelection>) => {
    const currentSelection = get().runDatasetSelection;
    const newSelection = { ...currentSelection, ...selection };
    set(() => ({
      runDatasetSelection: newSelection,
    }));
  },

  // Multi-level iterator support
  iteratorSelections: [],
  setIteratorSelections: (selections: number[]) => {
    set(() => ({ iteratorSelections: selections }));
  },
  setIteratorSelectionAtLevel: (level: number, value: number, max: number) => {
    const { iteratorSelections } = get();
    const next = [...iteratorSelections];
    const clamped = Math.max(1, Math.min(value, max));
    next[level] = clamped;
    set(() => ({ iteratorSelections: next }));
  },
  resetIteratorSelections: () => {
    set(() => ({ iteratorSelections: [] }));
  },

  // Panel layout persistence defaults
  panelLayoutRoot: [50, 50],
  panelLayoutLogs: [85, 50],
  panelLayoutHorizontal: [],
  setPanelLayoutRoot: (layout: number[]) => {
    if (layout.length === 2) set({ panelLayoutRoot: [layout[0], layout[1]] });
  },
  setPanelLayoutLogs: (layout: number[]) => {
    if (layout.length === 2) set({ panelLayoutLogs: [layout[0], layout[1]] });
  },
  setPanelLayoutHorizontal: (layout: number[]) => set({ panelLayoutHorizontal: layout }),
  ensurePanelHorizontalCount: (count: number, fallback = 100 / Math.max(1, count)) => {
    const current = get().panelLayoutHorizontal;
    if (current.length === count && current.length > 0) return;
    const equal = Array.from({ length: count }, () => fallback);
    set({ panelLayoutHorizontal: equal });
  },

  datasetMapping: undefined,
  setDatasetMapping: (datasetMapping: DatasetMapping) => set(() => ({ datasetMapping })),

  configDescription: "",
  updateConfigDescription: (description: string) => set(() => ({ configDescription: description })),

  getCurrentConfig: () => {
    const { nodes, edges, selected, datasetMapping, configDescription } = get();
    return {
      project_name: selected,
      config: {
        name: "Sample Config",
        version: "1.0",
        description: configDescription,
        parameters: {
          nodes: nodes,
          edges: edges,
        },
        ...(datasetMapping && { datasetMapping }),
      },
    };
  },

  setOrchestrationConfig: (config: any) => {
    const { setEdges, setNodes, setDatasetMapping, syncNodeLabels, isInitialized } = get();
    if (isInitialized) {
      return;
    }
    if (config.datasetMapping) {
      setDatasetMapping(config.datasetMapping);
      set({ selectedDatasetId: config.datasetMapping.datasetVersionId });
    }
    if (config.description) {
      set({ configDescription: config.description });
    }

    setEdges(config.parameters?.edges || [], true);
    setNodes(config.parameters?.nodes || [], true);

    syncNodeLabels();

    set(() => ({ isInitialized: true }));
  },
});
