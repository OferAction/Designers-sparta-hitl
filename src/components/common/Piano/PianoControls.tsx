import React, { useState, useCallback } from "react";

import { CaretLeftIcon, CaretRightIcon, CaretLineLeftIcon, CaretLineRightIcon } from "@phosphor-icons/react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PianoControlsProps {
  className?: string;
  arrowsSize?: number;
  /** When true hides the input label and only shows arrows. */
  compact?: boolean;
  showText?: boolean;
}

export interface PianoControlsInternalProps extends PianoControlsProps {
  iteration: number;
  totalIterations: number;
  indicatorIndices?: number[];
  onIterationChange: (value: number) => void;
}

export function PianoControls({
  className,
  arrowsSize = 16,
  compact = false,
  iteration,
  totalIterations,
  indicatorIndices,
  showText = true,
  onIterationChange,
}: PianoControlsInternalProps) {
  const [draft, setDraft] = useState(String(iteration));

  // Sync draft when iteration changes externally
  React.useEffect(() => {
    setDraft(String(iteration));
  }, [iteration]);

  const digitCount = Math.max(2, draft.length || 1);
  const dynamicWidth = Math.max(40, digitCount * 16);

  const commit = useCallback(() => {
    const num = parseInt(draft, 10);
    if (isNaN(num)) return;
    const clamped = Math.min(Math.max(1, num), Math.max(1, totalIterations));
    onIterationChange(clamped);
  }, [draft, totalIterations, onIterationChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      commit();
    }
  };

  // Compute previous/next highlighted iterations from indicatorIndices
  const highlights = React.useMemo(() => {
    const uniqueSorted = Array.from(new Set(indicatorIndices?.map((n) => Math.max(1, Math.min(n, Math.max(1, totalIterations)))))).sort(
      (a, b) => a - b
    );
    return uniqueSorted;
  }, [indicatorIndices, totalIterations]);

  const prevExists = React.useMemo(() => highlights.some((n) => n < iteration), [highlights, iteration]);
  const nextExists = React.useMemo(() => highlights.some((n) => n > iteration), [highlights, iteration]);

  const goPrevHighlight = useCallback(() => {
    const prev = [...highlights].filter((n) => n < iteration).pop();
    onIterationChange(prev ?? highlights[0]);
  }, [highlights, iteration, onIterationChange]);

  const goNextHighlight = useCallback(() => {
    const next = highlights.find((n) => n > iteration);
    onIterationChange(next ?? highlights[highlights.length - 1]);
  }, [highlights, iteration, onIterationChange]);

  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={goPrevHighlight}
          disabled={!prevExists}
          className={cn(
            "inline-flex items-center justify-center rounded-sm bg-transparent text-muted-foreground hover:text-foreground transition",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "h-6 w-6"
          )}
        >
          <CaretLineLeftIcon className="text-foreground" weight="fill" size={arrowsSize} />
        </button>
        <button
          type="button"
          onClick={() => onIterationChange(iteration - 1)}
          disabled={iteration <= 1}
          className={cn(
            "inline-flex items-center justify-center rounded-sm bg-transparent text-muted-foreground hover:text-foreground transition",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "h-6 w-6"
          )}
        >
          <CaretLeftIcon className="text-foreground" size={arrowsSize} />
        </button>
        <button
          type="button"
          onClick={() => onIterationChange(iteration + 1)}
          disabled={iteration >= totalIterations}
          className={cn(
            "inline-flex items-center justify-center rounded-sm bg-transparent text-muted-foreground hover:text-foreground transition",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "h-6 w-6"
          )}
        >
          <CaretRightIcon className="text-foreground" size={arrowsSize} />
        </button>
        <button
          type="button"
          onClick={goNextHighlight}
          disabled={!nextExists}
          className={cn(
            "inline-flex items-center justify-center rounded-sm bg-transparent text-muted-foreground hover:text-foreground transition",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "h-6 w-6"
          )}
          aria-label="Last iteration"
        >
          <CaretLineRightIcon className="text-foreground" weight="fill" size={arrowsSize} />
        </button>
      </div>
      {!compact && (
        <div className="flex items-center">
          {!showText && <span className="relative text-sm text-muted-foreground mr-1">iteration #</span>}
          <div
            className={cn("relative flex items-center justify-center", "bg-background text-foreground", "shadow-inner", "h-8", "max-w-16")}
            style={{ width: `${dynamicWidth}px` }}
          >
            <Input
              type="number"
              min={1}
              max={Math.max(totalIterations, 1)}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={handleKeyDown}
              className={cn(
                "h-8 w-full border-border border rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 text-center text-sm font-semibold",
                "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              )}
            />
          </div>
          <span className="text-sm text-muted-foreground pl-1">/ {Math.max(totalIterations, 1)}</span>
        </div>
      )}
    </div>
  );
}

export default PianoControls;
