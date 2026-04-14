import React from "react";

import { GenOneGradientIcon, GenOneIcon } from "@/lib/icons";
import WithTooltip from "@/components/common/WithTooltip";
import { cn } from "@/utils";

interface GenOneButtonProps {
  onClick: () => void;
  isOpen: boolean;
  hasNotification: boolean;
  hasOrchestration: boolean;
  isLoading?: boolean;
}

const GenOneIconComponent = ({ shouldAnimateGradient }: { shouldAnimateGradient: boolean }) => {
  if (shouldAnimateGradient) {
    return <GenOneIcon className="transition-transform rounded-lg " />;
  } else {
    return <GenOneGradientIcon className="transition-transform rounded-lg" />;
  }
};

const GenOneButton: React.FC<GenOneButtonProps> = ({ onClick, isOpen, hasNotification, hasOrchestration, isLoading = false }) => {
  const shouldAnimateGradient = isLoading && !hasOrchestration;

  return (
    <WithTooltip
      tooltip="Create or edit with ActOne"
    >
      <div
        onClick={onClick}
        className={cn(
          "relative flex items-center justify-center shadow-lg bg-primary text-primary-foreground cursor-pointer",
          "bg-background border rounded-lg border-transparent w-full h-full p-px flex transition-transform",
          "[&_svg]:hover:rotate-12 size-10"
        )}
      >
        <div
          className={cn(
            "absolute rounded-lg left-0 top-0 size-10 flex p-px justify-center items-center hover:scale-110 transition-all",
            shouldAnimateGradient ? "border-ai-gradient-animated" : "border-ai-gradient",
            isOpen ? "size-40 rounded-br-3xl opacity-0" : "size-10 rounded-lg"
          )}
        >
          <div
            className={cn(
              "flex items-center justify-center rounded-lg w-full h-full transition-all",
              isOpen && "rounded-br-3xl",
              shouldAnimateGradient ? "bg-ai-gradient-animated" : "bg-background",
              4
            )}
          >
            <GenOneIconComponent shouldAnimateGradient={shouldAnimateGradient} />
          </div>
        </div>

        {/* Notification dot */}
        {hasNotification && !isOpen && (
          <div className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full bg-background canvasBlack p-0.5">
            <div className="rounded-full h-2 w-2 bg-purple-accent"></div>
          </div>
        )}
      </div>
    </WithTooltip>
  );
};

export default GenOneButton;
