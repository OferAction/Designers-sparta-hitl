import { useRef, useState, useCallback } from "react";

import WithTooltip from "@/components/common/WithTooltip";
import { InputTag } from "@/components/ui/input-tag";
import { VALUE_ICONS_MAP } from "@/constants";
import { cn } from "@/lib/utils";

export interface VariableTagProps {
  label: string;
  isActive: boolean;
  type?: string;
  isConnected?: boolean;
}

function useTextTruncation() {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const checkTruncation = useCallback(() => {
    if (textRef.current) {
      setIsTruncated(textRef.current.scrollWidth > textRef.current.clientWidth);
    }
  }, []);

  return { textRef, isTruncated, checkTruncation };
}

export function VariableTag({ label, isActive, type, isConnected = true }: VariableTagProps) {
  const { textRef, isTruncated, checkTruncation } = useTextTruncation();
  const Icon = VALUE_ICONS_MAP(type);

  const tagButton = (
    <InputTag.Root variant={isConnected ? "gtConnected" : "emphasized"} isGtConnected={isActive} className="group/variableTag">
      <InputTag.List>
        <div className={cn("flex items-center gap-2 min-w-0 p-0.5 max-w-[14rem]")}>
          <Icon className="h-4 w-4 text-muted-foreground group-hover/variableTag:text-primary flex-shrink-0" />
          <span ref={textRef} className="text-sm text-muted-foreground group-hover/variableTag:text-primary truncate" onMouseEnter={checkTruncation}>
            {label}
          </span>
        </div>
      </InputTag.List>
    </InputTag.Root>
  );

  if (!isTruncated) {
    return tagButton;
  }

  return (
    <WithTooltip tooltip={label} contentClassName="p-2 max-w-[16rem]" side="top">
      {tagButton}
    </WithTooltip>
  );
}

export default VariableTag;
