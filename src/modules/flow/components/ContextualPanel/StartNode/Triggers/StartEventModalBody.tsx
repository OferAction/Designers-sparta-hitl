import React from "react";

import { CircleNotchIcon, XIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/utils";

type StartEventModalBodyProps = {
  title: string;
  onClose: () => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  children: React.ReactNode;
  sourceSection?: React.ReactNode;
  contentRef?: React.RefObject<HTMLDivElement>;
  className?: string;
  isSubmitting?: boolean;
  lockClose?: boolean;
  // disableSubmit?: boolean; // deprecated - button always enabled; validation handles errors
};

export function StartEventModalBody({
  title,
  onClose,
  onSubmit,
  children,
  sourceSection,
  contentRef,
  className,
  isSubmitting,
  lockClose,
}: StartEventModalBodyProps) {
  return (
    <DialogContent
      ref={contentRef}
      className={cn(
        "w-[400px] max-h-[90vh] overflow-y-auto border-border block bg-ocr-modal-bg/30 backdrop-blur-[10px] left-auto translate-x-0 translate-y-0 origin-center top-16 right-[427px]",
        "data-[state=closed]:!slide-out-to-right-full data-[state=closed]:!slide-out-to-top-0 data-[state=open]:!slide-in-from-right-full data-[state=open]:!slide-in-from-top-0 data-[state=closed]:!zoom-out-100 data-[state=open]:!zoom-in-100 data-[state=open]:!animate-z-index-slide-in data-[state=closed]:z-[5] !duration-200 px-0 py-0",
        className
      )}
      hideCloseButton={true}
      overlayProps={{ className: "bg-transparent" }}
      onInteractOutside={lockClose ? (e) => e.preventDefault() : undefined}
      onEscapeKeyDown={lockClose ? (e) => e.preventDefault() : undefined}
    >
      <DialogTitle className="sr-only">{title}</DialogTitle>
      <form onSubmit={onSubmit}>
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 z-20 bg-sidebar">
          <h3 className="text-base font-medium">{title}</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <XIcon size={20} />
          </button>
        </div>

        {sourceSection ? <div className="py-3 px-4 border-b border-border">{sourceSection}</div> : null}

        <div className="px-5 pt-4 pb-2 space-y-4">{children}</div>

        <DialogFooter className="px-5 py-4 border-t border-border">
          <Button variant="secondary" className="w-full" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <CircleNotchIcon size={16} className="animate-spin" />
                Saving...
              </span>
            ) : (
              "Save Event Configuration"
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default StartEventModalBody;
