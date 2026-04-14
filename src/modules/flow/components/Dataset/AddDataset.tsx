import { useEffect } from "react";

import { useParams } from "react-router-dom";

import { ConnectDatasetDialog } from "./ConnectDatasetDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetConfigurationDatasetMappingById } from "@/modules/dataset/services";
import { useDialogStoreActions, useFlowStore } from "@/store";
import useDatasetUploadStore from "@/store/datasetUploadStore";

export const AddDataset = () => {
  const isConnected = useFlowStore((state) => !!state.selectedDatasetId);
  const setSelectedDatasetId = useFlowStore((state) => state.setSelectedDatasetId);
  const lastUpload = useDatasetUploadStore((state) => state.uploads[state.uploads.length - 1]);
  const { openDialog } = useDialogStoreActions();
  const { fileId } = useParams();

  const { data } = useGetConfigurationDatasetMappingById(fileId ? fileId : "");
  useEffect(() => {
    if (data?.datasetVersionId) {
      setSelectedDatasetId(data.datasetVersionId);
    }
  }, [data?.datasetVersionId, setSelectedDatasetId]);

  const handleConnect = () => {
    openDialog(({ id, onClose }) => <ConnectDatasetDialog id={id} onClose={onClose} />);
  };

  if (isConnected || (lastUpload?.status !== "error" && lastUpload?.autoConnect)) {
    return null;
  }

  return (
    <div className="pb-3">
      <div className={cn("bg-card border border-border rounded-lg overflow-hidden", "shadow-sm")}>
        {/* Header */}
        <div className="p-4 space-y-1.5">
          <h3 className="font-medium text-base text-foreground">Connect a Dataset</h3>
          <p className="text-sm text-muted-foreground">We recommend to start by adding a dataset.</p>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <Button variant="purple" size="sm" className="w-full text-purple-accent-foreground" onClick={handleConnect}>
            Connect
          </Button>
        </div>
      </div>
    </div>
  );
};
