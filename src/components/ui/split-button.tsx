import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { buttonVariants } from "./button";
import { Separator } from "./separator";
import { cn } from "@/lib/utils";

// Define types for individual button in the split button
export interface SplitButtonItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  className?: string;
  showSeparator?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

// Main SplitButton component props
export interface SplitButtonProps extends React.ButtonHTMLAttributes<HTMLDivElement>, VariantProps<typeof buttonVariants> {
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  className?: string;
  hideSeparators?: boolean;
  separatorVariant?: "default" | "subtle" | "muted" | "custom";
  separatorClassName?: string;
  children: React.ReactNode;
  asChild?: boolean;
}

// Variants for the split button wrapper
const splitButtonVariants = cva(
  "inline-flex relative items-center rounded-md [&>*:first-child]:rounded-r-none [&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-l-none [&>*:last-child]:rounded-r-md [&>*]:border-none outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  {
    variants: {
      variant: {
        default: "",
        outline: "border border-border",
        destructive: "",
        secondary: "",
        ghost: "",
        link: "",

        purple: "focus-visible:ring-purple-accent",
        blue: "focus-visible:ring-blue-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Variants for separators
const separatorVariants = cva("z-10", {
  variants: {
    variant: {
      default: "", // Will be determined dynamically
      subtle: "bg-muted/40",
      muted: "bg-muted/20",
      custom: "", // Apply custom class
    },
    buttonVariant: {
      default: "bg-primary-foreground/20",
      destructive: "bg-destructive-foreground/20",
      outline: "bg-accent",
      secondary: "bg-secondary-foreground/20",
      ghost: "bg-accent/20",
      link: "bg-primary/20",
      purple: "bg-purple-accent-hover",
      blue: "bg-blue-accent-hover",
    },
  },
  defaultVariants: {
    variant: "default",
    buttonVariant: "default",
  },
});

/**
 * SplitButtonGroup - a container for multiple connected buttons
 */
const SplitButtonGroup = React.forwardRef<HTMLDivElement, SplitButtonProps>(
  (
    {
      className,
      asChild = false,
      variant = "default",
      size,
      hideSeparators = false,
      separatorVariant = "default",
      separatorClassName,
      children,
      ...props
    },
    ref
  ) => {
    // Process children to add separators and pass props
    const processedChildren = React.useMemo(() => {
      const childArray = React.Children.toArray(children);
      const result: React.ReactNode[] = [];

      childArray.forEach((child, index) => {
        if (React.isValidElement(child)) {
          // Add the enhanced child with variant and size
          result.push(
            React.cloneElement(child, {
              variant,
              size,
              ...child.props,
              key: `button-${index}`,
            })
          );

          // Add separator if not the last child and separators are enabled
          const isLast = index === childArray.length - 1;
          if (!isLast && !hideSeparators && child.props?.showSeparator !== false) {
            // Determine separator classes based on variants
            const separatorClasses = cn(
              separatorVariants({
                variant: separatorVariant,
                buttonVariant: separatorVariant === "default" ? variant : undefined,
              }),
              "!border-0",
              separatorClassName
            );

            result.push(<Separator key={`separator-${index}`} orientation="vertical" className={separatorClasses} />);
          }
        } else {
          result.push(child);
        }
      });

      return result;
    }, [children, variant, size, hideSeparators, separatorVariant, separatorClassName]);

    const Comp = asChild ? Slot : "div";
    return (
      <Comp className={cn(splitButtonVariants({ variant }), className)} ref={ref} {...props}>
        {processedChildren}
      </Comp>
    );
  }
);
SplitButtonGroup.displayName = "SplitButtonGroup";

/**
 * SplitButtonItem - an individual button within a SplitButtonGroup
 */
const SplitButtonItem = React.forwardRef<HTMLButtonElement, SplitButtonItemProps & VariantProps<typeof buttonVariants>>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);
SplitButtonItem.displayName = "SplitButtonItem";

/**
 * IconSplitButtonItem - an icon-only button for split button groups
 */
const IconSplitButtonItem = React.forwardRef<HTMLButtonElement, SplitButtonItemProps & VariantProps<typeof buttonVariants>>(
  ({ className, children, variant, size = "icon", "aria-label": ariaLabel, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size }), "h-full", className)} ref={ref} {...props}>
        {children}
        {ariaLabel && <span className="sr-only">{ariaLabel}</span>}
      </button>
    );
  }
);
IconSplitButtonItem.displayName = "IconSplitButtonItem";

export { SplitButtonGroup, SplitButtonItem, IconSplitButtonItem };
