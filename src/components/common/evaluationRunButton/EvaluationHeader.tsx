import { Button } from "@/components/ui/button";

interface EvaluationHeaderProps {
  isPending: boolean;
  hasSelectedDataset: boolean;
  evaluateSamplesCount: number;
  onCancel: () => void;
  onEvaluate: () => void;
}

/**
 * Header section with cancel and evaluate action buttons.
 * Displays the sample count dynamically in the evaluate button text.
 */
export function EvaluationHeader({ isPending, hasSelectedDataset, evaluateSamplesCount, onCancel, onEvaluate }: EvaluationHeaderProps) {
  return (
    <div className="flex justify-between items-center p-3">
      <Button variant="ghost" className="text-white hover:text-destructive hover:bg-white/10 py-2.5" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        variant="blue"
        onClick={onEvaluate}
        loading={isPending}
        disabled={isPending || !hasSelectedDataset}
        className="h-full py-2.5 mr-0.5 min-w-[180px]"
      >
        {hasSelectedDataset ? `Evaluate ${evaluateSamplesCount} samples` : "Start Evaluation"}
      </Button>
    </div>
  );
}
