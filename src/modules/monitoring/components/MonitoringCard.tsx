import { Icon, InfoIcon } from "@phosphor-icons/react";

import { Spinner } from "@/components/common/Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils";

interface ReliableCardProps {
  className?: string;
  title?: string;
  titleClassName?: string;
  tooltip?: string;
  mainValue?: string;
  mainValueClassName?: string;
  subtitle?: string;
  subtitleClassName?: string;
  icon?: Icon;
  iconSize?: number;
  iconColor?: string;
  iconClassName?: string;
  cardClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
  isLoading?: boolean;
}

export default function MonitoringCard({
  className,
  title,
  tooltip = "",
  mainValue,
  mainValueClassName,
  subtitle = "--",
  subtitleClassName,
  icon: IconComponent,
  headerClassName,
  isLoading,
}: ReliableCardProps) {
  if (!isLoading && !mainValue) return null;
  return (
    <Card className={cn("flex flex-col justify-between py-3 px-4 w-full bg-sidebar border-sidebar-border gap-6", className)}>
      <CardHeader className={cn("flex flex-row justify-between items-start p-0 text-sidebar-foreground/70 space-y-0", headerClassName)}>
        <CardTitle className="text-sm leading-6">{title}</CardTitle>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="py-1.5">
                <InfoIcon className="size-3 text-sidebar-foreground/70" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-2 p-0">
        <div className={cn("flex gap-2 items-center text-foreground", mainValueClassName)}>
          <span className="leading-none font-bold"> {isLoading ? <Spinner /> : mainValue}</span>
          {IconComponent && <IconComponent weight="fill" className="text-2xl" />}
        </div>
        <p className={cn("text-xs", subtitleClassName)}>{subtitle}</p>
      </CardContent>
    </Card>
  );
}
