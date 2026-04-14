import React from "react";

import { QuestionIcon } from "@phosphor-icons/react";

import WithTooltip from "@/components/common/WithTooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

type Props = React.PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>> & {
  title: string;
  buttons?: React.ReactNode[];
  tooltip?: string;
};

export const SectionTitle: React.FC<Props> = ({ children, className, title, tooltip, ...rest }) => {
  return (
    <div className="flex gap-1">
      <div className="flex-1 flex gap-1 items-center">
        <h2 className={cn("text-xs leading-5 font-medium py-2.5 text-sidebar-foreground/70", className)} {...rest}>
          {title}
        </h2>
        {tooltip && (
          <WithTooltip tooltip={tooltip} side="right">
            <Button variant="ghost" className="!p-1.5px size-fit">
              <QuestionIcon className="!size-[13px]" />
            </Button>
          </WithTooltip>
        )}
      </div>
      <div className="py-1.5 flex items-center gap-1">{children}</div>
    </div>
  );
};

export const SectionTitleButton: React.FC<React.ComponentProps<typeof Button> & { tooltip?: string }> = ({ children, tooltip, ...rest }) => {
  return (
    <WithTooltip tooltip={tooltip} side="top">
      <Button variant="ghost" size="icon" className="h-7 w-7" {...rest}>
        {children}
      </Button>
    </WithTooltip>
  );
};
