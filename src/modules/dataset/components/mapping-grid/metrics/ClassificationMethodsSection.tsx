import { XIcon } from "@phosphor-icons/react";

import { ConfigurableInputField } from "./InputFields";
import { MetricConfigurationProps } from "./utils";
import { CLASSIFICATION_METHODS, getMetricName } from "@/modules/dataset/types/metrics";
import { cn } from "@/utils";

interface ClassificationMethodsSectionProps extends MetricConfigurationProps {
  selectedClassificationMethod: string | null;
  onClassificationMethodSelect: (methodId: string) => void;
  allowedMethodIds?: string[];
}

export const ClassificationMethodsSection = ({
  selectedClassificationMethod,
  onClassificationMethodSelect,
  allowedMethodIds,
  positives,
  classes,
  labels,
  onPositivesChange,
  onClassesChange,
  onLabelsChange,
}: ClassificationMethodsSectionProps) => {
  const renderMetricConfiguration = (method: any) => {
    if (!method) return null;

    // Binary classification metrics with positive class configuration
    if (method.hasPositiveOption) {
      return (
        <ConfigurableInputField
          placeholder="Add positive class"
          items={positives}
          onAdd={(value: string) => onPositivesChange([...(positives || []), value])}
          onRemove={(index: number) => onPositivesChange((positives || []).filter((_, i) => i !== index))}
        />
      );
    }

    // Multiclass classification metrics with class configuration
    if (method.hasConfigurableClasses) {
      return (
        <ConfigurableInputField
          placeholder="Set classes"
          items={classes}
          onAdd={(value: string) => onClassesChange([...classes, value])}
          onRemove={(index: number) => onClassesChange(classes.filter((_, i) => i !== index))}
        />
      );
    }

    if (method.hasConfigurableLabels) {
      return (
        <ConfigurableInputField
          placeholder="Set labels"
          items={labels}
          onAdd={(value: string) => onLabelsChange([...labels, value])}
          onRemove={(index: number) => onLabelsChange(labels.filter((_, i) => i !== index))}
        />
      );
    }

    return null;
  };

  const renderItemList = (items: string[], onRemove: (index: number) => void) => {
    return items.map((item, index) => (
      <div key={index} className="px-3 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{item}</span>
        <button
          type="button"
          className="h-4 w-4 p-0 text-muted-foreground hover:text-primary transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
        >
          <XIcon className="h-3 w-3" />
        </button>
      </div>
    ));
  };

  const visibleMethods = allowedMethodIds ? CLASSIFICATION_METHODS.filter((m) => allowedMethodIds.includes(m.id)) : CLASSIFICATION_METHODS;

  return (
    <div>
      {visibleMethods.map((method) => {
        const isSelected = selectedClassificationMethod === method.id;
        return (
          <div key={method.id}>
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClassificationMethodSelect(method.id);
              }}
              className={cn(
                "bg-blue-background border-t border-border-blue px-3 py-2.5 flex items-center justify-between cursor-pointer text-xs text-muted-foreground",
                "hover:bg-blue-accent/20",
                isSelected && "bg-blue-accent/20 text-primary"
              )}
            >
              <span>{method.name}</span>
              <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center bg-background border-primary")}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-primary"></div>}
              </div>
            </div>

            {isSelected && (
              <div>
                {renderMetricConfiguration(method)}

                {method.availableMetrics.map((metric) => (
                  <div key={metric} className="bg-blue-accent/20 px-3 py-2 text-xs text-muted-foreground">
                    {getMetricName(metric)}
                  </div>
                ))}

                {method.hasPositiveOption && Array.isArray(positives) && positives.length > 0 && (
                  <div className="bg-blue-accent/20">
                    {renderItemList(positives, (index) => onPositivesChange((positives || []).filter((_, i) => i !== index)))}
                  </div>
                )}

                {method.hasConfigurableClasses && classes.length > 0 && (
                  <div className="bg-blue-accent/20">
                    {renderItemList(classes, (index) => onClassesChange(classes.filter((_, i) => i !== index)))}
                  </div>
                )}

                {method.hasConfigurableLabels && labels.length > 0 && (
                  <div className="bg-blue-accent/20">{renderItemList(labels, (index) => onLabelsChange(labels.filter((_, i) => i !== index)))}</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
