import React from "react";

import { cn } from "@/lib/utils";

export const TerminalHeaderLeft: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
};
