import { useEffect, useCallback } from "react";

import { useBlocker } from "react-router-dom";
import { useShallow } from "zustand/shallow";

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
import { useSaveOrchestration } from "@/modules/flow/hooks";
import { FlowStoreState, useFlowStore } from "@/store";

const selector = (state: FlowStoreState) => ({
  hasUnsavedChanges: state.hasUnsavedChanges,
});

type Blocker = {
  state: string;
  proceed?: () => void;
  reset?: () => void;
};

export const UnsavedChangesGuard = () => {
  const { hasUnsavedChanges } = useFlowStore(useShallow(selector));
  const { onSaveOrchestration, isPending } = useSaveOrchestration();
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => hasUnsavedChanges() && currentLocation.pathname !== nextLocation.pathname
  ) as Blocker;

  useEffect(() => {
    if (blocker.state === "proceeding") {
      blocker.reset?.();
    }
  }, [blocker.state, blocker]);

  const handleSaveAndProceed = useCallback(() => {
    onSaveOrchestration({
      shouldNavigate: false,
      onSuccess: () => {
        if (blocker.state === "blocked") {
          blocker.proceed?.();
        }
      },
    });
  }, [blocker, onSaveOrchestration]);

  const handleProceedOnly = useCallback(() => {
    blocker.proceed?.();
  }, [blocker]);

  const handleCancel = useCallback(() => {
    blocker.reset?.();
  }, [blocker]);

  const open = blocker.state === "blocked" || isPending;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave Page?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>Do you really want to leave this page? Any changes you haven't saved will be lost.</AlertDialogDescription>{" "}
        <AlertDialogFooter className="flex justify-between">
          <div className="flex gap-2 mr-auto">
            <AlertDialogCancel asChild>
              <Button onClick={handleCancel} disabled={isPending} variant="outline">
                Cancel
              </Button>
            </AlertDialogCancel>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleProceedOnly} disabled={isPending}>
              Proceed
            </Button>
            <AlertDialogAction asChild>
              <Button variant="default" onClick={handleSaveAndProceed} loading={isPending}>
                Save and Proceed
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
