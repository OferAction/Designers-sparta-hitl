import { HTMLAttributes, ReactNode } from "react";

import { TransitionGroup } from "react-transition-group";

import { useTransitionGroupChildFactory } from "@/contexts";
import { FileCardSkeleton } from "@/modules/workspace/components/files";
import { FolderCardSkeleton } from "@/modules/workspace/components/folders";
import { cn } from "@/utils";

interface CardGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  loading?: boolean;
}

export function CardGrid({ children, className, loading, ...rest }: CardGridProps) {
  const childFactory = useTransitionGroupChildFactory();

  if (loading) {
    return (
      <div className={cn("grid grid-cols-[repeat(auto-fill,minmax(292px,1fr))] w-full py-16 px-11 justify-between gap-8", className)} {...rest}>
        {Array.from({ length: 5 }, (_, index) => (
          <FolderCardSkeleton key={index} />
        ))}
        <FileCardSkeleton />
      </div>
    );
  }

  return (
    <TransitionGroup
      component="div"
      className={cn("grid grid-cols-[repeat(auto-fill,minmax(292px,1fr))] w-full py-16 px-11 justify-between gap-8", className)}
      childFactory={childFactory}
      {...rest}
    >
      {children}
    </TransitionGroup>
  );
}
