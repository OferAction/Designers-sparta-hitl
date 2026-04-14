import { type UseMutationOptions } from "@tanstack/react-query";

import { apiClients } from "@/api/axios-clients";
import API_CONFIGS from "@/config/api.config";
import { Edge, Node } from "@/modules/flow/types";

const apiClientKey = "GENONE";
const GENONE_CONFIG = API_CONFIGS[apiClientKey];

export interface GenOneRequestPayload {
  prompt: string;
  session_id: string;
  user_id: string;
  files?: File[];
  existing_config?: { nodes: Node[]; edges: Edge[] };
}

export interface DescriptionGenerationPayload {
  session_id: string;
  user_id: string;
  existing_config: { nodes: Node[]; edges: Edge[] };
}

export interface GenOneResponse {
  response: string;
  session_id: string;
  user_id: string;
}

export const genOneOrchestratorMutation = (): UseMutationOptions<GenOneResponse, Error, GenOneRequestPayload> => ({
  mutationKey: ["genOneOrchestrator"],
  mutationFn: async (variables: GenOneRequestPayload) => {
    const formData = new FormData();

    // Add text fields
    formData.append("prompt", variables.prompt);
    formData.append("session_id", variables.session_id);
    formData.append("user_id", variables.user_id);
    formData.append("existing_config", JSON.stringify(variables.existing_config));

    // Add files if they exist
    if (variables.files && variables.files.length > 0) {
      variables.files.forEach((file) => {
        formData.append("files", file);
      });
    }

    const { data } = await apiClients[apiClientKey].post<GenOneResponse>(GENONE_CONFIG.ENDPOINTS.GENONE_ORCHESTRATOR, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  },
});

export const orchestrationDescriptionGenerationMutation = (): UseMutationOptions<GenOneResponse, Error, DescriptionGenerationPayload> => ({
  mutationKey: ["orchestrationDescriptionGeneration"],
  mutationFn: async (variables: DescriptionGenerationPayload) => {
    const formData = new FormData();

    formData.append("session_id", variables.session_id);
    formData.append("user_id", variables.user_id);
    formData.append("existing_config", JSON.stringify(variables.existing_config));

    const { data } = await apiClients[apiClientKey].post<GenOneResponse>(GENONE_CONFIG.ENDPOINTS.ORCHESTRATION_DESCRIPTION_GENERATION, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  },
});
