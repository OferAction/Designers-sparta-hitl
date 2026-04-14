import { FC, useCallback } from "react";

import { ConfirmationDialog } from "../ConfirmationDialog";

interface CancelConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const CancelConfirmationDialog: FC<CancelConfirmationDialogProps> = ({ isOpen, onClose, onConfirm }) => {
  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Confirm Cancellation"
      description="Are you sure you want to cancel the running orchestration? This action cannot be undone."
      confirmLabel="Yes, cancel"
      cancelLabel="No, keep running"
      confirmVariant="destructive"
    />
  );
};
