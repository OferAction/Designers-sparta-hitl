import { useMemo, useState } from "react";

import DataItemSelector from "../../DataItemSelector";
import { filterDatasetTreeByAlignment, extractFieldNameFromPath, findMetaByPath } from "../../utils";
import { useDataset } from "@/modules/dataset/hooks";
import { useDatasetMapping } from "@/modules/dataset/hooks";
import { useFlowStore } from "@/store";

interface MatchedLabelsCellProps {
  nodeId: string;
  outputId: string;
  isStartNode?: boolean;
  expectedType?: string | null;
  alignmentKeyFilterPath?: string | null;
}

function MatchedLabelsCell({ nodeId, outputId, expectedType, alignmentKeyFilterPath = null }: MatchedLabelsCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { datasetTreeData } = useDataset();
  const { setMapping } = useDatasetMapping();
  const mappings = useFlowStore((state) => state.mappings);

  const selectedItem = useMemo(() => {
    const map = mappings[`${nodeId}-${outputId}`];
    if (!map?.jsonPath) return null;
    const name = map.dataItem.name || extractFieldNameFromPath(map.jsonPath);
    const meta = findMetaByPath(datasetTreeData, map.jsonPath);
    const type = meta?.type || map.dataItem.type || "Unknown";
    const sample = meta?.sample || map.dataItem.sample || "";
    return { name, type, sample, path: map.jsonPath };
  }, [mappings, nodeId, outputId, datasetTreeData]);

  const isMissing = useMemo(() => {
    if (!selectedItem || !selectedItem.path) return false;
    const target = selectedItem.path;
    const stack = [...datasetTreeData];
    while (stack.length) {
      const item = stack.pop()!;
      if (item.path === target) return false;
      if (item.children && item.children.length) stack.push(...item.children);
    }
    return !!selectedItem;
  }, [datasetTreeData, selectedItem]);

  const filteredDatasetTreeData = useMemo(() => {
    return filterDatasetTreeByAlignment(alignmentKeyFilterPath, datasetTreeData);
  }, [alignmentKeyFilterPath, datasetTreeData]);

  return (
    <DataItemSelector
      datasetTreeData={filteredDatasetTreeData}
      onDataItemSelect={(item) => {
        const path = item.path;
        if (!path) return;
        setMapping(nodeId, outputId, item, path);
      }}
      selectedItem={selectedItem}
      expectedType={expectedType}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      isError={isMissing}
      errorMessage={isMissing ? "Missing data column. click to replace" : undefined}
    />
  );
}

export default MatchedLabelsCell;
