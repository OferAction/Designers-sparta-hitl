import * as React from "react";

import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "min-h-[5vh] w-full rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground transition-shadow focus:outline-none",
  {
    variants: {
      state: {
        default: "border border-border bg-background focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
        error: "border border-destructive bg-background text-destructive focus:ring-2 focus:ring-destructive",
        disabled: "opacity-50 pointer-events-none border border-border bg-background",
      },
    },
    defaultVariants: { state: "default" },
  }
);

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  state?: "default" | "error" | "disabled";
  errorMessage?: string | null;
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, placeholder, disabled, maxLength, state = "default", errorMessage, containerProps, ...props }, ref) => {
    const { className: containerClassName, ...rest } = containerProps || {};
    return (
      <div className={cn("flex flex-col gap-1 w-full", containerClassName)} {...rest}>
        <textarea
          {...props}
          ref={ref}
          className={cn(textareaVariants({ state }), className, "styled-scrollbar")}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
        />
        {state === "error" && errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
export default Textarea;
