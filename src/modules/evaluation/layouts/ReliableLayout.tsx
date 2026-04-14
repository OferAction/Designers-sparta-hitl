import { useMemo, useState } from "react";

import { CrosshairSimpleIcon, FunnelIcon, ShieldChevronIcon } from "@phosphor-icons/react";

import { EvaluationHeader } from "../components/EvaluationHeader";
import ReliableCard from "../components/ReliableCard";
import ReliableTable from "../reliableTable";
import { createColumns } from "../reliableTable/columns";
import { useEvaluationTable } from "../reliableTable/useEvaluationTable";
import { useGetEvaluation } from "../services";
import { formatDuration } from "../utils";

export default function ReliableLayout({ batchId }: { batchId?: string }) {
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const { data, isLoading } = useGetEvaluation(batchId || "");

  const columns = useMemo(() => createColumns(data), [data]);
  const table = useEvaluationTable(data, columns, {
    configId: data?.configurationId,
    batchId,
  });

  if (!isLoading && (!data || !table.getRowModel().rows.length)) {
    return;
  }

  const reliabilityMetrics = data?.reliabilityMetrics;
  const hasExtraMetrics = reliabilityMetrics?.Precision || reliabilityMetrics?.Recall || reliabilityMetrics?.["F1-Score"];

  return (
    <div className="w-full flex flex-col">
      <EvaluationHeader header="Workflow reliability" filteration={[globalFilter, setGlobalFilter]} table={table}>
        {data?.totalTime && (
          <div>
            <span className="text-sm text-sidebar-foreground/70 leading-6 mr-2">Avg. Time</span>
            <span className="text-lg text-foreground mr-1">{formatDuration(data.averageTimePerSample)}</span>
            <span className="text-xs text-muted-foreground">per sample</span>
          </div>
        )}
      </EvaluationHeader>
      <div className="flex gap-2 w-full flex-1 overflow-hidden">
        <div className="flex flex-col gap-2 w-[328px]">
          <div className="flex gap-2 grow">
            <ReliableCard isLoading={isLoading}>
              <ReliableCard.Header>
                <ReliableCard.Title>Coverage</ReliableCard.Title>
              </ReliableCard.Header>
              <ReliableCard.Content>
                <ReliableCard.Body>
                  <ReliableCard.Value className="text-3xl">
                    {data?.coverage ? `${data?.coverage.toFixed(1)}%` : ""}
                    <ReliableCard.Icon>
                      <ShieldChevronIcon size={24} weight="fill" className="text-success" />
                    </ReliableCard.Icon>
                  </ReliableCard.Value>
                </ReliableCard.Body>
                <ReliableCard.Subtitle>{data?.completedJobs ?? "--"} samples</ReliableCard.Subtitle>
              </ReliableCard.Content>
            </ReliableCard>
            <ReliableCard isLoading={isLoading}>
              <ReliableCard.Header>
                <ReliableCard.Title>Explainable Exceptions (ExEx)</ReliableCard.Title>
              </ReliableCard.Header>
              <ReliableCard.Content>
                <ReliableCard.Body>
                  <ReliableCard.Value className="text-3xl text-warning">
                    {data?.exePercentage ? `${data?.exePercentage.toFixed(1)}%` : ""}
                    <ReliableCard.Icon>
                      <FunnelIcon size={24} weight="fill" className="text-warning-hover" />
                    </ReliableCard.Icon>
                  </ReliableCard.Value>
                </ReliableCard.Body>
                <ReliableCard.Subtitle>{data?.failedJobs ?? "--"} samples</ReliableCard.Subtitle>
              </ReliableCard.Content>
            </ReliableCard>
          </div>
          <div className="">
            <ReliableCard isLoading={isLoading}>
              <ReliableCard.Header>
                <ReliableCard.Title>Reliable Accuracy</ReliableCard.Title>
              </ReliableCard.Header>
              <ReliableCard.Content>
                <ReliableCard.Body>
                  <ReliableCard.Value className="text-3xl text-blue-accent">
                    {reliabilityMetrics?.Accuracy?.value}
                    <ReliableCard.Icon>
                      <CrosshairSimpleIcon size={24} weight="fill" className="text-blue-accent" />
                    </ReliableCard.Icon>
                  </ReliableCard.Value>
                </ReliableCard.Body>
                <ReliableCard.Subtitle>{reliabilityMetrics?.Accuracy?.count ?? "-"} samples</ReliableCard.Subtitle>
              </ReliableCard.Content>
            </ReliableCard>
          </div>
        </div>
        {hasExtraMetrics && (
          <div className="flex flex-col gap-2">
            <ReliableCard className="bg-transparent grow min-w-[180px]" isLoading={isLoading}>
              <ReliableCard.Header>
                <ReliableCard.Title>Reliable Precision</ReliableCard.Title>
              </ReliableCard.Header>
              <ReliableCard.Body>
                <ReliableCard.Value className="text-sm lg:text-lg text-blue-accent">{reliabilityMetrics?.Precision?.value}</ReliableCard.Value>
                <ReliableCard.Subtitle>out of {reliabilityMetrics?.Precision ? reliabilityMetrics?.Precision?.count : "--"}</ReliableCard.Subtitle>
              </ReliableCard.Body>
            </ReliableCard>
            <ReliableCard className="bg-transparent grow min-w-[180px]" isLoading={isLoading}>
              <ReliableCard.Header>
                <ReliableCard.Title>Reliable Recall</ReliableCard.Title>
              </ReliableCard.Header>
              <ReliableCard.Body>
                <ReliableCard.Value className="text-sm lg:text-lg text-blue-accent">{reliabilityMetrics?.Recall?.value}</ReliableCard.Value>
                <ReliableCard.Subtitle>out of {reliabilityMetrics?.Recall ? reliabilityMetrics?.Recall?.count : "--"}</ReliableCard.Subtitle>
              </ReliableCard.Body>
            </ReliableCard>
            <ReliableCard className="bg-transparent grow min-w-[180px]" isLoading={isLoading}>
              <ReliableCard.Header>
                <ReliableCard.Title>Reliable F1 Score</ReliableCard.Title>
              </ReliableCard.Header>
              <ReliableCard.Body>
                <ReliableCard.Value className="text-sm lg:text-lg text-blue-accent">{reliabilityMetrics?.["F1-Score"]?.value}</ReliableCard.Value>
                <ReliableCard.Subtitle>
                  out of {reliabilityMetrics?.["F1-Score"] ? reliabilityMetrics?.["F1-Score"]?.count : "--"}
                </ReliableCard.Subtitle>
              </ReliableCard.Body>
            </ReliableCard>
          </div>
        )}
        <ReliableTable globalFilter={globalFilter} batchId={batchId} table={table} />
      </div>
    </div>
  );
}
