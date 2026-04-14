import { useRef } from "react";

export const useItemContextMenu = () => {
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    triggerButtonRef?.current?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  };

  return {
    triggerButtonRef,
    handleContextMenu,
  };
};
