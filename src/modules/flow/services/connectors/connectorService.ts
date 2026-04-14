import { useQueryClient } from "@tanstack/react-query";

import {
  addUserDisplay,
  deleteEmailConnectorUser,
  getEmailConnectorFolders,
  getEmailConnectorUsers,
  microsoftAuthorizeCallback,
  microsoftAuthorizeQuery,
} from "./connectorQueries";
import { useApiMutation, useApiQuery } from "@/api";

export const useMicrosoftAuthorize = (onClose?: () => void, userDisplay?: string) =>
  useApiMutation(microsoftAuthorizeQuery(), {
    onSuccess: (data) => {
      const width = 600;
      const height = 600;
      const left = (screen.width - width) / 2;
      const top = (screen.height - height) / 2;

      const url = data.url.includes("prompt=") ? data.url : `${data.url}${data.url.includes("?") ? "&" : "?"}prompt=select_account`;
      const authWindow = window.open(
        url,
        "microsoft_auth",
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no`
      );

      if (authWindow && onClose) {
        authWindow.focus();
        const timer = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(timer);
            onClose();
          }
        }, 1000);
      }

      if (userDisplay) {
        sessionStorage.setItem("pendingUserDisplay", userDisplay);
      }
    },
  });

export const useMicrosoftAuthorizeCallback = (code: string, state: string) => {
  return useApiQuery(microsoftAuthorizeCallback(code, state), {
    enabled: !!code && !!state,
    retry: true,
    retryDelay: 1000,
    staleTime: 0,
    gcTime: 0,
  });
};

export const useGetEmailConnectorUsers = () => {
  return useApiQuery(getEmailConnectorUsers(), {
    enabled: true,
    retry: true,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useDeleteEmailConnectorUser = (userId: string) => {
  const queryClient = useQueryClient();
  return useApiMutation(deleteEmailConnectorUser(queryClient, userId), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getEmailConnectorUsers().queryKey });
    },
  });
};

export const useAddUserDisplay = () => {
  const queryClient = useQueryClient();
  return useApiMutation(addUserDisplay(), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getEmailConnectorUsers().queryKey });
    },
  });
};

export const useGetEmailConnectorFolders = (accountId: string) =>
  useApiQuery(getEmailConnectorFolders(accountId), {
    enabled: !!accountId,
    retry: true,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
