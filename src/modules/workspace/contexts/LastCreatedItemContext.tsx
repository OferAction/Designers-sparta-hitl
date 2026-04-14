import { createContext, useContext, ReactNode } from "react";

import { useWorkspaceStore } from "@/modules/workspace/store";

const LastCreatedItemContext = createContext<boolean>(false);

export function LastCreatedItemProvider({ children, id }: { children: ReactNode; id: string }) {
  const lastCreatedId = useWorkspaceStore((state) => state.lastCreatedId);

  const isNewItem = lastCreatedId === id;
  return <LastCreatedItemContext.Provider value={isNewItem}>{children}</LastCreatedItemContext.Provider>;
}

export function useLastCreatedItem() {
  const context = useContext(LastCreatedItemContext);
  if (context === undefined) {
    throw new Error("useLastCreatedItem must be used within a LastCreatedItemProvider");
  }
  return context;
}
