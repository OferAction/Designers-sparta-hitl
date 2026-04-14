import { useEffect, RefObject } from "react";

interface UseKeyboardNavigationProps {
  isOpen: boolean;
  inputRef: RefObject<HTMLInputElement>;
  openDropdown: () => void;
}

export const useKeyboardNavigation = ({ isOpen, inputRef, openDropdown }: UseKeyboardNavigationProps) => {
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const handleGlobalKeyDown = (event: globalThis.KeyboardEvent) => {
      if (!input) {
        return;
      }
      if (!isOpen) {
        return;
      }

      if (event.key === "Tab") {
        const selectedItem = input?.closest("[cmdk-root]")?.querySelector(`[cmdk-item][aria-selected="true"]`);
        if (selectedItem) {
          event.preventDefault();
          const cmdkEvent = new Event("cmdk-item-select");
          selectedItem.dispatchEvent(cmdkEvent);
        }
      }
      if (event.key === "Escape") {
        input.blur();
      }
    };

    if (isOpen) {
      // Add event listener when menu opens
      input.addEventListener("keydown", handleGlobalKeyDown, true);
    } else {
      input.removeEventListener("keydown", handleGlobalKeyDown, true);
    }

    // Cleanup function
    return () => {
      input.removeEventListener("keydown", handleGlobalKeyDown, true);
    };
  }, [isOpen, inputRef, openDropdown]);
};
