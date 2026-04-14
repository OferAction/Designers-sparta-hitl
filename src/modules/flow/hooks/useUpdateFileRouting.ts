import { useParams } from "react-router-dom";

import { useGetFileQuery, useEditFileSystemRules } from "@/services/fileService/fileService";
import { useGetSubflowConfiguration } from "@/services/subflowConfiguratinService";

type RoutingUpdate = {
  defaultAgenticRoute?: string;
  agenticRoutingEnabled?: boolean;
  defaultCustomRoute?: string;
  customRoutingEnabled?: boolean;
  defaultSystemRoute?: string;
  systemRoutingEnabled?: boolean;
};

export function useUpdateFileRouting() {
  const { fileId = "", subflowConfigId } = useParams();
  const { data: subflowConfig } = useGetSubflowConfiguration(subflowConfigId || "");
  const actualFileId = subflowConfigId ? subflowConfig?.fileId || "" : fileId;
  const { data: file } = useGetFileQuery(actualFileId);
  const { mutate: editSystemRules } = useEditFileSystemRules(actualFileId);

  /** Persists routing config and, when a default route changes, also updates the matching systemRules routeIds. */
  const updateRouting = (updates: RoutingUpdate) => {
    if (!file) return;

    const updatedRulesRouteConfig = {
      defaultAgenticRoute: file.rulesRouteConfig?.defaultAgenticRoute || "",
      agenticRoutingEnabled: file.rulesRouteConfig?.agenticRoutingEnabled || false,
      defaultCustomRoute: file.rulesRouteConfig?.defaultCustomRoute || "",
      customRoutingEnabled: file.rulesRouteConfig?.customRoutingEnabled || false,
      defaultSystemRoute: file.rulesRouteConfig?.defaultSystemRoute || "",
      systemRoutingEnabled: file.rulesRouteConfig?.systemRoutingEnabled || false,
      ...updates,
    };

    // When the default system route changes, propagate the node ID into every system rule with action "route"
    const updatedSystemRules = updates.defaultSystemRoute
      ? (file.systemRules || []).map((rule) => ({
          ...rule,
          routeId: rule.action === "route" ? updates.defaultSystemRoute || rule.routeId : rule.routeId,
        }))
      : file.systemRules || null;

    editSystemRules({
      systemRules: updatedSystemRules,
      rulesRouteConfig: updatedRulesRouteConfig,
    });
  };

  return { updateRouting };
}
