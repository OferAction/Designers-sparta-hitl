import React, { ReactNode } from "react";

import { ApproximateEqualsIcon, CheckCircleIcon, HourglassHighIcon, SpinnerGapIcon, XIcon } from "@phosphor-icons/react";

import { NodeWarningIcon as WarningIcon, RuleFunnelIcon as FunnelIcon } from "@/lib/icons";
import { NodeVariantBorderProps } from "@/modules/flow/components/GeneralNodes/CustomNodeVariants";

import { formatDuration } from "@/utils/durationFormatting";
import { cn } from "@/utils/tw-clsx";

interface RuleIndicatorProps {
  count: number;
  icon: ReactNode;
  badgeBgColor?: string;
}

const RuleIndicator = ({ count, icon, badgeBgColor = "" }: RuleIndicatorProps) => {
  if (count === 0) return null;

  if (count === 1) {
    return <>{icon}</>;
  }

  return (
    <div className={cn("flex items-center justify-center relative w-2.5 h-3 rounded-[1px] font-semibold", badgeBgColor)}>
      <span className="text-[9px] text-background font-semibold">{count}</span>
    </div>
  );
};

const StatusIcon = ({
  state,
  systemRules,
  reliabilityRules,
  executionTime,
  isGroundTruthConnected,
  type,
  cached,
  showExecutionTime = true,
}: {
  state: NodeVariantBorderProps["state"];
  systemRules: number;
  reliabilityRules: number;
  executionTime: number | null;
  isGroundTruthConnected: boolean;
  type?: string;
  cached?: boolean;
  showExecutionTime?: boolean;
}) => {
  if (state === "running") {
    return <SpinnerGapIcon className="animate-spinSlow size-4" />;
  }

  if (state === "pruned") {
    return <XIcon className="size-3 text-muted-foreground" />;
  }

  return (
    <div className="flex items-start gap-1  flex-col">
      <div className="flex items-center gap-1">
        <RuleIndicator count={reliabilityRules} icon={<FunnelIcon className="size-4 text-warning" />} badgeBgColor="bg-warning" />
        <RuleIndicator count={systemRules} icon={<WarningIcon className="size-4 text-destructive" />} badgeBgColor="bg-destructive" />
        <RuleIndicator
          count={state === "success" ? 1 : 0}
          icon={
            <CheckCircleIcon
              fill="currentColor"
              weight="fill"
              className={cn("size-4 text-muted-foreground", isGroundTruthConnected && "text-blue-accent")}
            />
          }
        />
      </div>
      {showExecutionTime && (
        <div className={cn("items-center gap-0.5  hidden bg-sidebar/30 w-fit rounded", executionTime && "flex")}>
          {cached && <span className="text-xs leading-4 font-medium text-muted-foreground mr-1">Cached</span>}
          {type === "iterator" && <ApproximateEqualsIcon className="size-4  py-0.5 text-muted-foreground" />}
          <HourglassHighIcon className="size-4 font-medium text-muted-foreground" />
          <span className="text-sm leading-4 font-medium text-muted-foreground">{formatDuration(executionTime?.toString() ?? "0")}</span>

          {/* TODO : TOKENS AREN'T USED IN THE FLOW YET */}
          {/* <div className={cn("items-center gap-0.5 py-0.5 hidden bg-[#0F172A]/30 w-fit rounded", nodeState === "success" && "flex")}>
                <CoinsIcon className="size-4 font-medium text-muted-foreground" />
                <span className="text-sm leading-4 font-medium text-muted-foreground">4</span>
              </div> */}
        </div>
      )}
    </div>
  );
};

export default React.memo(StatusIcon);
