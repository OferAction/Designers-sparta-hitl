"use client";

import * as React from "react";

import { XIcon } from "@phosphor-icons/react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Resizable } from "re-resizable";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

type ResizableDirections = {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
};

type ResizeDirection = "top" | "right" | "bottom" | "left" | "topRight" | "bottomRight" | "bottomLeft" | "topLeft";

type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  hideCloseButton?: boolean;
  closeButtonClassName?: string;
  overlayProps?: React.ComponentPropsWithoutRef<typeof DialogOverlay>;
  resizable?: {
    enabled?: boolean;
    directions?: Array<keyof ResizableDirections>;
    defaultSize?: { width?: number | string; height?: number | string };
    maxWidth?: number | string;
    maxHeight?: number | string;
    minWidth?: number;
    minHeight?: number;
  };
  onResizeWithDirection?: (dir: ResizeDirection, next: { width: number; height: number }, prev: { width: number; height: number }) => void;
};

const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(
  ({ className, children, hideCloseButton, closeButtonClassName, overlayProps, resizable, onResizeWithDirection, ...props }, ref) => {
    const contentRef = React.useRef<HTMLDivElement | null>(null);

    const enableMap: ResizableDirections = {
      top: false,
      right: false,
      bottom: false,
      left: false,
    };
    (resizable?.directions || ["right", "bottom"]).forEach((d) => (enableMap[d] = true));

    const defaultMaxHeight = typeof window !== "undefined" ? window.innerHeight - 100 : undefined;
    const finalMaxHeight = resizable?.maxHeight ?? defaultMaxHeight;

    return (
      <DialogPortal>
        <DialogOverlay {...overlayProps} />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "fixed z-50 grid gap-4 border bg-background shadow-lg duration-200  data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
            !resizable?.enabled &&
              "left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] w-full max-w-lg p-6",
            className
          )}
          {...props}
        >
          {resizable?.enabled ? (
            <Resizable
              enable={enableMap}
              defaultSize={resizable.defaultSize}
              minWidth={resizable.minWidth}
              maxWidth={resizable.maxWidth}
              minHeight={resizable.minHeight}
              maxHeight={finalMaxHeight}
              onResize={(_e, direction, refToElement) => {
                const next = {
                  width: refToElement.offsetWidth,
                  height: refToElement.offsetHeight,
                };
                onResizeWithDirection?.(direction as ResizeDirection, next, next);
              }}
              handleStyles={{
                left: { cursor: "ew-resize" },
                right: { cursor: "ew-resize" },
                top: { cursor: "ns-resize" },
                bottom: { cursor: "ns-resize" },
              }}
              className="flex flex-col"
            >
              <div ref={contentRef} className="overflow-auto w-full h-full">
                {children}
              </div>
            </Resizable>
          ) : (
            children
          )}
          {!hideCloseButton && (
            <DialogPrimitive.Close className={cn("absolute right-4 top-4 p-1.5 rounded transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", closeButtonClassName)}>
              <XIcon className="h-4 w-4 m-auto" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  }
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />);
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export { Dialog, DialogPortal, DialogOverlay, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription };
