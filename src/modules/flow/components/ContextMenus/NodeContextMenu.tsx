import React, { useState } from "react";

import { NodeContextMenuContent } from "./NodeContextMenuContent";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";

interface NodeContextMenuProps {
  id: string;
  children: React.ReactNode;
}
const NodeContextMenuInner: React.FC<NodeContextMenuProps> = ({ id, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <ContextMenu onOpenChange={setOpen} modal={false}>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      {open && <NodeContextMenuContent id={id} />}
    </ContextMenu>
  );
};

export const NodeContextMenu = React.memo(NodeContextMenuInner);
