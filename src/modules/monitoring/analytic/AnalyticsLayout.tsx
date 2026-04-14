import { useMemo, useState } from "react";

import { addDays } from "date-fns";
import { ArrowLeftIcon as ArrowLeft } from "@phosphor-icons/react";
import { DateRange } from "react-day-picker";
import { useNavigate, useParams } from "react-router-dom";

import AnalyticsCards from "./AnalyticsCards";
import { ChartArea } from "./AreaChart/AreaChart";
import { DatePickerWithRange } from "../components/DateRange";
import { MultiSelect } from "../components/MultiSelect";
import { useGetAnalyticsCards, useGetPerformanceMetricsAnalytics, useGetTimeSeriesData } from "../services/monitoringServices";
import { MonitorApiParams } from "../services/types";
import { CardConfigKeys } from "../types";
import { Button } from "@/components/ui/button";
import { Option } from "@/components/ui/input-tag";

export default function AnalyticsLayout() {
  const { fileId = "" } = useParams();
  const [selectedAreas, setSelectedAreas] = useState<Record<CardConfigKeys, boolean>>({
    coverage: true,
    exex: true,
    accuracy: true,
  });
  const navigate = useNavigate();
  const [selectedVersions, setSelectedVersions] = useState<Option[] | null>(null);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const params: Omit<MonitorApiParams, "triggerType"> = {
    StartDate: date?.from ? date.from.toISOString() : undefined,
    EndDate: date?.to ? date.to.toISOString() : undefined,
  };

  const { data: timeSeriesData, isSuccess } = useGetTimeSeriesData(fileId, params);
  const { data: analyticsData } = useGetAnalyticsCards(fileId, params);

  const versionOptions = useMemo<Option[]>(() => {
    if (!isSuccess || !timeSeriesData) return [];

    const allVersions = timeSeriesData.versionSeries.map((v) => ({ id: v.id, label: v.label, value: v.id }));
    return allVersions;
  }, [isSuccess, timeSeriesData]);

  const ConfigIds = selectedVersions || versionOptions;
  const { data: performanceData } = useGetPerformanceMetricsAnalytics(fileId, {
    ...params,
    ConfigIds: ConfigIds?.map((v) => v?.value).filter((id): id is string => typeof id === "string"),
  });

  return (
    <div className="bg-muted/40 pb-4">
      <div className="flex items-center gap-6">
        <Button className="size-8" variant="secondary" size="icon" onClick={() => navigate("..")}>
          <ArrowLeft />
        </Button>
        <div className="flex items-center justify-between grow py-5">
          <div className="flex items-center">
            <h2 className="text-2xl font-semibold">Analytics</h2>
            <div className="w-px mx-4 bg-border self-stretch" />
            <div className="flex items-center gap-6">
              <div>
                <span className="text-sm text-sidebar-foreground/70 leading-6 mr-2">Avg. Tokens</span>
                <span className="text-lg text-foreground mr-1">{performanceData?.averageTokensPerExecution ?? "--"}</span>
                <span className="text-xs text-muted-foreground">per Execution</span>
              </div>
              <div>
                <span className="text-sm text-sidebar-foreground/70 leading-6 mr-2">Avg. Time </span>
                <span className="text-lg text-foreground mr-1">{performanceData?.averageExecutionTime.toFixed(2) ?? "--"}</span>
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
              triggerComponent={"Versions"}
              data={versionOptions}
              selectedValues={selectedVersions || versionOptions}
              setSelectedValues={setSelectedVersions}
            />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-1 overflow-hidden gap-2">
        <AnalyticsCards selectedAreas={selectedAreas} setSelectedAreas={setSelectedAreas} analyticsData={analyticsData} />
        <ChartArea data={timeSeriesData} selectedAreas={selectedAreas} />
      </div>
    </div>
  );
}
