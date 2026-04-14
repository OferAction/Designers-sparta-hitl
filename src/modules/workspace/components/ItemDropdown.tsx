import { isValidElement, useRef, useState } from "react";

import { DotsThreeOutlineIcon } from "@phosphor-icons/react";

import { useEditableFieldContextSelector } from "@/components/common/EditableField";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useItemDropdownRefContext } from "@/modules/workspace/contexts";
import { DropdownItem } from "@/modules/workspace/types/items";
import { cn } from "@/utils";

interface CardDropdownProps {
  items: DropdownItem[];
  children?: React.ReactNode;
  onDialogClose?: () => void;
  isInsideSubflow?: boolean;
}

export function ItemDropdown({ items, isInsideSubflow = false }: CardDropdownProps) {
  const isEditing = useEditableFieldContextSelector((ctx) => ctx.isEditing);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<React.ReactNode>(null);

  const onCloseAutoFocusHandler = useRef<() => void>();
  const { triggerButtonRef } = useItemDropdownRefContext();

  const onItemClick = (e: React.MouseEvent, { onClick, onCloseAutoFocus }: DropdownItem) => {
    e.stopPropagation();

    const dialogContent = onClick?.(e); // execute the item's onClick handler with event
    if (isValidElement(dialogContent)) {
      setIsDialogOpen(true);
      setDialogContent(dialogContent);
    } else {
      setIsDialogOpen(false);
      setDialogContent(null);
    }

    onCloseAutoFocusHandler.current = onCloseAutoFocus; // this way we can execute a handler (based on the item) after the dialog closes
  };

  const handleCloseAutoFocus = (e: Event) => {
    if (onCloseAutoFocusHandler.current) {
      e.preventDefault();
      e.stopPropagation();

      onCloseAutoFocusHandler.current?.(); // if there is a handler, in the clicked item, execute it
      onCloseAutoFocusHandler.current = undefined; // reset the handler after it's executed
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setIsDialogOpen(false);
      setDialogContent(null);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div onClick={handleClick}>
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <AlertDialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger ref={triggerButtonRef} asChild data-card-dropdown={isDropdownOpen ? "open" : "closed"}>
              <Button
                size="icon"
                className={cn(
                  "border-l-0 px-2 ml-0 size-8 text-foreground hover:text-foreground",
                  isEditing && "hidden",
                  isInsideSubflow
                    ? ["hover:bg-white/5", isDropdownOpen && "bg-white/5"]
                    : ["hover:bg-general-hover-secondary", isDropdownOpen && "bg-general-hover-secondary"]
                )}
                variant="ghost"
              >
                <DotsThreeOutlineIcon className="size-4" weight="fill" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onCloseAutoFocus={handleCloseAutoFocus}>
              {items.map((item, idx) =>
                item.separator ? (
                  <DropdownMenuSeparator key={`sep-${idx}`} />
                ) : (
                  <DialogTrigger key={idx} asChild>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem disabled={item.disabled} onClick={(e) => onItemClick(e, item)} className="cursor-pointer">
                        {item.label}
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DialogTrigger>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {dialogContent}
        </AlertDialog>
      </Dialog>
    </div>
  );
}
