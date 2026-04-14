import { NodeItemData, NodeOutputRowData } from "./mappingtable/types";
import { TreeItem } from "@/components/ui/tree-view";
import { NodeIconsMapping, VALUE_ICONS_MAP } from "@/constants";
import { IteratorNodeInputs, Node, NodeIOItem, NodeOutput } from "@/modules/flow/types";

import type { RowItemData } from "./mappingtable/types";
import type { Row } from "@tanstack/react-table";

export const extractFieldNameFromPath = (path: string): string => {
  return path.split(".").pop() || path;
};

/**
 * Traverses up the row hierarchy to find the actual node ID for a given output row.
 * This is necessary for nested outputs where the immediate parent might be another output, not a node.
 */
export const getActualNodeId = (row: Row<RowItemData>, data: NodeOutputRowData, fallbackParentId: string): string => {
  // If output has sourceNodeId (from iterator), use it
  if (data.sourceNodeId) return data.sourceNodeId;

  let currentRow = row.getParentRow();
  while (currentRow) {
    const rowData = currentRow.original;
    if (rowData.rowType === "node") {
      return (rowData as NodeItemData).id;
    }
    currentRow = currentRow.getParentRow();
  }

  return fallbackParentId;
};

export const findMetaByPath = (tree: TreeItem[], targetPath: string): Pick<TreeItem, "type" | "sample"> | null => {
  const search = (items: TreeItem[]): Pick<TreeItem, "type" | "sample"> | null => {
    for (const item of items) {
      if ((item as { path?: string }).path === targetPath) {
        return { type: item.type, sample: item.sample };
      }
      if (item.children && item.children.length) {
        const found = search(item.children);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  return search(tree);
};

export const filterDatasetTreeByAlignment = (alignmentKeyPath: string | null, datasetTreeData: TreeItem[]): TreeItem[] => {
  if (!alignmentKeyPath) return datasetTreeData;

  const findAlignmentKeyAndParent = (nodes: TreeItem[], parent: TreeItem | null = null): { alignmentKey: TreeItem; parent: TreeItem } | null => {
    for (const node of nodes) {
      if (!node) continue;

      if (node.path === alignmentKeyPath) {
        if (!parent) return null;
        return { alignmentKey: node, parent };
      }

      if (node.children) {
        const found = findAlignmentKeyAndParent(node.children, node);
        if (found) return found;
      }
    }
    return null;
  };

  const result = findAlignmentKeyAndParent(datasetTreeData);
  if (!result) return datasetTreeData;

  const { parent: arrayParent } = result;

  const primitiveTypes = new Set(["string", "number", "integer", "boolean"]);

  const filterNode = (node: TreeItem): TreeItem | null => {
    if (!node) return null;

    const nodeType = String(node.type ?? "").toLowerCase();

    if (primitiveTypes.has(nodeType) && node.path) {
      return { ...node };
    }

    if (node.children && node.children.length > 0) {
      const filteredChildren = node.children.map((child) => filterNode(child)).filter((child) => child !== null);

      if (filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        };
      }
    }

    return null;
  };

  if (arrayParent.children) {
    const filteredChildren = arrayParent.children.map((child) => filterNode(child)).filter((child) => child !== null);

    if (filteredChildren.length > 0) {
      return [
        {
          ...arrayParent,
          children: filteredChildren,
        },
      ];
    }
  }

  return datasetTreeData;
};

/**
 * Helper function to build hierarchical output structure from flat array
 * Outputs with parentId are nested under their parent, others are root-level
 */
const buildHierarchicalOutputs = <T extends NodeIOItem>(rawOutputs: T[], mapOutputToRow: (out: T) => NodeOutputRowData): NodeOutputRowData[] => {
  const outputsMap = new Map<string, NodeOutputRowData>();
  const rootOutputs: NodeOutputRowData[] = [];

  rawOutputs.forEach((out) => {
    const outputRow = mapOutputToRow(out);
    outputsMap.set(out.id, outputRow);
  });

  rawOutputs.forEach((out) => {
    const outputRow = outputsMap.get(out.id);
    if (!outputRow) return;

    if ("parentId" in out && out.parentId) {
      const parentOutput = outputsMap.get(out.parentId);
      if (parentOutput) {
        parentOutput.outputs.push(outputRow);
      }
    } else {
      rootOutputs.push(outputRow);
    }
  });

  return rootOutputs;
};

export const transformNodesToTreeData = (nodes: Node[]): { nodes: NodeItemData[]; footer: NodeItemData | null } => {
  const nodeMap = new Map<string, NodeItemData>();
  const rootNodes: NodeItemData[] = [];
  let footerRow: NodeItemData | null = null;

  nodes.forEach((node) => {
    if (node.hidden) return;
    const Icon = NodeIconsMapping[node.data.name as keyof typeof NodeIconsMapping] || NodeIconsMapping.start;

    // For start nodes, transform inputs into output rows for the footer section.
    const isStart = node.data.name === "start";
    const isIterator = node.data.name === "iterator";

    // For iterators, we need to filter outputs:
    // 1. Show only outputs where sourceNodeId is the iterator itself or undefined/null (like raw_response)
    // 2. Outputs with sourceNodeId pointing to nested children will be added to those children instead
    let rawOutputs = isStart ? (node.data.inputs as NodeIOItem[]) || [] : node.data.outputs || [];

    if (isIterator) {
      // Check if this iterator is nested inside another iterator
      let outermostIterator: Node | null = null;
      if (node.parentId) {
        let currentParent = nodes.find((n) => n.id === node.parentId);
        while (currentParent) {
          if (currentParent.data?.name === "iterator") {
            outermostIterator = currentParent;
            const grandparent = nodes.find((n) => n.id === currentParent?.parentId);
            if (grandparent?.data?.name === "iterator") {
              currentParent = grandparent;
            } else {
              break;
            }
          } else {
            break;
          }
        }
      }

      if (outermostIterator) {
        // Nested iterator: only show outputs that are enabled in the outermost iterator
        const outermostOutputs = outermostIterator.data.outputs || [];
        rawOutputs = rawOutputs.filter((out) => {
          const output = out as NodeOutput;
          // For nested iterators, only show non-sourced outputs (like raw_response) if they exist in outermost iterator
          if (!output.sourceNodeId || output.sourceNodeId === node.id) {
            // Check if this output is enabled in the outermost iterator
            return outermostOutputs.some((parentOut) => parentOut.sourceNodeId === node.id && parentOut.originalOutputId === output.id);
          }
          return false;
        });
      } else {
        // Top-level iterator: show outputs without sourceNodeId or where sourceNodeId equals the iterator's own ID
        rawOutputs = rawOutputs.filter((out) => {
          const output = out as NodeOutput;
          return !output.sourceNodeId || output.sourceNodeId === node.id;
        });
      }
    }

    // Build hierarchical output structure
    const rootOutputs = buildHierarchicalOutputs(rawOutputs, (out) => ({
      ...out,
      description: "description" in out ? out.description : "",
      icon: VALUE_ICONS_MAP(out.type),
      rowType: "output",
      outputs: [],
    }));

    const nodeData: NodeItemData = {
      id: node.id,
      name: node.data.name || node.type || "unknown",
      title: node.data.title || node.data.label || node.id,
      icon: Icon,
      outputs: rootOutputs,
      rowType: "node",
    };

    nodeMap.set(node.id, nodeData);
    if (isStart && !footerRow) {
      footerRow = nodeData;
    }
  });

  // Second pass: build the tree structure and replace nested children outputs with only enabled ones from iterator
  nodes.forEach((node) => {
    const nodeData = nodeMap.get(node.id);
    if (nodeData) {
      if (node.data?.name === "start") return;

      // If this node is inside an iterator, find the outermost iterator parent
      if (node.parentId) {
        const parentNode = nodeMap.get(node.parentId);
        const originalParentFlowNode = nodes.find((n) => n.id === node.parentId);

        if (parentNode && originalParentFlowNode?.data.name === "iterator") {
          let currentParent = originalParentFlowNode;

          while (currentParent.parentId) {
            const grandparent = nodes.find((n) => n.id === currentParent.parentId);
            if (grandparent && grandparent.data?.name === "iterator") {
              currentParent = grandparent;
            } else {
              break;
            }
          }

          // Only redistribute outputs to non-iterator child nodes
          if (node.data?.name !== "iterator") {
            const immediateParentIteratorOutputs = originalParentFlowNode.data.outputs || [];
            const childOutputs = immediateParentIteratorOutputs.filter((out) => out.sourceNodeId === node.id);

            if (childOutputs.length > 0) {
              // Build hierarchical structure for child outputs
              const rootChildOutputs = buildHierarchicalOutputs(childOutputs, (out) => ({
                ...out,
                id: out.originalOutputId || out.id,
                description: out.description || "",
                icon: VALUE_ICONS_MAP(out.type),
                rowType: "output",
                outputs: [],
                sourceNodeId: out.sourceNodeId,
              }));

              nodeData.outputs = rootChildOutputs;
            } else {
              // No enabled outputs in the immediate parent iterator
              nodeData.outputs = [];
            }
          }

          parentNode.outputs = parentNode.outputs || [];
          parentNode.outputs.push(nodeData);
        } else if (parentNode) {
          // Non-iterator parent or non-nested child
          parentNode.outputs = parentNode.outputs || [];
          parentNode.outputs.push(nodeData);
        }
      } else {
        rootNodes.push(nodeData);
      }
    }
  });

  return { nodes: rootNodes, footer: footerRow };
};

interface IteratorIterableInfo {
  iteratorNodeId: string;
  rawRef: string;
  sourceNodeId: string;
  outputToken: string;
  outputType?: string;
}

const getRawIterableRef = (iteratorNode: Node): { raw: string | null; keywords?: string[] } => {
  const inputs: IteratorNodeInputs = iteratorNode?.data?.inputs as IteratorNodeInputs;
  if (!inputs) return { raw: null };
  const iterable = inputs.iterable;
  if (!iterable) return { raw: null };
  if (typeof iterable === "string") return { raw: iterable || null };
  if (typeof iterable === "object") {
    if (iterable.value) return { raw: String(iterable.value) || null, keywords: iterable.keywords };
    if (Array.isArray(iterable.keywords) && iterable.keywords[2]) {
      return { raw: String(iterable.keywords[2]), keywords: iterable.keywords };
    }
    return { raw: null, keywords: iterable.keywords };
  }
  return { raw: null };
};

const getIteratorIterableOutputInfo = (iteratorNode: Node, allNodes: Node[]): IteratorIterableInfo | null => {
  if (!iteratorNode || iteratorNode.data?.name !== "iterator") return null;
  const ref = getRawIterableRef(iteratorNode);
  const rawRef = ref.raw;
  const keywords = ref.keywords || [];

  if (!rawRef || typeof rawRef !== "string" || !rawRef.includes(".")) return null;

  const [sourceNodeId, outputTokenRaw] = rawRef.split(".");
  if (!sourceNodeId || !outputTokenRaw) return null;
  const outputToken = outputTokenRaw.trim();

  const sourceNode = allNodes.find((n) => n.id === sourceNodeId);
  if (!sourceNode) {
    return { iteratorNodeId: iteratorNode.id, rawRef, sourceNodeId, outputToken };
  }

  const outputs: NodeOutput[] = sourceNode.data?.outputs || [];

  // Helper to recursively find output by ID or key (including nested outputs)
  const findOutputRecursive = (outputs: NodeOutput[], predicate: (o: NodeOutput) => boolean): NodeOutput | undefined => {
    for (const output of outputs) {
      if (predicate(output)) return output;
      if (output.childrenIds && output.childrenIds.length > 0) {
        const nested = outputs.filter((o) => output.childrenIds?.includes(o.id));
        const found = findOutputRecursive(nested, predicate);
        if (found) return found;
      }
    }
    return undefined;
  };

  let matched = findOutputRecursive(outputs, (o) => String(o.id) === outputToken);
  if (!matched) matched = findOutputRecursive(outputs, (o) => String(o.key) === outputToken);
  if (!matched && /^\d+$/.test(outputToken)) {
    const flatOutputs: NodeOutput[] = [];
    const collectAll = (outs: NodeOutput[]) => {
      outs.forEach((o) => {
        flatOutputs.push(o);
        if (o.childrenIds && o.childrenIds.length > 0) {
          const nested = outs.filter((n) => o.childrenIds?.includes(n.id));
          collectAll(nested);
        }
      });
    };
    collectAll(outputs);
    const byIndex = flatOutputs[Number(outputToken)];
    if (byIndex) matched = byIndex;
  }

  if (!matched && keywords[1]) {
    matched = findOutputRecursive(outputs, (o) => String(o.key) === String(keywords[1]));
  }

  return { iteratorNodeId: iteratorNode.id, rawRef, sourceNodeId, outputToken, outputType: matched?.type };
};

const iteratorIterableIsObject = (iteratorNode: Node, allNodes: Node[]): boolean => {
  const info = getIteratorIterableOutputInfo(iteratorNode, allNodes);
  const outputType = (info?.outputType || "").toLowerCase();
  return outputType === "object" || outputType === "list" || outputType.startsWith("list of");
};

/**
 * Determines if a "key" icon should be displayed for descendants of a given iterator, per the new rule:
 * Show key icon only when the iterator's iterable references an Object-typed output.
 *
 * @param iteratorNode The iterator node whose iterable we are inspecting.
 * @param allNodes All flow nodes (needed to resolve references).
 */
const shouldShowKeyIconForIterator = (iteratorNode: Node, allNodes: Node[]): boolean => {
  const isObject = iteratorIterableIsObject(iteratorNode, allNodes);
  if (!isObject) return false;

  let parent: Node | undefined = allNodes.find((n) => n.id === iteratorNode.parentId);
  while (parent && parent.data?.name !== "iterator") {
    parent = allNodes.find((n) => n.id === parent?.parentId);
  }
  if (parent && parent.data?.name === "iterator") {
    const curInputs: any = iteratorNode.data?.inputs || {};
    const parentInputs: any = parent.data?.inputs || {};
    const curIter: any = curInputs.iterable;
    const parentIter: any = parentInputs.iterable;
    const curKeywords: string[] = Array.isArray(curIter?.keywords) ? curIter.keywords : [];
    const curThird = curKeywords[2]; // third element
    const parentValue = parentIter?.value || (Array.isArray(parentIter?.keywords) ? parentIter.keywords[2] : undefined);
    if (!curThird || !parentValue || curThird !== parentValue) return false;
  }
  return true;
};

export const shouldShowKeyIconForNode = (node: Node, allNodes: Node[], ancestorIterator?: Node | null): boolean => {
  if (ancestorIterator && ancestorIterator.data?.name === "iterator") {
    return shouldShowKeyIconForIterator(ancestorIterator, allNodes);
  }
  if (node.data?.name === "iterator") {
    return shouldShowKeyIconForIterator(node, allNodes);
  }
  return false;
};

// ---- Shared mapping validation helpers ----

export const isTypeMismatch = (selectedType?: string | null, expectedType?: string | null): boolean => {
  if (!selectedType || !expectedType) return false;
  const sel = String(selectedType).toLowerCase();
  const exp = String(expectedType).toLowerCase();

  const selIsArray = sel === "array" || sel.includes("list") || sel.startsWith("list of");
  const expIsArray = exp === "array" || exp.includes("list") || exp.startsWith("list of");
  if (selIsArray !== expIsArray) return true;
  if (selIsArray && expIsArray) {
    if (sel === exp) return false;
    const innerSel = sel.replace(/list of\s*/i, "").trim();
    const innerExp = exp.replace(/list of\s*/i, "").trim();
    if (innerSel && innerExp) return innerSel !== innerExp;
    return false;
  }
  return sel !== exp;
};

export const pathExistsInTree = (tree: TreeItem[], targetPath?: string | null): boolean => {
  if (!targetPath) return false;
  const stack: TreeItem[] = [...tree];
  while (stack.length) {
    const it = stack.pop();
    if (!it) continue;
    if ((it as { path?: string }).path === targetPath) return true;
    if (it.children && it.children.length) stack.push(...it.children);
  }
  return false;
};

export const findTypeByPathInTrees = (labelsTree: TreeItem[], inputsTree: TreeItem[], targetPath?: string | null): string | null => {
  if (!targetPath) return null;
  const scan = (tree: TreeItem[]): string | null => {
    const stack: TreeItem[] = [...tree];
    while (stack.length) {
      const it = stack.pop();
      if (!it) continue;
      if ((it as { path?: string }).path === targetPath) return String(it.type || "");
      if (it.children && it.children.length) stack.push(...it.children);
    }
    return null;
  };
  return scan(labelsTree) || scan(inputsTree) || null;
};
