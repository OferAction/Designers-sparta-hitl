import { CheckCircleIcon, WarningIcon, SpinnerGapIcon as Loader2Icon } from "@phosphor-icons/react";

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useFlowStore } from "@/store";
import useDatasetUploadStore from "@/store/datasetUploadStore";

export const DatasetIndicator = ({ showWhenAutoConnected = false }: { showWhenAutoConnected?: boolean }) => {
  const lastUpload = useDatasetUploadStore((state) => state.uploads[state.uploads.length - 1]);
  const error = useDatasetUploadStore((state) => state.error);
  const selectedDatasetId = useFlowStore((state) => state.selectedDatasetId);

  if (!lastUpload) return null;
  if (showWhenAutoConnected && !lastUpload.autoConnect) return null;

  switch (lastUpload.status) {
    case "uploading":
      return <Loader2Icon className="w-4 h-4 animate-spin text-purple-accent" />;
    case "completed":
      return <CheckCircleIcon className="w-4 h-4 text-success" />;
    case "error":
      return (
        <Tooltip>
          <TooltipTrigger
            onClick={(e) => {
              e.stopPropagation();
              lastUpload.onRetry?.();
            }}
          >
            <WarningIcon className="w-4 h-4 text-destructive pointer-events-auto" />
          </TooltipTrigger>
          <TooltipContent>{error}</TooltipContent>
        </Tooltip>
      );
    default:
      if (selectedDatasetId) {
        return <CheckCircleIcon className="w-4 h-4 text-success" />;
      }
      return null;
  }
};
