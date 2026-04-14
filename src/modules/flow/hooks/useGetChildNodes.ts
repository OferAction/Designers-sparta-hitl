import { useCallback } from "react";

import { useStoreApi } from "@xyflow/react";

import { Edge, Node } from "@/modules/flow/types";

export const useGetChildNodes = () => {
  const { parentLookup } = useStoreApi<Node, Edge>().getState();
  return useCallback(
    (nodeId: string) => {
      const getChildNodesRecursively = (id: string): string[] => {
        const childNodes = parentLookup.get(id)?.keys() || [];
        return Array.from(childNodes).flatMap((childId) => {
          if (parentLookup.has(childId)) {
            return [...getChildNodesRecursively(childId), childId];
          }
          return childId;
        });
      };
      return getChildNodesRecursively(nodeId);
    },
    [parentLookup]
  );
};
