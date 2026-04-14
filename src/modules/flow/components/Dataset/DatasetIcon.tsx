import { DatabaseIcon } from "@phosphor-icons/react";

import useDatasetUploadStore from "@/store/datasetUploadStore";
import { cn } from "@/utils";

const DatasetNotification = () => {
  const lastUpload = useDatasetUploadStore((state) => state.uploads[state.uploads.length - 1]);

  return (
    <div
      className={cn(
        "border-2 border-sidebar-accent rounded-full size-2.5 bg-success absolute bottom-0.5 left-0.5 -translate-x-1/2 translate-y-1/2 hidden",
        lastUpload?.status === "completed" && "block bg-success",
        lastUpload?.status === "error" && "block bg-destructive"
      )}
    />
  );
};

export const DatasetIcon = () => {
  return (
    <div className="relative">
      <DatabaseIcon size={20} />
      <DatasetNotification />
    </div>
  );
};
