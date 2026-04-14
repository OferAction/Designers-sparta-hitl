import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { useParentFileId } from "@/hooks/useFileCache";

import { branchPullLatestChanges, createBranch, getBranches, publishBranch, unpublishBranch, updateBranchInList } from "./branchesQueries";
import { useApiMutation, useApiQuery } from "@/api";
import { updateFileInsideCanvas } from "@/services/fileService/fileQueries";

export function useGetBranches(fileId?: string) {
  const { fileId: paramFileId = "" } = useParams<{ fileId: string }>();
  const finalFileId = fileId ?? paramFileId;
  return useApiQuery(getBranches(finalFileId), {
    placeholderData: keepPreviousData,
  });
}

export function usePublishBranch(fileId?: string) {
  const queryClient = useQueryClient();
  const { fileId: paramFileId = "" } = useParams<{ fileId: string }>();
  const finalFileId = fileId ?? paramFileId;
  return useApiMutation(publishBranch(finalFileId, queryClient));
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useApiMutation(createBranch(queryClient));
}

export function useUnpublishBranch(fileId?: string) {
  const queryClient = useQueryClient();
  const { fileId: paramFileId = "" } = useParams<{ fileId: string }>();
  const finalFileId = fileId ?? paramFileId;
  return useApiMutation(unpublishBranch(finalFileId, queryClient));
}

export function useUpdateBranch(fileId: string) {
  const queryClient = useQueryClient();
  const [branchParentFileId] = useParentFileId(fileId);
  return useApiMutation(updateFileInsideCanvas(queryClient, fileId), updateBranchInList(queryClient, fileId, branchParentFileId));
}

export function useBranchPullLatestChanges(branchParentFileId: string) {
  const queryClient = useQueryClient();
  return useApiMutation(branchPullLatestChanges(queryClient, branchParentFileId));
}
