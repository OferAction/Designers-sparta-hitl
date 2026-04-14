import { useReactFlow } from "@xyflow/react";

import { Piano, PianoProps } from "./Piano";
import { PianoControls } from "./PianoControls";
import { SimpleIterableNavigator } from "./SimpleIterableNavigator";
import { NODE_CATEGORY_COLOR, NodeIconsMapping } from "@/constants";
import { cn } from "@/lib/utils";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { Node } from "@/modules/flow/types";

export interface PianoSectionProps extends PianoProps {
  /** Optional external selected iteration to initialize provider */
  initialIteration?: number;
  /** Controlled iteration value */
  iteration?: number;
  /** Callback when iteration changes */
  onIterationChange?: (iteration: number) => void;
  nodeId?: string;
  hideTitle?: boolean;
  hideControls?: boolean;
  /** Name of iterable for small mode display (e.g. "samples") */
  iterableName?: string;
  headerText?: string;
}

export function PianoSection({
  indicators = [],
  height = 38,
  width = "100%",
  nodeId,
  hideControls = false,
  className,
  iteration = 1,
  onIterationChange,
  totalIterations,
  children,
  iterableName = "samples",
  headerText = "Sample to preview",
}: PianoSectionProps & { totalIterations: number; children?: React.ReactNode }) {
  const { getNode } = useReactFlow<Node>();
  const targetNode = nodeId ? getNode(nodeId) : undefined;
  const nodeTitle = targetNode?.data.label;
  const Icon = targetNode ? NodeIconsMapping[targetNode.data.name] : null;
  const colorVar = targetNode ? NODE_CATEGORY_COLOR[targetNode.data.name] || "var(--foreground)" : "var(--foreground)";

  // Clamp iteration to valid range (handle case where selected iteration > totalIterations)
  const safeIteration = Math.min(Math.max(0, iteration), Math.max(1, totalIterations || 1));
  const safeTotalIterations = Math.max(1, totalIterations || 1);

  return (
    <SectionContainer className={cn("py-1 space-y-2 last:border-b-1", className)}>
      <div className="flex items-center gap-2">
        {nodeId && (
          <div className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md", "bg-muted/40")}>
            {Icon && <Icon className="w-4 h-4" style={{ color: `hsl(${colorVar})` }} />}
            <span className="text-muted-foreground text-sm">{nodeTitle}</span>
          </div>
        )}
        <span className="text-xs font-medium text-muted-foreground">{headerText}</span>
      </div>

      {safeTotalIterations <= 10 ? (
        <div className="flex justify-center">
          {/* Compact navigator replaces piano + controls when number of iterations is less than or equal to 10 */}
          <SimpleIterableNavigator
            iteration={safeIteration}
            totalIterations={safeTotalIterations}
            onIterationChange={onIterationChange || (() => {})}
            iterableName={iterableName}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mt-1">
            {!hideControls && (
              <PianoControls
                iteration={safeIteration}
                totalIterations={safeTotalIterations}
                indicatorIndices={indicators.map((it) => Math.max(1, it.index))}
                onIterationChange={onIterationChange || (() => {})}
              />
            )}
          </div>
          <Piano
            indicators={indicators}
            height={height}
            width={width}
            totalIterations={safeTotalIterations}
            iteration={safeIteration}
            onIterationChange={onIterationChange || (() => {})}
          />
        </>
      )}
      {children && <div className="pt-1">{children}</div>}
    </SectionContainer>
  );
}

export default PianoSection;
