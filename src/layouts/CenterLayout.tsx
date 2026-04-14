import React from "react";

import { ResizablePanel } from "@/components/ui/resizable";
import { cn } from "@/utils";

export default function CenterLayout({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <ResizablePanel className={cn("relative flex flex-col justify-between self-stretch items-end min-w-0 z-100 pointer-events-none", className)}>
      {children}
    </ResizablePanel>
  );
}
