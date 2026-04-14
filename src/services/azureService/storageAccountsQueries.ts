import { queryOptions } from "@tanstack/react-query";

import { fetchStorageAccountsList, StorageAccountsListEntry } from "./azureService";

export const storageAccountsListQueryKey = ["storageAccountsList"] as const;

export function storageAccountsListQuery() {
  return queryOptions<StorageAccountsListEntry[]>({
    queryKey: storageAccountsListQueryKey,
    queryFn: () => fetchStorageAccountsList(),
  });
}

export function getAccountNames(entries: StorageAccountsListEntry[] | undefined) {
  return (entries || []).map((e) => e.accountName);
}

export function getContainers(entries: StorageAccountsListEntry[] | undefined, accountName?: string) {
  if (!accountName) return [] as string[];
  return entries?.find((e) => e.accountName === accountName)?.containers || [];
}
