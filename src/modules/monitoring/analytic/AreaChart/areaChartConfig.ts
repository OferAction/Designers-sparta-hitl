import { VersionDataPoint } from "../../services/types";

export const COLORS = {
  agenticExec: "hsla(var(--warning-hover))",
  systemExec: "hsla(var(--destructive))",
  coverage: "hsla(var(--success))",
  confidence: "hsla(var(--blue-accent))",
};

interface ChartSeriesConfig {
  dataKey: keyof Omit<VersionDataPoint, "date">;
  name: string;
  stroke: string;
  gradient: {
    id: string;
    x1: string;
    y1: string;
    x2: string;
    y2: string;
    gradientUnits?: string;
    stops: Array<{
      offset: string;
      color: string;
      opacity: number;
    }>;
  };
}

export const chartSeriesConfig: ChartSeriesConfig[] = [
  {
    dataKey: "systemEXEX",
    name: "SystemEXEX",
    stroke: COLORS.systemExec,
    gradient: {
      id: "mobile",
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1",
      stops: [
        { offset: "0%", color: COLORS.systemExec, opacity: 0.35 },
        { offset: "100%", color: COLORS.systemExec, opacity: 0 },
      ],
    },
  },
  {
    dataKey: "agenticEXEX",
    name: "AgenticEXEX",
    stroke: COLORS.agenticExec,
    gradient: {
      id: "agenticEXEX",
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1",
      stops: [
        { offset: "0%", color: COLORS.agenticExec, opacity: 0.2 },
        { offset: "100%", color: COLORS.agenticExec, opacity: 0 },
      ],
    },
  },
  {
    dataKey: "coverage",
    name: "coverage",
    stroke: COLORS.coverage,
    gradient: {
      id: "coverage",
      x1: "751.669",
      y1: "64.9966",
      x2: "755.527",
      y2: "160.023",
      gradientUnits: "userSpaceOnUse",
      stops: [
        { offset: "0.538462", color: COLORS.coverage, opacity: 0.2 },
        { offset: "1", color: COLORS.coverage, opacity: 0 },
      ],
    },
  },
  {
    dataKey: "confidence",
    name: "confidence",
    stroke: COLORS.confidence,
    gradient: {
      id: "confidence",
      x1: "758.191",
      y1: "0",
      x2: "758.191",
      y2: "327",
      gradientUnits: "userSpaceOnUse",
      stops: [
        { offset: "0", color: COLORS.confidence, opacity: 0.6 },
        { offset: "1", color: COLORS.confidence, opacity: 0 },
      ],
    },
  },
];
