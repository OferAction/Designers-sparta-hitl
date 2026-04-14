import { TreeInputItem } from "@/modules/flow/hooks/useNodeIOItem";

import { TreeItem } from "@/components/ui/tree-view";
import { Node, NodeInputItem, NodeOutput } from "@/modules/flow/types";

// Helper function to check if type is Object, List, or Dictionary
export const isObjectOrListType = (type: string): boolean => {
  const normalizedType = type.toLowerCase();
  return normalizedType.includes("object") || normalizedType.includes("list");
};

export const buildParentChildMap = (nodes: Node[]): Map<string, Node[]> => {
  const map = new Map<string, Node[]>();
  nodes.forEach((node) => {
    if (node.parentId) {
      const children = map.get(node.parentId) || [];
      children.push(node);
      map.set(node.parentId, children);
    }
  });
  return map;
};

// Build tree structure using the same logic as useNodeIOItem hook
const buildTreeFromItems = (items: (NodeInputItem | NodeOutput)[]): TreeInputItem[] => {
  if (!items.length) return [];

  const map = new Map(items.map((inp) => [inp.id, { ...inp, children: [] as TreeInputItem[] }]));

  items.forEach((inp) => {
    if (inp.childrenIds?.length) {
      const parent = map.get(inp.id);
      inp.childrenIds.forEach((cid) => {
        const child = map.get(cid);
        if (parent && child) {
          parent.children.push(child);
        }
      });
    }
  });

  const roots: TreeInputItem[] = Array.from(map.values()).filter((n) => !n.parentId);
  return roots;
};

// Convert TreeInputItem to TreeItem recursively
const convertTreeInputItemToTreeItem = (item: TreeInputItem): TreeItem => {
  // Get display name from value.label if available (for inputs)
  let displayName = "";

  if (item.value && typeof item.value === "object" && "label" in item.value) {
    const label = item.value.label;
    // Only use the label if it's not empty and not an object
    if (label && typeof label === "string" && label.trim() !== "") {
      displayName = label;
    }
  }

  // If no label was found and it's not empty, fall back to key (but not for numeric indices like "0", "1", "2")
  if (!displayName && item.key && typeof item.key === "string" && !/^\d+$/.test(item.key)) {
    displayName = item.key;
  }

  const treeItem: TreeItem = {
    name: displayName || "", // Ensure it's always a string, never an object
    type: typeof item.type === "string" ? item.type : "Unknown",
    path: item.id,
  };

  // Add children if they exist
  if (item.children && item.children.length > 0) {
    treeItem.children = item.children.map(convertTreeInputItemToTreeItem);
  }

  return treeItem;
};

// Build a tree structure from flat NodeIOItem array using the same logic as useNodeIOItem
const buildIOItemTree = (items: (NodeInputItem | NodeOutput)[]): TreeItem[] => {
  const treeInputItems = buildTreeFromItems(items);
  return treeInputItems.map(convertTreeInputItemToTreeItem);
};

export const convertNodeToTreeItem = (node: Node, parentChildMap: Map<string, Node[]>, visited = new Set<string>()): TreeItem => {
  if (visited.has(node.id)) {
    return {
      name: node.data.label || node.data.title || node.data.name || "...",
      type: node.data.name || "node",
      path: node.id,
    };
  }

  visited.add(node.id);

  // Safely extract inputs and outputs as arrays
  let inputs: NodeInputItem[] = [];
  if (Array.isArray(node.data.inputs)) {
    inputs = node.data.inputs as NodeInputItem[];
  }

  let outputs: NodeOutput[] = [];
  if (Array.isArray(node.data.outputs)) {
    outputs = node.data.outputs as NodeOutput[];
  }

  const children: TreeItem[] = [];

  if (node.data.name === "iterator") {
    const innerNodes = parentChildMap.get(node.id) || [];
    innerNodes.forEach((innerNode) => {
      children.push(convertNodeToTreeItem(innerNode, parentChildMap, visited));
    });
  }

  // Combine inputs and outputs, removing duplicates by ID
  // Prefer inputs over outputs because inputs have the value.label property
  const allIOItems = [...outputs, ...inputs]; // outputs first, inputs second (inputs will override)
  const uniqueIOItems = Array.from(new Map(allIOItems.map((item) => [item.id, item])).values());

  // Add unique inputs and outputs using the tree structure
  if (uniqueIOItems.length > 0) {
    children.push(...buildIOItemTree(uniqueIOItems));
  }

  return {
    name: node.data.label || node.data.title || node.data.name || "Unnamed Node",
    type: node.data.name || "node",
    path: node.id,
    children: children.length > 0 ? children : undefined,
  };
};
