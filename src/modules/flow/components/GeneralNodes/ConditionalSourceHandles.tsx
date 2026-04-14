import { Position } from "@xyflow/react";

import NodeHandle from "../NodeHandle";
import { ConditionType, NodeVariant } from "@/modules/flow/types";

interface ConditionalSourceHandlesProps {
  data: NodeVariant<"ifelse">["data"];
  id: string;
}

export const ConditionalSourceHandles: React.FC<ConditionalSourceHandlesProps> = ({ data, id }) => {
  if (data.type !== "ifelse" || !data.conditions) {
    return null;
  }

  return (
    <>
      {data.conditions.map((condition: ConditionType) => (
        <div key={condition.id}>
          <NodeHandle type="source" position={Position.Right} id={condition.id} isConnectable={true} parentNodeId={id} data={data} isConditional={true}/>
          {/* TODO add input tag */}
          <div className="text-xs uppercase pointer-events-none text-center text-muted-foreground leading-4 absolute right-0 -mr-4 translate-x-full -translate-y-3/4">
            {condition.type}
          </div>
        </div>
      ))}
    </>
  );
};
