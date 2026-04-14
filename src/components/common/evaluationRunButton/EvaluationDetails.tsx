import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EvaluationDetailsProps {
  description: string;
  onDescriptionChange: (value: string) => void;
}

/**
 * Textarea section for entering a description or notes for the evaluation run.
 * Supports resizing with a maximum height constraint.
 */
export function EvaluationDetails({ description, onDescriptionChange }: EvaluationDetailsProps) {
  return (
    <div className="p-3">
      <Label className="text-sm font-semibold">Evaluation details</Label>
      <Textarea
        placeholder="e.g fixed PDF extraction"
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        className="mt-2 h-24 border-input bg-background resize-y overflow-auto max-h-48"
      />
    </div>
  );
}
