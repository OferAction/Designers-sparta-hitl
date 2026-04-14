import { useCallback } from "react";

import { findOutputById } from "@/modules/dataset/components/mapping-grid/mappingHelpers";
import { Node } from "@/modules/flow/types";
import { useFlowStore } from "@/store";
import { ReliabilityOutput } from "@/store/slices/datasetMappingSlice";

// Hook for getting reliability outputs
export const useReliabilityOutputs = () => {
  const mappings = useFlowStore((state) => state.mappings);
  const getReliabilityOutputs = useCallback(
    (nodes: Node[]): ReliabilityOutput[] => {
      const allMappings = Object.values(mappings);

      const outputs = Array.from(
        new Map(
          allMappings
            .filter((m) => {
              const node = nodes.find((n) => n.id === m.nodeId);
              if (!node) return false;
              if (node.data.name === "start") return true;
              return !!(m.jsonPath && m.jsonPath.trim() !== "");
            })
            .map((m) => {
              const key = `${m.nodeId}.${m.outputId}`;
              const node = nodes.find((n) => n.id === m.nodeId);
              let label: string | undefined = undefined;
              let type: string | undefined = undefined;
              if (node?.data?.name === "start") {
                const inp = node?.data.inputs?.find((i) => i.id === m.outputId);
                label = inp?.key || m.outputId;
                type = inp?.type || undefined;
              } else {
                const out = findOutputById(node?.data?.outputs || [], m.outputId);
                label = out?.key || m.outputId;
                type = out?.type || undefined;
              }
              return [key, { nodeId: m.nodeId, outputId: m.outputId, key: label || m.outputId, label, type }];
            })
        ).values()
      );
      return outputs;
    },
    [mappings]
  );

  return { getReliabilityOutputs };
};
