import { useCallback } from "react";

import { Connection, EdgeChange, NodeChange, OnDelete, applyEdgeChanges, applyNodeChanges } from "@xyflow/react";
import dotProp from "dot-prop-immutable";
import { produce } from "immer";
import debounce from "lodash.debounce";
import merge from "lodash.merge";

import { readFlowDataFromClipboard } from "@/modules/flow/hooks/osClipboard";

import { isRuleSourceHandle } from "@/modules/flow/utils/useConnectionValidity";

import { mitt } from "@/lib/mitt";
import type { ConditionType, Edge } from "@/modules/flow/types";
import { FlowConfiguration, Node, NodeTypes, type AfterNodeExecutionAction } from "@/modules/flow/types/BaseNodeTypes";
import hocusPocusService from "@/services/hocusPocus/collaborativeService";
import { YjsCollaborationManager } from "@/services/hocusPocus/yjsCollaboration";
import { useFlowStore, type FlowStoreState } from "@/store";
import useDatasetUploadStore from "@/store/datasetUploadStore";
import { genId } from "@/utils";

import { applyCollisionResolution } from "@/modules/flow/utils/resolveCollision";
import { handleNodeChangesOnEdgeRemoval } from "@/utils/edgeRemovalHandlers";
import { nodeLabelService } from "@/utils/nodeLabelService";

export type CanvasInteractionPermissions = {
  canSelectNodes: boolean;
  canChangeNodeData: boolean;
  canDragOrRemoveNodes: boolean; // covers position, resize, and remove
  canCreateElements: boolean; // covers adding both nodes and edges
  canSelectEdges: boolean;
  canRemoveEdges: boolean;
  canRunFlow: boolean;
};

type CollaborationOptions = {
  ignoreCollaboration?: boolean;
};
type WithCollaborationOptions<T extends (...args: any[]) => any> = (...args: [...Parameters<T>, options?: CollaborationOptions]) => ReturnType<T>;
const isCollaborationOptions = (arg: any): arg is CollaborationOptions => {
  return arg && typeof arg === "object" && "ignoreCollaboration" in arg;
};

export type FlowState = {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string;
  selectedNodeIds: string[];
  selectedNodeIdsSet: Set<string>;
  mode: "run" | "build";
  setMode: (mode: "run" | "build") => void;
  setNodes: WithCollaborationOptions<(nodes: Node[], force?: boolean) => void>;
  setEdges: WithCollaborationOptions<(edges: Edge[], force?: boolean) => void>;
  syncNodeLabels: () => void;
  setNode: WithCollaborationOptions<(node: Partial<Node> & Pick<Node, "id">) => void>;
  setSelectedNodeId: (nodeId: string) => void;
  setSelectedNodeIds: (nodeIds: string[]) => void;
  setSelectedNodeIdsSet: (nodeIdsSet: Set<string>) => void;
  onNodesChange: WithCollaborationOptions<(changes: NodeChange<Node>[]) => void>;
  onEdgesChange: WithCollaborationOptions<(changes: EdgeChange<Edge>[]) => void>;
  onConnect: WithCollaborationOptions<(connection: Connection) => void>;
  // paste clipboard content with origin at provided base (flow coordinates)
  pasteClipboardAt: WithCollaborationOptions<(base: { x: number; y: number }) => Promise<void>>;
  onChange: WithCollaborationOptions<(id: string, prop: string, newValue: any) => void>;
  setAfterNodeExecution: WithCollaborationOptions<(id: string, value: AfterNodeExecutionAction) => void>;
  addNode: WithCollaborationOptions<
    (type: NodeTypes, position: { x: number; y: number }, nodeTemplates: FlowConfiguration, rest: Record<string, any>) => string
  >;
  onDelete: WithCollaborationOptions<OnDelete>;
  lastSaved: string | null;
  lastSavedStateStringified: string | null;
  hasUnsavedChanges: () => boolean;
  setLastSaved: (lastSaved: string | null) => void;
  connectDataset: (datasetId: string) => void;
  updateConnectedDataset: (datasetId: string) => void;
  canvasPermissions?: Partial<CanvasInteractionPermissions>;
  setCanvasPermissions: (permissions?: Partial<CanvasInteractionPermissions>) => void;
};

export const checkCanvasPermission = (
  key: keyof CanvasInteractionPermissions,
  canvasPermissions?: Partial<CanvasInteractionPermissions>
): boolean => {
  const permissions = canvasPermissions ?? useFlowStore.getState().canvasPermissions;

  // If permissions are undefined, allow all interactions (default behavior)
  if (permissions === undefined) return true;
  // If the specific permission is not set, default to true (allow)
  return permissions[key] ?? true;
};

export const useCheckCanvasPermission = () => {
  const canvasPermissions = useFlowStore((state) => state.canvasPermissions);
  return useCallback(
    (key: keyof CanvasInteractionPermissions) => {
      return checkCanvasPermission(key, canvasPermissions);
    },
    [canvasPermissions]
  );
};

export const createFlowSlice = (set: any, get: () => FlowStoreState): FlowState => {
  // Wrapper that provides manager to method implementations based on options
  const withCollaboration = <Args extends any[], Return>(
    implementation: (manager: YjsCollaborationManager | null, ...args: [...Args, CollaborationOptions?]) => Return
  ) => {
    return (...args: [...Args]): Return => {
      // Extract options from last argument if it exists and is an options object
      const lastArg = args[args.length - 1];
      const hasOptions = isCollaborationOptions(lastArg);
      const options = hasOptions ? (lastArg as CollaborationOptions) : undefined;
      const actualArgs = (hasOptions ? args.slice(0, -1) : args) as Args;

      const manager = options?.ignoreCollaboration ? null : hocusPocusService.collaborationManager;
      return implementation(manager, ...actualArgs, options);
    };
  };

  // Flag to prevent infinite loops during collision resolution
  let isResolvingCollisions = false;

  // Debounced collision resolution function
  const debouncedResolveCollisions = debounce((options?: CollaborationOptions) => {
    if (isResolvingCollisions) return;

    isResolvingCollisions = true;
    try {
      const currentNodes = get().nodes;
      const positionChanges = applyCollisionResolution(currentNodes);
      if (positionChanges.length) {
        get().onNodesChange(positionChanges, options);
      }
    } finally {
      isResolvingCollisions = false;
    }
  }, 50);

  return {
    nodes: [],
    edges: [],
    mode: "build",
    setMode: (mode) => set({ mode }),
    selectedNodeId: "",
    selectedNodeIds: [],
    selectedNodeIdsSet: new Set<string>(),

    setNodes: withCollaboration((manager, nodes, force = false, options) => {
      if (force === false && !checkCanvasPermission("canCreateElements")) return;

      if (manager) {
        manager.setNodes(nodes);
      } else {
        set({ nodes });
      }
      debouncedResolveCollisions(options);
    }),

    setNode: withCollaboration((manager, node, options) => {
      if (!checkCanvasPermission("canChangeNodeData")) return;

      if (manager) {
        manager.updateNode(node);
      } else {
        const updatedNodes = produce(get().nodes, (draft) => {
          const index = draft.findIndex((n) => n.id === node.id);
          if (index !== -1) {
            Object.assign(draft[index], node);
          }
        });
        set({ nodes: updatedNodes });
      }

      debouncedResolveCollisions(options);
    }),

    setEdges: withCollaboration((manager, edges, force = false) => {
      if (force === false && !checkCanvasPermission("canCreateElements")) return;
      const processedEdges = edges.map((e) => ({
        ...e,
        markerEnd: undefined,
        type: "curved",
      }));

      if (manager) {
        manager.setEdges(processedEdges);
      } else {
        set({ edges: processedEdges });
      }
    }),

    syncNodeLabels: () => {
      const nodes = get().nodes;
      nodeLabelService.syncWithExistingNodes(nodes);
    },

    setSelectedNodeId: (nodeId: string) => {
      set({
        selectedNodeId: nodeId,
      });
    },

    setSelectedNodeIds: (nodeIds: string[]) => {
      set({
        selectedNodeIds: nodeIds,
      });
    },
    setSelectedNodeIdsSet: (nodeIdsSet: Set<string>) => {
      // to handle collaborative selection
      hocusPocusService.updateSelection(nodeIdsSet);
      set({
        selectedNodeIdsSet: nodeIdsSet,
      });
    },

    onNodesChange: withCollaboration((manager, changes, options) => {
      // Filter changes based on permissions
      const allowedChanges = changes.filter((change) => {
        switch (change.type) {
          case "select":
            return checkCanvasPermission("canSelectNodes");
          case "position":
          case "dimensions":
          case "remove":
            return checkCanvasPermission("canDragOrRemoveNodes");
          case "add":
          case "replace":
            return checkCanvasPermission("canCreateElements");
          default:
            return true;
        }
      });

      // If all changes were filtered out, return early
      if (allowedChanges.length === 0) return;

      if (manager) {
        manager.onNodesChange(allowedChanges);
      } else {
        // Fallback to original implementation
        const updateNodes = produce(get().nodes, (draft) => {
          const entries = applyNodeChanges(allowedChanges, draft) as Node[];
          draft.splice(0, entries.length, ...entries);
          draft.splice(entries.length);
        });
        set({ nodes: updateNodes });
      }
      debouncedResolveCollisions(options);
      mitt.emit("flow:node:change", allowedChanges);
    }),

    onEdgesChange: withCollaboration((manager, changes, options) => {
      // Filter changes based on permissions
      const allowedChanges = changes.filter((change) => {
        switch (change.type) {
          case "select":
            return checkCanvasPermission("canSelectEdges");
          case "remove":
            return checkCanvasPermission("canRemoveEdges");
          case "add":
          case "replace":
            return checkCanvasPermission("canCreateElements");
          default:
            return true;
        }
      });

      // If all changes were filtered out, return early
      if (allowedChanges.length === 0) return;

      // Handle edge removal logic before applying changes
      const currentEdges = get().edges;
      const currentNodes = get().nodes;

      const nodeChanges: NodeChange<Node>[] = [];

      const edgeRemovalNodeUpdates = handleNodeChangesOnEdgeRemoval(allowedChanges, currentEdges, currentNodes);
      nodeChanges.push(...edgeRemovalNodeUpdates);

      if (nodeChanges.length > 0) {
        get().onNodesChange(nodeChanges, options);
      }

      if (manager) {
        manager.onEdgesChange(allowedChanges);
      } else {
        set({ edges: applyEdgeChanges(allowedChanges, get().edges) });
      }
      mitt.emit("flow:edge:change", allowedChanges);
    }),

    onDelete: withCollaboration((manager, { edges, nodes }) => {
      // Check permissions for deleting nodes and edges
      const canDeleteNodes = checkCanvasPermission("canDragOrRemoveNodes");
      const canDeleteEdges = checkCanvasPermission("canRemoveEdges");

      // Filter nodes and edges based on permissions
      const allowedNodes = canDeleteNodes ? nodes : [];
      const allowedEdges = canDeleteEdges ? edges : [];

      // If nothing to delete, return early
      if (allowedNodes.length === 0 && allowedEdges.length === 0) return;

      if (manager) {
        const nodeIds = allowedNodes.map((n) => n.id);
        const edgeIds = allowedEdges.map((e) => e.id);
        manager.deleteNodesAndEdges(nodeIds, edgeIds);
      }
      mitt.emit("flow:delete", { edges: allowedEdges, nodes: allowedNodes });
    }),

    onConnect: withCollaboration((manager, connection) => {
      // Check permission for creating elements
      if (!checkCanvasPermission("canCreateElements")) return;

      // Get the target node's ID from the connection object
      const targetNodeId = connection.target;
      const sourceNodeId = connection.source;
      // Find the target node using its ID
      const targetNode = get().nodes.find((node) => node.id === targetNodeId);
      // Retrieve the type of the target node
      const targetNodeType = targetNode ? targetNode.type : null;

      const isRuleEdge = isRuleSourceHandle(connection.sourceHandle);

      const newEdge: Edge = {
        ...connection,
        id: `${connection.source}-${connection.target}-${connection.sourceHandle}-${connection.targetHandle}`,
        zIndex: (targetNode?.zIndex || 2) - 1,
        style: isRuleEdge ? { ...(connection as any).style, strokeDasharray: "5 5" } : (connection as any).style,
        data: { targetNodeType, isRuleEdge },
      };

      const newNodes = produce(get().nodes, (draft) => {
        const sourceNodeIndex = draft.findIndex((node) => node.id === sourceNodeId);
        const targetNodeIndex = draft.findIndex((node) => node.id === targetNodeId);
        if (sourceNodeIndex !== -1) {
          if (draft[sourceNodeIndex].type === "ifelse") {
            const newCondetions = draft[sourceNodeIndex].data.conditions;
            draft[sourceNodeIndex].data.conditions = newCondetions.map((condition: ConditionType) => {
              if (connection.sourceHandle === condition.id) {
                condition.then = [...condition.then, draft[targetNodeIndex].id];
              }
              return condition;
            });
          }
        }

        // Set after_node_execution to "continue" when source node gets connected
        if (draft[sourceNodeIndex].data.after_node_execution === "stop" || draft[sourceNodeIndex].data.after_node_execution === "terminate") {
          draft[sourceNodeIndex].data.after_node_execution = "continue";
        }
      });

      if (manager) {
        manager.addEdge(newEdge);
        manager.setNodes(newNodes);
      } else {
        set({
          edges: [...get().edges, newEdge],
          nodes: newNodes,
        });
      }

      mitt.emit("flow:connect", connection);
    }),

    pasteClipboardAt: withCollaboration(async (manager, base, options) => {
      // Check permission for creating elements
      if (!checkCanvasPermission("canCreateElements")) return;

      const clip = await readFlowDataFromClipboard();
      if (!clip || !clip.nodes?.length) return;

      // find min bounds of copied nodes positions
      let minX = Infinity;
      let minY = Infinity;
      clip.nodes.forEach(({ node }) => {
        minX = Math.min(minX, node.position.x);
        minY = Math.min(minY, node.position.y);
      });

      const idMap = new Map<string, string>();
      const cleared = get().nodes.map((n) => ({ ...n, selected: false }));
      const newNodes = clip.nodes.map(({ originalId, node }) => {
        const newId = genId().replace(/-/g, "");
        idMap.set(originalId, newId);
        return {
          ...node,
          id: newId,
          position: {
            x: base.x + (node.position.x - minX),
            y: base.y + (node.position.y - minY),
          },
          selected: true,
          dragging: false,
          // generate the labels for the new node if not subflow
          data: {
            ...node.data,
            label: node.data.type === "subflow" ? node.data.label : nodeLabelService.generateNextLabel(node.data.type),
          },
          zIndex: node.zIndex ?? 2,
        } as Node;
      });
      get().onNodesChange(
        newNodes.map((n) => ({
          id: n.id,
          type: "select",
          selected: true,
        })),
        options
      );

      if (manager) {
        manager.setNodes([...cleared, ...newNodes]);
      } else {
        set({ nodes: [...cleared, ...newNodes] });
      }

      // recreate edges
      clip.edges.forEach((edge) => {
        const source = idMap.get(edge.source);
        const target = idMap.get(edge.target);
        if (source && target) {
          get().onConnect(
            {
              source,
              target,
              sourceHandle: edge.sourceHandle ?? null,
              targetHandle: edge.targetHandle ?? null,
            } as Connection,
            options
          );
        }
      });
    }),

    onChange: withCollaboration((manager, id, prop, newValue) => {
      if (prop === "after_node_execution") return;
      // Check permission for changing node data
      if (!checkCanvasPermission("canChangeNodeData")) return;

      if (manager) {
        const currentNode = get().nodes.find((n) => n.id === id);
        if (currentNode) {
          const updatedNode = dotProp.set(currentNode, `data.${prop}`, newValue);
          manager.updateNode(updatedNode);
        }
      } else {
        set({
          nodes: get().nodes.map((nd) => {
            if (nd.id === id) {
              const updatedNode = dotProp.set(nd, `data.${prop}`, newValue);
              return updatedNode;
            }
            return nd;
          }),
        });
      }
    }),

    setAfterNodeExecution: withCollaboration((manager, id, value) => {
      // Check permission for changing node data
      if (!checkCanvasPermission("canChangeNodeData")) return;

      // Only allow explicit updates when node has no outgoing edges (optional enforcement)
      const hasOutgoing = get().edges.some((e) => e.source === id);
      const enforcedValue: AfterNodeExecutionAction = hasOutgoing ? "continue" : value;

      if (manager) {
        const currentNode = get().nodes.find((n) => n.id === id);
        if (currentNode) {
          const updatedNode = dotProp.set(currentNode, "data.after_node_execution", enforcedValue);
          manager.updateNode(updatedNode);
        }
      } else {
        set({
          nodes: get().nodes.map((nd) => {
            if (nd.id === id) {
              const updatedNode = dotProp.set(nd, "data.after_node_execution", enforcedValue);
              return updatedNode;
            }
            return nd;
          }),
        });
      }
    }),

    addNode: withCollaboration((manager, type, position, nodeTemplates, rest) => {
      // Check permission for creating elements
      if (!checkCanvasPermission("canCreateElements")) return "";

      const newId = genId().replace(/-/g, "");

      const nodeTemplate = nodeTemplates[type];
      if (!nodeTemplate) {
        throw new Error(`Node template for type "${type}" not found.`);
      }

      // Remove subflowConfigId from rest if type is subflow
      const { subflowConfigId, subflowId, ...restWithoutSubflowId } = (rest as Record<string, any>) || {};
      const cleanedRest = type === "subflow" ? restWithoutSubflowId : (rest as Record<string, any>);

      const newNode = merge(
        {},
        nodeTemplate,
        {
          id: newId,
          position,
          selected: false,
          zIndex: 2,
          ...cleanedRest,
        },
        type === "subflow"
          ? {
              data: {
                subflowConfigId: subflowConfigId || "",
                subflowId: subflowId || "",
              },
            }
          : null
      );

      // Apply numbered labeling to the new node (only if not subflow)
      const nodeType = type;
      const newNodeWithLabel =
        type === "subflow"
          ? newNode
          : {
              ...newNode,
              data: {
                ...newNode.data,
                label: nodeLabelService.generateNextLabel(nodeType),
              },
            };

      if (manager) {
        manager.addNode(newNodeWithLabel as Node);
      } else {
        set({ nodes: [...get().nodes, newNodeWithLabel] });
      }

      if (rest?.parentId) {
        const parentNode = get().nodes.find((node) => node.id === rest?.parentId);
        newNodeWithLabel.zIndex = (parentNode?.zIndex || 0) + 2;
      }

      mitt.emit("flow:node:add", newNodeWithLabel as Node);
      return newId;
    }),

    lastSaved: null,
    lastSavedStateStringified: null,
    hasUnsavedChanges: () => {
      const currentConfig = get().getCurrentConfig();
      const lastSavedState = get().lastSavedStateStringified;
      if (!lastSavedState) return false;

      return JSON.stringify(currentConfig) !== lastSavedState;
    },
    setLastSaved: (lastSaved) => {
      set({ lastSaved, lastSavedStateStringified: JSON.stringify(get().getCurrentConfig()) });
    },
    connectDataset: (datasetId: string) => {
      set({ selectedDatasetId: datasetId });
      useDatasetUploadStore.getState().dismissError();
    },
    updateConnectedDataset: (datasetId: string) => {
      set({ selectedDatasetId: datasetId });
    },

    setCanvasPermissions: (permissions) => {
      set({ canvasPermissions: permissions });
    },
  };
};
