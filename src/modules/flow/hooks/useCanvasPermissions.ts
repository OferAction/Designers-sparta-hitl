import { useLayoutEffect } from "react";

import { useFlowStore } from "@/store";
import type { CanvasInteractionPermissions } from "@/store/slices/flowSlice";

/**
 * Sets canvas interaction permissions.
 * - Pass undefined to allow all interactions (full editing mode)
 * - Pass a partial permissions object to control specific interactions
 * - Automatically applies on mount and cleans up by restoring permissions when unmounted
 */
export function useCanvasPermissions(permissions?: Partial<CanvasInteractionPermissions>) {
  const setCanvasPermissions = useFlowStore((state) => state.setCanvasPermissions);
  useLayoutEffect(() => {
    setCanvasPermissions(permissions);

    return () => {
      // Restore to allow-all state on unmount to avoid leaking restricted state
      setCanvasPermissions(undefined);
    };
  }, [permissions, setCanvasPermissions]);
}

/**
 * Centralizes enabling/disabling canvas interactions.
 * Pass true to disable interactions (history / read-only modes), false to enable (editing modes).
 */
const READ_ONLY_PERMISSIONS: Partial<CanvasInteractionPermissions> = {
  canSelectNodes: false,
  canChangeNodeData: false,
  canDragOrRemoveNodes: false,
  canCreateElements: false,
  canSelectEdges: false,
  canRemoveEdges: false,
};

/** Convenience hooks for common modes */
export const useEnableCanvasInteractions = () => useCanvasPermissions(undefined);
export const useReadOnlyCanvasInteractions = () => useCanvasPermissions(READ_ONLY_PERMISSIONS);
