import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { useSubflowContext } from "../../contexts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { getFile, useRestoreConfigurationHistory } from "@/services";
import { useDialogStore } from "@/store";

const RollbackAlertDialog: React.FC<{ onClose: () => void; handleConfirm: () => void }> = ({ onClose, handleConfirm }) => {
  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rollback Live Workflow</AlertDialogTitle>
          <AlertDialogDescription>
            You're about to modify a live workflow.
            <br /> Are you sure you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Yes, Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const VHRestoreButton: React.FC<{ configId: string; onSuccess: (id: string) => void }> = ({ configId, onSuccess }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { fileId, folderId } = useParams<{ fileId: string; folderId: string }>();
  const { mutate: restoreConfiguration, isPending } = useRestoreConfigurationHistory(configId, fileId || "");
  const isSubflowFile = useSubflowContext();

  const fileQuery = queryClient.getQueryData(getFile(fileId || "").queryKey);

  const isLive = fileQuery?.status === "Live" && !fileQuery.parentFileId;

  const handleRestoreVersion = () => {
    const handleConfirm = () => {
      restoreConfiguration(
        {},
        {
          onSuccess: (data) => {
            if (isSubflowFile) {
              navigate(`/canvas/${folderId}/${fileId}/${data}/subflowhistory`);
              onSuccess(data);
              return;
            }
            navigate(`/canvas/${folderId}/${fileId}/${data}/history`);
            onSuccess(data);
          },
        }
      );
    };
    if (isLive) {
      useDialogStore.getState().openDialog(({ onClose }) => <RollbackAlertDialog onClose={onClose} handleConfirm={handleConfirm} />);
      return;
    }
    handleConfirm();
  };

  return (
    <Button className="gap-1 py-2 px-3 h-full" variant="default" onClick={handleRestoreVersion} loading={isPending}>
      <span className="px-1 font-medium leading-6 min-h-4">{isLive ? "Rollback" : "Restore"}</span>
    </Button>
  );
};
