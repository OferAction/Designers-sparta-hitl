import { memo } from "react";

import { NodeProps } from "@xyflow/react";

import { NodeContainer, NodeTitle } from "../Node";
import { NodeVariant } from "@/modules/flow/types";

function StartNode({ data, id, selected, parentId }: NodeProps<NodeVariant<"start">>) {
  return (
    <NodeContainer selected={selected} id={id} data={data} nodeTypeWithState={{ type: "start" }} parentId={parentId}>
      <NodeTitle title={data?.title} mainIcon={data.name} nodeType="start" />
    </NodeContainer>
  );
}

export default memo(StartNode);
