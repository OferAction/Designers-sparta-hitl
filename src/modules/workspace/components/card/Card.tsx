import type React from "react";
import { useRef } from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { CSSTransition } from "react-transition-group";

import { FolderTopIcon as FolderTop } from "@/lib/icons";
import { useTransitionGroupProps } from "@/contexts";
import { cn } from "@/utils";

const cardVariants = cva("group flex flex-col has-[[data-card-dropdown=open]]:bg-secondary bg-primary-foreground cursor-pointer ", {
  variants: {
    variant: {
      file: "hover:bg-secondary relative flex-1 w-auto rounded-xl border border-border overflow-hidden",
      folder: "relative flex-1 w-full group-hover:bg-secondary hover:bg-secondary rounded-xl rounded-tl-none",
      subflow:
        "relative border border-border-purple/50 bg-purple-background hover:bg-border-purple group-hover:bg-border-purple rounded-xl has-[[data-card-dropdown=open]]:bg-border-purple",
    },
  },
});

interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  children: React.ReactNode;
}

export function Card({ children, className, variant = "file", onClick, onContextMenu, ...props }: CardProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const transitionProps = useTransitionGroupProps();

  return (
    <CSSTransition
      key={props.id}
      classNames={{
        exitActive: "transition-all animate-zoomTiltOut duration-300",
      }}
      timeout={300}
      nodeRef={nodeRef}
      {...transitionProps}
    >
      <div className={cn("relative flex flex-col group w-full transition-all duration-300")} ref={nodeRef}>
        {/* shadow div */}
        {variant === "folder" && (
          <FolderTop
            className={cn(
              "text-primary-foreground group-hover:text-secondary cursor-pointer animate-zoomTiltIn bg-transparent translate-y-[1px] transition-all duration-300",
              "group-has-[[data-card-dropdown=open]]:text-secondary"
            )}
            onClick={onClick as React.MouseEventHandler}
            onContextMenu={onContextMenu as React.MouseEventHandler}
          />
        )}
        <div
          className={cn(
            cardVariants({
              variant,
            }),
            "transition-all duration-300",
            className
          )}
          onContextMenu={onContextMenu}
          onClick={onClick}
        >
          {children}
        </div>
      </div>
    </CSSTransition>
  );
}
