import { cva } from "class-variance-authority";

import { JobCardHeader } from "./JobCardHeader";
import { JobCardMetadata } from "./JobCardMetadata";
import { JobCardMetrics } from "./JobCardMetrics";
import { JobCardProgressBar } from "./JobCardProgressBar";
import { JobCardTimeRemaining } from "./JobCardTimeRemaining";
import { EvaluationActions } from "../../EvaluationActions/EvaluationActions";
import { EvaluationHistoryItem } from "@/modules/evaluation/types";

const cardVariants = cva("flex flex-col w-full p-3 transition-all duration-150 rounded-md", {
  variants: {
    selected: {
      true: "ring-2 ring-offset-2 ring-offset-background ring-primary",
      false: "",
    },
    status: {
      Failed: "bg-destructive/10",
      Running: "",
      Pending: "",
      Paused: "",
      Finished: "",
    },
  },
  defaultVariants: {
    selected: false,
    status: "Pending",
  },
});

interface EvaluationJobCardProps {
  evaluationJob: EvaluationHistoryItem;
  selected: boolean;
  setSelectedBatchId: React.Dispatch<React.SetStateAction<string>>;
  onDeleteSuccess?: () => void;
}

export const EvaluationJobCard = ({ evaluationJob, selected, setSelectedBatchId, onDeleteSuccess, ...rest }: EvaluationJobCardProps) => {
  const {
    runningStatus,
    evaluationTitle,
    submittedDate,
    datasetName,
    datasetVersion,
    datasetSamples,
    completedPercentage,
    coverage,
    exExPercentage,
    reliabilityMetrics: { Accuracy: accuracy } = {},
    id,
    executedSamples,
    runningTime,
    remainingTime,
    version,
  } = evaluationJob;

  const showTimeRemaining = !["Finished", "Pending"].includes(runningStatus);
  const showProgressBar = runningStatus !== "Finished";

  return (
    <div
      className="flex flex-col p-2 border-b border-sidebar-border w-full cursor-pointer transition-all group/card relative"
      onClick={() => setSelectedBatchId(id)}
      onBlur={() => setSelectedBatchId(id)}
      tabIndex={0}
      {...rest}
    >
      <div className="flex flex-row justify-between items-center w-full bg-sidebar-background">
        <div className={cardVariants({ selected, status: runningStatus })}>
          <JobCardHeader title={evaluationTitle} version={version} />

          <div className="flex flex-col gap-3">
            <JobCardMetadata
              submittedDate={submittedDate}
              datasetName={datasetName}
              datasetVersion={datasetVersion}
              datasetSamples={datasetSamples}
            />

            <JobCardMetrics accuracy={accuracy?.value} coverage={coverage} exExPercentage={exExPercentage} selected={selected} />

            <EvaluationActions runningStatus={runningStatus} cardId={id} onDeleteSuccess={onDeleteSuccess} />

            {showTimeRemaining && (
              <JobCardTimeRemaining
                completedPercentage={completedPercentage}
                executedSamples={executedSamples}
                runningTime={runningTime}
                remainingTime={remainingTime}
                runningStatus={runningStatus}
              />
            )}

            {showProgressBar && <JobCardProgressBar completedPercentage={completedPercentage} runningStatus={runningStatus} selected={selected} />}
          </div>
        </div>
      </div>
    </div>
  );
};
