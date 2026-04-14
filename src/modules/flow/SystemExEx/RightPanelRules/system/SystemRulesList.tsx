import { PlaceholderIcon } from "@phosphor-icons/react";
import { useParams } from "react-router";

import { useSelectedNode } from "@/modules/flow/hooks/useSelectedNode";

import { SYSTEM_ACTION_META } from "../shared";
import WithTooltip from "@/components/common/WithTooltip";
import { useGetFileSystemRulesByAgent } from "@/services/fileService/fileService";

export default function SystemRulesList() {
  const selectedNode = useSelectedNode();
  const { fileId = "" } = useParams();

  const rawAgentKey = selectedNode?.data?.name;
  const agentKey = rawAgentKey ? rawAgentKey.trim().charAt(0).toUpperCase() + rawAgentKey.trim().slice(1) : undefined;
  const { data: agentRules } = useGetFileSystemRulesByAgent(fileId, agentKey || "");

  if (!agentRules || agentRules.length === 0) {
    return <div className="text-sm text-muted-foreground text-center mb-3 mt-6">No agent-specific rules found.</div>;
  }

  return (
    <div className="space-y-4 px-4 py-2">
      {agentRules.map((rule) => (
        <div key={rule.name} className="flex items-center justify-between">
          <div className="text-sidebar-foreground/70 text-sm truncate">{rule.name}</div>
          <div className="text-sm text-muted-foreground flex items-center">
            {rule.action === "terminate" ? (
              <WithTooltip tooltip="Terminate">
                <PlaceholderIcon size={16} weight="fill" className="text-muted-foreground" />
              </WithTooltip>
            ) : (
              <span className="truncate">{SYSTEM_ACTION_META[rule.action]?.label || rule.action}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
