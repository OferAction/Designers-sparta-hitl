import { SortingFnOption } from "@tanstack/react-table";
import moment from "moment";

import { EvaluationNode } from "../evaluationTable/types";

// Helper function to sort by metric value
export const sortByMetricValue: SortingFnOption<EvaluationNode> = (rowA, rowB, columnId) => {
  const valueA = rowA.getValue<{ value?: number }>(columnId)?.value ?? -Infinity;
  const valueB = rowB.getValue<{ value?: number }>(columnId)?.value ?? -Infinity;
  return valueA - valueB;
};

export const formatDuration = (runDuration: string): string => {
  const duration = moment.duration(runDuration);
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  if (parts.length === 0) {
    return "<1s";
  }
  return parts.join(" ");
};
