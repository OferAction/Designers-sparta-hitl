import WithTooltip from "@/components/common/WithTooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import RangeSlider from "@/components/ui/range-slider";
import { cn } from "@/lib/utils";
import type { Dataset, Subset } from "@/modules/dataset/types";
import { FULL_DATASET } from "@/store/evaluationRunStore";

interface SubsetSelectionProps {
  dataset: Dataset;
  activeSubsets: Subset[];
  radioValue: string;
  amount: number;
  onRadioChange: (value: string) => void;
  onAmountChange: (value: number) => void;
}

/**
 * Radio group for selecting between full dataset or a specific subset, with inline range sliders.
 * Each option shows the total sample count, and the selected option displays a slider for fine-tuning the sample amount.
 */
export function SubsetSelection({ dataset, activeSubsets, radioValue, amount, onRadioChange, onAmountChange }: SubsetSelectionProps) {
  return (
    <div className="mx-3 mb-3 border border-border-blue rounded-xl bg-blue-accent/5 overflow-hidden">
      <RadioGroup value={radioValue} onValueChange={onRadioChange} className="gap-0 grid-cols-1">
        {/* All the dataset option */}
        <label
          className={cn(
            "flex items-center gap-3 hover:bg-blue-accent/10 px-3 py-2 cursor-pointer transition-colors",
            radioValue === FULL_DATASET && "bg-blue-accent/20"
          )}
        >
          <RadioGroupItem value={FULL_DATASET} />
          <span className="text-sm flex-1">All the dataset</span>
          <span className={cn("text-sm shrink-0", radioValue === FULL_DATASET ? "text-primary" : "text-muted-foreground")}>
            {dataset.samplesCount}
          </span>
        </label>
        {radioValue === FULL_DATASET && (
          <div className="px-3 pb-2 bg-blue-accent/20">
            <RangeSlider value={amount} totalSamples={dataset.samplesCount} onValueChange={onAmountChange} />
          </div>
        )}

        {/* Subset items with inline slider below the selected one */}
        {activeSubsets.map((subset) => (
          <div key={subset.id}>
            <label
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 hover:bg-blue-accent/10 cursor-pointer transition-colors border-t border-border-blue/60 overflow-hidden",
                radioValue === subset.id && "bg-blue-accent/20"
              )}
            >
              <RadioGroupItem value={subset.id} className="shrink-0" />
              <div className="flex-1 overflow-hidden">
                <WithTooltip tooltip={subset.name} side="top" delayDuration={300}>
                  <p className="text-sm truncate">{subset.name}</p>
                </WithTooltip>
              </div>
              <span className={cn("text-sm shrink-0", radioValue === subset.id ? "text-primary" : "text-muted-foreground")}>
                {subset.subsetJobCount}
              </span>
            </label>

            {radioValue === subset.id && (
              <div className="px-3 pb-3 bg-blue-accent/20">
                <RangeSlider value={amount} totalSamples={subset.subsetJobCount} onValueChange={onAmountChange} />
              </div>
            )}
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
