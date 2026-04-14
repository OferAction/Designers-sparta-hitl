import { useState, useCallback, memo, useMemo } from "react";

import { CaretDownIcon, CrosshairSimpleIcon, PlusIcon } from "@phosphor-icons/react";

import MatchedDataItemCell from "./MatchedDataItemCell";
import MetricsDropdown from "../../MetricsDropdown";
import { extractFieldNameFromPath } from "../../utils";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { InputTag } from "@/components/ui/input-tag";
import { useDatasetMapping } from "@/modules/dataset/hooks";
import { CLASSIFICATION_METHODS, MetricType, getClassifierFromMetrics, DEFAULT_ACCURACY_MARGIN } from "@/modules/dataset/types/metrics";
import { FlowStoreState, useFlowStore } from "@/store";
import { cn } from "@/utils";

interface MetricsCellProps {
  outputId: string;
  nodeId: string;
  isStartNode?: boolean;
  outputType?: string;
}

type Metric = {
  id: string;
  name: string;
  type: "accuracy" | "classification";
  accuracyMargin?: number;
};

const selector = (state: FlowStoreState) => ({
  inputsDict: state.inputsDict,
  mappings: state.mappings,
});

const MetricsCell = ({ outputId, nodeId, isStartNode = false, outputType }: MetricsCellProps) => {
  const { setMetrics, setMetricParams } = useDatasetMapping();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { inputsDict, mappings } = useFlowStore(selector);

  const key = `${nodeId}-${outputId}`;
  const existingMapping = mappings[key];

  const currentMetricIds = useMemo(() => existingMapping?.metrics || [], [existingMapping?.metrics]);

  const { positives = [], classes = [], labels = [], accuracyMargin = DEFAULT_ACCURACY_MARGIN } = existingMapping?.metricParams || {};

  const { selectedMetrics, selectedClassificationMethod, accuracyEnabled } = useMemo(() => {
    const metrics: Metric[] = [];
    let classificationMethod: string | null = null;
    let hasAccuracy = false;

    if (currentMetricIds.length > 0) {
      const metricTypes = currentMetricIds;

      if (metricTypes.includes(MetricType.Accuracy)) {
        hasAccuracy = true;
        metrics.push({ id: "accuracy", name: "Accuracy", type: "accuracy", accuracyMargin: accuracyMargin });
      }

      const matchingClassifier = getClassifierFromMetrics(metricTypes);
      if (matchingClassifier) {
        classificationMethod = matchingClassifier.id;
        metrics.push({ id: matchingClassifier.id, name: matchingClassifier.name, type: "classification" });
      }
    }

    return { selectedMetrics: metrics, selectedClassificationMethod: classificationMethod, accuracyEnabled: hasAccuracy };
  }, [currentMetricIds, accuracyMargin]);

  const handleAccuracyToggle = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        if (!currentMetricIds.includes(MetricType.Accuracy)) {
          setMetrics(nodeId, outputId, [...currentMetricIds, MetricType.Accuracy]);
        }
        if (typeof existingMapping?.metricParams?.accuracyMargin !== "number") {
          setMetricParams(nodeId, outputId, { accuracyMargin: DEFAULT_ACCURACY_MARGIN });
        }
      } else {
        const filtered = currentMetricIds.filter((id) => id !== MetricType.Accuracy);
        setMetrics(nodeId, outputId, filtered);
      }
    },
    [currentMetricIds, nodeId, outputId, setMetrics, existingMapping, setMetricParams]
  );

  const handleAccuracyMarginChange = useCallback(
    (margin: number) => {
      setMetricParams(nodeId, outputId, { accuracyMargin: margin });
    },
    [nodeId, outputId, setMetricParams]
  );

  const handleClassificationMethodSelect = useCallback(
    (methodId: string) => {
      const method = CLASSIFICATION_METHODS.find((m) => m.id === methodId);
      if (!method) return;

      if (selectedClassificationMethod === methodId) {
        const filtered = currentMetricIds.filter((id) => !method.availableMetrics.includes(id));
        setMetrics(nodeId, outputId, filtered);
      } else {
        const withoutClassification = currentMetricIds.filter((id) => !CLASSIFICATION_METHODS.some((cm) => cm.availableMetrics.includes(id)));
        const newClassificationIds = method.availableMetrics;
        setMetrics(nodeId, outputId, [...withoutClassification, ...newClassificationIds]);
      }
    },
    [currentMetricIds, selectedClassificationMethod, nodeId, outputId, setMetrics]
  );

  const getMetricDisplayText = useCallback((metric: Metric) => {
    if (metric.type === "accuracy") {
      return `${metric.name} (${metric.accuracyMargin}%)`;
    }
    return metric.name;
  }, []);

  const allowedMethodIds = useMemo(() => {
    const t: string = outputType || "Undefined";
    const isList = t.startsWith("List") || t === "List";
    const M = {
      regression: "regression",
      binary_classification: "binary",
      multiclass_classification: "multiclass",
      multilabel_classification: "multilabel",
    } as const;
    if (t === "Number" || t === "Integer") return [M.regression, M.binary_classification, M.multiclass_classification];
    if (t === "Boolean") return [M.binary_classification];
    if (t === "String") return [M.binary_classification, M.multiclass_classification];
    if (isList) return [M.multilabel_classification];
    return [] as string[];
  }, [outputType]);

  const startNodeSelected = useMemo(() => {
    if (!isStartNode) return null;
    const key = `${nodeId}.${outputId}`;
    const path = inputsDict[key];
    return path ? { name: extractFieldNameFromPath(path), type: "Unknown", sample: "", path } : null;
  }, [isStartNode, nodeId, outputId, inputsDict]);

  if (isStartNode) {
    return <MatchedDataItemCell selectedItem={startNodeSelected} expectedType={null} />;
  }

  return (
    <div className="p-3 overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 min-w-0">
        {selectedMetrics.map((metric) => (
          <DropdownMenu key={`metric-${outputId}-${metric.id}`}>
            <DropdownMenuTrigger asChild>
              <div className="cursor-pointer">
                <InputTag.Root variant="emphasized">
                  <InputTag.List>
                    <div className="inline-flex peer disabled:select-none disabled:pointer-events-none self-stretch items-center justify-center whitespace-nowrap rounded-none px-1 py-0.5 text-sm hover:bg-accent ring-offset-background ring-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <CrosshairSimpleIcon className="h-4 w-4 text-blue-accent flex-shrink-0" weight="bold" />
                        <span className="text-sm text-blue-accent truncate">{getMetricDisplayText(metric)}</span>
                      </div>
                    </div>
                  </InputTag.List>
                </InputTag.Root>
              </div>
            </DropdownMenuTrigger>
            <MetricsDropdown
              accuracyEnabled={accuracyEnabled}
              onAccuracyToggle={handleAccuracyToggle}
              accuracyMargin={accuracyMargin}
              onAccuracyMarginChange={handleAccuracyMarginChange}
              selectedClassificationMethod={selectedClassificationMethod}
              onClassificationMethodSelect={handleClassificationMethodSelect}
              allowedMethodIds={allowedMethodIds}
              positives={positives}
              classes={classes}
              labels={labels}
              onPositivesChange={(vals) => setMetricParams(nodeId, outputId, { positives: vals })}
              onClassesChange={(vals) => setMetricParams(nodeId, outputId, { classes: vals })}
              onLabelsChange={(vals) => setMetricParams(nodeId, outputId, { labels: vals })}
            />
          </DropdownMenu>
        ))}
        <DropdownMenu key={`dropdown-${nodeId}-${outputId}`} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-transparent bg-transparent shadow-none hover:bg-accent hover:text-accent-foreground h-6 w-6 p-0 cursor-pointer flex-shrink-0",
                !isDropdownOpen && "opacity-0 group-hover/row:opacity-100"
              )}
            >
              {selectedMetrics.length === 0 ? <PlusIcon className="h-3 w-3" /> : <CaretDownIcon weight="regular" size={16} />}
            </div>
          </DropdownMenuTrigger>
          <MetricsDropdown
            accuracyEnabled={accuracyEnabled}
            onAccuracyToggle={handleAccuracyToggle}
            accuracyMargin={accuracyMargin}
            onAccuracyMarginChange={handleAccuracyMarginChange}
            selectedClassificationMethod={selectedClassificationMethod}
            onClassificationMethodSelect={handleClassificationMethodSelect}
            allowedMethodIds={allowedMethodIds}
            positives={positives}
            classes={classes}
            labels={labels}
            onPositivesChange={(vals) => setMetricParams(nodeId, outputId, { positives: vals })}
            onClassesChange={(vals) => setMetricParams(nodeId, outputId, { classes: vals })}
            onLabelsChange={(vals) => setMetricParams(nodeId, outputId, { labels: vals })}
          />
        </DropdownMenu>
      </div>
    </div>
  );
};

export default memo(MetricsCell);
