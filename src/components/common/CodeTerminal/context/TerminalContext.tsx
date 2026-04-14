import { createContext, useContext } from "react";

// Define the Terminal context
export interface TerminalContextType {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  variant: "viewer" | "input";
  disabled?: boolean;
  value: string | object;
  setValue: (value: string | object) => void;
  maxLength?: number;
  language: string;
  setLanguage: (language: string) => void;
  showAlert: boolean;
  setShowAlert: (show: boolean) => void;
}

export const TerminalContext = createContext<TerminalContextType | undefined>(undefined);

// Create hook for accessing terminal context
export const useTerminal = () => {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error("useTerminal must be used within a Terminal component");
  }
  return context;
};
