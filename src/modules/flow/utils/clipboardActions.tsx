import { OnConnect, OnNodesChange, NodeAddChange, NodeSelectionChange } from "@xyflow/react";

import { Node, Edge } from "@/modules/flow/types";
import { genId } from "@/utils";

export type ClipNode = { originalId: string; node: any };
export type ClipEdge = { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null };

// Clone a node for clipboard usage (strip id & reset connection meta)
export const cloneNodeForClipboard = (n: Node): ClipNode => {
  const cloned: any = JSON.parse(JSON.stringify(n));
  delete cloned.id;
  if (cloned.data) {
    if (cloned.type === "ifelse" && Array.isArray(cloned.data.conditions)) {
      cloned.data.conditions = cloned.data.conditions.map((c: any) => ({ ...c, then: [] }));
    }
  }
  return { originalId: n.id, node: cloned };
};

// Build clipboard payload from selection
export const buildClipboard = (selected: Node[], edges: Edge[]) => {
  const clipNodes = selected.map(cloneNodeForClipboard);
  const selectedIds = new Set(selected.map((n) => n.id));
  const clipEdges: ClipEdge[] = edges
    .filter((e) => selectedIds.has(e.source) && selectedIds.has(e.target))
    .map((e) => ({ source: e.source, target: e.target, sourceHandle: e.sourceHandle, targetHandle: e.targetHandle }));
  return { nodes: clipNodes, edges: clipEdges };
};

// Duplicate selection (like Ctrl/Cmd + D without Shift)
export const duplicateSelection = (selected: Node[], edges: Edge[], onConnect: OnConnect, onNodesChange: OnNodesChange<Node>) => {
  if (!selected.length) return;
  // compute base offset reference
  let minX = Infinity;
  let minY = Infinity;
  selected.forEach((n) => {
    minX = Math.min(minX, n.position.x);
    minY = Math.min(minY, n.position.y);
  });
  const base = { x: minX + 60, y: minY + 40 };

  // prepare clipboard-like structure internally
  const { nodes: clipNodes, edges: clipEdges } = buildClipboard(selected, edges);

  // id generator consistent with existing logic
  const idMap = new Map<string, string>();

  // Build change groups separately for clarity
  const addChanges: NodeAddChange<Node>[] = clipNodes.map(({ originalId, node }) => {
    const newId = genId().replace(/-/g, "");
    idMap.set(originalId, newId);
    return {
      type: "add",
      item: {
        ...node,
        id: newId,
        position: {
          x: node.position.x - minX + base.x,
          y: node.position.y - minY + base.y,
        },
        selected: true,
        zIndex: node.zIndex ?? 2,
      },
    };
  });
  const deselectOld: NodeSelectionChange[] = selected.map((n) => ({ id: n.id, type: "select", selected: false }));
  const selectNew: NodeSelectionChange[] = clipNodes.map(({ originalId }) => ({ id: idMap.get(originalId)!, type: "select", selected: true }));

  // Single batched update
  onNodesChange([...addChanges, ...deselectOld, ...selectNew]);

  clipEdges.forEach((edge) => {
    const source = idMap.get(edge.source);
    const target = idMap.get(edge.target);
    if (source && target) {
      onConnect({
        source,
        target,
        sourceHandle: edge.sourceHandle ?? null,
        targetHandle: edge.targetHandle ?? null,
      });
    }
  });
};

// Replace selection with clipboard (handles cluster insert scenario) – Shift + D / Paste to replace
export const replaceSelectionWithClipboard = (
  targets: Node[],
  clipboard: { nodes: ClipNode[]; edges: ClipEdge[] },
  allNodes: Node[],
  onConnect: (args: any) => void,
  setNodes: (nodes: Node[]) => void,
  setSelectedNodeId: (id: string) => void,
  setSelectedNodeIds: (ids: string[]) => void
) => {
  if (!clipboard?.nodes?.length || !targets.length) return;

  // Single target + multi clipboard => insert cluster
  if (targets.length === 1 && clipboard.nodes.length > 1) {
    const target = targets[0];
    const minClipX = Math.min(...clipboard.nodes.map((c) => c.node.position.x));
    const minClipY = Math.min(...clipboard.nodes.map((c) => c.node.position.y));
    // id generator
    const idMap = new Map<string, string>();
    const firstClip = clipboard.nodes[0];
    idMap.set(firstClip.originalId, target.id);
    const firstCloned = JSON.parse(JSON.stringify(firstClip.node));
    const replacedTarget: Node = {
      ...target,
      ...firstCloned,
      id: target.id,
      position: target.position,
      selected: true,
    } as Node;
    const additional: Node[] = clipboard.nodes.slice(1).map((clipNode) => {
      const cloned = JSON.parse(JSON.stringify(clipNode.node));
      const newPos = {
        x: target.position.x + (cloned.position.x - minClipX) + 40,
        y: target.position.y + (cloned.position.y - minClipY) + 40,
      };

      const newId = genId().replace(/-/g, "");
      idMap.set(clipNode.originalId, newId);
      return {
        ...cloned,
        id: newId,
        position: newPos,
        selected: true,
        zIndex: cloned.zIndex ?? target.zIndex ?? 2,
      } as Node;
    });
    const newNodesList = allNodes.map((n) => (n.id === target.id ? replacedTarget : { ...n, selected: false }));
    newNodesList.push(...additional);
    setNodes(newNodesList);
    if (clipboard.edges?.length) {
      clipboard.edges.forEach((e) => {
        const source = idMap.get(e.source);
        const tgt = idMap.get(e.target);
        if (source && tgt) {
          onConnect({
            source,
            target: tgt,
            sourceHandle: e.sourceHandle ?? null,
            targetHandle: e.targetHandle ?? null,
          });
        }
      });
    }
    setSelectedNodeId(target.id);
    setSelectedNodeIds([target.id, ...additional.map((n) => n.id)]);
    return;
  }

  // Multi-selection or 1:1 mapping (cyclic)
  const targetIds = new Set(targets.map((t) => t.id));
  const replaced = allNodes.map((orig) => {
    if (!targetIds.has(orig.id)) return orig;
    const idx = targets.findIndex((t) => t.id === orig.id);
    const clipNode = clipboard.nodes[idx % clipboard.nodes.length];
    const cloned = JSON.parse(JSON.stringify(clipNode.node));
    return {
      ...orig,
      ...cloned,
      id: orig.id,
      position: orig.position,
      selected: true,
      zIndex: orig.zIndex,
    } as Node;
  });
  setNodes(replaced);
  setSelectedNodeId(targets[0].id);
  setSelectedNodeIds(targets.map((t) => t.id));
};
