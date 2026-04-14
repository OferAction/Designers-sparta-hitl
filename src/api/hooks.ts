import {
  useInfiniteQuery,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
  UseInfiniteQueryOptions,
  InfiniteData,
} from "@tanstack/react-query";

import { createApiQuery, createApiPostMutation, createApiInfiniteQuery } from "./utils";
import { ApiError, ContextOptimisticUpdate } from "@/api/types";

export function useApiQuery<TQueryFnData = unknown, TError = ApiError, TResult = TQueryFnData>(
  queryOptions: ReturnType<typeof createApiQuery<TQueryFnData>>,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TResult>, "queryKey" | "queryFn">
) {
  return useQuery({
    ...queryOptions,
    ...options,
  } as UseQueryOptions<TQueryFnData, TError, TResult>);
}

export function useInfiniteApiQuery<TPage = unknown, TError = ApiError, TSelected = InfiniteData<TPage>>(
  queryOptions: ReturnType<typeof createApiInfiniteQuery<TPage>>,
  options?: Omit<UseInfiniteQueryOptions<TPage, TError, TSelected>, "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam">
) {
  return useInfiniteQuery<TPage, TError, TSelected>({
    ...queryOptions,
    ...options,
  } as UseInfiniteQueryOptions<TPage, TError, TSelected>);
}

export function useApiMutation<
  TData = unknown,
  TError extends ApiError = ApiError,
  TVariables = void | Record<string, never>,
  TContext = ContextOptimisticUpdate<TData>,
  TOptionsContext = TContext,
>(
  mutationOptions: ReturnType<typeof createApiPostMutation<TData, TVariables, TContext>>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TOptionsContext>, "mutationFn">
) {
  const mergedOptions = Object.fromEntries(
    Object.entries(options || {}).map(([k, v]) => {
      // Keep the original mutationFn
      if (k === "mutationFn") return [k, mutationOptions.mutationFn];

      if (typeof v !== "function") return [k, v];

      return [
        k,
        async (...args: any[]) => {
          const result1 = await (mutationOptions as any)[k]?.(...args);
          const result2 = await (v as any)?.(...args);

          // Merge return values (important for onMutate context)
          if (result1 !== undefined || result2 !== undefined) {
            return { ...result1, ...result2 };
          }
          return undefined;
        },
      ];
    })
  );
  return useMutation<TData, TError, TVariables, TContext & TOptionsContext>({
    ...mutationOptions,
    ...mergedOptions,
  } as UseMutationOptions<TData, TError, TVariables, TContext & TOptionsContext>);
}
