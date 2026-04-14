import { useMemo } from "react";

import { PlaceholderIcon } from "@phosphor-icons/react";
import { useNodeConnections, useReactFlow } from "@xyflow/react";

import { RuleAction } from "./RuleHandling";
import ConnectionDots from "@/components/common/ConnectionDots";
import { InputLabel } from "@/components/common/InputLabel";
import type { Node } from "@/modules/flow/types/BaseNodeTypes";
import { cn } from "@/utils";

import { NODE_ICONS_MAP } from "@/constants/NodesConstants";

interface RuleRouteDisplayProps {
  action: RuleAction;
  handleId?: string;
  sourceNodeId?: string;
  targetNodeId?: string;
  onClick?: () => void;
  wrapperClassName?: string;
  isDefault?: boolean;
}

export function RuleRouteDisplay({
  action,
  handleId,
  targetNodeId,
  sourceNodeId,
  onClick,
  wrapperClassName = "",
  isDefault = false,
}: RuleRouteDisplayProps) {
  const reactFlowInstance = useReactFlow<Node>();
  const safeSourceId = sourceNodeId ?? "__none__";
  const connections = useNodeConnections({ handleId, handleType: "source", id: safeSourceId });

  const targetNode: Node | undefined = useMemo(() => {
    if (targetNodeId) return reactFlowInstance.getNode(targetNodeId);
    if (action !== "route" || !handleId || !sourceNodeId) return undefined;
    if (connections?.length) {
      const target = connections[0]?.target;
      return reactFlowInstance.getNode(target || "");
    }
  }, [action, connections, handleId, reactFlowInstance, sourceNodeId, targetNodeId]);

  const TargetIcon = useMemo(() => {
    if (!targetNode) return null;
    const comp = NODE_ICONS_MAP(targetNode.data?.name);
    return comp || PlaceholderIcon;
  }, [targetNode]);

  const routeError = !targetNode;
  const label = targetNode ? targetNode.data?.label || targetNode.data?.title : "Drag to route...";

  if (action !== "route") return null;
  if (!sourceNodeId && !targetNodeId) return null;

  return (
    <>
      <ConnectionDots className={cn("self-center h-px w-3 text-muted-foreground/60", { "text-purple-accent": isDefault })} />
      <div
        role="button"
        onClick={onClick}
        className={cn(
          "shrink-0 max-w-[340px] rounded-sm p-1 transition-colors flex items-center gap-2",
          {
            "bg-purple-accent/10 hover:bg-purple-accent/20": isDefault,
            "bg-destructive/10 hover:bg-destructive/10": routeError,
            "bg-muted/40 border border-border/20 hover:bg-muted/60": !routeError && !isDefault,
          },
          wrapperClassName
        )}
      >
        <InputLabel
          as="label"
          variant="flat"
          size="sm"
          className={cn("max-w-[140px] flex items-center gap-2", {
            "text-destructive hover:text-destructive": routeError,
            "text-muted-foreground": !routeError && isDefault,
            "text-foreground": !routeError && !isDefault,
          })}
        >
          <span className="inline-flex items-center gap-2 truncate">
            {targetNode && TargetIcon && <TargetIcon className="size-4 shrink-0" />}
            {label}
          </span>
        </InputLabel>
      </div>
    </>
  );
}

export default RuleRouteDisplay;
