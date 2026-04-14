import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

interface DescriptionSessionContextValue {
  /** Whether a description generation is currently in progress */
  isDescriptionSessionActive: boolean;
  /** Registers a new description session and returns its ID */
  startDescriptionSession: (sessionId: string) => void;
  /** Removes a completed description session */
  endDescriptionSession: (sessionId: string) => void;
}

const DescriptionSessionContext = createContext<DescriptionSessionContextValue | null>(null);

/** Provides tracking of active description-generation sessions */
export const DescriptionSessionProvider = ({ children }: { children: React.ReactNode }) => {
  const sessionsRef = useRef(new Set<string>());
  const [activeCount, setActiveCount] = useState(0);

  /** Registers a session ID as an active description generation */
  const startDescriptionSession = useCallback((sessionId: string) => {
    sessionsRef.current.add(sessionId);
    setActiveCount(sessionsRef.current.size);
  }, []);

  /** Removes a session ID after description generation completes */
  const endDescriptionSession = useCallback((sessionId: string) => {
    sessionsRef.current.delete(sessionId);
    setActiveCount(sessionsRef.current.size);
  }, []);

  const value = useMemo(
    () => ({
      isDescriptionSessionActive: activeCount > 0,
      startDescriptionSession,
      endDescriptionSession,
    }),
    [activeCount, startDescriptionSession, endDescriptionSession]
  );

  return <DescriptionSessionContext.Provider value={value}>{children}</DescriptionSessionContext.Provider>;
};

/** Hook to access description session tracking */
export const useDescriptionSession = (): DescriptionSessionContextValue => {
  const context = useContext(DescriptionSessionContext);
  if (!context) {
    throw new Error("useDescriptionSession must be used within a DescriptionSessionProvider");
  }
  return context;
};
