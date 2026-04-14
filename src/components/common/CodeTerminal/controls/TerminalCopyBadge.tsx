import React from "react";

import { useTerminal } from "../context";
import { Badge } from "@/components/ui/badge";

interface TerminalCopyBadgeProps {
  /** milliseconds before auto hide; set 0/undefined to keep until manually hidden */
  duration?: number;
  children?: React.ReactNode;
  className?: string;
  label?: string;
}

export const TerminalCopyBadge: React.FC<TerminalCopyBadgeProps> = ({
  className = "py-.05 px-2.5 text-secondary-foreground text-sm leading-4 font-medium shadow animate-in fade-in",
  label = "Copied to clipboard",
  children,
}) => {
  const { showAlert } = useTerminal();

  if (!showAlert) return null;

  return (
    <Badge variant="secondary" className={className}>
      {children || label}
    </Badge>
  );
};
