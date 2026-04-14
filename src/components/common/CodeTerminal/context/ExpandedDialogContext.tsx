import { createContext, useContext } from "react";

export interface ExpandedDialogContextType {
  expanded: boolean;
}

export const ExpandedDialogContext = createContext<ExpandedDialogContextType | undefined>(undefined);

export const useExpandedDialog = () => {
  const context = useContext(ExpandedDialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a Dialog component");
  }
  return context;
};
