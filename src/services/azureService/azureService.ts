import { apiClients } from "@/api/axios-clients";
import API_CONFIG from "@/config/api.config";

const apiClientKey = "DEFAULT" as const;
const CONFIG = API_CONFIG[apiClientKey];

export type StorageAccountsListEntry = {
  accountName: string;
  containers: string[];
};

export async function fetchStorageAccountsList(): Promise<StorageAccountsListEntry[]> {
  const endpoint = CONFIG.ENDPOINTS.STORAGE_ACCOUNTS_LIST;
  const { data } = await apiClients[apiClientKey].get<StorageAccountsListEntry[]>(endpoint);
  return data;
}
