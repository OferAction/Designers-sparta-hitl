import { ShieldChevronIcon, FunnelIcon, CrosshairSimpleIcon } from "@phosphor-icons/react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface JobCardMetricsProps {
  coverage: number;
  exExPercentage: number;
  accuracy?: string;
  selected: boolean;
}

export const JobCardMetrics = ({ coverage, exExPercentage, accuracy = "N/A", selected }: JobCardMetricsProps) => {
  return (
    <div className="flex flex-row items-center gap-3 flex-wrap transition-all duration-150">
      <div
        className={cn("flex flex-row items-center gap-1 group-hover/card:text-foreground", selected ? "text-foreground" : "text-muted-foreground")}
      >
        <Label className="text-sm leading-5">{typeof coverage === "number" ? coverage?.toFixed(2) + "%" : "N/A"}</Label>
        <ShieldChevronIcon weight="fill" size={16} />
      </div>
      <div className={cn("flex flex-row items-center gap-1 group-hover/card:text-warning", selected ? "text-warning" : "text-muted-foreground")}>
        <Label className="text-sm leading-5">{typeof exExPercentage === "number" ? exExPercentage?.toFixed(2) + "%" : "N/A"}</Label>
        <FunnelIcon weight="fill" size={16} />
      </div>
      <div
        className={cn("flex flex-row items-center gap-1 group-hover/card:text-blue-accent", selected ? "text-blue-accent" : "text-muted-foreground")}
      >
        <Label className="text-sm leading-5">{accuracy}</Label>
        <CrosshairSimpleIcon weight="fill" size={16} />
      </div>
    </div>
  );
};
