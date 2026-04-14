import { useCallback } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { getFile, useGetFileQuery } from "@/services";

/**
 * Custom hook to get cached file data from React Query cache
 * @param fileId - The ID of the file to retrieve from cache
 * @returns The cached File object or undefined if not found
 */
export function useGetParentFileId() {
  const queryClient = useQueryClient();
  return useCallback(
    async (fileId: string) => {
      const file = await queryClient.ensureQueryData(getFile(fileId));
      return file?.parentFileId || fileId;
    },
    [queryClient]
  );
}

/**
 * Custom hook to resolve the parent file ID for branching scenarios
 * If the file is a branch (has parentFileId), returns the parent's ID
 * Otherwise returns the original fileId
 * @param fileId - The ID of the file to check
 * @returns The resolved parent file ID or the original fileId
 */
export function useParentFileId(fileId: string) {
  const { data } = useGetFileQuery(fileId);

  if (!data || data.id !== fileId) {
    return [fileId, false] as const;
  }

  const resolvedId = data?.parentFileId || fileId;
  const isLive = data?.status === "Live";

  return [resolvedId, isLive] as const;
}
