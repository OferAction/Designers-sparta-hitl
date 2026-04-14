import { useState } from "react";

import { CaretDownIcon } from "@phosphor-icons/react";

import DataItemSelector from "../../DataItemSelector";
import { isTypeMismatch } from "../../utils";
import { Button } from "@/components/ui/button";
import { TreeItem } from "@/components/ui/tree-view";
import { useDataset } from "@/modules/dataset/hooks";
import { cn } from "@/utils";

interface MatchedDataItemCellProps {
  onDataItemSelect?: (item: TreeItem) => void;
  selectedItem?: TreeItem | null;
  expectedType?: string | null;
}

function MatchedDataItemCell({ onDataItemSelect, selectedItem, expectedType }: MatchedDataItemCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { datasetTreeData, rawFilesData } = useDataset();

  const handleSelectingLabel = () => {
    setIsOpen(true);
  };

  const renderTrigger = () => {
    if (selectedItem) {
      const mismatch = selectedItem && expectedType ? isTypeMismatch(selectedItem.type, expectedType) : false;

      return (
        <div className="flex items-center min-h-[32px] min-w-0">
          <div className={cn("text-sm flex items-center truncate min-w-0", mismatch ? "text-warning" : "text-foreground")}>{selectedItem?.name}</div>
          <div className="flex-shrink-0">
            <CaretDownIcon
              size={16}
              weight="regular"
              className={cn("m-2 group-hover/row:inline-block hidden", isOpen && "inline-block")}
              onClick={handleSelectingLabel}
            />
          </div>
        </div>
      );
    }
    return (
      <Button variant="blue" size="sm" className="justify-start" onClick={handleSelectingLabel}>
        Select data item...
      </Button>
    );
  };

  return (
    <div className="px-4 py-2">
      <DataItemSelector
        datasetTreeData={datasetTreeData}
        inputKeysData={rawFilesData}
        onDataItemSelect={onDataItemSelect}
        selectedItem={selectedItem}
        expectedType={expectedType}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        triggerContent={renderTrigger()}
        showVisibilityControl={false}
      />
    </div>
  );
}

export default MatchedDataItemCell;
