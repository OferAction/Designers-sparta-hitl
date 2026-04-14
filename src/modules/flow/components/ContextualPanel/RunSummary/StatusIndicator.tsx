import { SpinnerGapIcon } from "@phosphor-icons/react";

import { cn } from "@/utils";

export interface StatusIndicatorProps {
  status: "Running" | "Finished" | "Failed" | "Pending" | "Cancelled";
}

export const StatusIndicator = ({ status }: StatusIndicatorProps) => {
  return (
    <div className="flex items-center gap-2">
      {status === "Running" && <SpinnerGapIcon size={16} weight="regular" className="animate-spin" />}
      <span
        className={cn("font-inter justify-center flex leading-5", {
          "text-destructive": status === "Failed",
          "text-success": status === "Finished",
          "text-foreground": status === "Running",
        })}
      >
        {status}
      </span>
    </div>
  );
};

export default StatusIndicator;
