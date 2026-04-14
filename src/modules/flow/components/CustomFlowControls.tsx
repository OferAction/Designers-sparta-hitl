import React, { useCallback } from "react";

import { PresentationIcon, ScanIcon } from "@phosphor-icons/react";
import { useReactFlow } from "@xyflow/react";

import ZoomControls from "@/modules/flow/hooks/ZoomControls/ZoomControls";

import { useFullScreen } from "./FlowResizablePanelGroup";
import WithTooltip from "@/components/common/WithTooltip";
import { IconSplitButtonItem } from "@/components/ui/split-button";
import { CANVAS_VIEW_SETTINGS } from "@/constants";

const CustomFlowControls: React.FC = () => {
  const { fitView } = useReactFlow();
  const { toggleFullScreen } = useFullScreen();

  const handleFitView = useCallback(() => {
    fitView(CANVAS_VIEW_SETTINGS);
  }, [fitView]);

  return (
    <div className="flex justify-center items-stretch h-10">
      <ZoomControls />

      <div className="flex items-center justify-center gap-x-1 p-2 border border-border bg-background">
        <WithTooltip
          tooltip={
            <>
              <span>Fit to screen</span>
              <span className="pl-2.5 text-muted-foreground text-xs leading-5">⌘⌥⏎</span>
            </>
          }
        >
          <IconSplitButtonItem onClick={handleFitView} className="size-8" variant="ghost" aria-label="Fit to screen ⌘⌥⏎">
            <ScanIcon weight="bold" role="presentation" aria-hidden="true" focusable="false" />
          </IconSplitButtonItem>
        </WithTooltip>

      </div>

      <div className="flex items-center justify-center gap-x-1 rounded-r-md p-2 border-r border-t border-b border-border bg-background">
        <WithTooltip
          tooltip={
            <>
              <span>Present</span>
              <span className="pl-2.5 text-muted-foreground text-xs leading-5">⌘/</span>
            </>
          }
        >
          <IconSplitButtonItem onClick={toggleFullScreen} className="size-8" variant="ghost" aria-label="Present ⌘/">
            <PresentationIcon weight="bold" role="presentation" aria-hidden="true" focusable="false" />
          </IconSplitButtonItem>
        </WithTooltip>
      </div>
    </div>
  );
};

export default CustomFlowControls;
export { CustomFlowControls };
