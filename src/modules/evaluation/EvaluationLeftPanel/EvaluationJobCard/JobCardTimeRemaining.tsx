import { WarningIcon } from "@phosphor-icons/react";

import { formatDuration } from "../../utils";
import { Label } from "@/components/ui/label";
import { EvaluationStatus } from "@/modules/evaluation/types";

interface JobCardTimeRemainingProps {
  completedPercentage: number;
  executedSamples: number;
  runningTime: string;
  remainingTime: string;
  runningStatus: EvaluationStatus;
}

export const JobCardTimeRemaining = ({
  completedPercentage,
  executedSamples,
  runningTime,
  remainingTime,
  runningStatus,
}: JobCardTimeRemainingProps) => {
  return (
    <div className="flex flex-row justify-between w-full gap-3">
      <Label className="text-sm text-muted-foreground/70 leading-5 w-44">
        {completedPercentage?.toFixed(2)}% ({executedSamples} sample{executedSamples !== 1 && "s"})
      </Label>
      <Label className="text-sm text-muted-foreground/70 leading-5">{formatDuration(runningTime)}</Label>
      <Label className="text-sm text-muted-foreground/70 leading-5">
        {runningStatus === "Paused" && "Paused"}
        {runningStatus === "Running" && `~ ${formatDuration(remainingTime)} left`}
        {runningStatus === "Failed" && (
          <span className="text-destructive flex gap-1 items-center">
            Failed <WarningIcon weight="fill" />
          </span>
        )}
      </Label>
    </div>
  );
};
