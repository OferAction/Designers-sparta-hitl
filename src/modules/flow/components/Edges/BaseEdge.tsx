import { memo } from "react";

import { EdgeLabelRenderer, getBezierPath, getStraightPath } from "@xyflow/react";
import { useShallow } from "zustand/shallow";

import AddNodeMenu from "./AddNodeMenu";
import { DefaultPath, EdgeEvaluatingState, EdgeRunningState } from "./EdgeComponents";
import { SYSTEM_RULE_HANDLE_PREFIX, BUILT_IN_RULE_HANDLE_PREFIX, CUSTOM_RULE_HANDLE_PREFIX } from "@/modules/flow/SystemExEx/RightPanelRules/shared";
import { EdgeProps } from "@/modules/flow/types";
import { useFlowStore } from "@/store";
import { useExecutionStore } from "@/store/executionStore";

const withBaseEdge = (getPathFunction: typeof getBezierPath | typeof getStraightPath) => {
  const EdgeComponent: React.FC<EdgeProps> = (props: EdgeProps) => {
    const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, selected, targetHandleId, target, source, sourceHandleId, data } =
      props;
    const mode = useFlowStore((state) => state.mode);

    // Read edge state from centralized store
    const edgeKey = `${source}-${target}`;
    const edgeState = useExecutionStore(useShallow((state) => state.getEdgeExecutionState(edgeKey)));
    const edgeMode = useExecutionStore(useShallow((state) => state.getEdgeMode(edgeKey)));
    const stopAnimation = useExecutionStore(useShallow((state) => !!state.getGraphEvent() && state.getEdgeMode(edgeKey) !== "default"));

    // Get source and target node states
    const sourceNodeState = useExecutionStore(useShallow((state) => state.getNodeState(source)));
    const targetNodeState = useExecutionStore(useShallow((state) => state.getNodeState(target)));

    const isRuleHandle =
      sourceHandleId?.startsWith(SYSTEM_RULE_HANDLE_PREFIX) ||
      sourceHandleId?.startsWith(BUILT_IN_RULE_HANDLE_PREFIX) ||
      sourceHandleId?.startsWith(CUSTOM_RULE_HANDLE_PREFIX) ||
      false;

    const [edgePath, labelX, labelY] = getPathFunction({
      sourceX,
      sourceY: sourceY === targetY ? sourceY + 0.01 : sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    });

    const strokeWidth = selected ? "4px" : "2px";

    return (
      <g className="group/edge">
        {edgeMode === "default" && (
          <DefaultPath id={id} edgePath={edgePath} selected={selected} strokeWidth={strokeWidth} isRuleHandle={isRuleHandle} />
        )}
        {edgeMode === "evaluating" && <EdgeEvaluatingState id={id} edgePath={edgePath} strokeWidth={strokeWidth} />}
        {edgeMode === "running" && mode === "run" && (
          <EdgeRunningState
            id={id}
            edgePath={edgePath}
            state={edgeState}
            strokeWidth={strokeWidth}
            sourceX={sourceX}
            targetX={targetX}
            EdgeLabelRenderer={EdgeLabelRenderer}
            labelX={labelX}
            labelY={labelY}
            stopAnimation={stopAnimation}
            sourceNodeState={sourceNodeState}
            targetNodeState={targetNodeState}
            isRuleHandle={isRuleHandle}
          />
        )}

        {/* Invisible path with a wider stroke for better hover detection */}
        <path d={edgePath} fill="none" stroke="transparent" strokeWidth="30px" className="cursor-pointer" />

        {/* Edge Dropdown */}
        {edgeMode === "default" && mode === "build" && (
          <AddNodeMenu
            labelX={labelX}
            labelY={labelY}
            targetId={target}
            sourceId={source}
            targetHandleId={targetHandleId}
            sourceHandleId={sourceHandleId}
            edgeId={id}
            forceVisible={data.showEdgeMenuPlus}
          />
        )}
      </g>
    );
  };

  return memo(EdgeComponent);
};

export default withBaseEdge;
