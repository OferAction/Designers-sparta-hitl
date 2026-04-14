import { Metric } from "../types";
import { NodeIconsMapping } from "@/constants";

export type EvaluationNode = {
  id: string;
  nodeId: string;
  label: string;
  samples?: number;
  tokens?: number;
  type?: keyof typeof NodeIconsMapping;
  time?: number;
  agenticExEx?: number;
  systemicExEx?: number;
  flags?: number;
  accuracy: Metric;
  nmae: Metric;
  f1Score: Metric;
  precision: Metric;
  recall: Metric;
  children?: EvaluationNode[];
};
