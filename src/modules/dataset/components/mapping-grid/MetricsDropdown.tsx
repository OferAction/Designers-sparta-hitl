import { AccuracySection, ClassificationMethodsSection } from "./metrics";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MetricsDropdownProps {
  accuracyEnabled: boolean;
  onAccuracyToggle: (enabled: boolean) => void;
  accuracyMargin: number;
  onAccuracyMarginChange: (margin: number) => void;
  selectedClassificationMethod: string | null;
  onClassificationMethodSelect: (methodId: string) => void;
  // allowed methods based on output type
  allowedMethodIds?: string[];
  // metric configuration values (controlled by parent)
  positives: string[];
  classes: string[];
  labels: string[];
  onPositivesChange: (values: string[]) => void;
  onClassesChange: (values: string[]) => void;
  onLabelsChange: (values: string[]) => void;
}

const MetricsDropdown = ({
  accuracyEnabled,
  onAccuracyToggle,
  accuracyMargin,
  onAccuracyMarginChange,
  selectedClassificationMethod,
  onClassificationMethodSelect,
  allowedMethodIds,
  positives,
  classes,
  labels,
  onPositivesChange,
  onClassesChange,
  onLabelsChange,
}: MetricsDropdownProps) => {
  return (
    <ScrollArea>
      <DropdownMenuContent
        side="bottom"
        align="start"
        sideOffset={4}
        className="w-60 p-0 bg-blue-background text-popover-foreground rounded-md shadow-lg overflow-auto border border-border-blue"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="px-3 py-2 text-sm font-medium border-b border-border-blue bg-blue-background">Evaluation Metrics</div>

        <AccuracySection
          accuracyEnabled={accuracyEnabled}
          onAccuracyToggle={onAccuracyToggle}
          accuracyMargin={accuracyMargin}
          onAccuracyMarginChange={onAccuracyMarginChange}
        />

        <ClassificationMethodsSection
          selectedClassificationMethod={selectedClassificationMethod}
          onClassificationMethodSelect={onClassificationMethodSelect}
          allowedMethodIds={allowedMethodIds}
          positives={positives}
          classes={classes}
          labels={labels}
          onPositivesChange={onPositivesChange}
          onClassesChange={onClassesChange}
          onLabelsChange={onLabelsChange}
        />
      </DropdownMenuContent>
    </ScrollArea>
  );
};

export default MetricsDropdown;
