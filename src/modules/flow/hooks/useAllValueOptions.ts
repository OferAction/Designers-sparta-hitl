import { useMemo } from "react";


import { VALUE_ICONS_MAP } from "@/constants";
import { AncestorValueOption, Node } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

/**
 * Hook that returns all nodes' outputs as value options.
 * Unlike useAncestorValueOptions which only returns ancestors of a specific node,
 * this hook returns outputs from ALL nodes in the orchestration.
 * Useful for GenOne chat where we want access to all orchestration variables.
 */
export const useAllValueOptions = () => {
  const nodes = useFlowStore((state) => state.nodes);

  return useMemo(() => {
    return nodes
      .filter((node) => node.data?.outputs && node.data.outputs.length > 0)
      .map((node: Node) => {
        const regularOutputs: AncestorValueOption[] = [];

        // Process regular outputs
        node.data.outputs?.forEach((output) => {
          regularOutputs.push({
            id: output.id,
            key: output.key,
            label: output.key,
            value: `${node.id}.${output.id}`,
            keywords: [node.id, output.key, `${node.id}.${output.id}`],
            type: output.type,
            icon: VALUE_ICONS_MAP(output.type),
            isReference: true,
            description: "description" in output ? output.description : undefined,
          });
        });




        return {
          label: node.data.label || node.id,
          value: node.id,
          children: [...regularOutputs,],
        };
      });
  }, [nodes]);
};

export default useAllValueOptions;
