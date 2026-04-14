import { GitBranchIcon as GitBranch } from "@phosphor-icons/react";

import { Label } from "@/components/ui/label";

interface JobCardHeaderProps {
  title: string;
  version: string;
}

export const JobCardHeader = ({ title, version }: JobCardHeaderProps) => {
  return (
    <Label className="flex items-center text-sm font-medium text-foreground leading-5 mb-0.5">
      {title}
      <span className="flex text-sidebar-foreground/70">
        <GitBranch className="size-4 ml-1 mr-0.5" /> {version}
      </span>
    </Label>
  );
};
