import * as React from "react";

import { cn } from "@/lib/utils";

interface HoverActionWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface HoverActionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  position?: "right" | "left";
}

const HoverActionWrapper = React.forwardRef<HTMLDivElement, HoverActionWrapperProps>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("group/input hover:bg-muted/50 has-[:focus]:bg-muted/50 has-[[data-state=open]]:bg-muted/50 relative", className)}
      {...props}
    >
      {children}
    </div>
  );
});

HoverActionWrapper.displayName = "HoverActionWrapper";

const positionClasses = {
  right: "right-0 border-l",
  left: "left-0 border-r",
};
const HoverActions = React.forwardRef<HTMLDivElement, HoverActionProps>(({ children, className, position = "right", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-accent/75 hover:bg-accent/75 absolute top-0 bottom-0 px-1 border-border",
        "hidden group-has-[:focus]/input:hidden group-has-focus/input:hidden group-hover/input:flex",
        "items-center justify-center transition-colors has-[[data-state=open]]:flex",
        positionClasses[position],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

HoverActions.displayName = "HoverActions";

export { HoverActionWrapper, HoverActions };
