export interface MetricConfig {
  name: string;
  r?: number;
  list_of_positives?: string[];
  list_of_classes?: string[];
  class_labels?: string[];
  labels?: string[];
}

export const DEFAULT_ACCURACY_MARGIN = 0;

export enum MetricType {
  Accuracy = "Accuracy",
  ConfusionMatrix = "ConfusionMatrix",
  F1Score = "F1Score",
  MAE = "MAE",
  MSE = "MSE",
  MulticlassConfusionMatrix = "MulticlassConfusionMatrix",
  multiclassF1Score = "multiclassF1Score",
  MulticlassPrecision = "MulticlassPrecision",
  MulticlassRecall = "MulticlassRecall",
  MultilabelF1Score = "MultilabelF1Score",
  MultilabelPrecision = "MultilabelPrecision",
  MultilabelRecall = "MultilabelRecall",
  NMAE = "NMAE",
  NMSE = "NMSE",
  Precision = "Precision",
  Recall = "Recall",
  RMSE = "RMSE",
}

export interface ClassificationMethod {
  id: string;
  name: string;
  availableMetrics: MetricType[];
  hasConfigurableClasses?: boolean;
  hasConfigurableLabels?: boolean;
  hasPositiveOption?: boolean;
}

export const CLASSIFICATION_METHODS: ClassificationMethod[] = [
  {
    id: "regression",
    name: "Regression",
    availableMetrics: [MetricType.MSE, MetricType.NMAE, MetricType.MAE, MetricType.NMSE, MetricType.RMSE],
  },
  {
    id: "binary",
    name: "Binary Classification",
    availableMetrics: [MetricType.ConfusionMatrix, MetricType.F1Score, MetricType.Precision, MetricType.Recall],
    hasPositiveOption: true,
  },
  {
    id: "multiclass",
    name: "MultiClass Classification",
    availableMetrics: [
      MetricType.MulticlassConfusionMatrix,
      MetricType.multiclassF1Score,
      MetricType.MulticlassPrecision,
      MetricType.MulticlassRecall,
    ],
    hasConfigurableClasses: true,
  },
  {
    id: "multilabel",
    name: "MultiLabel Classification",
    availableMetrics: [MetricType.MultilabelF1Score, MetricType.MultilabelPrecision, MetricType.MultilabelRecall],
    hasConfigurableLabels: true,
  },
];

export const getMetricName = (metric: MetricType): string => {
  const metricNames: Record<MetricType, string> = {
    [MetricType.Accuracy]: "Accuracy",
    [MetricType.ConfusionMatrix]: "Confusion matrix",
    [MetricType.F1Score]: "F1 score",
    [MetricType.MAE]: "Mean absolute error",
    [MetricType.MSE]: "Mean squared error",
    [MetricType.MulticlassConfusionMatrix]: "Confusion matrix",
    [MetricType.multiclassF1Score]: "F1 score per class",
    [MetricType.MulticlassPrecision]: "Precision per class",
    [MetricType.MulticlassRecall]: "Recall per class",
    [MetricType.MultilabelF1Score]: "F1 score per label",
    [MetricType.MultilabelPrecision]: "Precision per label",
    [MetricType.MultilabelRecall]: "Recall per label",
    [MetricType.NMAE]: "Normalized mean absolute error",
    [MetricType.NMSE]: "Normalized mean squared error",
    [MetricType.Precision]: "Precision",
    [MetricType.Recall]: "Recall",
    [MetricType.RMSE]: "RMSE",
  };

  return metricNames[metric] || "Unknown metric";
};

// Create metric configuration based on metric type
export const createMetricConfig = (
  metricType: MetricType,
  options?: {
    accuracyMargin?: number;
    positives?: string[];
    classes?: string[];
    labels?: string[];
  }
): MetricConfig => {
  const config: MetricConfig = { name: metricType };

  switch (metricType) {
    case MetricType.Accuracy:
      if (typeof options?.accuracyMargin === "number" && options.accuracyMargin >= 0) {
        config.r = options.accuracyMargin / 100;
      } else {
        config.r = DEFAULT_ACCURACY_MARGIN / 100;
      }
      break;
    case MetricType.ConfusionMatrix:
    case MetricType.F1Score:
    case MetricType.Precision:
    case MetricType.Recall:
      config.list_of_positives = options?.positives || [];
      break;
    case MetricType.MulticlassConfusionMatrix:
      config.list_of_classes = options?.classes || [];
      break;
    case MetricType.multiclassF1Score:
    case MetricType.MulticlassPrecision:
    case MetricType.MulticlassRecall:
      config.class_labels = options?.classes || [];
      break;
    case MetricType.MultilabelF1Score:
    case MetricType.MultilabelPrecision:
    case MetricType.MultilabelRecall:
      config.labels = options?.labels || [];
      break;
  }

  return config;
};

// Reverse mapping
export const getMetricTypeFromString = (metricName: string): MetricType | null => {
  const stringToMetricMap: Record<string, MetricType> = {
    Accuracy: MetricType.Accuracy,
    ConfusionMatrix: MetricType.ConfusionMatrix,
    F1Score: MetricType.F1Score,
    MAE: MetricType.MAE,
    MSE: MetricType.MSE,
    MulticlassConfusionMatrix: MetricType.MulticlassConfusionMatrix,
    multiclassF1Score: MetricType.multiclassF1Score,
    MulticlassPrecision: MetricType.MulticlassPrecision,
    MulticlassRecall: MetricType.MulticlassRecall,
    MultilabelF1Score: MetricType.MultilabelF1Score,
    MultilabelPrecision: MetricType.MultilabelPrecision,
    MultilabelRecall: MetricType.MultilabelRecall,
    NMAE: MetricType.NMAE,
    NMSE: MetricType.NMSE,
    Precision: MetricType.Precision,
    Recall: MetricType.Recall,
    RMSE: MetricType.RMSE,
  };

  if (metricName in stringToMetricMap) {
    return stringToMetricMap[metricName];
  }

  const cleanedName = metricName.trim();
  if (cleanedName in stringToMetricMap) {
    return stringToMetricMap[cleanedName];
  }

  return null;
};

// Backend metric code mapping (keep in sync with backend enum ordering)
const METRIC_CODE_MAP: Record<MetricType, number> = {
  [MetricType.Accuracy]: 0,
  [MetricType.ConfusionMatrix]: 1,
  [MetricType.F1Score]: 2,
  [MetricType.MAE]: 3,
  [MetricType.MSE]: 4,
  [MetricType.MulticlassConfusionMatrix]: 5,
  [MetricType.multiclassF1Score]: 6,
  [MetricType.MulticlassPrecision]: 7,
  [MetricType.MulticlassRecall]: 8,
  [MetricType.MultilabelF1Score]: 9,
  [MetricType.MultilabelPrecision]: 10,
  [MetricType.MultilabelRecall]: 11,
  [MetricType.NMAE]: 12,
  [MetricType.NMSE]: 13,
  [MetricType.Precision]: 14,
  [MetricType.Recall]: 15,
  [MetricType.RMSE]: 16,
};

export const getMetricCodeFromType = (metricType: MetricType): number | undefined => METRIC_CODE_MAP[metricType];

export const getMetricCodeFromString = (metricName: string): number | undefined => {
  const t = getMetricTypeFromString(metricName);
  return t ? METRIC_CODE_MAP[t] : undefined;
};

const CODE_METRIC_MAP: Record<number, MetricType> = Object.entries(METRIC_CODE_MAP).reduce(
  (acc, [k, v]) => {
    acc[v] = k as MetricType;
    return acc;
  },
  {} as Record<number, MetricType>
);

export const getMetricTypeFromCode = (code: number): MetricType | undefined => CODE_METRIC_MAP[code];

// Backend payload metric object
export interface BackendMetricPayload {
  metric: number;
  list_of_positives?: string[];
  list_of_classes?: string[];
  class_labels?: string[];
  labels?: string[];
  r?: number;
}

// Build backend metric payload with defaulted params when not provided
export const buildBackendMetricPayload = (
  metricName: string,
  options?: { r?: number; positives?: string[]; classes?: string[]; labels?: string[] }
): BackendMetricPayload | undefined => {
  const metricType = getMetricTypeFromString(metricName);
  if (!metricType) return undefined;
  const code = getMetricCodeFromType(metricType);
  if (code === undefined) return undefined;

  const payload: BackendMetricPayload = { metric: code };
  // Only attach r for Accuracy. If not provided fall back to default.
  if (metricType === MetricType.Accuracy) {
    const provided = options?.r;
    const effective = typeof provided === "number" && provided >= 0 ? provided : DEFAULT_ACCURACY_MARGIN / 100;
    payload.r = Number(effective?.toFixed(4));
  }

  switch (metricType) {
    case MetricType.ConfusionMatrix:
    case MetricType.F1Score:
    case MetricType.Precision:
    case MetricType.Recall:
      payload.list_of_positives = options?.positives ?? [];
      break;
    case MetricType.MulticlassConfusionMatrix:
      payload.list_of_classes = options?.classes ?? [];
      break;
    case MetricType.multiclassF1Score:
    case MetricType.MulticlassPrecision:
    case MetricType.MulticlassRecall:
      payload.class_labels = options?.classes ?? [];
      break;
    case MetricType.MultilabelF1Score:
    case MetricType.MultilabelPrecision:
    case MetricType.MultilabelRecall:
      payload.labels = options?.labels ?? [];
      break;
    default:
      // regression metrics (MAE/MSE/NMAE/NMSE/RMSE) have no extra params
      break;
  }

  return payload;
};

// Function to determine which classifier method matches a set of metrics
export const getClassifierFromMetrics = (metricTypes: MetricType[]): ClassificationMethod | null => {
  for (const method of CLASSIFICATION_METHODS) {
    const methodMetrics = method.availableMetrics;

    const allMetricsMatch = metricTypes.every((metric) => methodMetrics.includes(metric));

    const hasCommonMetrics = metricTypes.some((metric) => methodMetrics.includes(metric));

    if (allMetricsMatch || (hasCommonMetrics && metricTypes.length > 0)) {
      return method;
    }
  }

  return null;
};

// Helper function to check if a metric requires configuration
export const metricRequiresConfiguration = (metricType: MetricType): boolean => {
  return [
    MetricType.ConfusionMatrix,
    MetricType.F1Score,
    MetricType.Precision,
    MetricType.Recall,
    MetricType.MulticlassConfusionMatrix,
    MetricType.multiclassF1Score,
    MetricType.MulticlassPrecision,
    MetricType.MulticlassRecall,
    MetricType.MultilabelF1Score,
    MetricType.MultilabelPrecision,
    MetricType.MultilabelRecall,
  ].includes(metricType);
};
