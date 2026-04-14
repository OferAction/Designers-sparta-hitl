import React from "react";

import { cva } from "class-variance-authority";

import { useTerminal } from "./context/TerminalContext";
import { cn } from "@/lib/utils";

const headerVariants = cva("", {
  variants: {
    variant: {
      viewer: "flex items-center justify-between border-b border-border p-2",
      input: "flex items-center justify-between px-2",
    },
    state: {
      default: "",
      disabled: "opacity-50 pointer-events-none",
      error: "text-destructive",
    },
  },
  defaultVariants: {
    variant: "viewer",
    state: "default",
  },
});

interface TerminalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({ children, className, ...props }) => {
  const { variant, disabled } = useTerminal();

  const componentState = disabled ? "disabled" : "default";

  return (
    <div className={cn(headerVariants({ variant, state: componentState }), className)} {...props}>
      {children}
    </div>
  );
};
