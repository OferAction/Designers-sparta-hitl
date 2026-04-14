import { cva } from "class-variance-authority";

import { Progress } from "@/components/ui/progress";
import { EvaluationStatus } from "@/modules/evaluation/types";

export const progressBarVariants = cva("overflow-hidden bg-sidebar-accent rounded-full w-full flex", {
  variants: {
    status: {
      Failed: "group-hover/card:bg-destructive/20",
      Running:
        "group-hover/card:bg-gradient-to-r group-hover/card:from-teal-300/10 group-hover/card:via-purple-500/10 group-hover/card:to-rose-500/10",
      Pending:
        "group-hover/card:bg-gradient-to-r group-hover/card:from-teal-300/10 group-hover/card:via-purple-500/10 group-hover/card:to-rose-500/10",
      Paused:
        "group-hover/card:bg-gradient-to-r group-hover/card:from-teal-300/10 group-hover/card:via-purple-500/10 group-hover/card:to-rose-500/10",
      Finished: "",
    },
    selected: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      status: "Failed",
      selected: true,
      class: "bg-destructive/20",
    },
  ],
  defaultVariants: {
    status: "Pending",
    selected: false,
  },
});

export const progressIndicatorVariants = cva("", {
  variants: {
    status: {
      Failed: "bg-border group-hover/card:bg-destructive",
      Running: "bg-border group-hover/card:bg-gradient-to-r group-hover/card:from-teal-300 group-hover/card:to-blue-500",
      Pending: "bg-gradient-to-r from-muted/40 to-muted-foreground",
      Paused: "bg-border group-hover/card:bg-gradient-to-r group-hover/card:from-teal-300 group-hover/card:to-blue-500",
      Finished: "",
    },
    selected: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      status: "Failed",
      selected: true,
      class: "bg-destructive",
    },
    {
      status: "Running",
      selected: true,
      class: "bg-gradient-to-r from-teal-300 to-blue-500",
    },
    {
      status: "Paused",
      selected: true,
      class: "bg-gradient-to-r from-teal-300 to-blue-500",
    },
    {
      status: "Pending",
      selected: true,
      class: "bg-gradient-to-r from-muted to-muted-foreground",
    },
  ],
  defaultVariants: {
    status: "Pending",
    selected: false,
  },
});

interface JobCardProgressBarProps {
  completedPercentage: number;
  runningStatus: EvaluationStatus;
  selected: boolean;
}

export const JobCardProgressBar = ({ completedPercentage, runningStatus, selected }: JobCardProgressBarProps) => {
  return (
    <Progress
      value={completedPercentage > 0 ? completedPercentage : 0}
      className={progressBarVariants({ status: runningStatus, selected })}
      indicatorClassName={progressIndicatorVariants({ status: runningStatus, selected })}
    />
  );
};
