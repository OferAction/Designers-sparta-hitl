import { useCallback, useEffect, useState } from "react";

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SimpleIterableNavigatorProps {
  iteration: number;
  totalIterations: number;
  onIterationChange: (value: number) => void;
  iterableName?: string; // e.g. "samples" or "items"
  className?: string;
}

export function SimpleIterableNavigator({
  iteration,
  totalIterations,
  onIterationChange,
  iterableName = "samples",
  className,
}: SimpleIterableNavigatorProps) {
  const total = Math.max(1, totalIterations);
  const safeIteration = Math.min(Math.max(0, iteration), total);

  // Local draft for direct number entry
  const [draft, setDraft] = useState(String(safeIteration));
  useEffect(() => {
    setDraft(String(safeIteration));
  }, [safeIteration]);

  const commit = useCallback(() => {
    const num = parseInt(draft, 10);
    if (isNaN(num)) return;
    const clamped = Math.min(Math.max(1, num), total);
    if (clamped !== safeIteration) onIterationChange(clamped);
  }, [draft, total, safeIteration, onIterationChange]);

  const goPrev = () => {
    if (safeIteration > 1) onIterationChange(safeIteration - 1);
  };
  const goNext = () => {
    if (safeIteration < total) onIterationChange(safeIteration + 1);
  };

  return (
    <div className={cn("flex items-center gap-2 m-1", className)}>
      <button
        type="button"
        onClick={goPrev}
        disabled={safeIteration <= 1}
        className={cn(
          "inline-flex items-center justify-center size-5 p-0.5 rounded-md bg-secondary text-muted-foreground transition",
          "disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary/80 hover:text-foreground shadow-md"
        )}
        aria-label="Previous"
      >
        <CaretLeftIcon size={16} />
      </button>
      <div className="inline-flex items-center gap-2 text-sm font-medium">
        <Input
          type="number"
          min={1}
          max={total}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
          }}
          className={cn(
            "h-6 w-6 p-1 bg-background border-border border rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 text-center text-sm font-semibold",
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          )}
        />
        <span className="text-muted-foreground whitespace-nowrap text-xs">
          out of {total} {iterableName}
        </span>
      </div>
      <button
        type="button"
        onClick={goNext}
        disabled={safeIteration >= total}
        className={cn(
          "inline-flex items-center justify-center size-5 p-0.5 rounded-md bg-secondary text-muted-foreground transition",
          "disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary/80 hover:text-foreground shadow-md"
        )}
        aria-label="Next"
      >
        <CaretRightIcon size={16} />
      </button>
    </div>
  );
}

export default SimpleIterableNavigator;
