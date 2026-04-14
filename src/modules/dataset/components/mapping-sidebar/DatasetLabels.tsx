import { useState } from "react";

import { ArrowsInLineVerticalIcon } from "@phosphor-icons/react";

import { Loader } from "@/components/common/Loader";
import { TreeItem, TreeView } from "@/components/ui/tree-view";
import { useDataset, useSelectedDataset } from "@/modules/dataset/hooks";
import { cn } from "@/utils";

interface DatasetSectionProps {
  title: string;
  data: TreeItem[];
  isExpanded: boolean;
  toggleExpanded: () => void;
  selectedDatasetId: string | null;
  isLoading: boolean;
}

function DatasetSection({ title, data, isExpanded, toggleExpanded, selectedDatasetId, isLoading }: DatasetSectionProps) {
  return (
    <div className="text-muted-foreground py-2">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-normal">{title}</h3>
        <button
          onClick={toggleExpanded}
          className="hover:text-foreground transition-colors cursor-pointer"
          aria-label={isExpanded ? `Collapse ${title.toLowerCase()}` : `Expand ${title.toLowerCase()}`}
        >
          <ArrowsInLineVerticalIcon
            size={16}
            weight="regular"
            className={cn("text-foreground transition-transform duration-200", isExpanded ? "rotate-0" : "rotate-90")}
          />
        </button>
      </div>

      {isExpanded && (
        <>
          {data.length > 0 ? (
            <TreeView data={data} draggable={true} showSample={true} className="space-y-2" />
          ) : (
            <div className="text-xs text-muted-foreground py-4 text-center">
              {selectedDatasetId ? (
                isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader size={14} />
                    <span>Loading dataset structure...</span>
                  </div>
                ) : (
                  `No ${title.toLowerCase()} data available`
                )
              ) : (
                "No dataset selected"
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DatasetLabels() {
  const { datasetTreeData, rawFilesData, isLoading } = useDataset();
  const { selectedDatasetId } = useSelectedDataset();
  const [isLabelsExpanded, setIsLabelsExpanded] = useState(true);
  const [isInputKeysExpanded, setIsInputKeysExpanded] = useState(true);

  const toggleLabelsExpanded = () => {
    setIsLabelsExpanded(!isLabelsExpanded);
  };

  const toggleInputKeysExpanded = () => {
    setIsInputKeysExpanded(!isInputKeysExpanded);
  };

  return (
    <div className="flex flex-col">
      {/* Input Keys Section */}
      <DatasetSection
        title="Input keys"
        data={rawFilesData}
        isExpanded={isInputKeysExpanded}
        toggleExpanded={toggleInputKeysExpanded}
        selectedDatasetId={selectedDatasetId}
        isLoading={isLoading}
      />

      {/* Divider */}
      <div className="border-t border-border my-2" />

      {/* Labels Section */}
      <DatasetSection
        title="Labels"
        data={datasetTreeData}
        isExpanded={isLabelsExpanded}
        toggleExpanded={toggleLabelsExpanded}
        selectedDatasetId={selectedDatasetId}
        isLoading={isLoading}
      />
    </div>
  );
}

export default DatasetLabels;
