import { useRef, useEffect, useState } from "react";

// Refactored to receive iteration props from parent (runSlice) instead of context
import { PianoIndicator } from "./PianoIndicator";
import { PianoIndicatorVariants } from "@/components/common/Piano/variants";
import { cn } from "@/lib/utils";

export interface PianoIndicator {
  index: number;
  type?: PianoIndicatorVariants["type"];
}

export interface PianoProps {
  /** Array of indicators with special styling */
  indicators?: PianoIndicator[];
  /** Height of the piano container */
  height?: string | number;
  /** Width of the piano container */
  width?: string | number;
  /** Custom className for the container */
  className?: string;
}

export interface PianoInternalProps extends PianoProps {
  totalIterations: number;
  iteration: number;
  onIterationChange: (value: number) => void;
}

export function Piano({
  indicators = [],
  height = "40px",
  width = "100%",
  className,
  totalIterations,
  iteration,
  onIterationChange,
}: PianoInternalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerWidth(rect.width);
        setContainerHeight(rect.height);
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleClick = (i: number) => {
    onIterationChange(i);
  };

  return (
    <div
      className={cn("", className)}
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        width: typeof width === "number" ? `${width}px` : width,
      }}
    >
      <div className="h-full w-full overflow-visible bg-muted/40 rounded-md border border-border">
        <div ref={containerRef} className="h-full w-full overflow-visible">
          <PianoIndicator
            totalIterations={totalIterations}
            indicators={indicators}
            selectedIteration={iteration}
            onClick={handleClick}
            containerWidth={containerWidth}
            containerHeight={containerHeight}
          />
        </div>
      </div>
    </div>
  );
}
