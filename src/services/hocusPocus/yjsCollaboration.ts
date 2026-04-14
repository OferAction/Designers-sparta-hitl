import { EdgeChange, NodeAddChange, NodeChange, NodeSelectionChange, applyEdgeChanges, applyNodeChanges } from "@xyflow/react";
import { produce } from "immer";
import * as Y from "yjs";

import { FlowStoreState } from "../../store/index";
import { Node, Edge } from "@/modules/flow/types";

export class YjsCollaborationManager {
  private nodesMap: Y.Map<Node>;
  private edgesMap: Y.Map<Edge>;
  private get: () => FlowStoreState;
  private set: (partial: Partial<FlowStoreState>) => void;
  private unsubscribeNodes?: () => void;
  private unsubscribeEdges?: () => void;
  private isUpdatingFromYjs = false;
  private ydocInstance?: Y.Doc;
  public undoManager?: Y.UndoManager;
  public canUndo: () => boolean = () => false;
  public canRedo: () => boolean = () => false;
  private firstTimeLoad = true;

  constructor(
    nodesMap: Y.Map<Node>,
    edgesMap: Y.Map<Edge>,
    get: () => FlowStoreState,
    set: (partial: Partial<FlowStoreState>) => void,
    ydocInstance?: Y.Doc
  ) {
    this.nodesMap = nodesMap;
    this.edgesMap = edgesMap;
    this.get = get;
    this.set = set;
    this.ydocInstance = ydocInstance;
    this.undoManager = new Y.UndoManager(this.ydocInstance!, { trackedOrigins: new Set(["nodes", "edges"]) });
    this.canUndo = () => this.undoManager?.canUndo() ?? false;
    this.canRedo = () => this.undoManager?.canRedo() ?? false;
  }

  withTransaction(fn: (...args: any) => void) {
    this.ydocInstance?.transact(() => {
      fn();
    }, "nodes");
  }

  initializeObservers() {
    // Observer for nodes changes from Yjs
    const nodesObserver = () => {
      if (this.isUpdatingFromYjs) return;
      this.isUpdatingFromYjs = true;
      const selectedNodesIdsSet = new Set(
        this.get()
          .nodes.filter((n) => n.selected)
          .map((n) => n.id)
      );
      const nodesArray = Array.from(this.nodesMap.values()).map((n) => ({
        ...n,
        selected: this.firstTimeLoad ? false : selectedNodesIdsSet.has(n.id),
      }));
      this.set({ nodes: nodesArray });
      this.isUpdatingFromYjs = false;
      this.firstTimeLoad = false;
    };

    // Observer for edges changes from Yjs
    const edgesObserver = () => {
      if (this.isUpdatingFromYjs) return;
      this.isUpdatingFromYjs = true;
      const edgesArray = Array.from(this.edgesMap.values());
      this.set({ edges: edgesArray });
      this.isUpdatingFromYjs = false;
    };

    // Start observing changes
    this.nodesMap.observe(nodesObserver);
    this.edgesMap.observe(edgesObserver);

    // Store unsubscribe functions
    this.unsubscribeNodes = () => this.nodesMap.unobserve(nodesObserver);
    this.unsubscribeEdges = () => this.edgesMap.unobserve(edgesObserver);
  }

  cleanup() {
    this.unsubscribeNodes?.();
    this.unsubscribeEdges?.();
  }

  onNodesChange = (changes: NodeChange<Node>[]) => {
    if (this.isUpdatingFromYjs) return;
    const currentNodes = this.get().nodes;
    const nextNodes = produce(currentNodes, (draft) => {
      const entries = applyNodeChanges(changes, draft) as Node[];
      draft.splice(0, entries.length, ...entries);
      draft.splice(entries.length);
    });
    // Sync changes to Yjs

    this.withTransaction(() => {
      for (const change of changes) {
        if (change.type === "add") {
          const nodeToAdd = change.item;
          this.nodesMap.set(nodeToAdd.id, nodeToAdd);
        } else if (change.type === "remove" && this.nodesMap.has(change.id)) {
          this.nodesMap.delete(change.id);
        } else if (change.type === "position" || change.type === "dimensions") {
          // For other changes, find the updated node and sync it
          const updatedNode = nextNodes.find((n) => n.id === change.id);
          if (updatedNode) {
            this.nodesMap.set(change.id, updatedNode);
          }
        } else if (change.type === "select") {
          //   only update selection state in the store
          if (nextNodes) this.set({ nodes: nextNodes });
        } else if (change.type === "replace") {
          const nodeToReplace = change.item;
          this.nodesMap.set(nodeToReplace.id, nodeToReplace);
        }
      }
    });
  };

  onEdgesChange = (changes: EdgeChange<Edge>[]) => {
    if (this.isUpdatingFromYjs) return;

    const currentEdges = this.get().edges;
    const nextEdges = applyEdgeChanges(changes, currentEdges) as Edge[];

    // Sync changes to Yjs
    this.withTransaction(() => {
      for (const change of changes) {
        if (change.type === "add") {
          const edgeToAdd = change.item;
          this.edgesMap.set(edgeToAdd.id, edgeToAdd);
        } else if (change.type === "remove" && this.edgesMap.has(change.id)) {
          this.edgesMap.delete(change.id);
        } else if (change.type === "select") {
          this.set({ edges: nextEdges });
        } else if (change.type === "replace") {
          const edgeToReplace = change.item;
          this.edgesMap.set(edgeToReplace.id, edgeToReplace);
        }
      }
    });
  };

  addNode = (node: Node) => {
    this.withTransaction(() => {
      const nodeAddChange: NodeAddChange<Node> = {
        type: "add",
        item: node,
      };
      const nodeSelectionChange: NodeSelectionChange = {
        id: node.id,
        type: "select",
        selected: node.selected || false,
      };
      this.onNodesChange([nodeAddChange, nodeSelectionChange]);
    });
  };

  updateNode = (nodeUpdate: Partial<Node> & Pick<Node, "id">) => {
    const currentNodes = this.get().nodes;
    const nodeIndex = currentNodes.findIndex((n) => n.id === nodeUpdate.id);

    if (nodeIndex !== -1) {
      const currentNode = currentNodes[nodeIndex];
      const updatedNode = { ...currentNode, ...nodeUpdate } as Node;
      const newNodes = [...currentNodes];
      newNodes[nodeIndex] = updatedNode;

      this.withTransaction(() => this.nodesMap.set(updatedNode.id, updatedNode));
    }
  };

  addEdge = (edge: Edge) => {
    this.withTransaction(() => this.edgesMap.set(edge.id, edge));
  };

  setNodes = (nodes: Node[]) => {
    this.withTransaction(() => {
      this.nodesMap.clear();
      const nodeAddChanges: NodeAddChange<Node>[] = nodes.map((node) => ({
        type: "add",
        item: node,
      }));
      const nodeSelectionChanges: NodeSelectionChange[] = nodes.map((node) => ({
        id: node.id,
        type: "select",
        selected: node.selected || false,
      }));
      this.onNodesChange([...nodeAddChanges, ...nodeSelectionChanges]);
    });
  };

  setEdges = (edges: Edge[]) => {
    // Clear existing edges in Yjs and add new ones
    this.withTransaction(() => {
      this.edgesMap.clear();
      const edgeAddChanges: EdgeChange<Edge>[] = edges.map((edge) => ({
        type: "add",
        item: edge,
      }));
      const edgeSelectionChanges: EdgeChange<Edge>[] = edges.map((edge) => ({
        id: edge.id,
        type: "select",
        selected: edge.selected || false,
      }));
      this.onEdgesChange([...edgeAddChanges, ...edgeSelectionChanges]);
    });
  };

  /**
   * Delete nodes and edges
   */
  deleteNodesAndEdges = (nodeIds: string[], edgeIds: string[]) => {
    this.withTransaction(() => {
      if (nodeIds.length > 0) {
        this.onNodesChange(
          nodeIds.map((id) => ({
            id,
            type: "remove",
          }))
        );
      }
      if (edgeIds.length > 0) {
        this.onEdgesChange(
          edgeIds.map((id) => ({
            id,
            type: "remove",
          }))
        );
      }
    });
  };

  undo = () => {
    if (!this.undoManager) return;
    this.undoManager.undo();
  };
  redo = () => {
    if (!this.undoManager) return;
    this.undoManager.redo();
  };
}
