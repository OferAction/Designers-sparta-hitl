import { memo } from "react";

import { NodeProps } from "@xyflow/react";

import { NodeContainer, NodeTitle } from "../Node";
import { NodeVariant } from "@/modules/flow/types";

function ConditionalOperatorNode({ data, id, selected, parentId }: NodeProps<NodeVariant<"ifelse">>) {
  return (
    <NodeContainer data={data} selected={selected} id={id} nodeTypeWithState={{ type: "condition" }} parentId={parentId}>
      <NodeTitle title={data?.label || data?.title || data?.name} mainIcon={data?.name} />
    </NodeContainer>
  );
}

export default memo(ConditionalOperatorNode);
