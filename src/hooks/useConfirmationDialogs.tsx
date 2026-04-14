import { useCallback, useRef, useState, useEffect } from "react";

import { useShallow } from "zustand/shallow";

import { useSubflowContext, useViewSubflowContext } from "@/modules/flow";
import { SaveBeforeRunDialog } from "@/modules/flow/components/ContextualPanel/SaveBeforeRunDialog";
import { FlowStoreState, useDialogStoreActions, useFlowStore } from "@/store";

const saveSelector = (state: FlowStoreState) => ({
  hasUnsavedChanges: state.hasUnsavedChanges,
});

export function useRunWithSaveCheck() {
  const { hasUnsavedChanges } = useFlowStore(useShallow(saveSelector));
  const pendingActionRef = useRef<((configId: string) => void) | null>(null);
  const { openDialog } = useDialogStoreActions();
  const isViewOnlyContext = useViewSubflowContext();
  const isSubflowNodeContext = useSubflowContext();

  const handleCloseDialog = useCallback(() => {
    pendingActionRef.current = null;
  }, []);

  const handleProceedWithRun = useCallback((configId: string) => {
    pendingActionRef.current?.(configId);
    pendingActionRef.current = null;
  }, []);

  const runWithSaveCheck = useCallback(
    (runAction: (configId?: string) => void) => {
      if (hasUnsavedChanges()) {
        pendingActionRef.current = runAction;
        openDialog(({ id, onClose }) => (
          <SaveBeforeRunDialog
            id={id}
            isOpen={true}
            onClose={() => {
              handleCloseDialog();
              onClose();
            }}
            onProceed={handleProceedWithRun}
            isViewOnly={isViewOnlyContext}
            isSubflowNode={isSubflowNodeContext}
          />
        ));
      } else {
        runAction();
      }
    },
    [hasUnsavedChanges, openDialog, handleProceedWithRun, isViewOnlyContext, isSubflowNodeContext, handleCloseDialog]
  );

  return {
    runWithSaveCheck,
    handleCloseDialog,
    handleProceedWithRun,
  };
}

export function useCancelWithConfirmCheck(isLoading?: boolean) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const pendingCancelActionRef = useRef<(() => void) | null>(null);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    pendingCancelActionRef.current = null;
  }, []);

  useEffect(() => {
    if (isLoading === false && dialogOpen) {
      handleCloseDialog();
    }
  }, [isLoading, dialogOpen, handleCloseDialog]);

  const handleConfirmCancel = useCallback(() => {
    pendingCancelActionRef.current?.();
    pendingCancelActionRef.current = null;
    setDialogOpen(false);
  }, []);

  const cancelWithConfirmCheck = useCallback((cancelAction: () => void) => {
    pendingCancelActionRef.current = cancelAction;
    setDialogOpen(true);
  }, []);

  return {
    cancelWithConfirmCheck,
    cancelDialogIsOpen: dialogOpen,
    handleCloseCancelDialog: handleCloseDialog,
    handleConfirmCancel,
  };
}
