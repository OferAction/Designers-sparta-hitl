import { AxiosError } from "axios";

import API_CONFIG from "@/config/api.config";

export type ApiClient = keyof typeof API_CONFIG;

export type ApiError = AxiosError;

export type ContextOptimisticUpdate<TData> = {
  previousData?: TData;
};
