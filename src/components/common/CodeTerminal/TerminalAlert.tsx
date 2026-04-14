import { ReactNode } from "react";

import { CheckCircleIcon } from "@phosphor-icons/react";

import { useTerminal } from "./context/TerminalContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TerminalAlertProps {
  message?: string;
  icon?: ReactNode;
  show?: boolean;
}

export const TerminalAlert = ({
  message = "Prompt copied to clipboard",
  icon = <CheckCircleIcon className="h-4 w-4 !text-success" />,
}: TerminalAlertProps) => {
  const { showAlert } = useTerminal();

  if (!showAlert) return null;

  return (
    <Alert className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-fit bg-background border-border text-foreground shadow-lg z-10 animate-in fade-in-0 slide-in-from-top-1 duration-300 flex items-center justify-center">
      {icon}
      <AlertDescription className="font-sm whitespace-nowrap overflow-hidden mt-1">{message}</AlertDescription>
    </Alert>
  );
};
