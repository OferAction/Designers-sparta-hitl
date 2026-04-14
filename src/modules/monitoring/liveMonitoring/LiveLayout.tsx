import { useMemo } from "react";

import { DotOutlineIcon, LightningIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { useParams } from "react-router-dom";

import { useParentFileId } from "@/hooks/useFileCache";

import ActivityLogTable from "./activityLogTable";
import LiveMonitoringCards from "./LiveMonitoringCards";
import MonitoringTable from "./monitoringTable";
import { DatePickerWithRange } from "../components/DateRange";
import { createColumns } from "./monitoringTable/columns";
import { useMonitoringTable } from "./monitoringTable/useMonitoringTable";
import { MultiSelect } from "../components/MultiSelect";
import { useGetAnalyticsCards, useGetLiveActivity, useGetLiveWorkflow, useGetPerformanceMetricsLive } from "../services/monitoringServices";
import { MonitorApiParams, TriggerTypeValues } from "../services/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMonitoringFiltersURLParams } from "@/modules/monitoring/hooks";

export default function LiveLayout() {
  const { fileId = "" } = useParams();
  const [parentFileId] = useParentFileId(fileId);
  const { date, setDate, selectedTriggers, setSelectedTriggers, allTriggers } = useMonitoringFiltersURLParams();

  const params: MonitorApiParams = useMemo(() => {
    const triggerOptions = selectedTriggers?.length ? selectedTriggers : allTriggers;
    return {
      StartDate: date?.from ? date.from.toISOString() : undefined,
      EndDate: date?.to ? date.to.toISOString() : undefined,
      TriggerTypes: triggerOptions?.map((t) => t?.value) as TriggerTypeValues[],
    };
  }, [allTriggers, date?.from, date?.to, selectedTriggers]);

  const { data: analyticsData } = useGetAnalyticsCards(parentFileId, params);
  const { data: performanceData } = useGetPerformanceMetricsLive(parentFileId, params);
  const liveActivityQuery = useGetLiveActivity(parentFileId, params);
  const liveWorkflowQuery = useGetLiveWorkflow(parentFileId, params);

  const columns = useMemo(() => createColumns(liveWorkflowQuery.data), [liveWorkflowQuery.data]);
  const table = useMonitoringTable(liveWorkflowQuery.data, columns);

  return (
    <div>
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center py-3 gap-2 md:gap-4 text-nowrap">
          <h2 className="text-2xl lg:text-3xl font-semibold">Live Monitoring</h2>
          <div className="w-px bg-border self-stretch" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="text-sm text-neon-green">
                  <span>
                    <DotOutlineIcon className="inline-block size-6" />
                  </span>
                  {performanceData?.versionName}
                </h3>
              </TooltipTrigger>
              <TooltipContent>
                <p>Published {performanceData?.publishedAt ? format(new Date(performanceData.publishedAt), "PPpp") : "No publish date available"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="w-px bg-border self-stretch" />

          <div className="flex items-center gap-4 xxl:gap-6">
            <div>
              <span className="text-sm text-sidebar-foreground/70 leading-6 mr-2">Avg. Tokens</span>
              <span className="text-lg text-foreground mr-1">{performanceData?.averageTokensPerExecution ?? "--"}</span>
              <span className="text-xs text-muted-foreground">per Execution</span>
            </div>
            <div>
              <span className="text-sm text-sidebar-foreground/70 leading-6 mr-2">Avg. Time </span>
              <span className="text-lg text-foreground mr-1">{performanceData?.averageExecutionTime?.toFixed(2) ?? "--"}</span>
              <span className="text-xs text-muted-foreground">per Execution</span>
            </div>
            <div>
              <span className="text-sm text-sidebar-foreground/70 leading-6 mr-2">Total Token Usage</span>
              <span className="text-lg text-foreground mr-1">{performanceData?.totalTokenUsage ?? "--"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center h-9 gap-2">
          <DatePickerWithRange date={date} setDate={setDate} />
          <MultiSelect
            selectedValues={selectedTriggers || allTriggers}
            setSelectedValues={setSelectedTriggers}
            data={allTriggers}
            triggerComponent={
              <div className="text-sm">
                <LightningIcon weight="fill" className="inline mr-2" /> All Triggers
              </div>
            }
          />
        </div>
      </div>
      <div className="flex gap-2">
        <LiveMonitoringCards analyticsData={analyticsData} />
        <div className="flex min-w-0 gap-2 w-full">
          <div className="flex w-2/3">
            <MonitoringTable query={liveWorkflowQuery} table={table} />
          </div>
          <ActivityLogTable query={liveActivityQuery} />
        </div>
      </div>
    </div>
  );
}
