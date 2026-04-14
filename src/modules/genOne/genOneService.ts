import { useMutation } from "@tanstack/react-query";

import { genOneOrchestratorMutation, orchestrationDescriptionGenerationMutation } from "./genOneQueries";

/** Sends a prompt to the GenOne orchestrator */
export function useGenOneOrchestrator() {
  return useMutation({
    ...genOneOrchestratorMutation(),
    retry: 2,
  });
}

/** Generates an AI description for the current orchestration */
export function useOrchestrationDescriptionGeneration() {
  return useMutation({
    ...orchestrationDescriptionGenerationMutation(),
    retry: 2,
  });
}
