import { StateCreator } from "zustand";

import { NodeMapping } from "@/modules/dataset/types/dataset";
import { MetricType } from "@/modules/dataset/types/metrics";
import type { PreprocessingFunctionWithParams } from "@/modules/dataset/types/preprocessing";
import { FlowStoreState } from "@/store";

export interface ReliabilityOutput {
  nodeId: string;
  outputId: string;
  key: string;
  label?: string;
  type?: string;
}

export interface DatasetMappingState {
  mappings: Record<string, NodeMapping>;
  inputsDict: Record<string, string>;
  alignmentKeys: Array<{ nodeId: string; outputId: string }>;
  alignmentKeyErrorMap: Record<string, string[]>;
  flaggedNodesOutputsFrontend: string[];
  selectedDatasetId: string | null;
  setMapping: (nodeId: string, outputId: string, dataItem: NodeMapping["dataItem"], jsonPath: string) => void;
  removeMapping: (nodeId: string, outputId: string) => void;
  setMetrics: (nodeId: string, outputId: string, metrics: MetricType[]) => void;
  setMetricParams: (
    nodeId: string,
    outputId: string,
    params: Partial<{ accuracyMargin: number; positives: string[]; classes: string[]; labels: string[] }>
  ) => void;
  setPreprocessingFunctions: (nodeId: string, outputId: string, functions: PreprocessingFunctionWithParams[]) => void;
  removePreprocessingFunction: (nodeId: string, outputId: string, functionId: string) => void;
  setInputDict: (nodeId: string, outputId: string, jsonPath: string) => void;
  removeInputDict: (nodeId: string, outputId: string) => void;
  setAlignmentKey: (nodeId: string, outputId: string) => void;
  removeAlignmentKey: (nodeId: string) => void;
  // Alignment key errors aggregation
  setAlignmentKeyErrorsForNode: (nodeId: string, messages: string[]) => void;
  clearAlignmentKeyErrorsForNode: (nodeId: string) => void;
  setFlaggedNodesOutputsFrontend: (flagged: string[]) => void;
  toggleFlaggedOutput: (refKey: string) => void;
  setSelectedDatasetId: (id: string | null) => void;
  clearAll: () => void;
  populateMappingsFromApi: (
    mappings: Record<string, NodeMapping>,
    inputsDict: Record<string, string>,
    alignmentKeys: { nodeId: string; outputId: string }[]
  ) => void;
}

export const createDatasetMappingSlice: StateCreator<FlowStoreState, [], [], DatasetMappingState> = (set) => ({
  mappings: {},
  inputsDict: {},
  alignmentKeys: [],
  alignmentKeyErrorMap: {},
  flaggedNodesOutputsFrontend: [],
  selectedDatasetId: null,

  setMapping: (nodeId, outputId, dataItem, jsonPath) => {
    const key = `${nodeId}-${outputId}`;
    const refKey = `${nodeId}.${outputId}`;
    set((state) => {
      // Automatically add to flagged outputs if not already present
      const flaggedSet = new Set(state.flaggedNodesOutputsFrontend || []);
      if (!flaggedSet.has(refKey)) {
        flaggedSet.add(refKey);
      }

      return {
        mappings: {
          ...state.mappings,
          [key]: {
            nodeId,
            outputId,
            dataItem,
            jsonPath,
            metrics: state.mappings[key]?.metrics || [],
            metricParams: state.mappings[key]?.metricParams || {},
          },
        },
        flaggedNodesOutputsFrontend: Array.from(flaggedSet),
      };
    });
  },

  removeMapping: (nodeId, outputId) => {
    const key = `${nodeId}-${outputId}`;
    const refKey = `${nodeId}.${outputId}`;
    set((state) => {
      const { [key]: _, ...newMappings } = { ...state.mappings };

      // Automatically remove from flagged outputs
      const flaggedSet = new Set(state.flaggedNodesOutputsFrontend || []);
      flaggedSet.delete(refKey);

      return {
        mappings: newMappings,
        flaggedNodesOutputsFrontend: Array.from(flaggedSet),
      };
    });
  },

  setMetrics: (nodeId, outputId, metrics) => {
    const key = `${nodeId}-${outputId}`;
    set((state) => {
      const existing = state.mappings[key];

      const existingMetricsSorted = existing?.metrics ? [...existing.metrics].sort() : [];
      const newMetricsSorted = [...metrics].sort();

      if (JSON.stringify(existingMetricsSorted) === JSON.stringify(newMetricsSorted)) {
        return state;
      }

      return {
        mappings: {
          ...state.mappings,
          [key]: {
            ...existing,
            nodeId,
            outputId,
            dataItem: existing?.dataItem || { name: "", type: "", sample: "" },
            jsonPath: existing?.jsonPath || "",
            metrics,
            metricParams: existing?.metricParams || {},
          },
        },
      };
    });
  },

  setMetricParams: (nodeId, outputId, params) => {
    const key = `${nodeId}-${outputId}`;
    set((state) => {
      const existing = state.mappings[key];
      return {
        mappings: {
          ...state.mappings,
          [key]: {
            ...existing,
            nodeId,
            outputId,
            dataItem: existing?.dataItem || { name: "", type: "", sample: "" },
            jsonPath: existing?.jsonPath || "",
            metrics: existing?.metrics || [],
            metricParams: {
              ...(existing?.metricParams || {}),
              ...params,
            },
          },
        },
      };
    });
  },

  setPreprocessingFunctions: (nodeId, outputId, functions) => {
    const key = `${nodeId}-${outputId}`;
    set((state) => {
      const existing = state.mappings[key];
      return {
        mappings: {
          ...state.mappings,
          [key]: {
            ...existing,
            nodeId,
            outputId,
            dataItem: existing?.dataItem || { name: "", type: "", sample: "" },
            jsonPath: existing?.jsonPath || "",
            metrics: existing?.metrics || [],
            metricParams: existing?.metricParams || {},
            preprocessingFunctions: functions,
          },
        },
      };
    });
  },

  removePreprocessingFunction: (nodeId, outputId, functionId) => {
    const key = `${nodeId}-${outputId}`;
    set((state) => {
      const existing = state.mappings[key];
      if (!existing?.preprocessingFunctions) {
        return state;
      }

      const updatedFunctions = existing.preprocessingFunctions.filter((fn) => fn.functionId !== functionId);

      return {
        mappings: {
          ...state.mappings,
          [key]: {
            ...existing,
            preprocessingFunctions: updatedFunctions.length > 0 ? updatedFunctions : undefined,
          },
        },
      };
    });
  },

  setInputDict: (nodeId, outputId, jsonPath) => {
    const key = `${nodeId}.${outputId}`;
    set((state) => ({
      inputsDict: {
        ...state.inputsDict,
        [key]: jsonPath,
      },
    }));
  },

  removeInputDict: (nodeId, outputId) => {
    const key = `${nodeId}.${outputId}`;
    set((state) => {
      const newInputsDict = { ...state.inputsDict };
      delete newInputsDict[key];
      return { inputsDict: newInputsDict };
    });
  },

  setAlignmentKey: (nodeId, outputId) => {
    set((state) => {
      // Remove any existing alignment key for this node
      const filteredKeys = state.alignmentKeys.filter((key) => key.nodeId !== nodeId);
      // Add the new alignment key
      return {
        alignmentKeys: [...filteredKeys, { nodeId, outputId }],
      };
    });
  },

  removeAlignmentKey: (nodeId) => {
    set((state) => ({
      alignmentKeys: state.alignmentKeys.filter((key) => key.nodeId !== nodeId),
    }));
  },

  setAlignmentKeyErrorsForNode: (nodeId, messages) => {
    set((state) => {
      const next = { ...state.alignmentKeyErrorMap };
      if (messages && messages.length > 0) {
        next[nodeId] = messages;
      } else {
        delete next[nodeId];
      }
      return { alignmentKeyErrorMap: next };
    });
  },

  clearAlignmentKeyErrorsForNode: (nodeId) => {
    set((state) => {
      const { [nodeId]: _, ...newAlignmentKeyErrorMap } = state.alignmentKeyErrorMap;
      return { alignmentKeyErrorMap: newAlignmentKeyErrorMap };
    });
  },

  setSelectedDatasetId: (id) => {
    set({ selectedDatasetId: id });
  },

  setFlaggedNodesOutputsFrontend: (flagged) => {
    set({ flaggedNodesOutputsFrontend: flagged });
  },

  toggleFlaggedOutput: (refKey) => {
    set((state) => {
      const current = state.flaggedNodesOutputsFrontend || [];
      const isPresent = current.includes(refKey);
      return {
        flaggedNodesOutputsFrontend: isPresent ? current.filter((k) => k !== refKey) : [...current, refKey],
      };
    });
  },

  clearAll: () => {
    set({ mappings: {}, inputsDict: {}, alignmentKeys: [], flaggedNodesOutputsFrontend: [] });
  },

  populateMappingsFromApi: (newMappings = {}, inputsDict = {}, alignmentKeys = []) => {
    set({
      mappings: newMappings,
      inputsDict: inputsDict,
      alignmentKeys: alignmentKeys,
    });
  },
});
