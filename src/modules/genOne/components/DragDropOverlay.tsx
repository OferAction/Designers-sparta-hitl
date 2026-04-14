import React from "react";

import { PlusCircleIcon } from "@phosphor-icons/react";

interface DragDropOverlayProps {
  isVisible: boolean;
}

const DragDropOverlay: React.FC<DragDropOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute top-14 left-0 right-0 bottom-0 z-50 bg-sidebar/80 flex items-center justify-center border-2 border-dashed rounded-xl border-blue-accent-hover pointer-events-none m-3 mt-0">
      <div className="flex flex-col items-center gap-3 text-center p-6">
        <PlusCircleIcon className="w-8 h-8 text-primary" />
        <div>
          <p className="font-medium text-foreground w-[200px]">Drop any file here to add it to the conversation</p>
        </div>
      </div>
    </div>
  );
};

export default DragDropOverlay;
