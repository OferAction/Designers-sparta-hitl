import React from "react";

import { MetricsBadges, RunDuration, StatusIndicator } from "../RunSummary";
import { cn } from "@/utils";

export interface SampleType {
  id: string;
  status: "Running" | "Finished" | "Failed" | "Pending" | "Cancelled";
  startTime: string;
  endTime?: string;
  groundTruthDiff?: number;
  reliabilityRules?: number;
  executionTime?: string;
  systemRules?: number;
  data?: Record<string, string>;
}

const RunSummaryMessage = ({ sample, children }: { sample: SampleType; children?: React.ReactNode }) => {
  const isCompleted = sample.status === "Finished" || sample.status === "Failed" || sample.status === "Cancelled";

  return (
    <div key={sample.id} className="flex w-full flex-col items-start">
      {children}
      <div
        className={cn("flex items-center my-2 p-2 w-full border rounded-md bg-foreground/10 border-muted/20", {
          "bg-success/10 border-success/20": sample.status === "Finished",
          "bg-destructive/10 border-destructive/20": sample.status === "Failed",
        })}
      >
        <div className="flex flex-col items-start w-full">
          <div className="flex items-center gap-2 justify-between w-full">
            <StatusIndicator status={sample.status} />

            {isCompleted && sample.groundTruthDiff !== undefined && (
              <MetricsBadges
                groundTruthDiff={sample.groundTruthDiff}
                reliabilityRules={sample.reliabilityRules || 0}
                systemRules={sample.systemRules || 0}
              />
            )}
          </div>
          <div className="mt-1 flex items-center justify-between w-full">
            <RunDuration id={sample.id} executionTime={sample.executionTime} status={sample.status} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunSummaryMessage;
