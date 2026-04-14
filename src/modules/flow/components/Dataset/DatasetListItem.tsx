import { DatabaseIcon, FlowArrowIcon } from "@phosphor-icons/react";
import moment from "moment";

import { cn } from "@/lib/utils";
import { DatasetResponse } from "@/modules/flow/types";

interface DatasetListItemProps {
  dataset: DatasetResponse;
  isSelected: boolean;
  onClick: (datasetId: string) => void;
}

export function DatasetListItem({ dataset, isSelected, onClick }: DatasetListItemProps) {
  return (
    <div
      className={cn("flex items-center gap-4 p-3 cursor-pointer transition-colors hover:bg-accent/50", isSelected && "bg-accent")}
      onClick={() => onClick(dataset.activeVersionId)}
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-10 h-10 border border-border rounded-md flex items-center justify-center bg-background">
        <DatabaseIcon size={24} className="text-foreground" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="font-medium text-base text-foreground truncate leading-none">{dataset.name}</div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground font-semibold">
            {dataset.samplesCount} item{dataset.samplesCount !== 1 ? "s" : ""}
          </div>
          {dataset.configurationNames && dataset.configurationNames.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FlowArrowIcon size={14} className="text-muted-foreground" />
              <span>
                {dataset.configurationNames.slice(0, 2).join(", ")}
                {dataset.configurationNames.length > 2 && ` +${dataset.configurationNames.length - 2}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Timestamp */}
      <div className="flex-shrink-0 text-sm text-muted-foreground">{moment(dataset.createdTime).fromNow()}</div>
    </div>
  );
}
