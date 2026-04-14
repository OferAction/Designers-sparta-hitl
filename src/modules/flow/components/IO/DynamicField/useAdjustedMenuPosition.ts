import { RefObject, useLayoutEffect, useState } from "react";

import { XYPosition } from "@xyflow/react";

import { OptionsDropdownHandle } from "@/components/common/input-tags/OptionsDropdown";

type MenuPosition = XYPosition | null;

type UseAdjustedMenuPositionOptions = {
  /** Whether the dropdown menu is open */
  isOpen: boolean;
  /** The initial position of the menu */
  position: MenuPosition;
  /** Ref to the dropdown component for measuring its dimensions */
  dropdownRef: RefObject<OptionsDropdownHandle | null>;
  /** Optional container element that the dropdown is rendered within */
  portalContainer?: HTMLElement | null;
};

/**
 * Hook to adjust menu position to stay within viewport boundaries.
 * Handles horizontal overflow (shifts left) and vertical overflow (positions above trigger).
 */
export const useAdjustedMenuPosition = ({
  isOpen,
  position,
  dropdownRef,
  portalContainer: portalContainerProp = document.body,
}: UseAdjustedMenuPositionOptions): MenuPosition => {
  const [adjustedPosition, setAdjustedPosition] = useState<MenuPosition>(null);

  useLayoutEffect(() => {
    const portalContainer = portalContainerProp || document.body;
    if (!isOpen || !position) {
      setAdjustedPosition(null);
      return;
    }

    let frameId: number;

    const adjustPosition = () => {
      if (!isOpen || !position) {
        return;
      }

      const bb = dropdownRef.current?.getBoundingClientRect();

      // If dropdown isn't ready yet, wait for next frame
      if (!bb || bb.width === 0 || bb.height === 0) {
        frameId = requestAnimationFrame(adjustPosition);
        return;
      }

      const containerRect = portalContainer.getBoundingClientRect();
      const viewportWidth = containerRect.width;
      const viewportHeight = containerRect.height;

      let adjustedX = position.x;
      let adjustedY = position.y;

      // Calculate what the right edge would be at the current position
      const potentialRight = position.x + bb.width;

      // Adjust horizontal position
      if (potentialRight > viewportWidth) {
        // Shift left by the overflow amount
        const overflow = potentialRight - viewportWidth;
        adjustedX = position.x - overflow - 32; // Add padding from edge
      }

      // Ensure we don't go off the left edge after adjustment
      if (adjustedX < 32) {
        adjustedX = 32;
      }

      // Adjust vertical position if menu goes off bottom edge
      const potentialBottom = position.y + bb.height;
      if (potentialBottom > viewportHeight) {
        adjustedY = Math.max(32, position.y - bb.height - 32); // Position above the trigger
      }

      setAdjustedPosition({
        x: adjustedX,
        y: adjustedY,
      });
    };

    frameId = requestAnimationFrame(adjustPosition);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isOpen, position, dropdownRef, portalContainerProp]);

  return adjustedPosition;
};
