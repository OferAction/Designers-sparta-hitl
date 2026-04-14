import { useMemo } from "react";

import MatchedDataItemCell from "./MatchedDataItemCell";
import { extractFieldNameFromPath } from "../../utils";
import type { TreeItem } from "@/components/ui/tree-view";
import { useDatasetMapping } from "@/modules/dataset/hooks";
import { useFlowStore } from "@/store";

interface StartMatchedDataItemCellProps {
  nodeId: string;
  outputId: string;
  expectedType?: string | null;
}

function StartMatchedDataItemCell({ nodeId, outputId, expectedType = null }: StartMatchedDataItemCellProps) {
  const inputsDict = useFlowStore((state) => state.inputsDict);
  const { setInputDict } = useDatasetMapping();

  const selectedItem = useMemo(() => {
    const key = `${nodeId}.${outputId}`;
    const path = inputsDict[key];
    return path ? { name: extractFieldNameFromPath(path), type: "Unknown", sample: "", path } : null;
  }, [inputsDict, nodeId, outputId]);

  const handleSelect = (item: TreeItem) => {
    const rawPath = item.path;
    if (!rawPath) return;
    setInputDict(nodeId, outputId, rawPath);
  };

  return <MatchedDataItemCell selectedItem={selectedItem} onDataItemSelect={handleSelect} expectedType={expectedType} />;
}

export default StartMatchedDataItemCell;
