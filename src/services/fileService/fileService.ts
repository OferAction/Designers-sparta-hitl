import { keepPreviousData, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  archiveFileInsideFolderMutation,
  archiveFileMutation,
  createFileMutation,
  deleteFileMutation,
  duplicateFileMutation,
  duplicateTemplateMutation,
  getFile,
  updateFileInsideCanvas,
  editFileSystemRules,
  updateFileInsideFolderMutation,
  updateFileMutation,
  getFileSystemRulesByAgent,
} from "./fileQueries";
import { useApiQuery } from "@/api";
import { File } from "@/modules/workspace";

export function useCreateFileMutation() {
  const queryClient = useQueryClient();
  return useMutation(createFileMutation(queryClient));
}
export function useUpdateFileInsideFolderMutation(file: File) {
  const queryClient = useQueryClient();
  return useMutation(updateFileInsideFolderMutation(queryClient, file.id));
}
export function useUpdateFileMutation(file: File) {
  const queryClient = useQueryClient();
  return useMutation(updateFileMutation(queryClient, file.id));
}
export function useDeleteFileMutation(file: File) {
  const queryClient = useQueryClient();
  return useMutation(deleteFileMutation(queryClient, file.id, file.projectId));
}
export function useGetFileQuery(fileId: string) {
  return useApiQuery(getFile(fileId), {
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    enabled: !!fileId,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useGetFileRoutingConfig(fileId: string) {
  const query = useApiQuery(getFile(fileId), {
    enabled: !!fileId,
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    data: query.data?.rulesRouteConfig ?? null,
  };
}

export function useGetFileSystemRulesByAgent(fileId: string, agentKey: string) {
  return useApiQuery(
    getFileSystemRulesByAgent(fileId, agentKey),

    {
      enabled: !!fileId && !!agentKey,
      refetchOnMount: "always",
      refetchOnWindowFocus: "always",
      staleTime: 0,
      placeholderData: keepPreviousData,
    }
  );
}

export function useArchiveFile(file: File) {
  const queryClient = useQueryClient();
  return useMutation(archiveFileMutation(queryClient, file.id));
}

export function useArchiveFileInsideFolder(file: File) {
  const queryClient = useQueryClient();
  return useMutation(archiveFileInsideFolderMutation(queryClient, file.projectId, file.id));
}

export function useUpdateFileInsideCanvas(fileId: string) {
  const queryClient = useQueryClient();
  return useMutation(updateFileInsideCanvas(queryClient, fileId));
}

export function useEditFileSystemRules(fileId: string) {
  const queryClient = useQueryClient();
  return useMutation(editFileSystemRules(queryClient, fileId));
}

export function useDuplicateFile(fileId: string) {
  const queryClient = useQueryClient();
  return useMutation(duplicateFileMutation(queryClient, fileId));
}

export function useDuplicateTemplate(fileId: string) {
  const queryClient = useQueryClient();
  return useMutation(duplicateTemplateMutation(queryClient, fileId));
}
