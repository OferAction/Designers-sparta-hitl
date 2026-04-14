import { memo } from "react";

import { NodeProps } from "@xyflow/react";

import { NodeContainer, NodeTitle } from "../Node";
import { NodeVariant } from "@/modules/flow/types";

function EndNode({ data, id, selected, parentId }: NodeProps<NodeVariant<"end">>) {
  return (
    <NodeContainer selected={selected} id={id} data={data} nodeTypeWithState={{ type: "end" }} parentId={parentId}>
      <NodeTitle title={data?.title} mainIcon={data.name} nodeType="end" />
    </NodeContainer>
  );
}

export default memo(EndNode);
