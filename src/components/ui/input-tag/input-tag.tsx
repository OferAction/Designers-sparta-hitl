import * as React from "react";
import { createContext, useContext } from "react";

import { cn } from "@/utils";

export type Option =
  | ({
      label: string;
      value: string;
      children?: NonNullable<Option>[];
      keywords?: string[];
      type?: string;
    } & Record<string, any>)
  | null;

export type NonNullableOption = NonNullable<Option>;

interface InputTagContextValue {
  error: boolean;
  isGtConnected: boolean;
  variant: "flat" | "emphasized" | "gtConnected" | "variable" | "conditionalRouting";
  readonly: boolean;
}

const InputTagContext = createContext<InputTagContextValue | undefined>(undefined);

const useInputTagContext = () => {
  const context = useContext(InputTagContext);
  if (!context) {
    throw new Error("InputTag components must be used within InputTag.Root");
  }
  return context;
};

interface InputTagRootProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: boolean;
  isGtConnected?: boolean;
  variant?: "flat" | "emphasized" | "gtConnected" | "variable" | "conditionalRouting";
  readonly?: boolean;
}

const InputTagRoot = React.forwardRef<HTMLDivElement, InputTagRootProps>(
  ({ className, error = false, isGtConnected = false, variant = "flat", children, readonly = false, ...props }, ref) => {
    const contextValue = React.useMemo(() => ({ error, isGtConnected, variant, readonly }), [error, isGtConnected, variant, readonly]);

    return (
      <InputTagContext.Provider value={contextValue}>
        <div className="relative flex min-w-0" tag-root="true">
          <div
            ref={ref}
            className={cn(
              "inline-flex items-stretch rounded-md overflow-hidden divide-x divide-transparent border border-transparent hover:border-input hover:divide-muted",
              variant === "emphasized" && !readonly && "border-muted divide-muted",
              variant === "gtConnected" &&
                "border-blue-accent/20 bg-blue-background hover:border-blue-accent/50 hover:bg-blue-accent/50 hover:text-foreground text-muted-foreground",
              variant === "gtConnected" && !isGtConnected && "opacity-50",
              error && "ring-2 ring-destructive border-transparent",
              variant === "variable" && "text-purple-accent border-transparent",
              variant === "conditionalRouting" && " text-muted-foreground/80 border-muted-foreground/20",
              readonly && "pointer-events-none",
              className
            )}
            {...props}
          >
            {children}
          </div>
        </div>
      </InputTagContext.Provider>
    );
  }
);
InputTagRoot.displayName = "InputTag.Root";

export { InputTagRoot, useInputTagContext };
