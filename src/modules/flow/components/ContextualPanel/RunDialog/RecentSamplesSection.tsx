import { CheckIcon, CoinsIcon, HourglassIcon, XIcon, SpinnerGapIcon as Loader2Icon } from "@phosphor-icons/react";
import moment from "moment";
import { useParams } from "react-router-dom";

import { usePopulateFormFromData } from "./hooks";
import { RecentSamplesSectionProps, RecentSamplesResponse, RunItem, VersionGroup } from "./types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useGetRecentSamples } from "@/modules/flow/services";
import { cn } from "@/utils";

import { formatDuration } from "@/utils/durationFormatting";

const humanizeDuration = (timeString?: string): string => {
  if (!timeString) return "--";
  return formatDuration(timeString);
};

export const RecentSamplesSection = ({ inputs, runScope }: RecentSamplesSectionProps) => {
  const { fileId = "" } = useParams();
  const { data: recentSamples } = useGetRecentSamples(fileId);

  const { populateFormFromData } = usePopulateFormFromData(inputs, runScope);

  const handleRunClick = (data?: Record<string, any>) => {
    if (!data) return;
    populateFormFromData(data);
  };

  const groupRunsByVersion = (runs: RecentSamplesResponse | undefined): VersionGroup[] => {
    if (!runs?.items || !runs.items.length) return [];

    const versionGroups: Record<string, VersionGroup> = {};

    runs.items.forEach((run: RunItem) => {
      if (!run.configurationVersion) return;

      const version = run.configurationVersion;
      const versionString = `${version.major}.${version.minor}.${version.patch}`;

      if (!versionGroups[versionString]) {
        versionGroups[versionString] = {
          version: versionString,
          versionTimestamp: version.timestamp,
          runs: [],
        };
      }

      versionGroups[versionString].runs.push(run);
    });
    return Object.values(versionGroups).sort((a, b) => new Date(b.versionTimestamp).getTime() - new Date(a.versionTimestamp).getTime());
  };

  const groupedRuns: VersionGroup[] = groupRunsByVersion(recentSamples);

  return (
    <div>
      {groupedRuns.map((group: VersionGroup, groupIndex: number) => (
        <div key={group.version} className="mb-4">
          <span className="text-xs text-sidebar-foreground/70 pt-2 block mb-1">
            {groupIndex === 0 ? "Runs in current version" : `Version ${group.version}`}
          </span>
          {group.runs.map((run: RunItem) => (
            <div
              key={run.id}
              onClick={() => handleRunClick(run.data)}
              className="-mx-6 px-6 py-2 flex items-center justify-between hover:bg-accent cursor-pointer"
            >
              <span className="text-base text-primary leading-6">{moment(run.startTime).fromNow()}</span>
              <div className="flex items-center gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className={cn("cursor-pointer", !run.executionTime && "pointer-events-none")} type="button">
                      <span className="text-sm text-sidebar-foreground/70 leading-5 flex items-center gap-1">
                        <HourglassIcon />
                        {humanizeDuration(run.executionTime)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{run.executionTime}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="text-sm text-sidebar-foreground/70 leading-5 flex items-center gap-1">
                  <CoinsIcon />
                  --
                </span>
                <span
                  className={cn(
                    "size-5 flex items-center justify-center rounded",
                    run.status === "Finished" && "bg-[#10B9811A]",
                    run.status === "Failed" && "bg-destructive/10"
                  )}
                >
                  {run.status === "Finished" ? (
                    <CheckIcon weight="regular" className="size-3 text-success" />
                  ) : run.status === "Failed" ? (
                    <XIcon weight="regular" className="size-3 text-destructive" />
                  ) : (
                    <Loader2Icon className="size-3 text-primary animate-spin" />
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
      {!groupedRuns.length && <div className="text-sm text-sidebar-foreground/70 py-2">No recent runs available</div>}
    </div>
  );
};
