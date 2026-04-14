import { useEffect, useRef, useState } from "react";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

import { cn } from "@/utils";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = (props: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      setHeight(contentRef.current?.scrollHeight ?? 0);
    });
    resizeObserver.observe(contentRef.current);
    return () => resizeObserver.disconnect();
  }, [props.children]);

  return (
    <CollapsiblePrimitive.CollapsibleContent
      ref={contentRef}
      style={{ "--radix-collapsible-content-height": height ? `${height}px` : "0px" } as React.CSSProperties}
      className={cn("transition-[height] duration-300 ease-out", props.className)}
      {...props}
    />
  );
};

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
