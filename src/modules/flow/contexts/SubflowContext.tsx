import { createContext, ReactNode, useContext } from "react";

export const SubflowContext = createContext<boolean>(false);

export const useSubflowContext = () => useContext(SubflowContext);

export const SubflowProvider = ({ children }: { children: ReactNode }) => {
  return <SubflowContext.Provider value={true}>{children}</SubflowContext.Provider>;
};
