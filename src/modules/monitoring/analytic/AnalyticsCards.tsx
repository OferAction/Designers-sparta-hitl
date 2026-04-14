import { useMemo } from "react";

import { MetricsResponse } from "../services/types";
import { CardConfig, CardConfigKeys } from "../types";
import { ConfidenceIcon, CoverageMetricIcon as CoverageIcon, ExExMetricIcon as ExExIcon } from "@/lib/icons";
import { Checkbox } from "@/components/ui/checkbox";
import ReliableCard from "@/modules/evaluation/components/ReliableCard";
import { cn } from "@/utils";

type AnalyticsCardsProps = {
  selectedAreas: Record<CardConfigKeys, boolean>;
  setSelectedAreas: React.Dispatch<React.SetStateAction<Record<CardConfigKeys, boolean>>>;
  analyticsData?: MetricsResponse;
};

export default function AnalyticsCards({ selectedAreas, setSelectedAreas, analyticsData }: AnalyticsCardsProps) {
  const cardConfigs: CardConfig[] = useMemo(
    () => [
      {
        key: "coverage",
        title: "Coverage",
        icon: <CoverageIcon className="text-success" />,
        value: `${analyticsData?.coverage.value ?? "--"}%`,
        subtitle: `${analyticsData?.coverage.totalSamples ?? "--"} samples`,
        tooltip: "Samples that successfully reached an End node.",
      },
      {
        key: "exex",
        title: "Explainable Exceptions",
        icon: <ExExIcon className="text-warning-hover" />,
        value: `${analyticsData?.explainableException.exceptionsPercentage ?? "--"}%`,
        subtitle: `${analyticsData?.explainableException.totalSamples ?? "--"} samples`,
        extra: [
          { label: `${analyticsData?.explainableException.exceptionsPercentage ?? "--"}% Important`, color: "bg-destructive" },
          { label: `${analyticsData?.explainableException.flagsPercentage ?? "--"}% Warning`, color: "bg-warning-hover" },
        ],
        tooltip: "Failed samples that did not reach the End node due to exception rules or system errors.",
      },
      {
        key: "accuracy",
        title: "Reliable Confidence",
        icon: <ConfidenceIcon className="text-blue-accent" />,
        value: `${analyticsData?.reliabilityConfidence.value ?? "--"}%`,
        subtitle: `${analyticsData?.reliabilityConfidence.totalSamples ?? "--"} samples`,
        tooltip: "Confidence of predictions matching the ground truth labels, measured on samples that reached an End node.",
      },
    ],
    [analyticsData]
  );

  return (
    <div className="flex flex-col gap-2 w-[330px] shrink-0">
      {cardConfigs.map((config) => (
        <ReliableCard key={config.key} className="border-border rounded-lg">
          <ReliableCard.Header>
            <ReliableCard.Title className="flex items-center gap-2">
              {config.title}
              <ReliableCard.Tooltip content={config.tooltip || ""} />
            </ReliableCard.Title>
            <ReliableCard.Trigger>
              <Checkbox
                checked={selectedAreas[config.key]}
                onCheckedChange={(checked) => setSelectedAreas((prev) => ({ ...prev, [config.key]: checked as boolean }))}
              />
            </ReliableCard.Trigger>
          </ReliableCard.Header>
          <ReliableCard.Body>
            <ReliableCard.Content>
              <ReliableCard.Value className="text-3xl">
                <ReliableCard.Icon>{config.icon}</ReliableCard.Icon>
                {config.value}
              </ReliableCard.Value>
              <ReliableCard.Subtitle className="text-muted-foreground">{config.subtitle}</ReliableCard.Subtitle>
            </ReliableCard.Content>
            <ReliableCard.Extra>
              {config.extra?.map((item, index) => (
                <p key={index} className="flex items-center gap-1 text-muted-foreground text-sm">
                  {item.label} <span className={cn("size-2 inline-block rounded-full ml-1", item.color)} />
                </p>
              ))}
            </ReliableCard.Extra>
          </ReliableCard.Body>
        </ReliableCard>
      ))}
    </div>
  );
}
