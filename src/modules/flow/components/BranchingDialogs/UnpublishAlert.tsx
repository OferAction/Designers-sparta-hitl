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
import { useUnpublishBranch } from "@/modules/flow/services";

interface UnpublishAlertProps {
  id: string;
  onClose: () => void;
  branchId: string;
}

export function UnpublishAlert({ onClose, branchId }: UnpublishAlertProps) {
  const { mutate } = useUnpublishBranch();
  const handleConfirm = () => {
    mutate({
      $fileId: branchId,
    });
    onClose();
  };

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unpublish This Workflow</AlertDialogTitle>
          <AlertDialogDescription>
            Unpublishing will remove this workflow from production.
            <br />
            Are you sure you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Unpublish</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
