import React from "react";

import { FunnelIcon } from "@phosphor-icons/react";
import { cva } from "class-variance-authority";
import { PlusIcon as Plus, WarningIcon } from "@phosphor-icons/react";

import { CustomRuleFunnelIcon, FunnelCodeNutIcon as FunnelCodeNut, FunnelNutIcon as FunnelNut } from "@/lib/icons";
import { useExecutionStore, useFlowStore } from "@/store";
import { cn } from "@/utils";
const handleCircleVariants = cva(
  "flex justify-center cursor-pointer pointer-events-none relative size-2 items-center origin-center transition-all duration-150 group-hover:items-center translate-x-0",
  {
    variants: {
      type: { source: "", target: "" },
      state: {
        notConnected: "handleAbove",
        connected: "handleAbove",
      },
      running: {
        false:
          "group-hover/handle:!size-6 group-hover/handle:bg-primary-foreground group-hover/handle:!rounded-full group-hover/handle:outline outline-2 outline-secondary",
        true: "",
      },
      nodeState: {
        default: "bg-border",
        success: "bg-success",
        error: "bg-destructive",
        running: "bg-border",
        systemRule: "bg-destructive",
        pruned: "bg-muted-foreground",
        reliabilityRule: "bg-warning",
      },
      systemRule: { false: "", true: "" },
      isDefaultRule: { false: "", true: "!cursor-not-allowed pointer-events-auto" },
    },
    compoundVariants: [
      {
        type: "source",
        state: "connected",
        systemRule: false,
        className: "rounded-r-full translate-x-[50%] border-l-none w-1 h-2",
      },
      {
        type: "source",
        systemRule: false,
        running: false,
        className: "group-hover:translate-x-[unset] group-hover:size-4",
      },
      {
        type: "source",
        nodeState: "default",
        className: "group-hover:rounded-full",
      },
      {
        type: "source",
        state: "notConnected",
        className: "rounded-full",
      },
      {
        type: "target",
        state: "notConnected",
        className:
          "rounded-full group-hover:translate-x-[-50%] group-hover:rounded-l-full group-hover:rounded-r-none group-hover:w-1 group-hover/handle:!translate-x-[unset]",
      },
      { type: "target", state: "connected", className: "rounded-l-full w-1 translate-x-[-50%]" },
      {
        type: "target",
        state: ["notConnected", "connected"],
        running: false,
        className: "group-hover/handle:rounded-full group-hover/handle:translate-x-0",
      },
      { state: "connected", running: true, className: "!w-1 !h-2 pointer-events-none" },
      {
        type: "source",
        running: false,
        systemRule: true,
        className: "group-hover:translate-x-[unset] group-hover:rounded-t-none",
      },
      {
        state: ["notConnected", "connected"],
        running: true,
        systemRule: true,
        className: "!w-2 !h-[4px] pointer-events-none !translate-y-[50%] rounded-b-full rounded-t-none",
      },
      {
        systemRule: true,
        type: "source",
        state: ["notConnected", "connected"],
        running: false,
        className: "mt-1 group group-hover/handle:!size-4 !translate-x-0 w-2 h-1 rounded-b-full rounded-t-none flex items-end justify-center",
      },
    ],
    defaultVariants: {
      type: "source",
      state: "notConnected",
      running: false,
      systemRule: false,
    },
  }
);

const iconBaseClassNames =
  "text-foreground w-full h-full opacity-0 transition-none shrink-0 block leading-none group-hover/handle:opacity-100 transition-transform duration-50 ease-in-out";

const iconRuleBaseClassNames = "size-3 group-hover/handle:size-4 group-hover/handle:opacity-100";

export interface HandleCircleProps {
  isSource: boolean;
  isConnected: boolean;
  nodeSelected?: boolean;
  running: boolean;
  isSystemRuleHandle: boolean;
  isBuiltInRuleHandle: boolean;
  isCustomRuleHandle: boolean;
  isDefaultBuiltInRoute?: boolean;
  isDefaultCustomRoute?: boolean;
  nodeId: string;
}

export const HandleCircle: React.FC<HandleCircleProps> = ({
  isSource,
  isConnected,
  running,
  isSystemRuleHandle,
  isBuiltInRuleHandle,
  isCustomRuleHandle,
  isDefaultBuiltInRoute,
  isDefaultCustomRoute,
  nodeId,
}) => {
  const isBuildMode = useFlowStore((state) => state.mode === "build");
  const nodeState = useExecutionStore((state) => (isBuildMode ? "default" : state.getNodeState(nodeId)));

  const isRuleHandle = isSystemRuleHandle || isBuiltInRuleHandle || isCustomRuleHandle || isDefaultBuiltInRoute || isDefaultCustomRoute;

  const baseClasses = handleCircleVariants({
    type: isSource ? "source" : "target",
    state: isConnected ? "connected" : "notConnected",
    running: running,
    nodeState: nodeState,
    systemRule: isRuleHandle,
    isDefaultRule: isDefaultBuiltInRoute || isDefaultCustomRoute,
  });

  const renderRuleIcon = () => {
    if (running) return null;

    if (isDefaultBuiltInRoute) {
      return <FunnelNut className={cn(iconBaseClassNames, iconRuleBaseClassNames)} />;
    }

    if (isDefaultCustomRoute) {
      return <FunnelCodeNut className={cn(iconBaseClassNames, iconRuleBaseClassNames)} />;
    }

    if (isSystemRuleHandle) {
      return <WarningIcon className={cn(iconBaseClassNames, iconRuleBaseClassNames)} />;
    }

    if (isBuiltInRuleHandle) {
      return <FunnelIcon className={cn(iconBaseClassNames, iconRuleBaseClassNames)} weight="fill" />;
    }

    if (isCustomRuleHandle) {
      return <CustomRuleFunnelIcon className={cn(iconBaseClassNames, iconRuleBaseClassNames)} />;
    }

    return null;
  };

  return (
    <div className={baseClasses}>
      {!running && !isRuleHandle && (
        <Plus
          className={cn(iconBaseClassNames, isSource && "group-hover:opacity-100", !isSource && "group-hover/handle:opacity-100")}
          strokeWidth={1}
        />
      )}
      {renderRuleIcon()}
    </div>
  );
};

export default HandleCircle;
