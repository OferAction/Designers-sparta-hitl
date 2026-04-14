import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getArchivedFolderFiles,
  getArchivedFolders,
  restoreArchivedFile,
  restoreArchivedFileFromFolder,
  restoreArchivedFolder,
} from "./archiveQueries";
import { useApiQuery } from "@/api";
import { File } from "@/modules/workspace/types";

export function useGetArchivedFolders() {
  return useApiQuery(getArchivedFolders(), {
    refetchOnMount: "always",
    placeholderData: [],
  });
}

export function useGetArchivedFolderFiles(projectId: string) {
  return useApiQuery(getArchivedFolderFiles(projectId), {
    enabled: !!projectId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnMount: "always",
  });
}

export function useRestoreArchivedFolder(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation(restoreArchivedFolder(queryClient, projectId));
}

export function useRestoreArchivedFile(file: File) {
  const queryClient = useQueryClient();
  return useMutation(restoreArchivedFile(queryClient, file.projectId, file.id));
}

export function useRestoreArchivedFileFromFolder(file: File) {
  const queryClient = useQueryClient();
  return useMutation(restoreArchivedFileFromFolder(queryClient, file.projectId, file.id));
}
