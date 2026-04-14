import {
  type DefinedInitialDataInfiniteOptions,
  InfiniteData,
  type UseMutationOptions,
  infiniteQueryOptions,
  queryOptions,
} from "@tanstack/react-query";
import { AxiosRequestConfig } from "axios";

import { apiClients } from "./axios-clients";
import { ApiClient, ApiError, ContextOptimisticUpdate } from "./types";

type WithCustomOptions<T> = T & { apiClientKey?: ApiClient };

type QueryOptions<TData, TResult> = Parameters<typeof queryOptions<TData, ApiError, TResult>>[0];

const filterVariables = (variables: unknown) => {
  if (variables && typeof variables === "object" && !Array.isArray(variables)) {
    return Object.fromEntries(Object.entries(variables).filter(([key]) => !key.startsWith("$")));
  }
  return variables;
};

export function createApiQuery<TData = unknown, TResult = TData>(
  endpoint: string,
  queryKey: QueryOptions<TData, TResult>["queryKey"],
  options: WithCustomOptions<Omit<QueryOptions<TData, TResult>, "queryKey" | "queryFn">> = {},
  config?: AxiosRequestConfig
) {
  const { apiClientKey = "DEFAULT", ...restOptions } = options;

  return queryOptions<TData, ApiError, TResult>({
    queryKey,
    queryFn: async () => {
      const { data } = await apiClients[apiClientKey].get<TData>(endpoint, config);
      return data;
    },
    ...restOptions,
  });
}

type InfiniteOptions<TData, TResult> = Partial<Omit<DefinedInitialDataInfiniteOptions<TData, ApiError, TResult>, "queryKey" | "queryFn">> &
  Partial<Pick<DefinedInitialDataInfiniteOptions<TData, ApiError, TResult>, "getNextPageParam" | "initialPageParam">>;

export function createApiInfiniteQuery<TData = unknown, TResult = InfiniteData<TData>>(
  endpoint: string,
  queryKey: QueryOptions<TData, TResult>["queryKey"],
  options: WithCustomOptions<InfiniteOptions<TData, TResult>> = {},
  config?: AxiosRequestConfig,
  PAGE_NUMBER_FIELD = "pageNumber"
) {
  const { apiClientKey = "DEFAULT", getNextPageParam = () => undefined, initialPageParam = 1, ...restOptions } = options;

  return infiniteQueryOptions<TData, ApiError, TResult>({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const { data } = await apiClients[apiClientKey].get<TData>(endpoint, {
        ...config,
        params: { ...config?.params, [PAGE_NUMBER_FIELD]: pageParam },
      });
      return data;
    },
    getNextPageParam,
    initialPageParam,
    ...restOptions,
  });
}

export function createApiPostMutation<TData = unknown, TVariables = void | Record<string, never>, TContext = ContextOptimisticUpdate<TData>>(
  endpoint: string | ((variables: TVariables) => string),
  options: WithCustomOptions<Omit<UseMutationOptions<TData, ApiError, TVariables, TContext>, "mutationFn">> = {},
  config?: AxiosRequestConfig
): UseMutationOptions<TData, ApiError, TVariables, TContext> {
  const { apiClientKey = "DEFAULT", ...restOptions } = options;
  return {
    mutationFn: async (variables) => {
      const payload = typeof endpoint === "function" ? filterVariables(variables) : variables;
      const { data } = await apiClients[apiClientKey].post<TData>(typeof endpoint === "function" ? endpoint(variables) : endpoint, payload, config);
      return data;
    },
    ...restOptions,
  };
}

export function createApiPutMutation<TData = unknown, TVariables = void | Record<string, never>, TContext = ContextOptimisticUpdate<TData>>(
  endpoint: string | ((variables: TVariables) => string),
  options: WithCustomOptions<Omit<UseMutationOptions<TData, ApiError, TVariables, TContext>, "mutationFn">> = {},
  config?: AxiosRequestConfig
): UseMutationOptions<TData, ApiError, TVariables, TContext> {
  const { apiClientKey = "DEFAULT", ...restOptions } = options;
  return {
    mutationFn: async (variables) => {
      const payload = typeof endpoint === "function" ? filterVariables(variables) : variables;
      const { data } = await apiClients[apiClientKey].put<TData>(typeof endpoint === "function" ? endpoint(variables) : endpoint, payload, config);
      return data;
    },
    ...restOptions,
  };
}

export function createApiDeleteMutation<TData = unknown, TVariables = void | Record<string, never>, TContext = ContextOptimisticUpdate<TData>>(
  endpoint: string | ((variables: TVariables) => string),
  options: WithCustomOptions<Omit<UseMutationOptions<TData, ApiError, TVariables, TContext>, "mutationFn">> = {},
  config?: AxiosRequestConfig
): UseMutationOptions<TData, ApiError, TVariables, TContext> {
  const { apiClientKey = "DEFAULT", ...restOptions } = options;
  return {
    mutationFn: async (variables) => {
      const { data } = await apiClients[apiClientKey].delete<TData>(typeof endpoint === "function" ? endpoint(variables) : endpoint, config);
      return data;
    },
    ...restOptions,
  };
}
