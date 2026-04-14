import * as React from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";

import debounce from "lodash.debounce";
import { XIcon as X } from "@phosphor-icons/react";

import { ResizablePopoverContent } from "@/components/common/resizable-popover-content";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import Textarea from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface RegexPatternPopoverProps {
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
  onSubmit?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  minWidth?: number;
  initialWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  initialHeight?: number;
  maxHeight?: number;
}

/**
 * Resizable popover for regex pattern input.
 * Features auto-focus, keyboard shortcuts (Enter to submit, Escape to close),
 * and dynamic resizing from edges and corner.
 */
const RegexPatternPopover = React.forwardRef<HTMLDivElement, RegexPatternPopoverProps>(
  (
    {
      value,
      onChange,
      onClose,
      onSubmit,
      onKeyDown: externalOnKeyDown,
      children,
      open,
      onOpenChange,
      minWidth = 200,
      initialWidth = 300,
      maxWidth = 600,
      minHeight = 150,
      initialHeight = 200,
      maxHeight = 400,
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    /** Debounced focus function to handle textarea focus after popover opens */
    const debouncedFocus = useMemo(
      () =>
        debounce((textarea: HTMLTextAreaElement) => {
          textarea.focus();
        }, 100),
      []
    );

    useEffect(() => {
      if (open && textareaRef.current) {
        debouncedFocus(textareaRef.current);
      }
    }, [open, debouncedFocus]);

    useEffect(() => {
      return () => {
        debouncedFocus.cancel();
      };
    }, [debouncedFocus]);

    /** Handles keyboard shortcuts: Enter to submit, Escape to close */
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        externalOnKeyDown?.(e);

        if (!e.defaultPrevented) {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit?.();
            onOpenChange?.(false);
          } else if (e.key === "Escape") {
            e.preventDefault();
            onOpenChange?.(false);
            onClose?.();
          }
        }
      },
      [externalOnKeyDown, onSubmit, onOpenChange, onClose]
    );

    /** Handles close button click */
    const handleClose = useCallback(() => {
      onOpenChange?.(false);
      onClose?.();
    }, [onOpenChange, onClose]);

    return (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <ResizablePopoverContent
          ref={ref}
          isOpen={open}
          className={cn("bg-sidebar border border-border")}
          align="start"
          side="bottom"
          sideOffset={8}
          minWidth={minWidth}
          initialWidth={initialWidth}
          maxWidth={maxWidth}
          minHeight={minHeight}
          initialHeight={initialHeight}
          maxHeight={maxHeight}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <h3 className="text-sm font-medium">Regex pattern</h3>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col p-1">
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='e.g r"\d{3}-\d{3}-\d{4}"'
                className="h-full w-full font-mono text-sm resize-none overflow-auto"
                containerProps={{ className: "h-full flex-1" }}
                style={{ minHeight: 0, height: "100%" }}
              />
            </div>
          </div>
        </ResizablePopoverContent>
      </Popover>
    );
  }
);

RegexPatternPopover.displayName = "RegexPatternPopover";

export { RegexPatternPopover };
