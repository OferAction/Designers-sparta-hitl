import { XIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExitFullScreenButtonProps {
  onExit: () => void;
}

const ExitFullScreenButton = ({ onExit }: ExitFullScreenButtonProps) => {
  return (
    <div className="fixed top-3 left-3 z-50 pointer-events-auto">
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button variant="secondary" className="hover:bg-general-hover-secondary" size="icon" aria-label="Exit present mode ESC" onClick={onExit}>
              <XIcon size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground rounded-md border border-border">
            <p className="text-sm leading-5">Exit present mode ESC</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ExitFullScreenButton;
