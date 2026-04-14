import { getAgentsWithTemplatesQuery } from "./agentQueries";
import { useApiQuery } from "@/api";

export const useAgentsWithTemplates = (includeInactive = false) =>
  useApiQuery(getAgentsWithTemplatesQuery(includeInactive), {
    enabled: true,
    staleTime: 5 * 60 * 1000,
  });
