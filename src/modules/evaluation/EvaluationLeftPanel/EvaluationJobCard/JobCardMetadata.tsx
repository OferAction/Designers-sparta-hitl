import { DatabaseIcon } from "@phosphor-icons/react";
import moment from "moment";

import { formatSampleCount } from "./utils";
import { Label } from "@/components/ui/label";

interface JobCardMetadataProps {
  submittedDate: string;
  datasetName: string;
  datasetVersion: string;
  datasetSamples: number;
}

export const JobCardMetadata = ({ submittedDate, datasetName, datasetVersion, datasetSamples }: JobCardMetadataProps) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row items-center">
        <Label className="text-sm text-muted-foreground leading-5 py-1">{moment(submittedDate).fromNow()}</Label>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-1">
          <DatabaseIcon size={16} weight="fill" className="text-muted-foreground shrink-0" />
          <Label className="text-sm text-muted-foreground gap-1 leading-5 flex min-w-0">
            <span className="truncate">{datasetName}</span>
            <span className="max-w-max w-full flex gap-1">
              <span>{datasetVersion}</span>
              <span>
                {formatSampleCount(datasetSamples)} sample{datasetSamples > 1 && "s"}
              </span>
            </span>
          </Label>
        </div>
      </div>
    </div>
  );
};
