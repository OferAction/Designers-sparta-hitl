import { useState } from "react";

import { DotsThreeVerticalIcon } from "@phosphor-icons/react";

import { useDeleteEvaluation, usePauseResumeEvaluation } from "../services";
import { EvaluationStatus } from "../types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteConfiramtionDialog from "@/modules/flow/components/ContextualPanel/DeleteConfiramtionDialog";
import { cn } from "@/utils";

export function EvaluationActions({
  cardId,
  runningStatus,
  onDeleteSuccess,
}: {
  cardId: string;
  runningStatus: EvaluationStatus;
  onDeleteSuccess?: () => void;
}) {
  const { mutate: handleDelete, isPending: isDeletePending } = useDeleteEvaluation(cardId, onDeleteSuccess);
  const { mutate } = usePauseResumeEvaluation(cardId, runningStatus);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const isRunning = runningStatus === "Running";
  const isPaused = runningStatus === "Paused";
  const actionLabel = isRunning ? "Stop Evaluation" : isPaused ? "Resume Evaluation" : null;

  const handlePauseResume = () => {
    mutate({ $pausing: isRunning ? "pause" : "resume" });
  };

  return (
    <section className="absolute top-3 right-3 w-fit">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" aria-label="Open menu" className="bg-transparent border-0 shadow-none">
            <DotsThreeVerticalIcon size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="start" side="right">
          <DropdownMenuGroup>
            <DropdownMenuItem
              className={cn(
                "cursor-pointer text-foreground",
                isRunning && "focus:text-destructive focus:bg-destructive/10 text-destructive",
                actionLabel ? "" : "hidden"
              )}
              onSelect={handlePauseResume}
            >
              <Button variant="ghost" className={cn("p-0 justify-start", isRunning && "hover:text-destructive hover:bg-transparent")}>
                {actionLabel}
              </Button>
            </DropdownMenuItem>
            <DropdownMenuSeparator className={cn(actionLabel ? "" : "hidden")} />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              onSelect={() => {
                setShowDeleteConfirmation(true);
              }}
            >
              Delete Evaluation
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteConfiramtionDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={() => handleDelete()}
        loading={isDeletePending}
        description="Are you sure you want to delete this evaluation? This action cannot be undone."
        title="Delete evaluation"
      />
    </section>
  );
}
