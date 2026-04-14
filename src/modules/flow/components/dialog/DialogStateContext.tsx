import { createContext, useContext, ReactNode } from "react";

interface DialogStateContextType {
  containerRef: React.RefObject<HTMLDivElement>;
  content?: ReactNode;
}

const DialogStateContext = createContext<DialogStateContextType | null>(null);

export function useDialogStateContext() {
  const context = useContext(DialogStateContext);
  if (!context) {
    throw new Error("useDialogStateContext must be used within a DialogStateProvider");
  }
  return context;
}

interface DialogStateProviderProps {
  children: ReactNode;
  containerRef: React.RefObject<HTMLDivElement>;
  content?: ReactNode;
}

export function DialogStateProvider({ children, containerRef, content }: DialogStateProviderProps) {
  return <DialogStateContext.Provider value={{ containerRef, content }}>{children}</DialogStateContext.Provider>;
}
