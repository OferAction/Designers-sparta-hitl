import { ReactNode, useState, useCallback } from "react";

import { cva } from "class-variance-authority";

// import { DialogContext, ExpandedDialogContext, ExpandedDialogContext } from "./context/DialogContext";
import { ExpandedDialogContext } from "./context/ExpandedDialogContext";
import { TerminalContext } from "./context/TerminalContext";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Variants from the original implementation
const terminalVariants = cva("flex flex-col rounded-md border border-border bg-background", {
  variants: {
    variant: {
      viewer: "",
      input: "",
    },
    size: {
      default: "w-full",
      expanded: "w-full h-fit min-h-[20vh] !max-h-[80vh] px-2 py-3",
    },
    theme: {
      default: "bg-background",
    },
    state: {
      default: "",
      disabled: "opacity-50 cursor-not-allowed",
    },
  },
  defaultVariants: {
    variant: "viewer",
    size: "default",
    theme: "default",
    state: "default",
  },
});

const dialogContentVariants = cva("border-border z-50", {
  variants: {
    variant: {
      viewer: "max-w-[80vw] bg-background max-h-[80vh] p-0 border-border [&>button]:hidden",
      input: "min-w-[70vw] max-h-[80vh] p-0 bg-prompt-modal-background/30 backdrop-blur-[3px]",
    },
  },
});

interface TerminalProps {
  children: ReactNode;
  className?: string;
  variant?: "viewer" | "input";
  theme?: "default";
  disabled?: boolean;
  value?: string | object;
  defaultValue?: string | object;
  onChange?: (value: string | object) => void;
  maxLength?: number;
}

export const Terminal: React.FC<TerminalProps> = ({
  children,
  className,
  variant = "viewer",
  theme = "default",
  disabled = false,
  value: controlledValue,
  defaultValue = "",
  onChange,
  maxLength,
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const setValue = useCallback(
    (newValue: string | object) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(newValue);
      }
      onChange?.(newValue);
    },
    [controlledValue, onChange]
  );

  const [expanded, setExpanded] = useState(false);
  const [language, setLanguage] = useState("python");
  const [showAlert, setShowAlert] = useState(false);

  const onShowAlertChange = useCallback((value: boolean) => {
    setShowAlert(value);
    if (value) {
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    }
  }, []);

  return (
    <TerminalContext.Provider
      value={{
        expanded,
        setExpanded,
        variant,
        disabled,
        value,
        setValue,
        maxLength,
        language,
        setLanguage,
        showAlert,
        setShowAlert: onShowAlertChange,
      }}
    >
      <ExpandedDialogContext.Provider value={{ expanded: false }}>
        <div className={cn(terminalVariants({ variant, theme, state: disabled ? "disabled" : "default" }), className)}>{children}</div>
      </ExpandedDialogContext.Provider>

      <Dialog
        modal={false}
        open={expanded}
        onOpenChange={(open) => {
          if (!open) {
            setExpanded(false);
          }
        }}
      >
        <DialogTitle className="hidden">Expanded Terminal</DialogTitle>
        <DialogContent hideCloseButton className={cn(dialogContentVariants({ variant }))}>
          <ExpandedDialogContext.Provider value={{ expanded }}>
            <div
              className={cn(
                terminalVariants({
                  variant,
                  size: "expanded",
                  theme,
                  state: disabled ? "disabled" : "default",
                }),
                className
              )}
            >
              {children}
            </div>
          </ExpandedDialogContext.Provider>
        </DialogContent>
      </Dialog>
    </TerminalContext.Provider>
  );
};
