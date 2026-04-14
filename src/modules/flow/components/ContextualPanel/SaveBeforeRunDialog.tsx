import { FC, useCallback } from "react";

import { ConfirmationDialog } from "./ConfirmationDialog";
import { useSaveOrchestration, UseSaveOrchestrationOptions } from "@/modules/flow/hooks";

interface SaveBeforeRunDialogProps extends Required<UseSaveOrchestrationOptions> {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  onProceed: (configId: string) => void;
}

export const SaveBeforeRunDialog: FC<SaveBeforeRunDialogProps> = ({ isOpen, onClose, onProceed, ...rest }) => {
  const { isPending, onSaveOrchestration } = useSaveOrchestration(rest);

  const handleSaveAndRun = useCallback(() => {
    onSaveOrchestration({
      onSuccess: (data) => {
        onProceed(data.id);
        onClose();
      },
    });
  }, [onSaveOrchestration, onProceed, onClose]);

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleSaveAndRun}
      title="Unsaved Changes"
      description="You have unsaved changes in your workflow. What would you like to do?"
      confirmLabel="Save and run"
      cancelLabel="Cancel"
      loading={isPending}
    />
  );
};
