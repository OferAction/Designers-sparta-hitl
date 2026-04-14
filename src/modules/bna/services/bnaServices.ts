import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import z from "zod";

import { useToast } from "@/hooks/use-toast";

import { saveSubset, subsetFilterMonitoringQuery, subsetFilterQuery } from "./bnaQueries";
import { ClickedColumn, SubsetFilterParams, SubsetFilterParamsMonitoring, SubsetFilterResponse } from "./types";
import { useApiMutation, useApiQuery } from "@/api";
import { TriggerType, TriggerTypeValues } from "@/modules/monitoring/services/types";

const validateParams = z.object({
  from: z.coerce
    .date()
    .nullable()
    .transform((date) => date?.toISOString() ?? null)
    .catch(null),
  to: z.coerce
    .date()
    .nullable()
    .transform((date) => date?.toISOString() ?? null)
    .catch(null),
  triggers: z
    .union([z.array(z.nativeEnum(TriggerType)), z.tuple([z.literal("null")])])
    .nullable()
    .catch(null)
    .transform((val) => {
      if (!val || val.length === 0) return Object.values(TriggerType);
      if (val.length === 1 && val[0] === "null") return [];
      return val as TriggerTypeValues[];
    }),
});

export function useSubsetFilter() {
  const { batchId = "", configId = "", propertyPath = "", metricName = "", fileId = "", columnId = "" } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const getQueryArgs = () => {
    if (batchId && configId) {
      const params: SubsetFilterParams = {
        BatchId: batchId,
        ResultPath: propertyPath,
        FileId: fileId,
        ConfigurationId: configId,
        ClickedColumn: ClickedColumn[columnId as keyof typeof ClickedColumn] ?? ClickedColumn["systemErrors"], // Default to 'systemErrors' if not specified
      };
      if (metricName) {
        params.MetricName = metricName;
      }
      return [
        subsetFilterQuery(params, location.state?.nonce ?? ""),
        {
          enabled: !!params.BatchId && !!params.ResultPath && !!params.FileId && !!params.ConfigurationId,
        },
      ] as const;
    }

    const parsedSearchParams = validateParams.parse({
      from: searchParams.get("from"),
      to: searchParams.get("to"),
      triggers: searchParams.getAll("triggers"),
    });

    const params: SubsetFilterParamsMonitoring = {
      FileId: fileId,
      ResultPath: propertyPath,
      ClickedColumn: ClickedColumn[columnId as keyof typeof ClickedColumn] ?? ClickedColumn["systemErrors"], // Default to 'systemErrors' if not specified
      StartDate: parsedSearchParams.from ?? undefined,
      EndDate: parsedSearchParams.to ?? undefined,
      TriggerTypes: parsedSearchParams.triggers,
    };
    return [
      subsetFilterMonitoringQuery(params, location.state?.nonce ?? ""),
      {
        enabled: !!params.ResultPath && !!params.FileId,
      },
    ] as const;
  };

  return useApiQuery(...getQueryArgs());
}

export function useSaveSubset() {
  const { batchId = "", configId = "", propertyPath = "", metricName = "", fileId = "", columnId = "" } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const params: SubsetFilterParams = {
    BatchId: batchId,
    ResultPath: propertyPath,
    FileId: fileId,
    ConfigurationId: configId,
    ClickedColumn: ClickedColumn[columnId as keyof typeof ClickedColumn] ?? ClickedColumn["systemErrors"],
  };
  if (metricName) params.MetricName = metricName;

  const nonce = location.state?.nonce ?? "";

  const mutation = useApiMutation<void, any, SubsetFilterParams, { previousSubsetData?: SubsetFilterResponse }>(saveSubset(), {
    onMutate: async (variables) => {
      const v = variables ?? params;
      const key = subsetFilterQuery(v, nonce).queryKey;
      await queryClient.cancelQueries({ queryKey: key });

      const previousSubsetData = queryClient.getQueryData<SubsetFilterResponse | undefined>(key);

      queryClient.setQueryData<SubsetFilterResponse | undefined>(key, (old) => {
        if (!old) return old;
        return { ...old, hasSubset: true };
      });

      return { previousSubsetData };
    },

    onSuccess: () => {
      toast({
        description: "Subset saved successfully",
        variant: "default",
      });
    },

    onError: (_, __, context) => {
      const v = __ ?? params;
      const key = subsetFilterQuery(v, nonce).queryKey;
      if (context?.previousSubsetData !== undefined) {
        queryClient.setQueryData(key, context.previousSubsetData);
      } else {
        queryClient.invalidateQueries({ queryKey: key });
      }

      toast({
        description: "Failed to save subset",
        variant: "destructive",
      });
    },

    onSettled: async (_, __) => {
      const v = __ ?? params;
      const key = subsetFilterQuery(v, nonce).queryKey;
      await queryClient.invalidateQueries({ queryKey: key });
    },
  });

  const mutate = (variables?: SubsetFilterParams) => {
    mutation.mutate(variables || params);
  };

  const mutateAsync = (variables?: SubsetFilterParams) => {
    return mutation.mutateAsync(variables || params);
  };

  return { mutate, mutateAsync, params, mutation };
}
