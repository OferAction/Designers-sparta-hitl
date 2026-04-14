import { useCallback } from "react";

import { useUpdateNodeInternals } from "@xyflow/react";

export const useUpdateNodeInternalsAsync = () => {
  const updateNodeInternals = useUpdateNodeInternals();
  return useCallback(
    (_id: string) => {
      return new Promise((resolve) => {
        // updateNodeInternals(id);
        new Promise((r) => requestAnimationFrame(r)).then(() => {
          new Promise((r) => requestAnimationFrame(r)).then(() => {
            resolve(true);
          });
        });
      });
    },
    [updateNodeInternals]
  );
};
