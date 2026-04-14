import { useEffect } from "react";

import { KeyEventMap } from "@/types/keyEvents";

export function useKeyboardShortcut(keyEventMap: KeyEventMap, sourceElement: HTMLElement | null = document.body) {
  useEffect(() => {
    const el = sourceElement;
    const handleKeyDown = (event: KeyboardEvent) => {
      Object.values(keyEventMap).forEach((keyAction) => {
        const { combination, action, enabled = true } = keyAction;
        if (!enabled) return;
        const { key, modifiers = [], preventDefault = true } = combination;
        // If no modifiers, treat as true; otherwise, check if all modifiers are pressed
        const allModifiersPressed = modifiers.length === 0 || modifiers.some((mod) => event[mod as keyof KeyboardEvent]);
        if (event.key === key && allModifiersPressed) {
          if (preventDefault) {
            event.preventDefault();
          }
          if (typeof action === "function") {
            action();
          }
        }
      });
    };

    el?.addEventListener("keydown", handleKeyDown);

    return () => {
      el?.removeEventListener("keydown", handleKeyDown);
    };
  }, [keyEventMap, sourceElement]);
}

export default useKeyboardShortcut;
