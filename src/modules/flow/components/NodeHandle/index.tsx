import { memo } from "react";

import { Handle, type HandleProps, useNodeConnections, useStore as useReactFlowStore } from "@xyflow/react";

import HandleCircle from "./HandleCircle";
import { BUILT_IN_RULE_HANDLE_PREFIX, CUSTOM_RULE_HANDLE_PREFIX, SYSTEM_RULE_HANDLE_PREFIX } from "@/modules/flow/SystemExEx/RightPanelRules/shared";
import { Node } from "@/modules/flow/types";
import { useFlowStore } from "@/store";
import { useExecutionStore } from "@/store/executionStore";
import { cn } from "@/utils";

// Ensure no parent styling interferes with pointer events. Added relative for potential pseudo elements.
const handleClassNames = "group/handle has-[.handleAbove]:animate-jumpTop z-[1000] relative";

const NodeHandle = ({
  type,
  position,
  id,
  style = {},
  nodeSelected,
  parentNodeId,
  isConditional = false,
  viewOnly,
  defaultBuiltInRoute,
  defaultCustomRoute,
}: HandleProps & {
  nodeSelected?: boolean;
  parentNodeId: string;
  data: Node["data"];
  isConditional?: boolean;
  viewOnly?: boolean;
  defaultBuiltInRoute?: boolean;
  defaultSystemRoute?: boolean;
  defaultCustomRoute?: boolean;
}) => {
  const isBuildMode = useFlowStore((state) => state.mode === "build");
  const running = useExecutionStore((state) => (isBuildMode ? false : state.getHandleState(parentNodeId)));

  const isSource = type === "source";
  const isSystemRuleHandle = isSource && !!id && id.startsWith(SYSTEM_RULE_HANDLE_PREFIX);
  const isBuiltInRuleHandle = isSource && !!id && id.startsWith(BUILT_IN_RULE_HANDLE_PREFIX);
  const isCustomRuleHandle = isSource && !!id && id.startsWith(CUSTOM_RULE_HANDLE_PREFIX);
  const isConnected = !!useNodeConnections({
    handleId: id ?? undefined,
    handleType: type,
    id: parentNodeId,
  }).length;

  const zoom = useReactFlowStore((state) => state.transform[2]);
  // Styles for the main handle container
  const isRuleHandle = isSystemRuleHandle || isBuiltInRuleHandle || isCustomRuleHandle;
  const handleStyle: React.CSSProperties = {
    position: "relative",
    background: "transparent",
    border: "none",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    top: "unset",
    width: isRuleHandle ? "1.5rem" : "fit-content",
    padding: zoom > 0.4 && !isConditional && !isRuleHandle ? "15px 2px" : "0px",
    height: "0.5rem",
    ...style,
  };

  return (
    <Handle
      type={type}
      position={position}
      id={id}
      style={handleStyle}
      className={cn(handleClassNames, zoom < 0.4 && "invisible")}
      isConnectable={!viewOnly}
    >
      <HandleCircle
        nodeId={parentNodeId}
        isSource={isSource}
        isConnected={isConnected}
        nodeSelected={nodeSelected}
        running={running}
        isSystemRuleHandle={isSystemRuleHandle}
        isBuiltInRuleHandle={isBuiltInRuleHandle}
        isCustomRuleHandle={isCustomRuleHandle}
        isDefaultBuiltInRoute={defaultBuiltInRoute}
        isDefaultCustomRoute={defaultCustomRoute}
      />
    </Handle>
  );
};

export default memo(NodeHandle);
