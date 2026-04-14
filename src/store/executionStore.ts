import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { useFlowStore } from ".";
import { isNodeEvent } from "@/lib/signalr";
import type { GraphEvent, NodeEvent, NodeResultEvent, RuleEvent } from "@/lib/signalr/types/serverToClient";
import { NodeVariantBorderProps } from "@/modules/flow/components/GeneralNodes/CustomNodeVariants";

// ===== Node Execution Types =====
export interface NodeExecutionState {
  executionResult: "default" | "running" | "success" | "error" | "pruned";
  systemRuleCount: number;
  builtInRuleCount: number;
  executionTime: number | null;
  fromCache: boolean;
}

export interface RuleExecutionState {
  status: "idle" | "running" | "success" | "error";
}

export const defaultNodeState: NodeExecutionState = {
  executionResult: "default",
  systemRuleCount: 0,
  builtInRuleCount: 0,
  executionTime: null,
  fromCache: false,
};

export interface NodeExecutionStore {
  // Map of nodeId to execution state
  nodeStates: Map<string, NodeExecutionState>;

  // Track if execution has started
  isExecutionStarted: boolean;

  // Node Actions
  setNodeExecutionResult: (nodeId: string, result: NodeExecutionState["executionResult"]) => void;
  setNodeMetrics: (nodeId: string, metrics: { systemRuleCount: number; builtInRuleCount: number; executionTime: number; fromCache: boolean }) => void;
  resetNodeState: (nodeId: string) => void;
  resetAllNodes: () => void;

  // Rule Actions
  resetAllRules: () => void;

  // Global Actions
  reset: () => void;

  // Selectors
  getNodeState: (nodeId: string) => NodeVariantBorderProps["state"];
  getNodeExecutionData: (nodeId: string) => NodeExecutionState;
  getIsExecutionStarted: () => boolean;
}

// ===== Edge Execution Types =====
interface EdgeExecutionState {
  mode: "default" | "running" | "evaluating";
  state: "default" | "success" | "error";
}

const defaultEdgeState: EdgeExecutionState = {
  mode: "default",
  state: "default",
};

// ===== Handle Execution Types =====
interface HandleExecutionState {
  running: boolean;
}

const defaultHandleState: HandleExecutionState = {
  running: false,
};

interface GraphExecutionState {
  lastEvent: GraphEvent | null;
}

const defaultGraphState: GraphExecutionState = {
  lastEvent: null,
};

type ReceiveMessageEvent = GraphEvent | NodeEvent | RuleEvent;

// ===== Extended Store Interface =====
interface ExtendedNodeExecutionStore extends NodeExecutionStore {
  // Edge State
  edgeStates: Map<string, EdgeExecutionState>;

  // Handle State
  handleStates: Map<string, HandleExecutionState>;

  // Graph State
  graphState: GraphExecutionState;

  // Edge Actions
  setEdgeMode: (edgeKey: string, mode: EdgeExecutionState["mode"]) => void;
  setEdgeState: (edgeKey: string, state: EdgeExecutionState["state"]) => void;
  resetEdge: (edgeKey: string) => void;
  resetAllEdges: () => void;
  getEdgeState: (edgeKey: string) => EdgeExecutionState;
  getEdgeMode: (edgeKey: string) => EdgeExecutionState["mode"];
  getEdgeExecutionState: (edgeKey: string) => EdgeExecutionState["state"];

  // Handle Actions
  setHandleRunning: (handleKey: string, running: boolean) => void;
  resetHandle: (handleKey: string) => void;
  resetAllHandles: () => void;
  getHandleState: (handleKey: string) => boolean;

  // Graph Actions
  setGraphEvent: (event: GraphEvent) => void;
  getGraphEvent: () => GraphEvent | null;
  resetGraph: () => void;

  // Event Handlers (called by SignalR)
  handleReceiveNotification: (event: NodeResultEvent) => void;
  handleReceiveMessage: (event: ReceiveMessageEvent) => void;
}

export const useExecutionStore = create<ExtendedNodeExecutionStore>()(
  devtools(
    (set, get) => ({
      // Node state
      nodeStates: new Map(),
      isExecutionStarted: false,

      // Edge state
      edgeStates: new Map(),

      // Handle state
      handleStates: new Map(),

      // Graph state
      graphState: defaultGraphState,

      setNodeExecutionResult: (nodeId, result) =>
        set((state) => {
          const newMap = new Map(state.nodeStates);
          const currentState = newMap.get(nodeId) || { ...defaultNodeState };
          newMap.set(nodeId, { ...currentState, executionResult: result });

          // Mark execution as started when first node starts running
          const isStarted = state.isExecutionStarted || result !== "default";

          return { nodeStates: newMap, isExecutionStarted: isStarted };
        }),

      setNodeMetrics: (nodeId, metrics) =>
        set((state) => {
          const newMap = new Map(state.nodeStates);
          const currentState = newMap.get(nodeId) || { ...defaultNodeState };
          newMap.set(nodeId, {
            ...currentState,
            systemRuleCount: metrics.systemRuleCount,
            builtInRuleCount: metrics.builtInRuleCount,
            executionTime: metrics.executionTime,
            fromCache: metrics.fromCache,
          });
          return { nodeStates: newMap };
        }),

      resetNodeState: (nodeId) =>
        set((state) => {
          const newMap = new Map(state.nodeStates);
          newMap.set(nodeId, { ...defaultNodeState });
          return { nodeStates: newMap };
        }),

      resetAllNodes: () =>
        set(() => ({
          nodeStates: new Map(),
          isExecutionStarted: false,
        })),

      resetAllRules: () =>
        set((state) => ({
          nodeStates: state.nodeStates,
        })),

      reset: () =>
        set(() => ({
          nodeStates: new Map(),
          isExecutionStarted: false,
          edgeStates: new Map(),
          handleStates: new Map(),
          graphState: defaultGraphState,
        })),

      getNodeState: (nodeId) => {
        if (useFlowStore.getState().mode === "build") {
          return "default";
        }

        const state = get().nodeStates.get(nodeId);
        if (!state) return "default";

        const { executionResult, systemRuleCount, builtInRuleCount } = state;

        const stateMap: Record<string, NodeVariantBorderProps["state"]> = {
          running: "running",
          error: "error",
          pruned: "pruned",
          success: systemRuleCount > 0 ? "systemRule" : builtInRuleCount > 0 ? "reliabilityRule" : "success",
        };

        return stateMap[executionResult] ?? "default";
      },

      getNodeExecutionData: (nodeId) => {
        if (useFlowStore.getState().mode === "build") {
          return { ...defaultNodeState };
        }
        return get().nodeStates.get(nodeId) || { ...defaultNodeState };
      },

      getIsExecutionStarted: () => {
        return get().isExecutionStarted;
      },

      // ===== Edge Actions =====
      setEdgeMode: (edgeKey, mode) =>
        set((state) => {
          const newMap = new Map(state.edgeStates);
          const currentState = newMap.get(edgeKey) || { ...defaultEdgeState };
          newMap.set(edgeKey, { ...currentState, mode });
          return { edgeStates: newMap };
        }),

      setEdgeState: (edgeKey, state) =>
        set((storeState) => {
          const newMap = new Map(storeState.edgeStates);
          const currentState = newMap.get(edgeKey) || { ...defaultEdgeState };
          newMap.set(edgeKey, { ...currentState, state });
          return { edgeStates: newMap };
        }),

      resetEdge: (edgeKey) =>
        set((state) => {
          const newMap = new Map(state.edgeStates);
          newMap.set(edgeKey, { ...defaultEdgeState });
          return { edgeStates: newMap };
        }),

      resetAllEdges: () =>
        set(() => ({
          edgeStates: new Map(),
        })),

      getEdgeState: (edgeKey) => {
        return get().edgeStates.get(edgeKey) || { ...defaultEdgeState };
      },

      getEdgeMode: (edgeKey) => {
        if (useFlowStore.getState().mode === "build") {
          return "default";
        }
        const state = get().edgeStates.get(edgeKey);
        return state ? state.mode : "default";
      },

      getEdgeExecutionState: (edgeKey) => {
        if (useFlowStore.getState().mode === "build") {
          return "default";
        }
        const state = get().edgeStates.get(edgeKey);
        return state ? state.state : "default";
      },

      // ===== Handle Actions =====
      setHandleRunning: (handleKey, running) =>
        set((state) => {
          const newMap = new Map(state.handleStates);
          newMap.set(handleKey, { running });
          return { handleStates: newMap };
        }),

      resetHandle: (handleKey) =>
        set((state) => {
          const newMap = new Map(state.handleStates);
          newMap.set(handleKey, { ...defaultHandleState });
          return { handleStates: newMap };
        }),

      resetAllHandles: () =>
        set(() => ({
          handleStates: new Map(),
        })),

      getHandleState: (handleKey) => {
        if (useFlowStore.getState().mode === "build") {
          return false;
        }
        const state = get().handleStates.get(handleKey);
        return state ? state.running : false;
      },

      // ===== Graph Actions =====
      setGraphEvent: (event) =>
        set(() => ({
          graphState: { lastEvent: event },
        })),

      getGraphEvent: () => {
        return get().graphState.lastEvent;
      },

      resetGraph: () =>
        set(() => ({
          graphState: defaultGraphState,
        })),

      // ===== Event Handlers (called by SignalR) =====
      handleReceiveNotification: (event: NodeResultEvent) => {
        const { nodeId, systemRuleCount, builtInRuleCount, executionTime, fromCache } = event;
        const nodeStore = get();

        nodeStore.setNodeMetrics(nodeId, {
          systemRuleCount,
          builtInRuleCount,
          executionTime,
          fromCache: fromCache,
        });
      },

      handleReceiveMessage: (event: ReceiveMessageEvent) => {
        const { eventType, payload } = event;
        const nodeId = payload.nodeId;
        const nodeStore = get();

        // Handle node events
        if (isNodeEvent(event)) {
          const nodeEvent = event;

          // Update node execution state
          if (eventType === "engine_node_started") {
            const currentData = nodeStore.getNodeExecutionData(nodeId);
            if (currentData.executionResult === "default") {
              nodeStore.setNodeExecutionResult(nodeId, "running");
            }

            // Update handle state for this node
            nodeStore.setHandleRunning(nodeId, true);
          } else if (eventType === "engine_node_failed") {
            nodeStore.setNodeExecutionResult(nodeId, "error");
          } else if (eventType === "engine_node_completed") {
            nodeStore.setNodeExecutionResult(nodeId, "success");
          } else if (eventType === "engine_node_pruned") {
            nodeStore.setNodeExecutionResult(nodeId, "pruned");
          }

          // Update edges connected to this node
          // Edge key format: `${sourceNodeId}-${targetNodeId}`
          if (nodeEvent.payload.additionalFields?.sourceNodes) {
            const sourceNodes = nodeEvent.payload.additionalFields.sourceNodes;
            sourceNodes.forEach((sourceNodeId) => {
              const edgeKey = `${sourceNodeId}-${nodeId}`;
              if (eventType === "engine_node_started") {
                nodeStore.setEdgeMode(edgeKey, "running");
              } else if (eventType === "engine_node_completed") {
                nodeStore.setEdgeState(edgeKey, "success");
              } else if (eventType === "engine_node_failed") {
                nodeStore.setEdgeState(edgeKey, "error");
              }
            });
          }
        }

        // Handle graph events
        if (eventType === "engine_graph_completed" || eventType === "engine_graph_failed") {
          nodeStore.setGraphEvent(event);
          useFlowStore.setState({ loading: false });
        }
      },
    }),
    { enabled: import.meta.env.DEV, name: "ExecutionStore" }
  )
);
