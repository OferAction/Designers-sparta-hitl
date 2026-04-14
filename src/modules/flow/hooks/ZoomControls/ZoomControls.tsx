import React from "react";

import { useZoomControls } from "./useZoomControls";
import { ZoomInButton } from "./ZoomInButton";
import { ZoomOutButton } from "./ZoomOutButton";
import { ZoomPicker } from "./ZoomPicker";

import Shortcut from "@/utils/Shortcut";

type Props = {
  enableShortcuts?: boolean;
};

const ZoomControls: React.FC<Props> = ({ enableShortcuts = true }) => {
  const z = useZoomControls({ enableShortcuts });

  return (
    <>
      <Shortcut shortcuts={z.shortcuts} />
      <div
        tabIndex={-1}
        ref={z.zoomContainerRef}
        className="min-w-20 flex items-center gap-x-1 rounded-l-md px-2 py-1 border-t border-b border-l border-border bg-background"
      >
        <ZoomOutButton onClick={z.onZoomOut} disabled={!z.canZoomOut} />

        <ZoomPicker
          zoomInput={z.zoomInput}
          open={z.open}
          onOpenChange={z.setOpen}
          presetZooms={z.presetZooms}
          onSelectPreset={z.onSelectPreset}
          onFitView={z.onFitView}
          onInputChange={z.onInputChange}
          onSubmit={z.onSubmit}
        />

        <ZoomInButton onClick={z.onZoomIn} disabled={!z.canZoomIn} />
      </div>
    </>
  );
};

export default ZoomControls;
export { ZoomControls };
