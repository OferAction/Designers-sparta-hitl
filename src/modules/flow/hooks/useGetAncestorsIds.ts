import { useCallback } from "react";

import { Edge, useReactFlow, useStoreApi } from "@xyflow/react";

import { useGetChildNodes } from "./useGetChildNodes";
import { Node } from "@/modules/flow/types";

import { isChildNode } from "@/modules/flow/utils/isChildNode";

export const useGetAncestorsIds = () => {
  const { getNodeConnections } = useReactFlow<Node>();
  const { nodeLookup, parentLookup } = useStoreApi<Node, Edge>().getState();
  const getChildNodes = useGetChildNodes();

  return useCallback(
    (nodeId: string, includeChildren?: boolean) => {
      const node = nodeLookup.get(nodeId);
      if (!node) return [];

      const visited = new Set<string>();
      const getAncestorIdsRecursively = (id: string): string[] => {
        if (!id) return [];

        const ancestors: string[] = [];

        const queue: string[] = [id];
        let queueIndex = 0;

        while (queueIndex < queue.length) {
          const currentId = queue[queueIndex++];

          if (visited.has(currentId)) continue;

          visited.add(currentId);
          ancestors.push(currentId);
          if (currentId !== nodeId) {
            if (includeChildren) {
              // if the current node is the original node we started with, don't add its children even if it's a nested node
              if (node.parentId !== currentId) {
                if (!isChildNode(parentLookup, nodeLookup, node, currentId)) {
                  // if the current node is the parent of the original node we started with, don't add its children
                  ancestors.push(...getChildNodes(currentId));
                }
              }
            }
          }

          // Get all nodes that connect to the current node
          const nodeConnections = getNodeConnections({
            type: "target",
            nodeId: currentId,
          });

          for (let i = 0; i < nodeConnections.length; i++) {
            const sourceId = nodeConnections[i].source;
            if (!visited.has(sourceId)) {
              queue.push(sourceId);
            }
          }
        }

        const lastNodeId = ancestors[ancestors.length - 1];
        const lastNode = nodeLookup.get(lastNodeId);
        if (lastNode?.parentId) {
          return ancestors.concat(getAncestorIdsRecursively(lastNode.parentId));
        }
        return ancestors;
      };
      return getAncestorIdsRecursively(nodeId);
    },
    [getChildNodes, getNodeConnections, nodeLookup, parentLookup]
  );
};
