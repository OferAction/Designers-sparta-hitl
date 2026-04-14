import { useState, useMemo, useCallback } from "react";

import { LinkBreakIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/shallow";

import { findMetaByPath, extractFieldNameFromPath } from "../../utils";
import type { TreeItem } from "@/components/ui/tree-view";
import VariableTag from "@/modules/dataset/components/mapping-grid/VariableTag";
import { useDatasetMapping, useDataset } from "@/modules/dataset/hooks";
import type { NodeOutput } from "@/modules/flow/types";
import { FlowStoreState, useFlowStore } from "@/store";
import { cn } from "@/utils";

import type { NodeItemData } from "../types";

const INDENT_UNIT = 26;

interface NodeColumnCellProps {
  node: NodeItemData;
  output: NodeOutput;
  isStartNode?: boolean;
  level: number;
  actualNodeId?: string;
}

const selector = (state: FlowStoreState) => ({
  mappings: state.mappings,
  inputsDict: state.inputsDict,
});

type DataItemRef = Pick<TreeItem, "name" | "type" | "sample"> & { path: string };

const NodeColumnCell = ({ node, output, isStartNode = false, level, actualNodeId }: NodeColumnCellProps) => {
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const { removeMapping, removeInputDict, setMapping, setInputDict } = useDatasetMapping();
  const { datasetTreeData } = useDataset();

  const { mappings, inputsDict } = useFlowStore(useShallow(selector));

  const effectiveNodeId = actualNodeId || node.id;

  const mappedItem = useMemo<DataItemRef | null>(() => {
    const key = `${effectiveNodeId}-${output.id}`;
    const map = mappings[key];
    if (!map?.jsonPath) return null;
    const meta = findMetaByPath(datasetTreeData, map.jsonPath);
    const name = map.dataItem.name || extractFieldNameFromPath(map.jsonPath);
    const type = meta?.type || map.dataItem.type || "Unknown";
    const sample = meta?.sample || map.dataItem.sample || "";

    return { name, type, sample, path: map.jsonPath };
  }, [datasetTreeData, mappings, effectiveNodeId, output.id]);

  const mappedInput = useMemo<DataItemRef | null>(() => {
    const key = `${effectiveNodeId}.${output.id}`;
    const path = inputsDict[key];
    if (!path) return null;
    return { name: extractFieldNameFromPath(path), type: "Unknown", sample: "", path };
  }, [inputsDict, effectiveNodeId, output.id]);

  const onUnmap = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isStartNode) {
      if (mappedItem) removeMapping(effectiveNodeId, output.id);
      if (mappedInput) removeInputDict(effectiveNodeId, output.id);
    } else {
      if (mappedItem) removeMapping(effectiveNodeId, output.id);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggedOver(false);
      try {
        const raw = e.dataTransfer.getData("text/plain");
        if (!raw) return;
        const dragData = JSON.parse(raw);
        const jsonPath = dragData.path && String(dragData.path);
        if (!jsonPath) return;

        // TODO: This is a technical debt and isn't reliable, change it to a more correct approach that doesn't rely on the id/jsonPath structure
        const isInputKey = jsonPath.includes("inputs");
        const isLabel = jsonPath.includes("labels");

        if (isStartNode) {
          if (isInputKey) {
            removeMapping(effectiveNodeId, output.id);
            setInputDict(effectiveNodeId, output.id, jsonPath);
          } else if (isLabel) {
            setMapping(
              effectiveNodeId,
              output.id,
              { name: dragData.name || extractFieldNameFromPath(jsonPath), type: "string", sample: "", path: jsonPath },
              jsonPath
            );
            const existing = inputsDict[`${effectiveNodeId}.${output.id}`];
            if (!existing || !existing.includes("inputs")) {
              setInputDict(effectiveNodeId, output.id, jsonPath);
            }
          }
        } else if (isLabel) {
          setMapping(
            effectiveNodeId,
            output.id,
            { name: dragData.name || extractFieldNameFromPath(jsonPath), type: "string", sample: "", path: jsonPath },
            jsonPath
          );
        }
      } catch (err) {
        console.error("Drop error:", err);
      }
    },
    [inputsDict, isStartNode, effectiveNodeId, output.id, removeMapping, setInputDict, setMapping]
  );

  const isConnected = !!(isStartNode ? mappedInput || mappedItem : mappedItem);

  return (
    <div className="p-2">
      {Array(level)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="absolute w-px bg-border" style={{ left: `${(i + 1) * INDENT_UNIT}px`, top: 0, height: "100%" }} />
        ))}
      <div
        className="relative overflow-hidden"
        style={{
          paddingLeft: `${level * 6}px`,
        }}
      >
        <div className="w-full relative min-w-0">
          <div className="h-full flex items-center gap-2 px-1 relative min-w-0" style={{ paddingLeft: `${level * INDENT_UNIT}px` }}>
            <div className="flex-1 min-w-0">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggedOver(true);
                }}
                onDragLeave={(e) => {
                  const { left, right, top, bottom } = e.currentTarget.getBoundingClientRect();
                  if (e.clientX < left || e.clientX > right || e.clientY < top || e.clientY > bottom) setIsDraggedOver(false);
                }}
                className={cn(isDraggedOver && "border-2 border-dashed border-primary bg-primary/5 rounded", "min-w-0")}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex-1 min-w-0">
                    <VariableTag label={output.key} type={output.type} isActive={true} isConnected={isConnected} />
                  </div>
                  {(mappedItem || (isStartNode && mappedInput)) && (
                    <LinkBreakIcon
                      size={15}
                      className="group-hover/row:opacity-100 opacity-0 text-muted-foreground hover:text-primary cursor-pointer transition-colors flex-shrink-0"
                      onClick={onUnmap}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeColumnCell;
