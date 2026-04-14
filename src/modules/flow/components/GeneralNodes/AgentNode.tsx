import { memo } from "react";

import { NodeProps } from "@xyflow/react";

import { NodeContainer, NodeTitle } from "../Node";
import { NodeVariant } from "@/modules/flow/types";

function AgentNode({ data, id, selected, parentId }: NodeProps<NodeVariant<"agent">>) {
  return (
    <NodeContainer selected={selected} id={id} data={data} parentId={parentId}>
      <NodeTitle title={data?.label || data?.title || data?.name} mainIcon={data.name} />
    </NodeContainer>
  );
}

export default memo(AgentNode);
