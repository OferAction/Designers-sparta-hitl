import { createContext, useContext, useState, useRef, ReactNode, useCallback } from "react";

interface DialogStateContextType {
  containerRef: React.RefObject<HTMLDivElement>;
  content?: ReactNode;
}

interface DialogContextType {
  openDialog: (content: ReactNode) => void;
  closeDialog: () => void;
  isOpen: boolean;
}

interface DialogStateProviderProps {
  children: ReactNode;
  containerRef: React.RefObject<HTMLDivElement>;
  content?: ReactNode;
}

interface DialogProviderProps {
  children: ReactNode;
}

export function createDialogContext(contextName: string) {
  const DialogContext = createContext<DialogContextType | null>(null);
  const DialogStateContext = createContext<DialogStateContextType | null>(null);

  function useDialogContext() {
    const context = useContext(DialogContext);
    if (!context) {
      throw new Error(`use${contextName}DialogContext must be used within a ${contextName}DialogProvider`);
    }
    return context;
  }

  function useDialogStateContext() {
    const context = useContext(DialogStateContext);
    if (!context) {
      throw new Error(`use${contextName}DialogStateContext must be used within a ${contextName}DialogProvider`);
    }
    return context;
  }

  function DialogStateProvider({ children, containerRef, content }: DialogStateProviderProps) {
    return <DialogStateContext.Provider value={{ containerRef, content }}>{children}</DialogStateContext.Provider>;
  }

  function DialogProvider({ children }: DialogProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [content, setContent] = useState<ReactNode>(null);

    const openDialog = useCallback((content: ReactNode) => {
      setContent(content);
      setIsOpen(true);
    }, []);

    const closeDialog = useCallback(() => {
      setIsOpen(false);
    }, []);

    return (
      <DialogContext.Provider value={{ isOpen, openDialog, closeDialog }}>
        <DialogStateProvider containerRef={containerRef} content={content}>
          {children}
        </DialogStateProvider>
      </DialogContext.Provider>
    );
  }

  return {
    useDialogContext,
    useDialogStateContext,
    DialogProvider,
  };
}
