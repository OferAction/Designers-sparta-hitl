import { XIcon } from "@phosphor-icons/react";
import { ConnectionLineComponentProps, EdgeLabelRenderer, getBezierPath } from "@xyflow/react";

import { Button } from "@/components/ui/button";

export default function ConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  connectionStatus,
  fromPosition,
  fromHandle,
  toPosition,
}: ConnectionLineComponentProps) {
  const handleId: string = fromHandle?.id || "";
  const isRuleHandle = /^system_rules_route_|^built_in_rule_|^custom_rule_/.test(handleId);

  // Match BaseEdge slight vertical jitter avoidance when perfectly horizontal
  const adjustedFromY = fromY === toY ? fromY + 0.01 : fromY;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: fromX,
    sourceY: adjustedFromY,
    targetX: toX,
    targetY: toY,
    sourcePosition: fromPosition,
    targetPosition: toPosition,
  });

  const isInvalid = connectionStatus === "invalid";

  return (
    <g>
      {isInvalid && (
        <EdgeLabelRenderer>
          <Button
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            size="sm"
            variant="destructive"
            className="absolute z-[99999] w-fit h-fit border border-destructive/50 bg-background text-foreground p-[2px]"
          >
            <XIcon size={16} />
          </Button>
        </EdgeLabelRenderer>
      )}
      <path d={edgePath} fill="none" stroke="hsl(var(--border))" strokeWidth={2} strokeDasharray={isRuleHandle ? "5 5" : undefined} />
    </g>
  );
}
