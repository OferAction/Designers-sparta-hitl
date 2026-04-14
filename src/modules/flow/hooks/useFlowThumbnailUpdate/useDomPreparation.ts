import { useCallback } from "react";

import { useStore, useReactFlow } from "@xyflow/react";

import { useGetViewportForThumbnail } from "./useGetViewportForThumbnail";
import { useCollaborativeStore } from "@/store";

export const useDomPreparation = () => {
  const domNode = useStore((state) => state.domNode);
  const { setViewport } = useReactFlow();
  const getViewportForThumbnail = useGetViewportForThumbnail();

  return useCallback(
    async <T>(callback: (domNode: HTMLElement) => Promise<T>): Promise<T> => {
      if (!domNode) {
        throw new Error("DOM node is not available for thumbnail generation.");
      }
      const { collaborativeUsers, setCollaborativeUsers, disableCollaboration, enableCollaboration } = useCollaborativeStore.getState();
      const { targetViewport, currentViewport } = getViewportForThumbnail();

      try {
        // 1. Prepare DOM
        setViewport(targetViewport, { duration: 0 });

        disableCollaboration();
        domNode?.querySelectorAll("[data-thumbnail='hidden']").forEach((el) => {
          if (el instanceof HTMLElement || el instanceof SVGElement) {
            el.style.visibility = "hidden";
          }
        });

        // 2. Execute callback
        return await callback(domNode);
      } finally {
        // 3. Restore DOM state (always runs, even on error)
        setViewport(currentViewport, { duration: 0 });
        domNode?.querySelectorAll("[data-thumbnail='hidden']").forEach((el) => {
          if (el instanceof HTMLElement || el instanceof SVGElement) {
            el.style.visibility = "";
          }
        });
        enableCollaboration();
        setCollaborativeUsers(collaborativeUsers);
      }
    },
    [domNode, getViewportForThumbnail, setViewport]
  );
};
