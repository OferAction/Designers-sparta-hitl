import { useMemo } from "react";

import { Node, Edge } from "@/modules/flow/types";

/**
 * Hook encapsulating logic for determining whether subflow creation is disabled
 * and per-node disable reasons.
 */
export const useCreateSubflowDisabled = (
  selectedNodes: Pick<Node, "id" | "type" | "data">[],
  edges: Edge[],
  options: {
    shouldGetDisableReasons?: boolean;
  } = { shouldGetDisableReasons: true }
) => {
  // Whether the basic preconditions for creating a subflow are satisfied
  const isCreateSubflowEnabled = useMemo(() => {
    if (selectedNodes.length <= 1) return false; // need at least 2 nodes
    return !selectedNodes.some((node) => node.type === "start" || node.type === "end");
  }, [selectedNodes]);

  // Detect if any selected ifelse node has no outbound edge to another selected node (would become right-most)
  const hasIfElseRightMost = useMemo(() => {
    if (!selectedNodes.length) return false;
    const selectedSet = new Set(selectedNodes.map((n) => n.id));
    const outboundWithin: Record<string, number> = {};
    selectedNodes.forEach((n) => (outboundWithin[n.id] = 0));
    edges.forEach((e) => {
      if (selectedSet.has(e.source) && selectedSet.has(e.target)) {
        outboundWithin[e.source] += 1;
      }
    });
    return selectedNodes.some((n) => n.type === "ifelse" && outboundWithin[n.id] === 0);
  }, [edges, selectedNodes]);

  const createSubflowDisabled = !isCreateSubflowEnabled || hasIfElseRightMost;

  const disableReasons = useMemo((): Record<string, string> => {
    if (!options.shouldGetDisableReasons) return {};
    if (!createSubflowDisabled) return {};
    const reasons: Record<string, string> = {};
    // start / end nodes
    selectedNodes.forEach((n) => {
      if (n.type === "start") {
        reasons[n.id] = "Start node cannot be included in a subflow";
      } else if (n.type === "end") {
        reasons[n.id] = "End node cannot be included in a subflow";
      }
    });
    // ifelse right-most
    if (hasIfElseRightMost) {
      const selectedSet = new Set(selectedNodes.map((n) => n.id));
      const outboundWithin: Record<string, number> = {};
      selectedNodes.forEach((n) => (outboundWithin[n.id] = 0));
      edges.forEach((e) => {
        if (selectedSet.has(e.source) && selectedSet.has(e.target)) outboundWithin[e.source] += 1;
      });
      selectedNodes.forEach((n) => {
        if (n.type === "ifelse" && outboundWithin[n.id] === 0) reasons[n.id] = "IF/Else node can't be right-most in a subflow";
      });
    }
    return reasons;
  }, [createSubflowDisabled, edges, hasIfElseRightMost, options.shouldGetDisableReasons, selectedNodes]);

  return { createSubflowDisabled, disableReasons } as const;
};
