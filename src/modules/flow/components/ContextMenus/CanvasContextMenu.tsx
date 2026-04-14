import React, { useCallback, useState } from "react";

import { CanvasContextMenuContent } from "./CanvasContextMenuContent";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";

interface CanvasContextMenuProps {
  children: React.ReactNode;
  disabled?: boolean;
}

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [contextPoint, setContextPoint] = useState<{ x: number; y: number } | null>(null);

  const onContextMenuPoint = useCallback((e: React.MouseEvent) => {
    setContextPoint({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <ContextMenu modal={false} onOpenChange={setOpen}>
      <ContextMenuTrigger onContextMenu={onContextMenuPoint}>{children}</ContextMenuTrigger>
      {open && <CanvasContextMenuContent contextPoint={contextPoint} />}
    </ContextMenu>
  );
};
