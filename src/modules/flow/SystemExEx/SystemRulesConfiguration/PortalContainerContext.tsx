import { createContext, useContext } from "react";

type PortalContextValue = React.RefObject<HTMLDivElement> | null;

export const PortalContainerContext = createContext<PortalContextValue>(null);

export function usePortalContainer() {
  return useContext(PortalContainerContext);
}
