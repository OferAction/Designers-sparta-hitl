import { ElementType } from "react";

import { NodeVariantBorderProps } from "@/modules/flow/components/GeneralNodes/CustomNodeVariants";
import { EdgeState } from "@/modules/flow/types";
import { cn } from "@/utils";

const stateColorMap: Record<NonNullable<NodeVariantBorderProps["state"]>, string> = {
  default: "hsl(var(--primary))",
  success: "hsl(var(--success))",
  error: "hsl(var(--destructive))",
  reliabilityRule: "hsl(var(--warning))",
  systemRule: "hsl(var(--destructive))",
  running: "hsl(var(--primary))",
  pruned: "hsl(var(--muted-foreground))",
};

const getEdgeStateColor = (state?: NodeVariantBorderProps["state"]): string => {
  return state ? stateColorMap[state] : stateColorMap["default"];
};

type DefaultEdgePathProps = {
  id: string;
  edgePath: string;
  selected?: boolean;
  strokeWidth?: string;
};

type EdgeAnimationBasePathProps = {
  edgePath: string;
  strokeWidth: string;
  state?: EdgeState;
  gradientId?: string;
  sourceNodeState?: NodeVariantBorderProps["state"];
  targetNodeState?: NodeVariantBorderProps["state"];
  strokeDasharray?: string;
};

type EdgeGradientLineAnimationProps = {
  edgePath: string;
  id: string;
  strokeWidth: string;
  stopAnimation?: boolean;
};

type EdgeEvaluatingStateProps = {
  id: string;
  edgePath: string;
  strokeWidth: string;
};

type EdgeRunningStateProps = {
  id: string;
  edgePath: string;
  state: EdgeState;
  strokeWidth: string;
  sourceX: number;
  targetX: number;
  EdgeLabelRenderer: ElementType;
  labelX: number;
  labelY: number;
  stopAnimation: boolean;
  sourceNodeState: NodeVariantBorderProps["state"];
  targetNodeState: NodeVariantBorderProps["state"];
  isRuleHandle?: boolean;
};

export const DefaultPath = ({ id, edgePath, selected, strokeWidth, isRuleHandle }: DefaultEdgePathProps & { isRuleHandle?: boolean }) => {
  return (
    <path
      id={id}
      d={edgePath}
      strokeWidth={strokeWidth}
      fill="none"
      stroke="hsl(var(--border))"
      className={cn("group-hover/edge:stroke-primary", selected ? "stroke-primary" : "stroke-border")}
      strokeDasharray={isRuleHandle ? "5 5" : undefined}
    />
  );
};

const EdgeAnimationBasePath = ({
  edgePath,
  strokeWidth,
  state = "default",
  gradientId,
  sourceNodeState,
  targetNodeState,
  strokeDasharray,
}: EdgeAnimationBasePathProps) => {
  const shouldUseGradient = gradientId && sourceNodeState !== targetNodeState;

  return (
    <path
      d={edgePath}
      strokeWidth={strokeWidth}
      stroke={shouldUseGradient ? `url(#${gradientId})` : undefined}
      strokeDasharray={strokeDasharray}
      className={cn(
        !shouldUseGradient && state === "success" && "stroke-success",
        !shouldUseGradient && state === "error" && "stroke-destructive/50",
        !shouldUseGradient && state === "default" && "stroke-border"
      )}
      fill="none"
    />
  );
};

const EdgeGradientLineAnimation = ({ edgePath, id, strokeWidth, stopAnimation = false }: EdgeGradientLineAnimationProps) => {
  return (
    <path d={edgePath} stroke={`url(#${id})`} strokeWidth={strokeWidth} strokeDasharray="17 17" strokeDashoffset="0" fill="none">
      <animate
        attributeName="stroke-dashoffset"
        from="0"
        to="-68"
        dur={stopAnimation ? "0s" : "1.5s"}
        repeatCount="indefinite"
        keyTimes="0;1"
        calcMode="linear"
      />
    </path>
  );
};

export const EdgeEvaluatingState = ({ id, edgePath, strokeWidth }: EdgeEvaluatingStateProps) => {
  return (
    <>
      <EdgeAnimationBasePath edgePath={edgePath} strokeWidth={strokeWidth} />
      <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop stopColor="#5EEAD4">
          <animate attributeName="stop-color" values="#5EEAD4;#3B82F6;#A855F7;#F43F5E;#5EEAD4" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop offset="0.32" stopColor="#3B82F6">
          <animate attributeName="stop-color" values="#3B82F6;#A855F7;#F43F5E;#5EEAD4;#3B82F6" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop offset="0.66" stopColor="#A855F7">
          <animate attributeName="stop-color" values="#A855F7;#F43F5E;#5EEAD4;#3B82F6;#A855F7" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop offset="1" stopColor="#F43F5E">
          <animate attributeName="stop-color" values="#F43F5E;#5EEAD4;#3B82F6;#A855F7;#F43F5E" dur="4s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
      <EdgeGradientLineAnimation edgePath={edgePath} id={id} strokeWidth={strokeWidth} />
    </>
  );
};

export const EdgeRunningState = ({
  id,
  strokeWidth,
  edgePath,
  state,
  sourceX,
  targetX,
  sourceNodeState,
  targetNodeState,
  isRuleHandle,
}: EdgeRunningStateProps) => {
  const gradientDirection = {
    x1: sourceX < targetX ? "0%" : "100%",
    y1: "0%", // Always 0% for horizontal lines
    x2: sourceX < targetX ? "100%" : "0%",
    y2: "0%", // Always 0% for horizontal lines
  };

  const sourceColor = getEdgeStateColor(sourceNodeState);
  const targetColor = getEdgeStateColor(targetNodeState);

  // Check if we should use gradient (when in running mode and not success state)
  const shouldUseGradient = sourceNodeState !== targetNodeState;

  return (
    <>
      <EdgeAnimationBasePath
        edgePath={edgePath}
        strokeWidth={state === "default" ? strokeWidth : "2px"}
        state={state}
        gradientId={id}
        sourceNodeState={sourceNodeState}
        targetNodeState={targetNodeState}
        strokeDasharray={isRuleHandle ? "5 5" : undefined}
      />
      {/* {state === "error" && (
        <linearGradient id={id} {...gradientDirection}>
          <stop offset="0" stopColor="#DC2626" />
          <stop offset="0.5" stopColor="#DC2626" />
          <stop offset="0.5" stopColor="transparent" />
          <stop offset="1" stopColor="transparent" />
        </linearGradient>
      )} */}
      {/* {state === "error" && (
        <EdgeLabelRenderer>
          <Button
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            size="sm"
            variant="destructive"
            className="absolute z-[99999] w-fit h-fit border border-destructive/50 bg-background text-foreground p-[2px] cursor-default"
          >
            <XIcon size={16} />
          </Button>
        </EdgeLabelRenderer>
      )} */}
      <defs>
        {/* Base gradient for the solid path */}
        {shouldUseGradient && (
          <linearGradient id={id} {...gradientDirection}>
            <stop offset="0%" stopColor={sourceColor} />
            <stop offset="70%" stopColor={targetColor} />
          </linearGradient>
        )}
        {/* Gradient for the animated dashed line */}
        {/* <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
          {shouldUseGradient ? (
            <>
              <stop offset="0%" stopColor={sourceColor} />
              <stop offset="100%" stopColor={targetColor} />
            </>
          ) : (
            <>
              {state === "default" && <stop stopColor="hsl(var(--primary))" />}
              {state === "success" && <stop stopColor="hsl(var(--success))" />}
            </>
          )}
        </linearGradient> */}
      </defs>
      {/* <EdgeGradientLineAnimation edgePath={edgePath} id={id} strokeWidth={state === "default" ? strokeWidth : "2px"} stopAnimation={false} /> */}
    </>
  );
};
