import { ReactNode } from "react";

import { DialogTitle } from "@radix-ui/react-dialog";

import { usePanelDialogContext, usePanelDialogStateContext } from "./PanelDialogContext";
import { Dialog } from "@/components/ui/dialog";

interface PanelDialogProps {
  content?: ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export function PanelDialog({ content: propContent, onOpenChange }: PanelDialogProps) {
  const { content: contextContent } = usePanelDialogStateContext();
  const { isOpen, closeDialog } = usePanelDialogContext();

  const displayContent = propContent || contextContent;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeDialog();
    }
    onOpenChange?.(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} >
      <DialogTitle className="hidden">Contextual Panel Dialog</DialogTitle>
      {displayContent}
    </Dialog>
  );
}
