import { useParams } from "react-router-dom";

import { useSystemRulesConfiguration } from "@/modules/flow/hooks/useSystemRulesConfiguration";
import { useUpdateFileRouting } from "@/modules/flow/hooks/useUpdateFileRouting";

import { BaseRoutingTab } from "./BaseRoutingTab";
import { ConnectorNode } from "@/modules/flow/types";
import { useGetFileRoutingConfig } from "@/services/fileService/fileService";

export const CustomRulesTab: React.FC = () => {
  const { fileId = "" } = useParams();
  const { data: routingConfig } = useGetFileRoutingConfig(fileId);
  const { updateRouting } = useUpdateFileRouting();
  const { connectorTemplates, handleConnectorSelection } = useSystemRulesConfiguration();

  const customRoute = routingConfig?.defaultCustomRoute || "";
  const customRoutingEnabled = routingConfig?.customRoutingEnabled || false;

  const handleToggle = (enabled: boolean) => {
    updateRouting({ customRoutingEnabled: enabled });
  };

  const handleConnectorSelectWrapper = (connectorName: ConnectorNode) => {
    handleConnectorSelection(connectorName, (id: string) => {
      updateRouting({ defaultCustomRoute: id });
    });
  };

  const handleSelectExistingNode = (nodeId: string) => {
    updateRouting({ defaultCustomRoute: nodeId });
  };

  return (
    <BaseRoutingTab
      title="Custom rules"
      tooltip="Configure custom rules and routing options"
      routingDescription="Define a default routing destination for all custom rule exceptions"
      routeValue={customRoute}
      routingEnabled={customRoutingEnabled}
      connectorTemplates={connectorTemplates}
      onToggle={handleToggle}
      onSelectConnector={handleConnectorSelectWrapper}
      onSelectExistingNode={handleSelectExistingNode}
    />
  );
};
