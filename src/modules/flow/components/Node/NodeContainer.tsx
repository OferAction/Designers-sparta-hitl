import React, { ReactNode, useEffect, useRef } from "react";

import { Position, useReactFlow, useStore } from "@xyflow/react";
import { useShallow } from "zustand/shallow";

import { useRemoteSelection } from "@/modules/flow/hooks/useRemoteSelection";

import { NodeContextMenu } from "../ContextMenus";
import DynamicNodeContent, { DynamicNodeProps } from "./DynamicNodeContent";
import StatusIcon from "./NodeStatusIcon";
import RemoteSelectionBadge from "./RemoteSelectionBadge";
import { TriggerIcon } from "@/lib/icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { mitt } from "@/lib/mitt";
import { ConditionalSourceHandles } from "@/modules/flow/components/GeneralNodes/ConditionalSourceHandles";
import NodeHandle from "@/modules/flow/components/NodeHandle";
import RulesHandle from "@/modules/flow/components/NodeHandle/RulesHandle";
import { useContainerMatchSize, useUpdateNodeInternalsAsync } from "@/modules/flow/hooks";
import { Node } from "@/modules/flow/types";
import { FlowStoreState, useFlowStore } from "@/store";
import { useExecutionStore } from "@/store/executionStore";
import { cn, getChildNodeExtent } from "@/utils";

type NodeHandleRendererProps = {
  position: Position;
  selected: boolean | undefined;
  id: string;
  data: Node["data"];
  ref?: React.RefObject<HTMLDivElement>;
};

interface NodeContainerProps extends DynamicNodeProps {
  selected: boolean | undefined;
  children?: ReactNode;
  className?: string;
  id: string;
  data: Node["data"];
  parentId?: string;
}

function NodeHandleRenderer({ position, selected, id, data, ref }: NodeHandleRendererProps) {
  if (position === Position.Left && data.type === "start") return null;
  if (position === Position.Right && data.type === "end") return null;

  return (
    <div
      className={cn("w-full flex flex-col justify-center h-[--node-handle-container-height] gap-3 absolute top-0 bottom-0", {
        "items-start": position === Position.Left,
        "items-end": position === Position.Right,
        "gap-4 h-fit [&>*:first-child]:mt-3 [&>*:last-child]:mb-3": data.type === "ifelse" && position === Position.Right,
      })}
      ref={ref}
    >
      {data.type === "ifelse" && position === Position.Right ? (
        <ConditionalSourceHandles data={data} id={id} />
      ) : (
        <NodeHandle
          type={position === Position.Left ? "target" : "source"}
          position={position}
          id={position === Position.Left ? "a" : "b"}
          parentNodeId={id}
          data={data}
          nodeSelected={selected}
        />
      )}
    </div>
  );
}

const selector = (state: FlowStoreState) => ({
  setNodes: state.setNodes,
  setNode: state.setNode,
  onChange: state.onChange,
});

export default function NodeContainer({ selected, data, id, children, nodeTypeWithState, parentId, className = "" }: NodeContainerProps) {
  const updateNodeInternals = useUpdateNodeInternalsAsync();
  const targetRef = useRef<HTMLDivElement>(null);
  const { sourceRef: heightSourceRef } = useContainerMatchSize(targetRef, { height: true });
  const { sourceRef: widthSourceRef } = useContainerMatchSize(targetRef, { width: true });
  const { isRemoteSelected, remoteSelectionColor, remoteUsers } = useRemoteSelection(id);

  const nodeState = useExecutionStore(useShallow((state) => state.getNodeState(id)));
  const nodeExecutionData = useExecutionStore(useShallow((state) => state.getNodeExecutionData(id)));
  const domNode = useStore((store) => store.domNode);

  const { setNode, setNodes } = useFlowStore(selector);

  const { getInternalNode } = useReactFlow();

  useEffect(() => {
    updateNodeInternals(id);
  }, [selected, id, updateNodeInternals]);

  useEffect(() => {
    const handleParentResize = async (resizedNodeId: string) => {
      if (!parentId) return;
      if (resizedNodeId !== parentId) return;
      await updateNodeInternals(id);
      setNode({
        id,
        extent: getChildNodeExtent(getInternalNode(parentId)!),
      });
    };

    mitt.on("flow:node:update-extent", handleParentResize);
    return () => {
      mitt.off("flow:node:update-extent", handleParentResize);
    };
  }, [getInternalNode, id, parentId, setNode, setNodes, updateNodeInternals]);

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    mitt.emit("node:double-click:focus-label", { nodeId: id });
  };

  const executionResult = nodeExecutionData.executionResult;
  const groundTruthFlag = false;
  const modelConnected = false;
  const hasTerminal = data.type === "agent";
  const isRunning = nodeState === "running";

  const nodeVariant = { ...nodeTypeWithState, state: nodeState, groundTruthConnected: groundTruthFlag, running: isRunning, actOneRunning: false };

  const { showTriggerIcon, triggersCount } = (() => {
    const triggers = (data && data.type === "start" && Array.isArray(data.triggers) ? data.triggers : []) as any[];
    const azure = triggers.some((t) => t.type === "AzureTrigger" || t.type === 2); // safeguard numeric or string types
    const outlookWithAccount = triggers.some((t) => (t.type === "EmailTrigger" || t.type === 1) && (t.settings?.userId || t.settings?.userEmail));
    return { showTriggerIcon: azure || outlookWithAccount, triggersCount: triggers.length };
  })();

  return (
    <NodeContextMenu id={id}>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div
              data-selected={selected}
              data-ground-truth-connected={groundTruthFlag}
              data-subflow-node={nodeTypeWithState?.type === "subflow"}
              data-model-connected={modelConnected}
              data-has-terminal={hasTerminal}
              data-pruned={executionResult === "pruned"}
              data-after-execution={data?.after_node_execution || ""}
              className={cn(
                "relative flex h-full flex-col group node-handle-container-" +
                  (nodeTypeWithState?.type ?? "default") +
                  (nodeTypeWithState?.type === "iteration" ? "" : " max-w-[280px]"),
                isRemoteSelected && "outline outline-2 rounded-2xl outline-offset-[6px]",
                nodeTypeWithState?.type === "start" && "rounded-tl-[100px] rounded-br-2xl rounded-tr-2xl rounded-bl-[100px]",
                nodeTypeWithState?.type === "end" && "rounded-tl-2xl rounded-br-[100px] rounded-tr-[100px] rounded-bl-2xl"
              )}
              style={isRemoteSelected && remoteSelectionColor ? { outlineColor: remoteSelectionColor } : undefined}
              onDoubleClick={handleDoubleClick}
            >
              {isRemoteSelected && remoteUsers.length > 0 && <RemoteSelectionBadge users={remoteUsers} outlineColor={remoteSelectionColor} />}
              {data.type === "start" && triggersCount > 0 && showTriggerIcon && (
                <div className="absolute left-[-23px] top-1/2 -translate-y-1/2 pointer-events-none">
                  <TriggerIcon width={16} height={16} className="text-emerald-500" />
                </div>
              )}
              <NodeHandleRenderer position={Position.Left} selected={selected} id={id} data={data} />
              <NodeHandleRenderer ref={heightSourceRef} position={Position.Right} selected={selected} id={id} data={data} />
              <RulesHandle ref={widthSourceRef} nodeSelected={selected} data={data} parentNodeId={id} />
              <DynamicNodeContent id={id} ref={targetRef} className={className} nodeTypeWithState={nodeVariant}>
                {children}
              </DynamicNodeContent>
            </div>
          </TooltipTrigger>
          <div className="flex flex-col justify-center pointer-events-none left-4 top-full mt-2 absolute gap-1">
            <StatusIcon
              state={nodeState}
              systemRules={nodeExecutionData.systemRuleCount}
              reliabilityRules={nodeExecutionData.builtInRuleCount}
              executionTime={nodeExecutionData.executionTime}
              isGroundTruthConnected={groundTruthFlag}
              type={data.type}
              cached={nodeExecutionData.fromCache}
            />
          </div>
          <TooltipContent className="mb-1 rounded-lg transition-none" container={domNode?.querySelector(".react-flow__pane")}>
            <p className="text-sm font-medium">{data.label || data.title || data.name || id}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </NodeContextMenu>
  );
}
