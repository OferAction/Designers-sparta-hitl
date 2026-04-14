import React from "react";

import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const headerControlsVariants = cva("", {
  variants: {
    variant: {
      default: "flex items-center gap-3",
      inputModal: "items-center justify-end pt-11",
      textlimit: "ml-auto text-md textforeground tabular-nums leading-5",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface TerminalControlsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const TerminalControls: React.FC<TerminalControlsProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn(headerControlsVariants({ variant: "default" }), className)} {...props}>
      {React.Children.map(children, (child) => {
        if (child === null || child === undefined || child === false) return null;
        if (typeof child === "string" && child.trim().length === 0) return null;

        if (React.isValidElement(child)) {
          if (child.props?.hidden) return null;
        }

        return <div className={cn("border rounded-md p-1 hover:bg-accent")}>{child}</div>;
      })}
    </div>
  );
};
