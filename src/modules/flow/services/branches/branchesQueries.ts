import { QueryClient } from "@tanstack/react-query";

import { createApiPostMutation, createApiQuery, createApiPutMutation } from "@/api";
import API_CONFIGS from "@/config/api.config";
import { File } from "@/modules/workspace";
import { getFile } from "@/services";

import type { CreateBranchBody, PublishBranchBody } from "./types";

const apiClientKey = "DEFAULT";
const CONFIG = API_CONFIGS[apiClientKey];

export const getBranches = (fileId: string) => createApiQuery<File[]>(CONFIG.ENDPOINTS.BRANCHES(fileId), ["branches", fileId], { apiClientKey });

export const publishBranch = (fileId: string, queryClient: QueryClient) =>
  createApiPostMutation<{ fileId: string; id: string }, PublishBranchBody & { $fileId?: string }>(CONFIG.ENDPOINTS.PUBLISH_BRANCH(fileId), {
    apiClientKey,
    mutationKey: ["publish-branch"],
    onSuccess: async ({ fileId }) => {
      queryClient.invalidateQueries({
        queryKey: getBranches(fileId).queryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: getFile(fileId).queryKey,
      });
    },
  });

export const createBranch = (queryClient: QueryClient) =>
  createApiPostMutation<CreateBranchBody & { id: string }, CreateBranchBody>(CONFIG.ENDPOINTS.CREATE_BRANCH, {
    apiClientKey,
    mutationKey: ["create-branch"],
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: getBranches(variables.parentFileId).queryKey,
      });
    },
  });

export const unpublishBranch = (fileId: string, queryClient: QueryClient) =>
  createApiPostMutation<void, { $fileId?: string }>(CONFIG.ENDPOINTS.UNPUBLISH_BRANCH(fileId), {
    apiClientKey,
    mutationKey: ["unpublish-branch"],
    onSuccess: async (_, { $fileId }) => {
      queryClient.invalidateQueries({
        queryKey: getBranches(fileId).queryKey,
      });
      if ($fileId) {
        queryClient.invalidateQueries({
          queryKey: getBranches($fileId).queryKey,
        });
      }
      await queryClient.invalidateQueries({
        queryKey: getFile(fileId).queryKey,
      });
    },
  });

export const updateBranchInList = (queryClient: QueryClient, fileId: string, branchParentFileId: string) =>
  createApiPutMutation(CONFIG.ENDPOINTS.FILE(fileId), {
    apiClientKey,
    onMutate: async (variables: File) => {
      const branchesQueryKey = getBranches(branchParentFileId).queryKey;
      await queryClient.cancelQueries({ queryKey: branchesQueryKey });
      const previousBranchesData = queryClient.getQueryData(branchesQueryKey);
      if (previousBranchesData) {
        queryClient.setQueryData(branchesQueryKey, (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((branch) => (branch.id === fileId ? { ...branch, ...variables } : branch));
        });
      }
      return { previousBranchesData };
    },
    onError: (_, __, context) => {
      const branchesQueryKey = getBranches(branchParentFileId).queryKey;
      queryClient.setQueryData(branchesQueryKey, context?.previousBranchesData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: getBranches(branchParentFileId).queryKey,
      });
    },
  });

export const branchPullLatestChanges = (queryClient: QueryClient, branchParentFileId: string) =>
  createApiPostMutation<void, { $fileId: string }>(CONFIG.ENDPOINTS.PULL_LATEST_CHANGES, {
    apiClientKey,
    mutationKey: ["branch-pull-latest-changes"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getBranches(branchParentFileId).queryKey });
    },
  });
