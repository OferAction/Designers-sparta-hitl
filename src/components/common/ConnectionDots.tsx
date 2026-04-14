import React from "react";

import { cn } from "@/utils";

export type ConnectionDotsProps = {
  className?: string;
  style?: React.CSSProperties;
};

export default function ConnectionDots({ className = "h-px text-muted-foreground/60", style }: ConnectionDotsProps) {
  return (
    <div aria-hidden className={cn(`flex items-center gap-[3px]`, className)} style={style}>
      <div className="w-[1px] h-[1px] bg-current " />
      <div className="w-[2px] h-[1px] bg-current " />
      <div className="w-[1px] h-[1px] bg-current " />
    </div>
  );
}
