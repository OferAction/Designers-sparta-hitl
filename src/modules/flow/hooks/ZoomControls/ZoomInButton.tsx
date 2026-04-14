import React from "react";

import { MagnifyingGlassPlusIcon } from "@phosphor-icons/react";

import WithTooltip from "@/components/common/WithTooltip";
import { IconSplitButtonItem } from "@/components/ui/split-button";

type Props = {
  onClick: () => void;
  disabled?: boolean;
};

export const ZoomInButton = React.memo(function ZoomInButton({ onClick, disabled }: Props) {
  return (
    <WithTooltip
      tooltip={
        <>
          <span>Zoom in</span>
          <span className="pl-2.5 text-muted-foreground text-xs leading-5">⌘+</span>
        </>
      }
    >
      <IconSplitButtonItem onClick={onClick} disabled={disabled} className="size-8" variant="ghost" aria-label="Zoom in ⌘+">
        <MagnifyingGlassPlusIcon size={16} weight="regular" />
      </IconSplitButtonItem>
    </WithTooltip>
  );
});
