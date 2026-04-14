import { HourglassHighIcon, SpinnerGapIcon } from "@phosphor-icons/react";

import { formatDuration } from "@/utils/durationFormatting";

export interface RunDurationProps {
  id: string;
  status: "Running" | "Finished" | "Failed" | "Pending" | "Cancelled";
  executionTime?: string;
}

export const RunDuration = ({ id, executionTime, status }: RunDurationProps) => {
  const duration = executionTime ? formatDuration(executionTime) : null;
  const shortId = id.slice(0, 8);

  return (
    <div className="flex items-center  justify-between w-full">
      <span className="font-inter text-sm text-sidebar-foreground/70 font-light flex leading-5">ID {shortId}</span>
      {status === "Finished" || status === "Failed" || status === "Cancelled" ? (
        <div className="flex items-center gap-1">
          <HourglassHighIcon size={16} weight="regular" className="text-sidebar-foreground/70" />
          <span className="font-inter text-sm text-sidebar-foreground/70 font-light flex leading-5">{duration ?? "--"}</span>
        </div>
      ) : (
        <SpinnerGapIcon size={16} weight="regular" className="animate-spin" />
      )}
    </div>
  );
};

export default RunDuration;
