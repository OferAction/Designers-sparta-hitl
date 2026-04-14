import { useParams } from "react-router-dom";

import { useSystemRulesConfiguration } from "@/modules/flow/hooks/useSystemRulesConfiguration";
import { useUpdateFileRouting } from "@/modules/flow/hooks/useUpdateFileRouting";

import { BaseRoutingTab } from "./BaseRoutingTab";
import { ConnectorNode } from "@/modules/flow/types";
import { useGetFileRoutingConfig } from "@/services/fileService/fileService";

export const AgenticRulesTab: React.FC = () => {
  const { fileId = "" } = useParams();
  const { data: routingConfig } = useGetFileRoutingConfig(fileId);
  const { updateRouting } = useUpdateFileRouting();
  const { connectorTemplates, handleConnectorSelection } = useSystemRulesConfiguration();

  const agenticRoute = routingConfig?.defaultAgenticRoute || "";
  const agenticRoutingEnabled = routingConfig?.agenticRoutingEnabled || false;

  const handleToggle = (enabled: boolean) => {
    updateRouting({ agenticRoutingEnabled: enabled });
  };

  const handleConnectorSelectWrapper = (connectorName: ConnectorNode) => {
    handleConnectorSelection(connectorName, (id: string) => {
      updateRouting({ defaultAgenticRoute: id });
    });
  };

  const handleSelectExistingNode = (nodeId: string) => {
    updateRouting({ defaultAgenticRoute: nodeId });
  };

  return (
    <BaseRoutingTab
      title="Agentic rules"
      tooltip="Configure agentic rules and routing options"
      routingDescription="Define a default routing destination for all agentic exceptions"
      routeValue={agenticRoute}
      routingEnabled={agenticRoutingEnabled}
      connectorTemplates={connectorTemplates}
      onToggle={handleToggle}
      onSelectConnector={handleConnectorSelectWrapper}
      onSelectExistingNode={handleSelectExistingNode}
    />
  );
};
