import { useMemo, useEffect, useState, useCallback } from "react";

import { CaretDownIcon, CaretRightIcon, KeyIcon, CircleIcon } from "@phosphor-icons/react";
import { useParams } from "react-router-dom";
import { useShallow } from "zustand/shallow";

import { hasOutputPathMissing, hasOutputTypeMismatch, hasAnyOutputMapped } from "../../mappingHelpers";
import { shouldShowKeyIconForNode, pathExistsInTree } from "../../utils";
import WithTooltip from "@/components/common/WithTooltip";
import { Command, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { TreeItem } from "@/components/ui/tree-view";
import { useDatasetMapping, useDataset } from "@/modules/dataset/hooks";
import type { Node as FlowNode } from "@/modules/flow/types";
import { useGetConfigurationByFileId } from "@/services";
import { FlowStoreState, useFlowStore } from "@/store";
import { cn } from "@/utils";

import type { NodeItemData, RowItemData } from "../types";

interface NodeHeaderCellProps {
  node: NodeItemData;
  level: number;
  isExpanded: boolean;
  canExpand: boolean;
  setExpanded(next: boolean): void;
}

const INDENT_UNIT = 26;

const selector = (state: FlowStoreState) => ({
  alignmentKeys: state.alignmentKeys,
  mappings: state.mappings,
  inputsDict: state.inputsDict,
});

export const NodeHeaderCell = ({ node, level, isExpanded, canExpand, setExpanded }: NodeHeaderCellProps) => {
  const { fileId = "" } = useParams();
  const [isIteratorPopoverOpen, setIsIteratorPopoverOpen] = useState(false);
  const [selectedIteratorKey, setSelectedIteratorKey] = useState<string | null>(null);
  const { data: configData } = useGetConfigurationByFileId(fileId);
  const { setAlignmentKeyErrorsForNode, clearAlignmentKeyErrorsForNode, setAlignmentKey, removeMapping, removeInputDict } = useDatasetMapping();
  const { datasetTreeData, rawFilesData } = useDataset();

  const flowNodes = useMemo<FlowNode[]>(() => configData?.config?.parameters?.nodes || [], [configData?.config]);

  const currentFlowNode = flowNodes.find((n) => n.id === node.id);
  const nodeLabel = currentFlowNode?.data?.label ?? "";
  const isIterator = currentFlowNode?.type === "iterator";

  const { alignmentKeys, mappings, inputsDict } = useFlowStore(useShallow(selector));

  const ancestorIteratorNode = useMemo(() => {
    if (!currentFlowNode) return null;
    let cur = currentFlowNode;
    while (cur?.parentId) {
      const parent = flowNodes.find((n) => n.id === cur!.parentId);
      if (!parent) break;
      if (parent.data?.name === "iterator") return parent;
      cur = parent;
    }
    return null;
  }, [currentFlowNode, flowNodes]);

  const showKeyIcon = useMemo(() => {
    if (!currentFlowNode) return false;
    return shouldShowKeyIconForNode(currentFlowNode, flowNodes, ancestorIteratorNode);
  }, [currentFlowNode, flowNodes, ancestorIteratorNode]);

  const hasAlignmentKey = useMemo(() => alignmentKeys.some((k) => k.nodeId === node.id), [alignmentKeys, node.id]);

  const alignmentKeyPathExists = useMemo(() => {
    const keyPath = alignmentKeys.find((k) => k.nodeId === node.id)?.outputId;
    if (!keyPath) return true;
    return pathExistsInTree(datasetTreeData, keyPath);
  }, [alignmentKeys, datasetTreeData, node.id]);

  const parentAlignmentKeyPath = useMemo(() => {
    if (!ancestorIteratorNode) return null;
    const keyEntry = alignmentKeys.find((k) => k.nodeId === ancestorIteratorNode.id);
    return keyEntry?.outputId || null;
  }, [ancestorIteratorNode, alignmentKeys]);

  const iteratorAncestorDepth = useMemo(() => {
    let depth = 0;
    let cur = currentFlowNode;
    while (cur?.parentId) {
      const parent = flowNodes.find((n) => n.id === cur!.parentId);
      if (!parent) break;
      if (parent.data?.name === "iterator") depth++;
      cur = parent;
    }
    return depth;
  }, [currentFlowNode, flowNodes]);

  // Build alignment key options from arrays at the same level as this iterator
  const iteratorAlignmentGroups = useMemo(() => {
    const items: { value: string; label: string }[] = [];
    if (!isIterator) return [{ objectName: "Alignment Keys", items }];

    const primitiveTypes = new Set(["string", "number", "integer", "boolean"]);
    const seenPaths = new Set<string>();

    const targetDepth = iteratorAncestorDepth + 1;

    // Find arrays at the target depth and collect their primitive keys
    const findArraysAtDepth = (nodes: TreeItem[], currentDepth: number, parentPrefix: string | null) => {
      for (const node of nodes || []) {
        if (!node) continue;

        const nodeType = String(node.type ?? "").toLowerCase();

        // Apply parent alignment key restriction if we have a parent iterator
        if (parentPrefix && node.path && !node.path.startsWith(parentPrefix)) {
          continue;
        }

        if (nodeType === "array") {
          const nextDepth = currentDepth + 1;

          if (nextDepth === targetDepth && node.children) {
            for (const child of node.children) {
              const childType = String(child.type ?? "").toLowerCase();
              if (primitiveTypes.has(childType) && child.path && !seenPaths.has(child.path)) {
                seenPaths.add(child.path);
                items.push({ value: child.path, label: child.name });
              }
            }
          }

          if (node.children) {
            findArraysAtDepth(node.children, nextDepth, parentPrefix);
          }
        } else if (node.children) {
          findArraysAtDepth(node.children, currentDepth, parentPrefix);
        }
      }
    };

    findArraysAtDepth(datasetTreeData, 0, parentAlignmentKeyPath);

    return [{ objectName: "Alignment Keys", items }];
  }, [datasetTreeData, isIterator, iteratorAncestorDepth, parentAlignmentKeyPath]);

  const existingAlignmentKey = alignmentKeys.find((key) => key.nodeId === node.id);
  const hasValue = !!(existingAlignmentKey || selectedIteratorKey);
  const errorDetected = isIterator && showKeyIcon && hasAlignmentKey && !alignmentKeyPathExists;

  const alignmentKeyPathValid = useMemo(() => {
    const keyPath = existingAlignmentKey?.outputId || selectedIteratorKey;
    if (!keyPath) return true;
    return pathExistsInTree(datasetTreeData, keyPath);
  }, [existingAlignmentKey, selectedIteratorKey, datasetTreeData]);

  useEffect(() => {
    if (existingAlignmentKey && !selectedIteratorKey) setSelectedIteratorKey(existingAlignmentKey.outputId);
  }, [existingAlignmentKey, selectedIteratorKey]);

  const alignmentGroupsWithSelection = useMemo(() => {
    const value = existingAlignmentKey?.outputId || selectedIteratorKey;
    if (!value) return iteratorAlignmentGroups;

    const alreadyPresent = iteratorAlignmentGroups.some((g) => g.items.some((i) => i.value === value));
    if (alreadyPresent) return iteratorAlignmentGroups;

    const label = value.split(".").filter(Boolean).pop() || value;
    return [{ objectName: "Current selection", items: [{ value, label }] }, ...iteratorAlignmentGroups];
  }, [iteratorAlignmentGroups, existingAlignmentKey, selectedIteratorKey]);

  const nodeHasMissingPaths = useMemo(() => {
    const outputs = (node.outputs || []).filter((o) => o?.rowType === "output");
    return outputs.some((o) => hasOutputPathMissing(o, node.id, mappings, inputsDict, datasetTreeData as TreeItem[]));
  }, [node.outputs, node.id, mappings, inputsDict, datasetTreeData]);

  const nodeHasTypeMismatch = useMemo(() => {
    const outputs = (node.outputs || []).filter((o) => o?.rowType === "output");
    return outputs.some((o) => hasOutputTypeMismatch(o, node.id, mappings, inputsDict, datasetTreeData as TreeItem[], rawFilesData as TreeItem[]));
  }, [node.outputs, node.id, mappings, inputsDict, datasetTreeData, rawFilesData]);

  const unmapSubtreeOutputs = useCallback(() => {
    const clearOutputMappings = (outputItem: RowItemData, parentId: string) => {
      if (!outputItem) return;

      const mappingKey = `${parentId}-${outputItem.id}`;
      if (mappings[mappingKey]?.jsonPath) {
        removeMapping(parentId, outputItem.id);
      }

      const inputKey = `${parentId}.${outputItem.id}`;
      if (inputsDict[inputKey]) {
        removeInputDict(parentId, outputItem.id);
      }

      if (outputItem.outputs && outputItem.outputs.length > 0) {
        outputItem.outputs.forEach((nestedOutput) => {
          clearOutputMappings(nestedOutput, outputItem.id);
        });
      }
    };

    node.outputs?.forEach((output) => {
      clearOutputMappings(output, node.id);
    });
  }, [node, mappings, inputsDict, removeMapping, removeInputDict]);

  const handleIteratorKeySelect = (value: string, e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    unmapSubtreeOutputs();
    if (isIterator) setSelectedIteratorKey(value);
    setIsIteratorPopoverOpen(false);
    setAlignmentKey(node.id, value);
  };

  // Compute whether any output under this iterator node (including nested outputs) is mapped
  const hasAnyMappedOutput = useMemo(() => {
    return (node.outputs || []).some((o) => hasAnyOutputMapped(o, node.id, mappings));
  }, [node, mappings]);

  const subtreeHasErrors = useMemo(() => {
    const alignmentError = isIterator && showKeyIcon && hasAnyMappedOutput && (!hasAlignmentKey || !alignmentKeyPathExists);
    const pathMissingError = nodeHasMissingPaths;
    return alignmentError || pathMissingError;
  }, [isIterator, showKeyIcon, hasAnyMappedOutput, hasAlignmentKey, alignmentKeyPathExists, nodeHasMissingPaths]);

  // Replicate error aggregation behavior (header-level key errors with refined conditions)
  useEffect(() => {
    const label = nodeLabel || node.title || node.id;
    const msgs: string[] = [];
    // Only show missing alignment key error if there are mapped outputs under this iterator
    if (isIterator && showKeyIcon && hasAnyMappedOutput && !hasAlignmentKey) msgs.push(`Missing alignment key for iterator: ${label}`);
    if (isIterator && showKeyIcon && hasAlignmentKey && !alignmentKeyPathExists) msgs.push(`Alignment key not found in dataset for: ${label}`);
    if (msgs.length) setAlignmentKeyErrorsForNode(node.id, msgs);
    else clearAlignmentKeyErrorsForNode(node.id);
    return () => clearAlignmentKeyErrorsForNode(node.id);
  }, [
    hasAnyMappedOutput,
    alignmentKeyPathExists,
    clearAlignmentKeyErrorsForNode,
    hasAlignmentKey,
    isIterator,
    node.id,
    node.title,
    nodeLabel,
    setAlignmentKeyErrorsForNode,
    showKeyIcon,
  ]);

  const Icon = node.icon;

  return (
    <div className="w-full relative min-w-0">
      {Array(level)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="absolute w-px bg-border" style={{ left: `${(i + 1) * INDENT_UNIT}px`, top: 0, height: "100%" }} />
        ))}
      <div
        className={cn("flex items-center gap-2 py-4 px-1 min-w-0", canExpand ? "cursor-pointer" : "cursor-default")}
        style={{ paddingLeft: `${level * INDENT_UNIT}px` }}
        onClick={() => canExpand && setExpanded(!isExpanded)}
      >
        <div className="w-2 h-2 ml-2 flex items-center justify-center flex-shrink-0">
          {!isExpanded && subtreeHasErrors && <CircleIcon className="text-destructive" size={8} weight="fill" />}
          {!isExpanded && nodeHasTypeMismatch && !subtreeHasErrors && <CircleIcon className="text-warning" size={8} weight="fill" />}
        </div>
        <div className="w-3 h-4 flex items-center justify-center flex-shrink-0">
          {canExpand ? isExpanded ? <CaretDownIcon size={14} /> : <CaretRightIcon size={14} /> : <div className="w-3 h-4" />}
        </div>
        <Icon size={16} className="text-muted-foreground flex-shrink-0" />
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-sm text-foreground truncate">{nodeLabel || node.title}</span>
        </div>
        {isIterator && showKeyIcon && (
          <Popover open={isIteratorPopoverOpen} onOpenChange={setIsIteratorPopoverOpen}>
            <WithTooltip
              withProvider
              disableTooltip={isIteratorPopoverOpen}
              side="bottom"
              align="start"
              contentClassName={cn("p-2 max-w-[15rem]")}
              tooltip={
                hasValue && alignmentKeyPathValid ? (
                  <div className="space-y-2">
                    <p className="text-xs text-foreground">Alignment key is required for dictionary iterators to align samples for evaluation.</p>
                  </div>
                ) : !hasValue ? (
                  <div className="space-y-2">
                    <p className="text-xs text-foreground">Select a label-based alignment key for this iterator.</p>
                  </div>
                ) : !alignmentKeyPathValid ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold">Alignment key missing in dataset</p>
                    <p className="text-xs">Selected alignment key path does not exist in dataset labels.</p>
                  </div>
                ) : null
              }
            >
              <PopoverTrigger
                data-no-expand
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className={cn(
                  "flex items-start justify-center cursor-pointer w-6 h-6 rounded-lg hover:bg-muted/50",
                  isIteratorPopoverOpen && "border-2 border-foreground"
                )}
              >
                <KeyIcon
                  size={16}
                  weight="fill"
                  className={cn(errorDetected ? "text-destructive" : hasValue && alignmentKeyPathValid ? "text-foreground" : "text-muted-foreground")}
                />
              </PopoverTrigger>
            </WithTooltip>

            <PopoverContent className="w-64 p-0" align="start">
              <Command>
                <CommandList>
                  {iteratorAlignmentGroups.length > 0 ? (
                    <div className="max-h-72 overflow-y-auto py-1">
                      {alignmentGroupsWithSelection.map((group, gi) => (
                        <div key={`grp-${gi}`} className="px-1 py-1">
                          {group.items.map((item, ii) => {
                            const selected = existingAlignmentKey?.outputId === item.value || selectedIteratorKey === item.value;
                            return (
                              <div
                                key={`grp-${gi}-itm-${ii}-${item.value}`}
                                className={cn(
                                  "flex items-center gap-2 rounded py-1 px-2 text-sm cursor-pointer hover:bg-muted/40",
                                  selected && "bg-muted/60"
                                )}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => handleIteratorKeySelect(item.value, e)}
                              >
                                <span className="text-foreground truncate">{item.label}</span>
                                {selected && <span className="ml-auto text-[10px] text-muted-foreground">Selected</span>}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-2 text-xs text-muted-foreground">No alignment keys available</div>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default NodeHeaderCell;
