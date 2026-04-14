import * as React from "react";
import { useMemo } from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { Loader } from "@/components/common/Loader";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-background focus-visible:ring-offset-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-action-btn-inset hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-action-btn-inset hover:bg-destructive/90",
        outline: "border border-border bg-background shadow-action-btn-inset hover:bg-accent hover:text-accent-foreground border-box",
        secondary: "bg-secondary text-secondary-foreground shadow-action-btn-inset hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground disabled:opacity-40",
        link: "text-primary underline-offset-4 hover:underline",

        // custom variants
        purple: "bg-purple-accent hover:bg-purple-accent-hover focus-visible:ring-purple-accent text-sm text-purple-accent-foreground",
        blue: "bg-blue-accent hover:bg-blue-accent-hover focus-visible:ring-blue-accent text-sm text-blue-accent-foreground",
      },
      size: {
        default: "px-3 py-2",
        xs: "h-6 rounded-md px-1 text-xs",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "p-3",
        full: "h-full py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const isHTMLElement = (element: React.ReactNode): boolean => {
  if (typeof element === "string" || typeof element === "number") return true;
  if (React.isValidElement(element)) {
    const { type } = element as React.ReactElement;
    return typeof type === "string";
  }
  return false;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const textContent = useMemo(() => {
      if (!loading) return "";

      if (typeof children === "string" || typeof children === "number") {
        return children.toString();
      }

      if (React.isValidElement(children)) {
        if (isHTMLElement(children)) return children;

        return "";
      }

      if (Array.isArray(children)) {
        const textElement = children.find((child) => isHTMLElement(child));
        return textElement ? textElement : "";
      }

      return "";
    }, [children, loading]);

    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} disabled={disabled || loading} {...props}>
        {loading ? (
          <>
            <Loader />
            {textContent && <span>{textContent}</span>}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
