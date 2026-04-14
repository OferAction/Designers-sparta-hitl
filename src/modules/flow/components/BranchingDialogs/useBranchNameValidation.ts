import { useCallback } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { useGetParentFileId } from "@/hooks/useFileCache";

import { getBranches } from "@/modules/flow/services";

export function useBranchNameValidation(existingFileId?: string) {
  const { fileId: paramFileId = "" } = useParams();
  const getParentFileId = useGetParentFileId();
  const queryClient = useQueryClient();

  return useCallback(
    async (value: string) => {
      const parentFileId = await getParentFileId(paramFileId);
      const data = await queryClient.ensureQueryData(getBranches(parentFileId));

      const normalizedValue = value.trim();

      const hasDuplicateName = data.some((branch) => {
        if (branch.name.trim() !== normalizedValue) return false;

        // If editing an existing branch, allow the same name only if it's the same branch
        if (existingFileId) {
          return branch.id !== existingFileId;
        }

        // If creating a new branch, any matching name is a duplicate
        return true;
      });

      if (hasDuplicateName) {
        return "Branch name must be unique";
      }
      return true;
    },
    [getParentFileId, paramFileId, queryClient, existingFileId]
  );
}
