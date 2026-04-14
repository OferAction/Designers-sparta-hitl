import IterableInput from "../shared/IterableInput";
import { useSelectedNode } from "@/modules/flow/hooks";
import type { NodeVariant } from "@/modules/flow/types";

export default function DeduplicationAgentIterable() {
  const selectedNode = useSelectedNode<NodeVariant<"agent", "deduplicationAgent">>();

  const currentValue = selectedNode?.data?.inputs?.items?.value;

  return (
    <IterableInput
      selectedNode={selectedNode}
      itemsKey="items"
      title="Iterable"
      items={[
        {
          id: "items",
          key: "items",
          type: selectedNode?.data?.inputs?.items?.type || "List",
          value: currentValue || { label: "", value: "" },
        },
      ]}
    />
  );
}
