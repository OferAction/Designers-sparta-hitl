import { createContext, ReactNode, useContext } from "react";

export const SubsetContext = createContext<boolean>(false);

export const useSubsetContext = () => useContext(SubsetContext);

export const SubsetProvider = ({ children }: { children: ReactNode }) => {
  return <SubsetContext.Provider value={true}>{children}</SubsetContext.Provider>;
};
