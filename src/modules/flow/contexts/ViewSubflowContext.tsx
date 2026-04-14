import { createContext, ReactNode, useContext } from "react";

export const ViewSubflowContext = createContext<boolean>(false);

export const useViewSubflowContext = () => useContext(ViewSubflowContext);

export const ViewSubflowProvider = ({ children }: { children: ReactNode }) => {
  return <ViewSubflowContext.Provider value={true}>{children}</ViewSubflowContext.Provider>;
};
