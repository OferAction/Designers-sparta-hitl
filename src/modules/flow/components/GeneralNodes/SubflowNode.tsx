import { memo } from "react";

import { NodeProps } from "@xyflow/react";

import { NodeContainer, NodeTitle } from "../Node";
import { NodeVariant } from "@/modules/flow/types";

function SubflowNode({ data, id, selected, parentId }: NodeProps<NodeVariant<"subflow">>) {
  return (
    <NodeContainer selected={selected} id={id} data={data} nodeTypeWithState={{ type: "subflow" }} parentId={parentId}>
      <NodeTitle title={data?.label || data?.title || data?.name} mainIcon="subflow" nodeType="subflow" className="text-purple-foreground" />
    </NodeContainer>
  );
}

export default memo(SubflowNode);
