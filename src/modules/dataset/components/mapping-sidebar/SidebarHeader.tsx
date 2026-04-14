import { ArrowLeftIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

interface SidebarHeaderProps {
  onBackClick: () => void;
  title?: string;
  className?: string;
}

export const SidebarHeader = ({ onBackClick, title = "Dataset", className }: SidebarHeaderProps) => {
  return (
    <div className={cn("border-b p-4", className)}>
      <div className="flex items-center gap-6">
        <Button variant="ghost" size="sm" onClick={onBackClick} className="w-8 h-8 rounded-md bg-foreground/10">
          <ArrowLeftIcon size={32} />
        </Button>
        <h2 className="font-semibold text-2xl">{title}</h2>
      </div>
    </div>
  );
};
