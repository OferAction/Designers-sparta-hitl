import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { Grid, type GridCellProps } from "react-virtualized";
import "react-virtualized/styles.css";

import { pianoIndicatorVariants } from "./variants";
import WithTooltip from "@/components/common/WithTooltip";
import { cn } from "@/lib/utils";

import type { PianoIndicator as PianoIndicatorType } from "./Piano";

interface PianoIndicatorProps {
  totalIterations: number;
  indicators: PianoIndicatorType[];
  selectedIteration?: number;
  onClick: (iteration: number) => void;
  containerWidth: number;
  containerHeight: number;
}

export function PianoIndicator({ totalIterations, indicators, selectedIteration, onClick, containerWidth, containerHeight }: PianoIndicatorProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartScrollLeft, setDragStartScrollLeft] = useState(0);
  const dragDistanceRef = useRef(0);
  const gridRef = useRef<Grid>(null);

  const indicatorMap = useMemo(() => {
    const map = new Map<number, PianoIndicatorType["type"]>();
    // Determine if incoming indices are already 0-based (presence of a 0)
    const isZeroBased = indicators.some((i) => i.index === 0);
    indicators.forEach((indicator) => {
      const internalIndex = isZeroBased ? indicator.index : indicator.index - 1; // normalize to 0-based
      if (internalIndex >= 0) {
        map.set(internalIndex, indicator.type);
      }
    });
    return map;
  }, [indicators]);

  const getIndicatorType = (index: number): PianoIndicatorType["type"] => {
    return indicatorMap.get(index) || "default";
  };

  const { itemWidth, columnWidth, requiresScroll } = useMemo(() => {
    const MIN_W = 0.4;
    const MAX_W = 4;
    const MIN_G = 0;
    const total = totalIterations;
    const cw = containerWidth || 0;

    if (!cw) {
      return { itemWidth: MIN_W, gap: MIN_G, columnWidth: MIN_W + MIN_G, requiresScroll: false };
    }
    // Ideal per-column space if we want to perfectly fill without scroll
    const perCol = cw / total;
    // Try using max width first
    let w = Math.min(MAX_W, Math.max(MIN_W, perCol - MIN_G));
    let g = perCol - w;
    // If after enforcing min gap and width we still can't fit (width fell below MIN_W), we fall back to min values and allow scroll.
    let requiresScroll = false;
    if (w <= MIN_W && perCol < MIN_W + MIN_G) {
      w = MIN_W;
      g = MIN_G;
      requiresScroll = true;
    }
    const colW = w + g;
    // Double check total width vs container width to decide scroll.
    const totalNeeded = colW * total;
    if (totalNeeded - cw > 0.5) {
      requiresScroll = true;
    }
    return { itemWidth: w, gap: g, columnWidth: colW, requiresScroll };
  }, [totalIterations, containerWidth]);

  useLayoutEffect(() => {
    if (gridRef.current) {
      gridRef.current.recomputeGridSize();
    }
  }, [columnWidth, containerWidth, totalIterations]);

  const cellRenderer = ({ columnIndex, key, style }: GridCellProps) => {
    // Internal styling index is 0-based
    const zeroBasedIndex = columnIndex;
    const displayedIteration = zeroBasedIndex + 1; // UI shows 1-based

    return (
      <div key={key} style={{ ...style, overflow: "hidden" }}>
        <WithTooltip tooltip={`${displayedIteration}`} side="top">
          <div
            className={cn(pianoIndicatorVariants({ type: getIndicatorType(zeroBasedIndex), state: "default" }))}
            style={{ width: `${itemWidth}px` }}
            onMouseEnter={() => setHoveredIndex(columnIndex)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => {
              // Only trigger click if drag distance is small (not a drag gesture)
              if (dragDistanceRef.current < 5) {
                onClick(displayedIteration);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`${displayedIteration}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onClick(displayedIteration);
              }
            }}
          />
        </WithTooltip>
      </div>
    );
  };

  if (!containerWidth || !containerHeight) {
    return null;
  }

  const totalWidth = totalIterations * columnWidth;
  const canScroll = requiresScroll; // enable sliding only when fitting fails

  const handleWheel = (e: React.WheelEvent) => {
    if (!canScroll) return;
    e.preventDefault();
    e.stopPropagation();
    if (gridRef.current) {
      const grid = gridRef.current;
      const currentScrollLeft = grid.state?.scrollLeft || 0;
      const newScrollLeft = Math.max(0, Math.min(totalWidth - containerWidth, currentScrollLeft + e.deltaY));
      gridRef.current.scrollToPosition({ scrollLeft: newScrollLeft, scrollTop: 0 });
      setScrollLeft(newScrollLeft);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canScroll) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartScrollLeft(scrollLeft);
    dragDistanceRef.current = 0;
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !canScroll) return;

    const deltaX = dragStartX - e.clientX;
    dragDistanceRef.current = Math.abs(deltaX);
    const newScrollLeft = Math.max(0, Math.min(totalWidth - containerWidth, dragStartScrollLeft + deltaX));

    if (gridRef.current) {
      gridRef.current.scrollToPosition({ scrollLeft: newScrollLeft, scrollTop: 0 });
      setScrollLeft(newScrollLeft);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) setIsDragging(false);
  };

  return (
    <div style={{ position: "relative", width: containerWidth, height: containerHeight }}>
      <div
        style={{
          width: containerWidth,
          height: containerHeight,
          position: "relative",
          overflow: "hidden",
          cursor: canScroll ? (isDragging ? "grabbing" : "grab") : "default",
          borderRadius: "4px",
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <Grid
          ref={gridRef}
          width={containerWidth}
          height={containerHeight}
          columnCount={totalIterations}
          columnWidth={columnWidth}
          rowCount={1}
          rowHeight={containerHeight}
          cellRenderer={cellRenderer}
          overscanColumnCount={10}
          className="no-scrollbar"
          style={{ overflow: "hidden" }}
        />
      </div>
      {hoveredIndex !== null && (
        <div
          style={{
            position: "absolute",
            left: hoveredIndex * columnWidth - scrollLeft,
            top: -2,
            bottom: 0,
            width: 3,
            height: containerHeight + 4,
            pointerEvents: "none",
            overflow: "visible",
            zIndex: 10,
          }}
        >
          <div
            className={cn(
              pianoIndicatorVariants({
                type: getIndicatorType(hoveredIndex),
                state: "default",
              }),
              "absolute z-20 ring-1 ring-primary rounded-md w-0.5",
              (selectedIteration ? selectedIteration - 1 === hoveredIndex : false) && "hidden",
              (hoveredIndex * columnWidth - scrollLeft < -columnWidth || hoveredIndex * columnWidth - scrollLeft > containerWidth) && "hidden"
            )}
            role="button"
            aria-label={`${hoveredIndex + 1}`}
          />
        </div>
      )}

      {selectedIteration !== undefined && (
        <div
          style={{
            position: "absolute",
            left: (selectedIteration - 1) * columnWidth - scrollLeft,
            top: 0,
            width: 2,
            height: containerHeight + 2,
            pointerEvents: "none",
            overflow: "visible",
            zIndex: 10,
          }}
        >
          <div
            className={cn(
              pianoIndicatorVariants({
                type: getIndicatorType(selectedIteration - 1),
                state: "selected",
              }),
              // Hide if out of visible bounds
              ((selectedIteration - 1) * columnWidth - scrollLeft < -columnWidth ||
                (selectedIteration - 1) * columnWidth - scrollLeft > containerWidth) &&
                "hidden"
            )}
            style={{ width: `${2}px` }}
            role="button"
            aria-label={`${selectedIteration}`}
          />
        </div>
      )}
    </div>
  );
}
