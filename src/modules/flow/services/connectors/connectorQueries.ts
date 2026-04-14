import { QueryClient } from "@tanstack/react-query";

import { EmailConnectorFoldersResponse, EmailConnectorUser, TokenResponse, UserDisplayPayload } from "./types";
import { createApiDeleteMutation, createApiPostMutation, createApiQuery } from "@/api";
import API_CONFIGS from "@/config/api.config";

const apiClientKey = "DEFAULT";
const CONFIG = API_CONFIGS[apiClientKey];

export const microsoftAuthorizeQuery = () =>
  createApiPostMutation<{ url: string }>(CONFIG.ENDPOINTS.MICROSOFT_AUTHORIZE, {
    mutationKey: ["microsoftAuthorize"],
    apiClientKey,
  });

export const microsoftAuthorizeCallback = (code: string, state: string) =>
  createApiQuery<TokenResponse>(
    CONFIG.ENDPOINTS.MICROSOFT_AUTHORIZE_CALLBACK,
    ["microsoftAuthorizeCallback", code, state],
    { apiClientKey },
    {
      params: {
        code,
        state,
      },
    }
  );

export const getEmailConnectorUsers = () =>
  createApiQuery<EmailConnectorUser[]>(CONFIG.ENDPOINTS.EMAILCONNECTOR_USERS, ["emailConnectorUsers"], {
    apiClientKey,
  });

export const deleteEmailConnectorUser = (queryClient: QueryClient, userId: string) => {
  const queryKey = getEmailConnectorUsers().queryKey;
  return createApiDeleteMutation(CONFIG.ENDPOINTS.DELETE_CONNECTOR_USER(userId), {
    mutationKey: ["deleteEmailConnectorUser", userId],
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      if (previousData) {
        queryClient.setQueryData(queryKey, (oldData) => {
          if (!oldData) return oldData;
          return oldData?.filter((user) => user.userId !== userId) ?? [];
        });
      }
      return { previousData };
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKey,
      });
    },
    apiClientKey,
  });
};

export const addUserDisplay = () =>
  createApiPostMutation<void, UserDisplayPayload>(CONFIG.ENDPOINTS.EMAILCONNECTOR_USERDISPLAY, {
    mutationKey: ["addUserDisplay"],
    apiClientKey,
  });

export const getEmailConnectorFolders = (accountId: string) =>
  createApiQuery<EmailConnectorFoldersResponse>(CONFIG.ENDPOINTS.EMAILCONNECTOR_FOLDERS(accountId), ["emailConnectorFolders", accountId], {
    apiClientKey,
  });
