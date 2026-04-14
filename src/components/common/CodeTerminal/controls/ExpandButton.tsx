import React, { useCallback, MouseEvent } from "react";

import { ArrowsInIcon, ArrowsOutIcon } from "@phosphor-icons/react";
import { cva } from "class-variance-authority";

import { useTerminal } from "../context/TerminalContext";
import WithTooltip from "@/components/common/WithTooltip";
import { cn } from "@/lib/utils";

const iconVariants = cva("h-4 w-4 cursor-pointer text-primary hover:text-muted-foreground");

interface ExpandButtonProps extends React.HTMLAttributes<SVGSVGElement> {
  className?: string;
  setExternalExpand?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ExpandButton: React.FC<ExpandButtonProps> = ({ className, setExternalExpand, ...props }) => {
  const { expanded, setExpanded } = useTerminal();

  const handleExpand = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      e.stopPropagation();
      e.preventDefault();
      if (setExternalExpand) {
        return setExternalExpand(true);
      }
      setExpanded(true);
    },
    [setExpanded, setExternalExpand]
  );

  const handleCollapse = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      e.stopPropagation();
      e.preventDefault();
      setExpanded(false);
    },
    [setExpanded]
  );

  if (expanded) {
    return (
      <WithTooltip tooltip="Collapse terminal" delayDuration={0}>
        <ArrowsInIcon className={cn(iconVariants(), className)} onClick={handleCollapse} {...props} />
      </WithTooltip>
    );
  }

  return (
    <WithTooltip tooltip="Expand terminal" delayDuration={0}>
      <ArrowsOutIcon className={cn(iconVariants(), className)} onClick={handleExpand} />
    </WithTooltip>
  );
};
