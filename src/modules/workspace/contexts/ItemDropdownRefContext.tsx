import { createContext, useContext } from "react";

// Create a context to share the dropdown trigger ref across components
const ItemDropdownRefContext = createContext<{
  triggerButtonRef: React.RefObject<HTMLButtonElement> | null;
}>({ triggerButtonRef: null });

export const useItemDropdownRefContext = () => useContext(ItemDropdownRefContext);
export const ItemDropdownRefProvider = ItemDropdownRefContext.Provider;
