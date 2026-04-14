import { useMemo, useState } from "react";

import { useParams } from "react-router-dom";

import { useAddNode } from "@/modules/flow/hooks/useAddNode";

import { selectOutlookConnector } from "../SystemExEx/SystemRulesConfiguration/outlookRouting";
import { useGetConfigConverter } from "@/modules/flow/services";
import { SystemRuleAction } from "@/modules/flow/SystemExEx/RightPanelRules/system/SystemRulesItem";
import type { ConnectorNode } from "@/modules/flow/types";
import { useGetFileQuery } from "@/services";
import { useEditFileSystemRules } from "@/services/fileService/fileService";
import { useGetSubflowConfiguration } from "@/services/subflowConfiguratinService";
import { useFlowStore } from "@/store";

export function useSystemRulesConfiguration() {
  const [active, setActive] = useState<"system" | "agentic" | "custom">("system");
  const { fileId = "", subflowConfigId } = useParams();
  const { data: subflowConfig } = useGetSubflowConfiguration(subflowConfigId || "");
  const { data: file } = useGetFileQuery(subflowConfigId ? subflowConfig?.fileId || "" : fileId);
  const onDelete = useFlowStore((s) => s.onDelete);
  const onSystemRulesChange = useFlowStore((s) => s.onChange);

  const { mutate: editSystemRules } = useEditFileSystemRules(subflowConfigId ? subflowConfig?.fileId || "" : fileId);
  const { addNode } = useAddNode();
  const { data: nodeTemplates } = useGetConfigConverter();
  const connectorTemplates = useMemo((): Array<{ name: ConnectorNode; title: string }> => {
    if (!nodeTemplates) return [];
    const values = Object.values(nodeTemplates) as Array<{ type?: string; data?: { name?: string; title?: string } }>;
    return values
      .filter((template): template is { type: "connector"; data: { name: ConnectorNode; title: string } } => {
        return !!template && template.type === "connector" && !!template.data?.name && !!template.data?.title;
      })
      .map((template) => ({ name: template.data.name, title: template.data.title }));
  }, [nodeTemplates]);

  const hasRouting = (file?.systemRules || []).some((r) => r.action === "route");

  const handleSelect = (ruleName: string, action: SystemRuleAction) => {
    const routeDestination = file?.rulesRouteConfig?.defaultSystemRoute || "";
    const updated = (file?.systemRules || []).map((rule) => {
      if (rule.name !== ruleName) return rule;
      const next: typeof rule = {
        ...rule,
        action,
        routeId: action === "route" ? rule.routeId || routeDestination : undefined,
      };
      return next;
    });
    editSystemRules({
      systemRules: updated,
      rulesRouteConfig: file?.rulesRouteConfig || null,
    });
  };

  // select a node from the command palette
  const handleRouteSelect = (nodeId: string) => {
    const updated = (file?.systemRules || []).map((rule) => ({
      ...rule,
      routeId: rule.action === "route" ? nodeId || rule.routeId : rule.routeId,
    }));
    editSystemRules({
      systemRules: updated,
      rulesRouteConfig: file?.rulesRouteConfig || null,
    });
  };

  /** Generic connector selection handler for all routing types. Accepts an optional callback invoked with the new node ID. */
  const handleConnectorSelection = (connectorName: ConnectorNode, onNodeCreated?: (id: string) => void) => {
    // Outlook special handling is delegated to helpers
    if (connectorName === "outlook") {
      selectOutlookConnector({
        addNode,
        onChange: onSystemRulesChange,
        selectInPanel: false,
        orchestrationName: file?.name,
        handleRouteSelect,
        onNodeCreated,
      });
      return;
    }

    // Add offscreen, non-interactive node for selected connector
    const id = addNode(
      connectorName,
      { x: -10000, y: -10000 },
      {
        draggable: false,
        selectable: false,
        hidden: true,
        data: { label: connectorName, name: connectorName },
      }
    );
    if (onNodeCreated) {
      onNodeCreated(id);
    } else {
      handleRouteSelect(id);
    }
  };

  return {
    active,
    setActive,
    file,
    connectorTemplates,
    handleSelect,
    handleRouteSelect,
    handleConnectorSelection,
    hasRouting,
    onDelete,
  };
}
