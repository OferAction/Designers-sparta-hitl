import { useCallback } from "react";

import { PlaceholderIcon } from "@phosphor-icons/react";
import { useNodeConnections } from "@xyflow/react";

import { useSelectedNode } from "../../hooks";
import { InputLabel } from "@/components/common/InputLabel";
import WithTooltip from "@/components/common/WithTooltip";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { SectionTitle } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import type { AfterNodeExecutionAction } from "@/modules/flow/types/BaseNodeTypes";
import { useFlowStore } from "@/store";

const ACTIONS: AfterNodeExecutionAction[] = ["continue", "stop", "terminate"];

const ACTION_META: Record<AfterNodeExecutionAction, { label: string; description: string }> = {
  continue: {
    label: "Continue",
    description: "Move to the next node.",
  },
  stop: {
    label: "Stop",
    description: "Stop the sample execution on this branch.",
  },
  terminate: {
    label: "Terminate",
    description: "Terminate the workflow for the sample.",
  },
};

export default function RightPanelAfterExecution() {
  const node = useSelectedNode();
  const setAfterNodeExecution = useFlowStore((s) => s.setAfterNodeExecution);
  const nodeId = node?.id;
  const outgoingConnections = useNodeConnections({
    id: nodeId || "",
    handleType: "source",
  });

  const hasOutgoing = outgoingConnections.length > 0;
  const nodeData = node?.data;
  const existingValue = nodeData?.after_node_execution;

  const panelValue: AfterNodeExecutionAction = existingValue && existingValue !== "continue" ? existingValue : "stop";

  const handleSelect = useCallback(
    (action: AfterNodeExecutionAction) => {
      if (!nodeId) return;
      if (nodeData?.after_node_execution === action) return;
      setAfterNodeExecution(nodeId, action);
    },
    [nodeId, setAfterNodeExecution, nodeData]
  );

  if (!nodeId) return null;

  const meta = ACTION_META[panelValue];

  return (
    !hasOutgoing && (
      <SectionContainer padBottom={false}>
        <SectionTitle title="After execution" tooltip="Manage the execution behavior for this node.">
          <DropdownMenu>
            <WithTooltip tooltip={meta.description} side="top">
              <DropdownMenuTrigger asChild>
                <InputLabel
                  variant="emphasized"
                  size="md"
                  className="cursor-pointer select-none px-2 justify-between"
                  value={meta.label}
                  icon={panelValue === "terminate" ? <PlaceholderIcon size={14} weight="fill" className="text-muted-foreground" /> : undefined}
                />
              </DropdownMenuTrigger>
            </WithTooltip>
            <DropdownMenuContent align="end">
              {ACTIONS.map((action) => {
                const disabled = action === "continue";
                const active = panelValue === action;
                return (
                  <DropdownMenuItem
                    key={action}
                    disabled={disabled}
                    onClick={() => !disabled && handleSelect(action)}
                    className={
                      "text-xs flex justify-between gap-2 items-center " +
                      (active ? "bg-primary/10 text-foreground" : "") +
                      (disabled ? " opacity-40 cursor-not-allowed" : "")
                    }
                  >
                    <span className="flex items-center gap-1">
                      {action === "terminate" && <PlaceholderIcon size={14} weight="fill" className="text-muted-foreground" />}
                      {ACTION_META[action].label}
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </SectionTitle>
      </SectionContainer>
    )
  );
}
