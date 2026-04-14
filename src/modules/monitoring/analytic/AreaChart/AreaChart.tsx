import * as React from "react";

import moment from "moment";
import { Area, AreaChart, ReferenceLine, XAxis } from "recharts";

import { chartSeriesConfig } from "./areaChartConfig";
import { getTimeFormat } from "./utils";
import { VersionSeriesResponse } from "../../services/types";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { cn } from "@/utils";

export const description = "An interactive area chart";

const chartConfig = {
  confidence: {
    label: "Confidence",
    color: "var(--chart-3)",
  },
  AgenticEXEX: {
    label: "Agentic EXEX",
    color: "var(--chart-1)",
  },
  SysemeEXEX: {
    label: "System EXEX",
    theme: {
      dark: "blue",
      light: "red",
    },
  },
  coverage: {
    label: "Coverage",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface ChartAreaInteractiveProps {
  data: VersionSeriesResponse | undefined;
  selectedAreas?: {
    coverage: boolean;
    exex: boolean;
    accuracy: boolean;
  };
}

export function ChartArea({ selectedAreas, data }: ChartAreaInteractiveProps) {
  const chartData = React.useMemo(
    () =>
      (data?.versionSeries ?? []).flatMap((element) =>
        element.data.map((item) => ({
          ...item,
          timestamp: moment.utc(item.date).valueOf(),
          elementId: element.id,
          elementLabel: element.label,
        }))
      ),
    [data?.versionSeries]
  );

  const segmentBoundaries = React.useMemo(() => {
    const boundaries: { x: number; label: string }[] = [];

    data?.versionSeries?.forEach((element) => {
      const firstPoint = element.data[0];
      if (!firstPoint) {
        return;
      }

      boundaries.push({
        x: moment.utc(firstPoint.date).valueOf(),
        label: element.label,
      });
    });

    return boundaries;
  }, [data?.versionSeries]);

  const timeFormat = React.useMemo(() => getTimeFormat(chartData), [chartData]);

  // Check if at least one area is selected
  const hasSelectedArea = React.useMemo(() => {
    if (!selectedAreas) return true; // If no selection prop, show all (backward compatibility)
    return selectedAreas.coverage || selectedAreas.exex || selectedAreas.accuracy;
  }, [selectedAreas]);

  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center border rounded-lg h-[416.8px] grow text-muted-foreground">
        No data in the selected date range
      </div>
    );
  }

  if (!hasSelectedArea) {
    return (
      <div className="flex justify-center items-center border rounded-lg h-[416.8px] grow text-muted-foreground">
        Please select at least one metric to display
      </div>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="flex justify-center items-center border rounded-lg h-[416.8px] grow [&_.recharts-curve.recharts-tooltip-cursor]:stroke-foreground"
    >
      <AreaChart data={chartData} margin={{ top: 30, bottom: 8 }} defaultShowTooltip>
        <defs>
          {chartSeriesConfig.map((series) => (
            <linearGradient
              key={series.gradient.id}
              id={series.gradient.id}
              x1={series.gradient.x1}
              y1={series.gradient.y1}
              x2={series.gradient.x2}
              y2={series.gradient.y2}
              gradientUnits={series.gradient.gradientUnits}
            >
              {series.gradient.stops.map((stop, index) => (
                <stop key={index} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity} />
              ))}
            </linearGradient>
          ))}
        </defs>
        <ChartTooltip
          cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeOpacity: 1 }}
          content={
            <ChartTooltipContent
              className="w-[200px]"
              labelFormatter={(_, payload) => {
                if (payload && payload[0]?.payload?.timestamp) {
                  return moment.utc(payload[0].payload.timestamp).format("MMM D, YYYY");
                }
              }}
              indicator="circle"
            />
          }
        />
        {chartSeriesConfig
          .filter((series) => {
            // If no selectedAreas prop, show all (backward compatibility)
            if (!selectedAreas) return true;

            // Map series dataKeys to their corresponding area selections
            if (series.dataKey === "coverage") return selectedAreas.coverage;
            if (series.dataKey === "systemEXEX" || series.dataKey === "agenticEXEX") return selectedAreas.exex;
            if (series.dataKey === "confidence") return selectedAreas.accuracy;

            return true;
          })
          .map((series) => (
            <Area
              key={series.dataKey}
              dataKey={series.dataKey}
              type="linear"
              fill={`url(#${series.gradient.id})`}
              stroke={series.stroke}
              strokeWidth={2}
              name={series.name}
            />
          ))}
        {segmentBoundaries.map((boundary, index) => (
          <ReferenceLine
            key={index}
            x={boundary.x}
            stroke="hsla(var(--muted-foreground) )"
            strokeWidth={1}
            isFront
            label={({ viewBox }) => {
              return (
                <g>
                  <foreignObject x={viewBox.x - 1} y={0} width={100} height={100}>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "rounded-lg rounded-bl-none text-sm text-muted-foreground font-roboto-mono",
                        index > 0 && "rounded-t-none",
                        index === 0 && "rounded-tr-none"
                      )}
                    >
                      {boundary.label}
                    </Badge>
                  </foreignObject>
                </g>
              );
            }}
          />
        ))}
        <XAxis
          dataKey="timestamp"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          height={30}
          tickCount={20}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          minTickGap={30}
          tickFormatter={(value) => moment.utc(value).format(timeFormat)}
        />
      </AreaChart>
    </ChartContainer>
  );
}
