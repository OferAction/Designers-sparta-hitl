import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  archiveFolder,
  createFolder,
  deleteFolder,
  duplicateProjectMutation,
  getFolderFiles,
  getFolders,
  getFoldersPage,
  updateFolder,
} from "./folderQueries";
import { useApiQuery, useInfiniteApiQuery } from "@/api";

export function useGetFoldersQuery() {
  return useApiQuery(getFolders(), {
    refetchOnMount: "always",
    placeholderData: [],
  });
}

export function useGetFoldersPageQuery(pageSize: number = 10, name?: string, sortDirection?: 0 | 1) {
  return useInfiniteApiQuery(getFoldersPage(pageSize, name, sortDirection), {
    refetchOnMount: "always",
  });
}

export function useGetFolderFilesQuery(projectId?: string) {
  return useApiQuery(getFolderFiles(projectId || ""), {
    enabled: !!projectId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });
}

export function useCreateFolderMutation() {
  const queryClient = useQueryClient();
  return useMutation(createFolder(queryClient));
}
export function useDeleteFolderMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation(deleteFolder(queryClient, projectId));
}

export function useUpdateFolderMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation(updateFolder(queryClient, projectId));
}

export function useArchiveFolderMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation(archiveFolder(queryClient, projectId));
}
export function useDuplicateProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation(duplicateProjectMutation(queryClient, projectId));
}
