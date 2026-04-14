import React from "react";

import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const headerTitleVariants = cva("text-sm font-medium text-white");

interface TerminalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const TerminalTitle: React.FC<TerminalTitleProps> = ({ children, className, ...props }) => {
  return (
    <h3 className={cn(headerTitleVariants(), className)} {...props}>
      {children}
    </h3>
  );
};
