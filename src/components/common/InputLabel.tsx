import React, { forwardRef } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputLabelVariants = cva("inline-flex items-center gap-2 px-3 py-0.5 text-sm font-medium rounded-md transition-all duration-200 select-none", {
  variants: {
    variant: {
      flat: "bg-transparent border border-transparent text-muted-foreground hover:text-foreground hover:border-border",
      emphasized: "bg-transparent border border-muted text-muted-foreground hover:bg-muted/80 hover:border-border/50",
      active: "bg-muted border border-border text-muted-foreground",
    },
    size: {
      sm: "px-1 py-0.5",
      md: "px-2",
      lg: "p-2"
    },
    as: {
      button: "cursor-pointer",
      label: "cursor-default",
    },
  },
  defaultVariants: {
    variant: "flat",
    size: "sm",
    as: "button",
  },
});

interface BaseInputLabelProps extends VariantProps<typeof inputLabelVariants> {
  icon?: React.ReactNode;
  title?: string;
  value?: string;
  className?: string;
  children?: React.ReactNode;
  editable?: boolean;
  onValueChange?: (val: string) => void; // called on blur/enter
  editPlaceholder?: string;
  autoFocusEdit?: boolean;
  editSignal?: number;
}

interface InputLabelButtonProps extends BaseInputLabelProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseInputLabelProps> {
  as?: "button";
}

interface InputLabelLabelProps extends BaseInputLabelProps, Omit<React.LabelHTMLAttributes<HTMLLabelElement>, keyof BaseInputLabelProps> {
  as: "label";
}

type InputLabelProps = InputLabelButtonProps | InputLabelLabelProps;

const InputLabel = forwardRef<HTMLButtonElement | HTMLLabelElement, InputLabelProps>(
  (
    {
      className,
      variant,
      size,
      as = "button",
      icon,
      title,
      value,
      children,
      editable = false,
      onValueChange,
      autoFocusEdit = false,
      editSignal,
      ...props
    },
    ref
  ) => {
    const displayText = value ?? title ?? (typeof children === "string" ? (children as string) : undefined);
    const [isEditing, setIsEditing] = React.useState(false);
    const [draft, setDraft] = React.useState(displayText || "");
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    // Sync external value changes
    React.useEffect(() => {
      if (!isEditing) setDraft(displayText || "");
    }, [displayText, isEditing]);

    React.useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isEditing]);

    const prevEditSignalRef = React.useRef<number | null>(null);
    React.useEffect(() => {
      if (!editable) return;
      if (typeof editSignal !== "number") return;
      if (prevEditSignalRef.current === null || editSignal !== prevEditSignalRef.current) {
        prevEditSignalRef.current = editSignal;
        if (editSignal > 0) setIsEditing(true);
      }
    }, [editSignal, editable]);

    const commit = () => {
      setIsEditing(false);
      if (onValueChange && draft !== (displayText || "")) {
        const normalized = draft.replace(/\r\n?/g, "\n");
        onValueChange(normalized);
      }
    };

    const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setDraft(displayText || "");
        setIsEditing(false);
      }
    };

    if (editable && isEditing) {
      return (
        <div className={cn(inputLabelVariants({ variant, size, as: "button", className }), "cursor-text")}>
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKey}
            className={cn(
              "bg-transparent outline-none border-none focus:ring-0 truncate w-full",
              size === "sm" ? "text-sm leading-5" : "text-sm leading-6"
            )}
          />
        </div>
      );
    }

    const commonContent = (
      <>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {displayText !== undefined ? (
          <span className="truncate">{displayText}</span>
        ) : (
          children && <span className="truncate flex items-center gap-1">{children}</span>
        )}
      </>
    );

    const interactiveProps: any = {};
    if (editable) {
      interactiveProps.onClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
      };
      if (autoFocusEdit && !displayText) {
        if (!isEditing) setIsEditing(true);
      }
    }

    if (as === "label") {
      return (
        <label
          className={cn(inputLabelVariants({ variant, size, as, className }), editable && "cursor-text")}
          ref={ref as React.ForwardedRef<HTMLLabelElement>}
          {...(props as React.LabelHTMLAttributes<HTMLLabelElement>)}
          {...interactiveProps}
        >
          {commonContent}
        </label>
      );
    }

    return (
      <button
        className={cn(inputLabelVariants({ variant, size, as, className }), editable && "cursor-text")}
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        {...interactiveProps}
        type={(props as any).type || "button"}
      >
        {commonContent}
      </button>
    );
  }
);

InputLabel.displayName = "InputLabel";

export { InputLabel, inputLabelVariants };
export type { InputLabelProps, InputLabelButtonProps, InputLabelLabelProps };
