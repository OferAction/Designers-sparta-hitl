import { AgentTemplates } from "../../constants";
import { FlowConfiguration } from "@/modules/flow/types";

interface ConfigConverterReturnType {
  data: FlowConfiguration;
  isLoading: boolean;
  isError: boolean;
}
export function useGetConfigConverter(): ConfigConverterReturnType {
  // Query is disabled, returning dummy data instead
  return {
    data: AgentTemplates,
    isLoading: false,
    isError: false,
  };
}
// export function useGetConfigConverter() {
//   return useApiQuery(getConfigConverter(), {
//     staleTime: 1000 * 60 * 60 * 24 * 30,
//     refetchOnMount: false,
//     refetchOnWindowFocus: false,
//     refetchInterval: 1000 * 60 * 10,
//   });
// }
