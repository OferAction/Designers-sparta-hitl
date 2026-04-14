import { useMemo } from "react";

import { CardConfig } from "../types";
import { ConfidenceIcon, CoverageMetricIcon as CoverageIcon, ExExMetricIcon as ExExIcon } from "@/lib/icons";
import ReliableCard from "@/modules/evaluation/components/ReliableCard";

interface LiveMonitoringCardsProps {
  analyticsData?: {
    coverage: {
      value: number;
      totalSamples: number;
    };
    explainableException: {
      exceptionsPercentage: number;
      flagsPercentage: number;
      totalSamples: number;
    };
    reliabilityConfidence: {
      value: number;
      totalSamples: number;
    };
  };
}

export default function LiveMonitoringCards({ analyticsData }: LiveMonitoringCardsProps) {
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
        title: "Explainable Exceptions (ExEx)",
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
    <div className="flex flex-col gap-2 w-[330px] shrink-0 mt-[60px]">
      {cardConfigs.map((config) => (
        <ReliableCard className="rounded-lg bg-transparent" key={config.key} isLoading={false}>
          <ReliableCard.Header>
            <ReliableCard.Title className="flex items-center gap-2">
              {config.title}
              <ReliableCard.Tooltip content={config.tooltip || ""} />
            </ReliableCard.Title>
          </ReliableCard.Header>
          <ReliableCard.Body>
            <ReliableCard.Content>
              <ReliableCard.Value className="text-3xl">
                <ReliableCard.Icon>{config.icon}</ReliableCard.Icon>
                {config.value}
              </ReliableCard.Value>
              <ReliableCard.Subtitle className="text-muted-foreground">{config.subtitle}</ReliableCard.Subtitle>
            </ReliableCard.Content>
          </ReliableCard.Body>
        </ReliableCard>
      ))}
    </div>
  );
}
