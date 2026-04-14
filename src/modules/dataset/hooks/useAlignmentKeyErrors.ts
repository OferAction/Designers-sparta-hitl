import { useCallback } from "react";

import { useFlowStore } from "@/store";

// Hook for getting all alignment key errors
export const useAlignmentKeyErrors = () => {
  const getAllAlignmentKeyErrors = useCallback(() => {
    const alignmentKeyErrorMap = useFlowStore.getState().alignmentKeyErrorMap;
    const map: Record<string, string[]> = alignmentKeyErrorMap || {};
    const unique = new Set<string>();
    Object.values(map).forEach((arr) => arr.forEach((msg) => unique.add(msg)));
    return Array.from(unique);
  }, []);

  return { getAllAlignmentKeyErrors };
};
