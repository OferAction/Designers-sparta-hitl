import React, { createContext, useContext } from "react";

interface ViewOnlyContextType {
  viewOnly?: boolean;
}

const ViewOnlyContext = createContext<ViewOnlyContextType | undefined>(undefined);

export const ViewOnlyProvider: React.FC<React.PropsWithChildren<{ viewOnly?: boolean }>> = ({ viewOnly = true, children }) => {
  return <ViewOnlyContext.Provider value={{ viewOnly }}>{children}</ViewOnlyContext.Provider>;
};

export const useViewOnlyContext = (): ViewOnlyContextType => {
  const context = useContext(ViewOnlyContext);
  if (context === undefined) {
    return {};
  }
  return context;
};
