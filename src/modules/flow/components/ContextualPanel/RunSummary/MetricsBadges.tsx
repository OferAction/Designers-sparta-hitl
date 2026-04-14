import { DiamondIcon } from "@phosphor-icons/react";

export interface MetricsBadgesProps {
  groundTruthDiff: number;
  reliabilityRules: number;
  systemRules: number;
}

export const MetricsBadges = ({ groundTruthDiff, reliabilityRules, systemRules }: MetricsBadgesProps) => {
  return (
    <div className="flex items-center gap-1">
      {/* Diamond with number */}
      <div className="relative w-4 h-4">
        <DiamondIcon size={14} className="text-warning absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" weight="fill" />
        <span className="text-[8px] text-background absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] font-semibold">
          {groundTruthDiff}
        </span>
      </div>

      {/* Warning/reliability badge (orange) */}
      <div className="flex items-center justify-center relative w-3 h-3 bg-warning rounded-[1px] font-semibold">
        <span className="text-[8px] text-background font-semibold">{reliabilityRules}</span>
      </div>

      {/* System rules badge (red) */}
      <div className="flex items-center justify-center text-center relative w-3 h-3 bg-destructive rounded-[1px] font-semibold">
        <span className="text-[8px] text-background font-semibold">{systemRules}</span>
      </div>
    </div>
  );
};

export default MetricsBadges;
